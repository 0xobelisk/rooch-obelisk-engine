import { ObeliskConfig } from '../../types';
import { formatAndWriteMove } from '../formatAndWrite';

export function generateIdConfig(network: string, packageId: string, worldId: string, savePath: string) {
  let code = `type NetworkType = 'testnet' | 'mainnet' | 'devnet' | 'localnet';

const NETWORK: NetworkType = '${network}';

const PACKAGE_ID = '${packageId}'
const WORLD_ID = '${worldId}'

export {
    NETWORK,
    PACKAGE_ID,
    WORLD_ID,
}
`
  const path = process.cwd()
  formatAndWriteMove(code, `${path}/${savePath}`, "formatAndWriteMove");
}