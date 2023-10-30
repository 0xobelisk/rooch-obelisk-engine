import {
  Provider,
  FaucetClient,
  TxnBuilderTypes,
  AptosAccount,
  AptosClient,
  IndexerClient,
  NetworkToIndexerAPI,
  Network,
  Types,
} from 'aptos';
import { FaucetNetworkType, NetworkType, ObjectData } from 'src/types';
import { delay } from './util';
const {
  AccountAddress,
  EntryFunction,
  MultiSig,
  MultiSigTransactionPayload,
  TransactionPayloadMultisig,
} = TxnBuilderTypes;

type RawTransaction = TxnBuilderTypes.RawTransaction;
/**
 * `SuiTransactionSender` is used to send transaction with a given gas coin.
 * It always uses the gas coin to pay for the gas,
 * and update the gas coin after the transaction.
 */
export class AptosInteractor {
  public readonly providers: Provider[];
  public currentProvider: Provider;
  public currentClient: AptosClient;
  public network?: NetworkType;
  public indexerClient?: IndexerClient;

  constructor(fullNodeUrls: string[], network?: NetworkType) {
    if (fullNodeUrls.length === 0)
      throw new Error('fullNodeUrls must not be empty');
    this.providers = fullNodeUrls.map(
      (url) => new Provider({ fullnodeUrl: url, indexerUrl: url })
    );
    this.currentProvider = this.providers[0];
    this.currentClient = new AptosClient(fullNodeUrls[0]);
    this.network = network;
    if (network !== undefined && network !== Network.LOCAL) {
      this.indexerClient = new IndexerClient(NetworkToIndexerAPI[network]);
    }
  }

  switchToNextProvider() {
    const currentProviderIdx = this.providers.indexOf(this.currentProvider);
    this.currentProvider =
      this.providers[(currentProviderIdx + 1) % this.providers.length];
  }

  async signTransaction(sender: AptosAccount, rawTxn: RawTransaction) {
    for (const provider of this.providers) {
      try {
        const signedBcsTxn = await provider.signTransaction(sender, rawTxn);
        return signedBcsTxn;
      } catch (err) {
        console.warn(
          `Failed to send transaction with fullnode ${provider.nodeUrl}: ${err}`
        );
        await delay(2000);
      }
    }
    throw new Error('Failed to send transaction with all fullnodes');
  }

  async submitTransaction(signedTxn: Uint8Array) {
    for (const provider of this.providers) {
      try {
        const pendingTxn = await provider.submitTransaction(signedTxn);
        return pendingTxn;
      } catch (err) {
        console.warn(
          `Failed to send transaction with fullnode ${provider.nodeUrl}: ${err}`
        );
        await delay(2000);
      }
    }
    throw new Error('Failed to send transaction with all fullnodes');
  }

  async waitForTransaction(txnHash: string) {
    for (const provider of this.providers) {
      try {
        await provider.waitForTransaction(txnHash, {
          checkSuccess: true,
        });
        return txnHash;
      } catch (err) {
        console.warn(
          `Failed to send transaction with fullnode ${provider.nodeUrl}: ${err}`
        );
        await delay(2000);
      }
    }
    throw new Error('Failed to send transaction with all fullnodes');
  }

  async sendTxWithPayload(
    sender: AptosAccount,
    payload: Types.EntryFunctionPayload
  ): Promise<Types.PendingTransaction> {
    for (const provider of this.providers) {
      try {
        const rawTxn = await provider.generateTransaction(
          sender.address(),
          payload
        );
        const bcsTxn = AptosClient.generateBCSTransaction(sender, rawTxn);
        const txnHash = await provider.submitSignedBCSTransaction(bcsTxn);
        return txnHash;
      } catch (err) {
        console.warn(
          `Failed to send transaction with fullnode ${provider.nodeUrl}: ${err}`
        );
        await delay(2000);
      }
    }
    throw new Error('Failed to send transaction with all fullnodes');
  }

  async signAndSubmitTransaction(
    sender: AptosAccount,
    rawTransaction: RawTransaction
  ): Promise<any> {
    for (const provider of this.providers) {
      try {
        const txnHash = await provider.signAndSubmitTransaction(
          sender,
          rawTransaction
        );
        return txnHash;
      } catch (err) {
        console.warn(
          `Failed to send transaction with fullnode ${provider.nodeUrl}: ${err}`
        );
        await delay(2000);
      }
    }
    throw new Error('Failed to send transaction with all fullnodes');
  }

