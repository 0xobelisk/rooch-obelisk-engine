import { Types, TxnBuilderTypes, AptosAccount } from 'aptos';
import { AptosAccountManager } from './libs/aptosAccountManager';
// import { SuiTxBlock } from './libs/suiTxBuilder';
import { AptosInteractor, getDefaultURL } from './libs/aptosInteractor';
// import { SuiSharedObject, SuiOwnedObject } from './libs/suiModel';

import { AptosContractFactory } from './libs/aptosContractFactory';
import {
  MoveModuleValueType,
  MoveModuleFuncType,
} from './libs/aptosContractFactory/types';

const {
  AccountAddress,
  EntryFunction,
  MultiSig,
  MultiSigTransactionPayload,
  TransactionPayloadMultisig,
} = TxnBuilderTypes;

type RawTransaction = TxnBuilderTypes.RawTransaction;

import {
  ObeliskParams,
  DerivePathParams,
  ComponentContentType,
  ContractQuery,
  ContractTx,
  MapModuleFuncQuery,
  MapModuleFuncTx,
  FaucetNetworkType,
} from './types';

export function isUndefined(value?: unknown): value is undefined {
  return value === undefined;
}

export function withMeta<T extends { meta: MoveModuleFuncType }>(
  meta: MoveModuleFuncType,
  creator: Omit<T, 'meta'>
): T {
  (creator as T).meta = meta;

  return creator as T;
}

function createQuery(
  meta: MoveModuleFuncType,
  fn: (
    typeArguments?: Types.MoveType[],
    params?: any[]
  ) => Promise<Types.MoveValue[]>
): ContractQuery {
  return withMeta(
    meta,
    async (
      typeArguments?: Types.MoveType[],
      params?: any[]
    ): Promise<Types.MoveValue[]> => {
      const result = await fn(typeArguments, params);
      return result;
    }
  );
}

function createTx(
  meta: MoveModuleFuncType,
  fn: (
    typeArguments?: Types.MoveType[],
    params?: any[],
    isRaw?: boolean
  ) => Promise<Types.PendingTransaction | Types.EntryFunctionPayload>
): ContractTx {
  return withMeta(
    meta,
    async (
      typeArguments?: Types.MoveType[],
      params?: any[],
      isRaw?: boolean
    ): Promise<Types.PendingTransaction | Types.EntryFunctionPayload> => {
      const result = await fn(typeArguments, params, isRaw);
      return result;
    }
  );
}

/**
 * @class Obelisk
 * @description This class is used to aggregate the tools that used to interact with SUI network.
 */
export class Obelisk {
  public accountManager: AptosAccountManager;
  public aptosInteractor: AptosInteractor;
  public contractFactory: AptosContractFactory;
  public packageId: string | undefined;
  public metadata: Types.MoveModule | undefined;

