import { ObeliskConfig } from '../../types';
import { formatAndWriteMove } from '../formatAndWrite';

export function generateToml(config: ObeliskConfig, srcPrefix: string) {
  let code = `[package]
name = "${config.projectName}"
version = "0.0.1"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "testnet-v1.8.0" }

[addresses]
sui =  "0x2"
${config.projectName} = "0x0"
`
  formatAndWriteMove(code, `${srcPrefix}/contracts/${config.projectName}/Move.toml`, "formatAndWriteMove");
}