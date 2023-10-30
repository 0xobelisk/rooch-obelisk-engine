import type { CommandModule } from "yargs";
import { worldgen, loadConfig } from "../../../common/src/codegen";
import { ObeliskConfig } from "../../../common/src/codegen/types";
import path from "path";


type Options = {
  configPath?: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "compgen <configPath>",

  describe: "Autogenerate Obelisk components based on the config file",

  builder(yargs) {
    return yargs.options({
      configPath: { type: "string", desc: "Path to the config file" },
    });
  },

  async handler({ configPath }) {
    const obeliskConfig = await loadConfig(configPath) as ObeliskConfig;
    worldgen(obeliskConfig)
    process.exit(0);
  },
};

export default commandModule;