  readonly #query: MapModuleFuncQuery = {};
  readonly #tx: MapModuleFuncTx = {};
  /**
   * Support the following ways to init the ObeliskClient:
   * 1. mnemonics
   * 2. secretKey (base64 or hex)
   * If none of them is provided, will generate a random mnemonics with 24 words.
   *
   * @param mnemonics, 12 or 24 mnemonics words, separated by space
   * @param secretKey, base64 or hex string, when mnemonics is provided, secretKey will be ignored
   * @param networkType, 'testnet' | 'mainnet' | 'devnet' | 'localnet', default is 'devnet'
   * @param fullnodeUrl, the fullnode url, default is the preconfig fullnode url for the given network type
   * @param packageId
   */
  constructor({
    mnemonics,
    secretKey,
    networkType,
    fullnodeUrls,
    packageId,
    metadata,
  }: ObeliskParams = {}) {
    // Init the account manager
    this.accountManager = new AptosAccountManager({ mnemonics, secretKey });
    // Init the rpc provider
    fullnodeUrls = fullnodeUrls || [getDefaultURL(networkType)];
    this.aptosInteractor = new AptosInteractor(fullnodeUrls, networkType);

    this.packageId = packageId;
    if (metadata !== undefined) {
      this.metadata = metadata as Types.MoveModule;
      let moduleName = metadata.name;
      let meta: MoveModuleFuncType;
      metadata.exposed_functions.map((value) => {
        meta = {
          contractAddress: metadata.address,
          moduleName,
          funcName: value.name,
          visibility: value.visibility,
          isEntry: value.is_entry,
          isView: value.is_view,
          typeParameters: value.generic_type_params,
          parameters: value.params,
          return: value.return,
        };

        if (value.is_view) {
          if (isUndefined(this.#query[moduleName])) {
            this.#query[moduleName] = {};
          }
          if (isUndefined(this.#query[moduleName][value.name])) {
            this.#query[moduleName][value.name] = createQuery(
              meta,
              (type_p, p) => this.#read(meta, type_p, p)
            );
          }
        }

        if (value.is_entry) {
          if (isUndefined(this.#tx[moduleName])) {
            this.#tx[moduleName] = {};
          }
          if (isUndefined(this.#tx[moduleName][value.name])) {
            this.#tx[moduleName][value.name] = createTx(
              meta,
              (type_p, p, isRaw) => this.#exec(meta, type_p, p, isRaw)
            );
          }
        }
      });
    }
    this.contractFactory = new AptosContractFactory({
      packageId,
      metadata,
    });
  }

  public get query(): MapModuleFuncQuery {
    return this.#query;
  }

  public get tx(): MapModuleFuncTx {
    return this.#tx;
  }

  #exec = async (
    meta: MoveModuleFuncType,
    typeArguments?: Types.MoveType[],
    params?: any[],
    isRaw?: boolean
  ) => {
    if (typeArguments === undefined) {
      typeArguments = [];
    }

    if (params === undefined) {
      params = [];
    }

    const payload = await this.generatePayload(
      `${this.contractFactory.packageId}::${meta.moduleName}::${meta.funcName}`,
      typeArguments,
      params
    );

    if (isRaw === true) {
      return payload;
    }
    return await this.signAndSendTxnWithPayload(payload);
  };

  #read = async (
    meta: MoveModuleFuncType,
    typeArguments?: Types.MoveType[],
    params?: any[]
  ) => {
    if (typeArguments === undefined) {
      typeArguments = [];
    }

    if (params === undefined) {
      params = [];
    }

    return this.aptosInteractor.view(
      meta.contractAddress,
      meta.moduleName,
      meta.funcName,
      typeArguments,
      params
    );
  };
  /**
   * if derivePathParams is not provided or mnemonics is empty, it will return the currentSigner.
   * else:
   * it will generate signer from the mnemonic with the given derivePathParams.
   * @param derivePathParams, such as { accountIndex: 2, isExternal: false, addressIndex: 10 }, comply with the BIP44 standard
   */
  getSigner(derivePathParams?: DerivePathParams) {
    const keyPair = this.accountManager.getKeyPair(derivePathParams);
    return keyPair;
  }

  /**
   * @description Switch the current account with the given derivePathParams
   * @param derivePathParams, such as { accountIndex: 2, isExternal: false, addressIndex: 10 }, comply with the BIP44 standard
   */
  switchAccount(derivePathParams: DerivePathParams) {
    this.accountManager.switchAccount(derivePathParams);
  }

  /**
   * @description Get the address of the account for the given derivePathParams
   * @param derivePathParams, such as { accountIndex: 2, isExternal: false, addressIndex: 10 }, comply with the BIP44 standard
   */
  getAddress(derivePathParams?: DerivePathParams) {
    return this.accountManager.getAddress(derivePathParams);
  }
  currentAddress() {
    return this.accountManager.currentAddress;
  }

  provider() {
    return this.aptosInteractor.currentProvider;
  }

  getPackageId() {
    return this.contractFactory.packageId;
  }

  getMetadata(): Types.MoveModule | undefined {
    return this.contractFactory.metadata;
  }
  // /**
  //  * Request some APT from faucet
  //  * @Returns {Promise<boolean>}, true if the request is successful, false otherwise.
  //  */
  // async requestFaucet(address: SuiAddress, network: FaucetNetworkType) {
  //   // const addr = this.accountManager.getAddress(derivePathParams);
  //   return this.aptosInteractor.requestFaucet(address, network);
  // }

  async getBalance(
    accountAddress: string,
    coinType: string
  ): Promise<string | number> {
    try {
      const resource = await this.aptosInteractor.getAccountResource(
        accountAddress,
        `0x1::coin::CoinStore<${coinType}>`
      );

      return parseInt((resource.data as any)['coin']['value']);
    } catch (_) {
      return 0;
    }
  }

