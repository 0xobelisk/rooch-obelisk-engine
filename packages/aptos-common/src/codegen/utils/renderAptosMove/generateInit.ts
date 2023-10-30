import { ObeliskConfig } from '../../types';
import { formatAndWriteMove } from '../formatAndWrite';
import { getRegisterComponent, getRegisterSingletonComponent, getUseComponent } from './common';

export function generateInit(config: ObeliskConfig, srcPrefix: string) {
  let code = `module ${config.projectName}::init {
    use sui::transfer;
    use sui::tx_context::TxContext;
    use ${config.projectName}::world;
${getUseComponent(config.projectName, config.components).join("\n")}
${getUseComponent(config.projectName, config.singletonComponents).join("\n")}

    fun init(ctx: &mut TxContext) {
        let world = world::create_world(ctx);

        // Add Component
${getRegisterComponent(config.components).join("\n")}
${getRegisterSingletonComponent(config.singletonComponents).join("\n")}

        transfer::public_share_object(world);
    }

    #[test_only]
    public fun init_world_for_testing(ctx: &mut TxContext){
        init(ctx)
    }
}
`
  formatAndWriteMove(code, `${srcPrefix}/contracts/${config.projectName}/sources/codegen/init.move`, "formatAndWriteMove");
}