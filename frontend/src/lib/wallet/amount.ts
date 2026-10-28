/** Stellar amounts: non-negative decimal, at most 7 fractional digits. */
const AMOUNT_RE = /^\d+(\.\d{1,7})?$/;

/** Minimum bet in stroops; raise once the contract exposes its minimum. */
export const MIN_BET_STROOPS = 1n;

/** Parse a user-entered amount to stroops, or null if malformed or below the minimum. */
export function parseBetAmount(amount: string): bigint | null {
  if (!AMOUNT_RE.test(amount)) return null;
  const [whole, frac = ''] = amount.split('.');
  const stroops = BigInt(whole) * 10_000_000n + BigInt(frac.padEnd(7, '0'));
  return stroops >= MIN_BET_STROOPS ? stroops : null;
}
