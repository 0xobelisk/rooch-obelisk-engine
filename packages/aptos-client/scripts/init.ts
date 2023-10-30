import { AptosClient } from 'aptos';
import { MoveModule } from 'aptos/src/generated';

async function init() {
  const client = new AptosClient('https://fullnode.testnet.aptoslabs.com');
  const accountResources = await client.getAccountResources(
    '0xc0de11113b427d35ece1d8991865a941c0578b0f349acabbe9753863c24109ff'
  );

  // console.log(accountResources);

  const moudleData = await client.getAccountModule(
    '0xc0de11113b427d35ece1d8991865a941c0578b0f349acabbe9753863c24109ff',
    'faucet'
  );

  console.log(moudleData.abi as MoveModule);
}

init();
