const fs = require('fs/promises');
const path = require('path');

const standaloneNodeModules = path.join(process.cwd(), '.next/standalone/node_modules');
const serverDir = path.join(process.cwd(), '.next/standalone/.next/server');
const prismaAliasPattern = /node_modules\/@prisma\/client-([^"/]+)/;

async function walk(dir, matches = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath, matches);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.nft.json')) {
      matches.push(fullPath);
    }
  }

  return matches;
}

async function main() {
  let aliasName = null;
  const nftFiles = await walk(serverDir);

  for (const nftFile of nftFiles) {
    const content = JSON.parse(await fs.readFile(nftFile, 'utf8'));
    for (const filePath of content.files || []) {
      const match = prismaAliasPattern.exec(filePath);
      if (match) {
        aliasName = match[0].replace('node_modules/', '');
        break;
      }
    }
    if (aliasName) break;
  }

  if (!aliasName) return;

  const aliasPath = path.join(standaloneNodeModules, aliasName);
  const targetPath = path.join(standaloneNodeModules, '@prisma/client');

  await fs.mkdir(path.dirname(aliasPath), { recursive: true });
  try {
    await fs.rm(aliasPath, { recursive: true, force: true });
  } catch {}

  await fs.symlink(path.relative(path.dirname(aliasPath), targetPath), aliasPath, 'dir');

  // Ensure static assets are present in the standalone bundle so the server can
  // serve CSS/fonts/images when the standalone folder is deployed alone.
  try {
    const srcStatic = path.join(process.cwd(), '.next', 'static');
    const destStatic = path.join(process.cwd(), '.next', 'standalone', '.next', 'static');
    await fs.mkdir(path.dirname(destStatic), { recursive: true });
    // Copy recursively if source exists
    await fs.cp(srcStatic, destStatic, { recursive: true });
  } catch (err) {
    // Non-fatal - static copy may not be necessary in some environments
    console.warn('Could not copy static assets into standalone bundle:', err.message || err);
  }
}

main().catch((error) => {
  console.error('Failed to repair standalone Prisma alias:', error);
  process.exit(1);
});