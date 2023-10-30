import type { CommandModule } from "yargs";

type Options = {
  tx: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "trace",

  describe: "Display the trace of a transaction",

  builder(yargs) {
    return yargs.options({
      tx: { type: "string", required: true, description: "Transaction hash to replay" },
    });
  },

  async handler(tx) {
    console.log(`sui trace ${tx}`)
    process.exit(0);
  },
};

export default commandModule;
