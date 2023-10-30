import { Obelisk } from '../src/obelisk';
import * as process from 'process';
import { NetworkType, SuiTxArgument } from '../src/types';
import { TransactionBlock } from '@mysten/sui.js';
import { initialize } from '../src/metadata/index';

type DataItem = [number[], string];
function formatData(data: DataItem[]): string {
  const formattedData: string[] = [];

  data.forEach(([values, format]) => {
    let formattedValue: string;

    if (format === '0x1::string::String') {
      formattedValue = values.map((num) => String.fromCharCode(num)).join('');
    } else if (format === 'bool') {
      formattedValue = values[0] !== 0 ? 'true' : 'false';
    } else if (format === 'u64') {
      const u64Value = new DataView(new ArrayBuffer(8));
      values.forEach((num, index) => u64Value.setUint8(index, num));
      formattedValue = u64Value.getBigUint64(0).toString();
    } else {
      formattedValue = 'Unknown Format';
    }

    formattedData.push(formattedValue);
  });

  return formattedData.join('\n');
}

async function init() {
  const network = process.argv[2];
  const packageId = process.argv[3];

  // Parse ABI
  const metadata = await initialize(network as NetworkType, packageId);

  // new obelisk class
  const obelisk = new Obelisk({
    networkType: network as NetworkType,
    packageId: packageId,
    metadata: metadata,
    // secretKey: privkey
  });

  const tx = new TransactionBlock();

  const params = [
    tx.pure(
      '0x6fa43c68221960f942572905f3c198a5bccaa0700506b3b6bd83dd9b007e6324'
    ) as SuiTxArgument,
    tx.pure(
      '0xbf64721f0961a0426ccde6b8d9343e2cb2c26a105a5c33e57074580fd98b2cb1'
    ) as SuiTxArgument,
    tx.pure('0x6') as SuiTxArgument,
  ] as SuiTxArgument[];

  const res1 = await obelisk.query.pet_system.get_pet_basic_info(tx, params);
  console.log(JSON.stringify(res1.results![0].returnValues));

  const input: DataItem[] = [
    [[7, 66, 97, 111, 76, 111, 110, 103], '0x1::string::String'],
    [[0], 'bool'],
    [[157, 136, 137, 14, 138, 1, 0, 0], 'u64'],
    [[11, 129, 14, 11, 0, 0, 0, 0], 'u64'],
  ];
  const formattedOutput: string = formatData(input);
  console.log(formattedOutput);
}

init();
