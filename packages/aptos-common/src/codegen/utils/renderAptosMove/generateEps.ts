import { ObeliskConfig } from '../../types';
import { formatAndWriteMove } from '../formatAndWrite';

export function generateEps(config: ObeliskConfig, srcPrefix: string) {
  let code = `module ${config.projectName}::world {
    use sui::tx_context::TxContext;
    use sui::hash::keccak256;
    use sui::bag::{ Self, Bag };
    use sui::object::{ Self, UID };

    struct World has key, store{
        id: UID,
        /// Components of the world
        /// K256(component_name) <=> Table<entity_key,T>
        components: Bag,
    }

    public fun create_world(ctx: &mut TxContext): World {
        World {
            id: object::new(ctx),
            components: bag::new(ctx),
        }
    }

    public fun get_component<T : store>(world: &World, component_name: vector<u8>): &T {
        let component_id = keccak256(&component_name);
        bag::borrow<vector<u8>, T>(&world.components, component_id)
    }

    public fun get_mut_component<T : store>(world: &mut World, component_name: vector<u8>): &mut T {
        let component_id = keccak256(&component_name);
        bag::borrow_mut<vector<u8>, T>(&mut world.components, component_id)
    }

    public fun add_component<T : store>(world: &mut World, component_name: vector<u8>, component: T){
        let component_id = keccak256(&component_name);
        bag::add<vector<u8>,T>(&mut world.components, component_id, component);
    }

    public fun contains(world: &mut World, component_name: vector<u8>): bool {
        let component_id = keccak256(&component_name);
        bag::contains(&mut world.components, component_id)
    }
}
`
  formatAndWriteMove(code, `${srcPrefix}/contracts/${config.projectName}/sources/codegen/eps/world.move`, "formatAndWriteMove");
}