  async signAndSendTxnWithPayload(
    payload: Types.EntryFunctionPayload,
    derivePathParams?: DerivePathParams
  ) {
    const signer = this.getSigner(derivePathParams);
    return this.aptosInteractor.sendTxWithPayload(signer, payload);
  }

  async generatePayload(
    target: string,
    // contractAddress: string,
    // moduleName: string,
    // funcName: string,
    typeArguments: Types.MoveType[],
    params: any[]
  ): Promise<Types.EntryFunctionPayload> {
    const payload = {
      function: target,
      // function: `${contractAddress}::${moduleName}::${funcName}`,
      type_arguments: typeArguments,
      arguments: params,
    };
    return payload;
  }

  async generateTransaction(
    sender: AptosAccount,
    contractAddress: string,
    moduleName: string,
    funcName: string,
    typeArguments: Types.MoveType[],
    params: any[]
  ): Promise<RawTransaction> {
    const rawTxn = await this.aptosInteractor.currentClient.generateTransaction(
      sender.address(),
      {
        function: `${contractAddress}::${moduleName}::${funcName}`,
        type_arguments: typeArguments,
        arguments: params,
      }
    );
    return rawTxn;
    // const bcsTxn = await this.aptosInteractor.currentClient.signTransaction(
    //   sender,
    //   rawTxn
    // );
    // const pendingTxn =
    //   await this.aptosInteractor.currentClient.submitTransaction(bcsTxn);
    // return pendingTxn;
  }

  async waitForTransaction(txnHash: string) {
    return this.aptosInteractor.waitForTransaction(txnHash);
  }

  async signAndSendTxn(
    tx: RawTransaction,
    derivePathParams?: DerivePathParams
  ) {
    const sender = this.getSigner(derivePathParams);
    return this.aptosInteractor.signAndSubmitTransaction(sender, tx);
  }

  // /**
  //  * Transfer the given amount of SUI to the recipient
  //  * @param recipient
  //  * @param amount
  //  * @param derivePathParams
  //  */
  // async transferSui(
  //   recipient: string,
  //   amount: number,
  //   derivePathParams?: DerivePathParams
  // ) {
  //   const tx = new SuiTxBlock();
  //   tx.transferSui(recipient, amount);
  //   return this.signAndSendTxn(tx, derivePathParams);
  // }

  // /**
  //  * Transfer to mutliple recipients
  //  * @param recipients the recipients addresses
  //  * @param amounts the amounts of SUI to transfer to each recipient, the length of amounts should be the same as the length of recipients
  //  * @param derivePathParams
  //  */
  // async transferSuiToMany(
  //   recipients: string[],
  //   amounts: number[],
  //   derivePathParams?: DerivePathParams
  // ) {
  //   const tx = new SuiTxBlock();
  //   tx.transferSuiToMany(recipients, amounts);
  //   return this.signAndSendTxn(tx, derivePathParams);
  // }

  // /**
  //  * Transfer the given amounts of coin to multiple recipients
  //  * @param recipients the list of recipient address
  //  * @param amounts the amounts to transfer for each recipient
  //  * @param coinType any custom coin type but not SUI
  //  * @param derivePathParams the derive path params for the current signer
  //  */
  // async transferCoinToMany(
  //   recipients: string[],
  //   amounts: number[],
  //   coinType: string,
  //   derivePathParams?: DerivePathParams
  // ) {
  //   const tx = new SuiTxBlock();
  //   const owner = this.accountManager.getAddress(derivePathParams);
  //   const totalAmount = amounts.reduce((a, b) => a + b, 0);
  //   const coins = await this.suiInteractor.selectCoins(
  //     owner,
  //     totalAmount,
  //     coinType
  //   );
  //   tx.transferCoinToMany(
  //     coins.map((c) => c.objectId),
  //     owner,
  //     recipients,
  //     amounts
  //   );
  //   return this.signAndSendTxn(tx, derivePathParams);
  // }

  // async transferCoin(
  //   recipient: string,
  //   amount: number,
  //   coinType: string,
  //   derivePathParams?: DerivePathParams
  // ) {
  //   return this.transferCoinToMany(
  //     [recipient],
  //     [amount],
  //     coinType,
  //     derivePathParams
  //   );
  // }

  // async transferObjects(
  //   objects: string[],
  //   recipient: string,
  //   derivePathParams?: DerivePathParams
  // ) {
  //   const tx = new SuiTxBlock();
  //   tx.transferObjects(objects, recipient);
  //   return this.signAndSendTxn(tx, derivePathParams);
  // }

