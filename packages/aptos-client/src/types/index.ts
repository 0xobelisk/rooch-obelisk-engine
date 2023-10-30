import { Network, Types } from 'aptos';

import { MoveModuleFuncType } from '../libs/aptosContractFactory/types';

export type ObeliskParams = {
  mnemonics?: string;
  secretKey?: string;
  fullnodeUrls?: string[];
  faucetUrl?: string;
  networkType?: NetworkType;
  packageId?: string;
  metadata?: Types.MoveModule;
};

export type ComponentFieldType = {
  components: {
    type: string;
    fields: {
      id: {
        id: string;
      };
      size: string;
    };
  };
};

export type ComponentValueType = {
  id: {
    id: string;
  };
  name: string;
  value: {
    type: string;
    fields: ComponentFieldType;
  };
};

export type ComponentContentType = {
  type: string;
  fields: ComponentValueType;
  hasPublicTransfer: boolean;
  dataType: 'moveObject';
};

export interface MessageMeta {
  readonly meta: MoveModuleFuncType;
}

export interface ContractQuery extends MessageMeta {
  (tx: TransactionBlock, params: SuiTxArgument[], isRaw?: boolean): Promise<
    DevInspectResults | TransactionBlock
  >;
}

export interface ContractTx extends MessageMeta {
  (tx: TransactionBlock, params: SuiTxArgument[], isRaw?: boolean):
    | SuiTransactionBlockResponse
    | TransactionBlock;
}

export type MapMessageTx = Record<string, ContractTx>;
export type MapMessageQuery = Record<string, ContractQuery>;

export type MapModuleFuncTx = Record<string, MapMessageTx>;
export type MapModuleFuncQuery = Record<string, MapMessageQuery>;

export type MapModuleFuncTest = Record<string, Record<string, string>>;
export type MapModuleFuncQueryTest = Record<string, Record<string, string>>;

export type AccountMangerParams = {
  mnemonics?: string;
  secretKey?: string;
};

export type DerivePathParams = {
  accountIndex?: number;
  isExternal?: boolean;
  addressIndex?: number;
};

// export type NetworkType = 'testnet' | 'mainnet' | 'devnet' | 'localnet';
export type NetworkType = Network;
export type FaucetNetworkType = 'testnet' | 'devnet' | 'localnet';

/**
 * These are the basics types that can be used in the SUI
 */
export type MoveBasicTypes =
  | 'address'
  | 'bool'
  | 'u8'
  | 'u16'
  | 'u32'
  | 'u64'
  | 'u128'
  | 'u256';

export type MoveInputTypes = 'object' | MoveBasicTypes;
