import { Types } from 'aptos';
import { AptosInteractor, getDefaultURL } from '../libs/aptosInteractor';

import { NetworkType } from 'src/types';

export async function getMetadata(
  networkType: NetworkType,
  packageId: string,
  moduleName: string
): Promise<Types.MoveModule | undefined> {
  // Init the rpc provider
  const fullnodeUrls = [getDefaultURL(networkType)];
  const aptosInteractor = new AptosInteractor(fullnodeUrls);
  if (packageId !== undefined) {
    const jsonData = await aptosInteractor.getAccountModule(
      packageId,
      moduleName
    );

    return jsonData.abi;
  } else {
    console.error('please set your package id.');
  }
}
