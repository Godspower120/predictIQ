/**
 * Platform-supported settlement assets for market creation.
 *
 * Reuses the contract's dual Soroban-token / classic-asset support
 * (contracts/predict-iq/src/test_multi_token.rs,
 * contracts/predict-iq/src/test_classic_assets.rs, via the SAC wrapper in
 * contracts/predict-iq/src/modules/sac.rs): an asset is "supported" only if
 * it appears here, independent of whether it's technically valid on-chain —
 * an asset that is valid on-chain but not on this list must still be
 * rejected client-side rather than left for the contract call to fail.
 */

import { StrKey } from '@stellar/stellar-sdk';

export type AssetKind = 'soroban_token' | 'classic_asset';

export interface SupportedAsset {
  /** Stable identifier used as the form value and submitted to the API. */
  id: string;
  kind: AssetKind;
  /** Display symbol, e.g. "USDC", "XLM". */
  code: string;
  /** Soroban contract address (soroban_token) or issuing account (classic_asset). */
  address: string;
  label: string;
}

export type StellarNetwork = 'PUBLIC' | 'TESTNET' | 'FUTURENET';

const XLM: SupportedAsset = {
  id: 'native:XLM',
  kind: 'classic_asset',
  code: 'XLM',
  address: 'native',
  label: 'XLM (Stellar Lumens)',
};

function usdc(issuer: string, label: string): SupportedAsset {
  return { id: `classic:USDC:${issuer}`, kind: 'classic_asset', code: 'USDC', address: issuer, label };
}

/** Per-network issuer/contract addresses; ids on one network never match another's. */
const ASSETS_BY_NETWORK: Record<StellarNetwork, SupportedAsset[]> = {
  PUBLIC: [
    XLM,
    usdc('GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN', 'USDC (Circle, classic asset)'),
  ],
  TESTNET: [
    XLM,
    usdc('GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5', 'USDC (Circle testnet, classic asset)'),
  ],
  FUTURENET: [XLM],
};

export function getStellarNetwork(): StellarNetwork {
  const raw = (process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? 'TESTNET').trim().toUpperCase();
  return raw in ASSETS_BY_NETWORK ? (raw as StellarNetwork) : 'TESTNET';
}

/** True when `address` is `native`, a valid G... issuer, or a valid C... contract id. */
export function isValidAssetAddress(address: string): boolean {
  return (
    address === 'native' ||
    StrKey.isValidEd25519PublicKey(address) ||
    StrKey.isValidContract(address)
  );
}

/**
 * Registry for `network`. The PIQ token contract is deployment-specific, so it
 * comes from NEXT_PUBLIC_PIQ_TOKEN_ADDRESS. Every address is validated; an
 * invalid one throws at startup instead of failing later on-chain.
 */
export function getSupportedAssets(network: StellarNetwork = getStellarNetwork()): SupportedAsset[] {
  const assets = [...ASSETS_BY_NETWORK[network]];
  const piq = process.env.NEXT_PUBLIC_PIQ_TOKEN_ADDRESS?.trim();
  if (piq) {
    assets.push({
      id: `soroban:PIQ:${piq}`,
      kind: 'soroban_token',
      code: 'PIQ',
      address: piq,
      label: 'PIQ (PredictIQ token)',
    });
  }
  for (const asset of assets) {
    if (!isValidAssetAddress(asset.address)) {
      throw new Error(`Invalid address for ${asset.code} on ${network}: ${asset.address}`);
    }
  }
  return assets;
}

export const SUPPORTED_ASSETS: SupportedAsset[] = getSupportedAssets();

export function isSupportedAsset(id: string): boolean {
  return SUPPORTED_ASSETS.some((asset) => asset.id === id);
}

export function getSupportedAsset(id: string): SupportedAsset | undefined {
  return SUPPORTED_ASSETS.find((asset) => asset.id === id);
}