  // async getObjects(ids: string[]) {
  //   // const options = {
  //   //   showContent: true,
  //   //   showDisplay: true,
  //   //   showType: true,
  //   //   showOwner: true,
  //   // };

  //   for (const provider of this.providers) {
  //     try {
  //       // const objects = await provider.multiGetObjects({ ids, options });
  //       const objects = await this.indexerClient.
  //       const parsedObjects = objects.map((object) => {
  //         const objectId = getObjectId(object);
  //         const objectType = getObjectType(object);
  //         const objectVersion = getObjectVersion(object);
  //         const objectDigest = object.data ? object.data.digest : undefined;
  //         const initialSharedVersion = getSharedObjectInitialVersion(object);
  //         const objectFields = getObjectFields(object);
  //         const objectDisplay = getObjectDisplay(object);
  //         return {
  //           objectId,
  //           objectType,
  //           objectVersion,
  //           objectDigest,
  //           objectFields,
  //           objectDisplay,
  //           initialSharedVersion,
  //         };
  //       });
  //       return parsedObjects as ObjectData[];
  //     } catch (err) {
  //       await delay(2000);
  //       console.warn(
  //         `Failed to get objects with fullnode ${provider.connection.fullnode}: ${err}`
  //       );
  //     }
  //   }
  //   throw new Error('Failed to get objects with all fullnodes');
  // }

  // async getObject(id: string) {
  //   const objects = await this.getObjects([id]);
  //   return objects[0];
  // }

  // async getDynamicFieldObject(
  //   parentId: string,
  //   name: string | DynamicFieldName
  // ) {
  //   for (const provider of this.providers) {
  //     try {
  //       return provider.getDynamicFieldObject({ parentId, name });
  //     } catch (err) {
  //       await delay(2000);
  //       console.warn(
  //         `Failed to get objects with fullnode ${provider.connection.fullnode}: ${err}`
  //       );
  //     }
  //   }
  //   throw new Error('Failed to get objects with all fullnodes');
  // }

  // async getDynamicFields(parentId: string, cursor?: string, limit?: number) {
  //   for (const provider of this.providers) {
  //     try {
  //       return provider.getDynamicFields({ parentId, cursor, limit });
  //     } catch (err) {
  //       await delay(2000);
  //       console.warn(
  //         `Failed to get objects with fullnode ${provider.connection.fullnode}: ${err}`
  //       );
  //     }
  //   }
  //   throw new Error('Failed to get objects with all fullnodes');
  // }

  // async getOwnedObjects(owner: SuiAddress, cursor?: string, limit?: number) {
  //   for (const provider of this.providers) {
  //     try {
  //       return await provider.getOwnedObjects({ owner, cursor, limit });
  //     } catch (err) {
  //       await delay(2000);
  //       console.warn(
  //         `Failed to get objects with fullnode ${provider.connection.fullnode}: ${err}`
  //       );
  //     }
  //   }
  //   throw new Error('Failed to get objects with all fullnodes');
  // }
  async getAccountResources(accountAddress: string) {
    for (const provider of this.providers) {
      try {
        return provider.getAccountResources(accountAddress);
      } catch (err) {
        await delay(2000);
        console.warn(
          `Failed to get objects with fullnode ${provider.nodeUrl}: ${err}`
        );
      }
    }
    throw new Error('Failed to get objects with all fullnodes');
  }

  async getAccountResource(
    accountAddress: string,
    resourceType: Types.MoveStructTag,
    ledgerVersion?: number
  ) {
    for (const provider of this.providers) {
      try {
        let ledgerVersionBig;
        if (ledgerVersion !== undefined) {
          ledgerVersionBig = BigInt(ledgerVersion);
        }
        return provider.getAccountResource(accountAddress, resourceType, {
          ledgerVersion: ledgerVersionBig,
        });
      } catch (err) {
        await delay(2000);
        console.warn(
          `Failed to get objects with fullnode ${provider.nodeUrl}: ${err}`
        );
      }
    }
    throw new Error('Failed to get objects with all fullnodes');
  }

