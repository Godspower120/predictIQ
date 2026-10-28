import { parseBetAmount } from '../wallet/amount';
import { getSupportedAssets } from '../assets';

describe('parseBetAmount', () => {
  it.each(['1e-9', '0x10', '1.123456789', '', '0', '0.0000000', '-1', '.5', '1.'])(
    'rejects %p',
    (v) => expect(parseBetAmount(v)).toBeNull()
  );
  it('converts exactly to stroops without float rounding', () => {
    expect(parseBetAmount('1.1234567')).toBe(11234567n);
    expect(parseBetAmount('9007199254740993')).toBe(90071992547409930000000n);
    expect(parseBetAmount('0.0000001')).toBe(1n);
  });
});

describe('getSupportedAssets', () => {
  it('keys issuers by network and validates addresses', () => {
    const usdc = (n: 'PUBLIC' | 'TESTNET') =>
      getSupportedAssets(n).find((a) => a.code === 'USDC')?.address;
    expect(usdc('PUBLIC')).not.toBe(usdc('TESTNET'));
    expect(getSupportedAssets('FUTURENET').some((a) => a.code === 'USDC')).toBe(false);
  });
  it('throws on an invalid PIQ address', () => {
    process.env.NEXT_PUBLIC_PIQ_TOKEN_ADDRESS = 'nope';
    expect(() => getSupportedAssets('TESTNET')).toThrow(/Invalid address/);
    delete process.env.NEXT_PUBLIC_PIQ_TOKEN_ADDRESS;
  });
});
