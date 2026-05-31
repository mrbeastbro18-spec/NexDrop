const EXECUTABLE_SIGNATURES = [
  { name: 'PE', bytes: [0x4d, 0x5a] },
  { name: 'ELF', bytes: [0x7f, 0x45, 0x4c, 0x46] },
  { name: 'Mach-O', bytes: [0xfe, 0xed, 0xfa, 0xce] },
  { name: 'Mach-O64', bytes: [0xfe, 0xed, 0xfa, 0xcf] },
  { name: 'Mach-O swap', bytes: [0xce, 0xfa, 0xed, 0xfe] },
  { name: 'Mach-O64 swap', bytes: [0xcf, 0xfa, 0xed, 0xfe] }
];

function startsWith(buffer: Uint8Array, signature: number[]) {
  return signature.every((value, index) => buffer[index] === value);
}

export function isExecutableBinary(buffer: Uint8Array): boolean {
  return EXECUTABLE_SIGNATURES.some((signature) => startsWith(buffer, signature.bytes));
}

export function looksLikeText(buffer: Uint8Array): boolean {
  const sampleLength = Math.min(buffer.length, 4096);
  for (let index = 0; index < sampleLength; index++) {
    if (buffer[index] === 0x00) return false;
  }
  return true;
}

export function sniffBasicMime(buffer: Uint8Array): string | null {
  if (buffer.length >= 8 && startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
  if (buffer.length >= 3 && startsWith(buffer, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (buffer.length >= 6 && (startsWith(buffer, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) || startsWith(buffer, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]))) return 'image/gif';
  if (buffer.length >= 12 && startsWith(buffer, [0x52, 0x49, 0x46, 0x46]) && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) return 'image/webp';
  if (buffer.length >= 4 && startsWith(buffer, [0x25, 0x50, 0x44, 0x46])) return 'application/pdf';
  if (buffer.length >= 12 && startsWith(buffer, [0x52, 0x49, 0x46, 0x46]) && buffer[8] === 0x57 && buffer[9] === 0x41 && buffer[10] === 0x56 && buffer[11] === 0x45) return 'audio/wav';
  if (buffer.length >= 8 && startsWith(buffer, [0x52, 0x49, 0x46, 0x46]) && buffer[8] === 0x41 && buffer[9] === 0x56 && buffer[10] === 0x49 && buffer[11] === 0x20) return 'video/avi';
  if (buffer.length >= 12 && buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) return 'video/mp4';
  if (buffer.length >= 4 && startsWith(buffer, [0x4f, 0x67, 0x67, 0x53])) return 'audio/ogg';
  if (buffer.length >= 4 && startsWith(buffer, [0x66, 0x4c, 0x61, 0x43])) return 'audio/flac';
  if (buffer.length >= 2 && startsWith(buffer, [0x50, 0x4b])) return 'archive-or-office-zip';
  return null;
}