  async getAccountModule(
    accountAddress: string,
    moduleName: string,
    ledgerVersion?: number
  ): Promise<Types.MoveModuleBytecode> {
    for (const provider of this.providers) {
      try {
        let ledgerVersionBig;
        if (ledgerVersion !== undefined) {
          ledgerVersionBig = BigInt(ledgerVersion);
        }
        return provider.getAccountModule(accountAddress, moduleName, {
          ledgerVersion: ledgerVersionBig,
        });
      } catch (err) {
        await delay(2000);
        console.warn(
          `Failed to get objects with fullnode ${provider.nodeUrl}: ${err}`
        );
      }
    }
    throw new Error('Failed to get objects with all fullnodes');
  }

  async view(
    contractAddress: string,
    moduleName: string,
    funcName: string,
    typeArguments: Types.MoveType[] = [],
    args: any[] = []
  ): Promise<Types.MoveValue[]> {
    for (const provider of this.providers) {
      try {
        let request: Types.ViewRequest = {
          function: `${contractAddress}::${moduleName}::${funcName}`,
          type_arguments: typeArguments,
          arguments: args,
        };
        return provider.view(request);
      } catch (err) {
        await delay(2000);
        console.warn(
          `Failed to get objects with fullnode ${provider.nodeUrl}: ${err}`
        );
      }
    }
    throw new Error('Failed to get objects with all fullnodes');
  }
  // async getNormalizedMoveModulesByPackage(packageId: string) {
  //   for (const provider of this.providers) {
  //     try {
  //       return provider.getNormalizedMoveModulesByPackage({
  //         package: packageId,
  //       });
  //     } catch (err) {
  //       await delay(2000);
  //       console.warn(
  //         `Failed to get objects with fullnode ${provider.connection.fullnode}: ${err}`
  //       );
  //     }
  //   }
  //   throw new Error('Failed to get objects with all fullnodes');
  // }

  // /**
  //  * @description Update objects in a batch
  //  * @param suiObjects
  //  */
  // async updateObjects(suiObjects: (SuiOwnedObject | SuiSharedObject)[]) {
  //   const objectIds = suiObjects.map((obj) => obj.objectId);
  //   const objects = await this.getObjects(objectIds);
  //   for (const object of objects) {
  //     const suiObject = suiObjects.find(
  //       (obj) => obj.objectId === object.objectId
  //     );
  //     if (suiObject instanceof SuiSharedObject) {
  //       suiObject.initialSharedVersion = object.initialSharedVersion;
  //     } else if (suiObject instanceof SuiOwnedObject) {
  //       suiObject.version = object.objectVersion;
  //       suiObject.digest = object.objectDigest;
  //     }
  //   }
  // }

  // /**
  //  * @description Select coins that add up to the given amount.
  //  * @param addr the address of the owner
  //  * @param amount the amount that is needed for the coin
  //  * @param coinType the coin type, default is '0x2::SUI::SUI'
  //  */
  // async selectCoins(
  //   addr: string,
  //   amount: number,
  //   coinType: string = '0x2::SUI::SUI'
  // ) {
  //   const selectedCoins: {
  //     objectId: string;
  //     digest: string;
  //     version: string;
  //   }[] = [];
  //   let totalAmount = 0;
  //   let hasNext = true,
  //     nextCursor: string | null = null;
  //   while (hasNext && totalAmount < amount) {
  //     const coins = await this.currentProvider.getCoins({
  //       owner: addr,
  //       coinType: coinType,
  //       cursor: nextCursor,
  //     });
  //     // Sort the coins by balance in descending order
  //     coins.data.sort((a, b) => parseInt(b.balance) - parseInt(a.balance));
  //     for (const coinData of coins.data) {
  //       selectedCoins.push({
  //         objectId: coinData.coinObjectId,
  //         digest: coinData.digest,
  //         version: coinData.version,
  //       });
  //       totalAmount = totalAmount + parseInt(coinData.balance);
  //       if (totalAmount >= amount) {
  //         break;
  //       }
  //     }

  //     nextCursor = coins.nextCursor;
  //     hasNext = coins.hasNextPage;
  //   }

  //   if (!selectedCoins.length) {
  //     throw new Error('No valid coins found for the transaction.');
  //   }
  //   return selectedCoins;
  // }

  // async requestFaucet(address: SuiAddress, network: FaucetNetworkType) {
  //   await requestSuiFromFaucetV0({
  //     host: getFaucetHost(network),
  //     recipient: address,
  //   });
  //   // let params = {
  //   //   owner: address
  //   // } as GetBalanceParams;
  // }
}
