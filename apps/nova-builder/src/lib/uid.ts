// Single id-minting routine for the whole builder (SOLID D1 — one write-path
// dependency, not ten local copies). 8 chars from a 62-symbol alphabet.
const CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function uid(prefix = ""): string {
  let s = "";
  for (let i = 0; i < 8; i++) s += CHARS[Math.floor(Math.random() * CHARS.length)];
  return `${prefix}${s}`;
}
