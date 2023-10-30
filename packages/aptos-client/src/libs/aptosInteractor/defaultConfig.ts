import { Network, Provider } from 'aptos';
import type { NetworkType } from 'src/types';
export const defaultGasBudget = 10 ** 8; // 0.1 APTOS, should be enough for most of the transactions
export const defaultGasPrice = 1000; // 1000 MIST

/**
 * @description Get the default fullnode url and faucet url for the given network type
 * @param networkType, 'testnet' | 'mainnet' | 'devnet' | 'localnet', default is 'devnet'
 * @returns { fullNode: string, websocket: string, faucet?: string }
 */
export const getDefaultURL = (networkType: NetworkType = Network.DEVNET) => {
  switch (networkType) {
    case Network.LOCAL:
      return 'http://127.0.0.1:8080';
    case Network.DEVNET:
      return 'https://fullnode.devnet.aptoslabs.com';
    case Network.TESTNET:
      return 'https://fullnode.testnet.aptoslabs.com';
    case Network.MAINNET:
      return 'https://fullnode.mainnet.aptoslabs.com';
    default:
      return 'https://fullnode.devnet.aptoslabs.com';
  }
};
