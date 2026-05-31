const { randomBytes } = require('node:crypto');

function gen(len = 48) {
  return randomBytes(len).toString('hex');
}

console.log('# Run this and copy the values into your .env (keep secrets private)');
console.log(`JWT_ACCESS_SECRET=${gen(48)}`);
console.log(`JWT_REFRESH_SECRET=${gen(64)}`);
console.log('\n# Example: export JWT_ACCESS_SECRET=...');
