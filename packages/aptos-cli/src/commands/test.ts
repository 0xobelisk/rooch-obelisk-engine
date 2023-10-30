import type { CommandModule } from "yargs";

type Options = {
  packagePath: string
}

const commandModule: CommandModule<Options, Options> = {
  command: "test",

  describe: "Run tests in Obelisk contracts",

  builder(yargs) {
    return yargs.options({
      packagePath: { type: "string", default: ".", description: "Options to pass to forge test" },
    });
  },

  async handler(packagePath) {
    // Start an internal anvil process if no world address is provided
    console.log(`sui move test --path ${packagePath}`)
    process.exit(0);
  },
};

export default commandModule;
