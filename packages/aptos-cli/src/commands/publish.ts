import type { CommandModule } from "yargs";
import { logError } from "../utils/errors";
import { publishHandler } from "../utils";
import { loadConfig } from "../../../common/src/codegen";
import { ObeliskConfig } from "../../../common/src/codegen/types";

type Options = {
  configPath: string,
  network: any
  savePath?: string
}

const commandModule: CommandModule<Options, Options> = {
  command: "publish",

  describe: "Publish obelisk move contracts",

  builder(yargs) {
    return yargs.options({
      configPath: { type: "string", default: ".", decs: "Path to the config file" },
      network: { type: 'string', choices: ['mainnet', 'testnet', 'devnet', 'localnet'], desc: "Network of the node (mainnet/testnet/devnet/localnet)" },
      savePath: { type: 'string', desc: "Path to the save template file" }
    });
  },

  async handler({ configPath, network, savePath}) {
    try {
      const obeliskConfig = await loadConfig(configPath) as ObeliskConfig;

      await publishHandler(obeliskConfig.projectName, network, savePath);
    } catch (error: any) {
      logError(error);
      process.exit(1);
    }
    process.exit(0);
  },
};

export default commandModule;
