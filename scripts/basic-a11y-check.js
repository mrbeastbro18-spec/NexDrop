#!/usr/bin/env node
import fs from 'fs/promises';

const file = process.argv[2] || '/workspaces/NexDrop/.next/index.html';
async function main() {
  try {
    const html = await fs.readFile(file, 'utf8');
    const issues = [];
    // Check for skip link
    if (!/class\s*=\s*"skip-link"/.test(html)) issues.push('Missing skip link (.skip-link)');
    // Check for images without alt
    const imgMatches = [...html.matchAll(/<img\b[^>]*>/gi)];
    let imgsWithoutAlt = 0;
    for (const m of imgMatches) {
      if (!/alt\s*=\s*"[^"\\]*"/.test(m[0])) imgsWithoutAlt++;
    }
    if (imgsWithoutAlt) issues.push(`${imgsWithoutAlt} <img> elements missing alt attribute`);
    // Check for form inputs without labels (very basic)
    const inputMatches = [...html.matchAll(/<input\b[^>]*>/gi)];
    let inputsWithoutLabel = 0;
    for (const m of inputMatches) {
      const idMatch = m[0].match(/id\s*=\s*"([^"]+)"/);
      if (!idMatch) inputsWithoutLabel++;
    }

    if (inputsWithoutLabel) issues.push(`${inputsWithoutLabel} <input> elements missing id (cannot be associated with labels)`);

    if (issues.length === 0) console.log('Basic a11y check: no obvious issues found');
    else console.log('Basic a11y issues:\n- ' + issues.join('\n- '));
  } catch (err) {
    console.error('Failed to run basic a11y check:', err.message || err);
    process.exit(2);
  }
}

main();