  // async moveCall(callParams: {
  //   target: string;
  //   arguments?: (SuiTxArg | SuiVecTxArg)[];
  //   typeArguments?: string[];
  //   derivePathParams?: DerivePathParams;
  // }) {
  //   const {
  //     target,
  //     arguments: args = [],
  //     typeArguments = [],
  //     derivePathParams,
  //   } = callParams;
  //   const tx = new SuiTxBlock();
  //   tx.moveCall(target, args, typeArguments);
  //   return this.signAndSendTxn(tx, derivePathParams);
  // }

  // /**
  //  * Select coins with the given amount and coin type, the total amount is greater than or equal to the given amount
  //  * @param amount
  //  * @param coinType
  //  * @param owner
  //  */
  // async selectCoinsWithAmount(
  //   amount: number,
  //   coinType: string,
  //   owner?: string
  // ) {
  //   owner = owner || this.accountManager.currentAddress;
  //   const coins = await this.suiInteractor.selectCoins(owner, amount, coinType);
  //   return coins.map((c) => c.objectId);
  // }

  // /**
  //  * stake the given amount of SUI to the validator
  //  * @param amount the amount of SUI to stake
  //  * @param validatorAddr the validator address
  //  * @param derivePathParams the derive path params for the current signer
  //  */
  // async stakeSui(
  //   amount: number,
  //   validatorAddr: string,
  //   derivePathParams?: DerivePathParams
  // ) {
  //   const tx = new SuiTxBlock();
  //   tx.stakeSui(amount, validatorAddr);
  //   return this.signAndSendTxn(tx, derivePathParams);
  // }

  // /**
  //  * Execute the transaction with on-chain data but without really submitting. Useful for querying the effects of a transaction.
  //  * Since the transaction is not submitted, its gas cost is not charged.
  //  * @param tx the transaction to execute
  //  * @param derivePathParams the derive path params
  //  * @returns the effects and events of the transaction, such as object changes, gas cost, event emitted.
  //  */
  // async inspectTxn(
  //   tx: Uint8Array | TransactionBlock | SuiTxBlock,
  //   derivePathParams?: DerivePathParams
  // ): Promise<DevInspectResults> {
  //   tx = tx instanceof SuiTxBlock ? tx.txBlock : tx;
  //   return this.suiInteractor.currentProvider.devInspectTransactionBlock({
  //     transactionBlock: tx,
  //     sender: this.getAddress(derivePathParams),
  //   });
  // }

  // async getWorld(worldObjectId: string) {
  //   return this.suiInteractor.getObject(worldObjectId);
  // }

  // async getComponents(worldId: string) {
  //   const parentId = (await this.suiInteractor.getObject(worldId)).objectFields
  //     .components.fields.id.id;

  //   return await this.suiInteractor.getDynamicFields(parentId);
  // }

  // async getComponentByName(worldId: string, componentName: string) {
  //   const componentId = keccak256(
  //     `${capitalizeFirstLetter(componentName)} Component`
  //   );
  //   return await this.getComponent(worldId, componentId);
  // }

  // async getComponent(worldId: string, componentId: Buffer) {
  //   const componentIdValue: number[] = Array.from(componentId);
  //   const parentId = (await this.suiInteractor.getObject(worldId)).objectFields
  //     .components.fields.id.id;

  //   const name = {
  //     type: 'vector<u8>',
  //     value: componentIdValue,
  //     // value: [250,208,186,160,39,171,62,206,98,224,138,41,11,217,63,100,248,104,207,64,78,126,43,109,129,68,64,127,236,113,152,132]
  //   } as DynamicFieldName;
  //   return await this.suiInteractor.getDynamicFieldObject(parentId, name);
  // }

  // async getOwnedEntities(owner: SuiAddress, cursor?: string, limit?: number) {
  //   const ownedObjects = await this.suiInteractor.getOwnedObjects(
  //     owner,
  //     cursor,
  //     limit
  //   );
  //   let ownedEntities: ObeliskObjectData[] = [];

  //   for (const object of ownedObjects.data) {
  //     let objectDetail = await this.getObject(object.data!.objectId);

  //     if (
  //       objectDetail.objectType.split('::')[0] ===
  //       this.contractFactory.packageId
  //     ) {
  //       ownedEntities.push(objectDetail);
  //     }
  //   }

  //   return ownedEntities;
  // }
}
