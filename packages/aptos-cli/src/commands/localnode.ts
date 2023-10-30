import { rmSync } from "fs";
import { homedir } from "os";
import path from "path";
import type { CommandModule } from "yargs";
import { execa } from "execa";

const commandModule: CommandModule = {
  command: "localnode",

  describe: "Start a local Sui node for development",

  builder(yargs) {
    return yargs;
  },

  async handler() {
    console.log("Clearing localnode history");
    // const userHomeDir = homedir();
    // rmSync(path.join(userHomeDir, ".sui", "sui_config", "tmp"), { recursive: true, force: true });

    console.log(`Running: sui-test-validator`);
    const child = execa("sui-test-validator");

    process.on("SIGINT", () => {
      console.log("\ngracefully shutting down from SIGINT (Crtl-C)");
      child.kill();
      process.exit();
    });
    await child;
  },
};

export default commandModule;
