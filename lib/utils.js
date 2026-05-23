async function sha256(value) {
  const data = new TextEncoder().encode(value);
  const hash = await globalThis.crypto.subtle.digest('SHA-256', data);
  return Buffer.from(hash).toString('hex');
}

function safeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 180) || 'file';
}

function humanSize(bytes) {
  const n = typeof bytes === 'bigint' ? Number(bytes) : bytes;
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(1)} GB`;
}

function nowPlusDays(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

module.exports = {
  sha256,
  safeFileName,
  humanSize,
  nowPlusDays
};