export function sha256(value: string): Promise<string>;
export function safeFileName(name: string): string;
export function humanSize(bytes: bigint | number): string;
export function nowPlusDays(days: number): Date;

declare const utils: {
  sha256: typeof sha256;
  safeFileName: typeof safeFileName;
  humanSize: typeof humanSize;
  nowPlusDays: typeof nowPlusDays;
};

export default utils;
