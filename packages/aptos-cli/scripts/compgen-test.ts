import { formatAndWriteMove } from "@0xobelisk/common/codegen";

type ComponentMapType = Record<string, string>
type ComponentValueType = string

type ConfigDataType = Record<string, string>

type ObeliskConfig = {
    projectName: string,
    systems: string[],
    components: Record<string, ComponentMapType | ComponentValueType>
    // world 的顶级存储，适合定义world的规则，比如一个admin, 一个fee，并且可以帮你初始化数据
    // genesis_config: {
    //   admin: {
    //     type: "address",
    //     value: "0x1"
    //   },
    //   world_info: {
    //     type: {
    //       name: "String",
    //       description: "String",
    //       birth_time: "u64",
    //     },
    //     value: {
    //       name: "Crypto Pet",
    //       description: "Crypto Pet",
    //       birth_time: "auto",
    //     }
    //   },
    //   fee: {
    //     type: "Table<vector<u8>,u64>",
    //     value: [
    //       {
    //         clean: "1000000"
    //       },
    //       {
    //         paly: "1000000"
    //       },
    //     ]
    //   },
    // }
}

async function init() {
  let config = {
    projectName: "withinfinity",
    systems: [
        "fee_system",
        "home_system",
        "pet_system",
        "state_system",
    ],
    components: {
      // Key - Struct value
      level: {
          hunger: "u64",
          cleanliness: "u64",
          mood: "u64",
          level: "u64",
      },
      // Key - Struct value
      state: {
          state: "vector<u8>" ,
          last_update_time: "u64" ,
      },
      // Key - Single value
      suifren: "bool",
    },
  } as ObeliskConfig;

  let output = `module eps::entity {
    use sui::bag::Bag;
    use sui::bag;
    use sui::tx_context::TxContext;

    struct Entity has store  {
        components: Bag
    }

    public fun create_entity(ctx: &mut TxContext): Entity {
        Entity {
            components: bag::new(ctx)
        }
    }

    public fun add_component<T: store>(entity: &mut Entity, component_id: vector<u8>, component:T){
        let components = get_mut_components(entity);
        bag::add(components, component_id, component);
    }

    public fun remove_component<T: drop + store>(entity: &mut Entity, component_id: vector<u8>){
        let components= get_mut_components(entity);
        bag::remove<vector<u8>,T>(components, component_id);
    }

    public fun get_mut_components(entity: &mut Entity): &mut Bag {
        &mut entity.components
    }

    public fun get_component<T: store>(entity: &Entity, component_id: vector<u8>): &T {
        assert!(bag::contains(&entity.components, component_id),0);
        bag::borrow<vector<u8>,T>(&entity.components, component_id)
    }

    public fun get_mut_component<T: store>(entity: &mut Entity, component_id: vector<u8>): &mut T {
        assert!(bag::contains(&entity.components, component_id),0);
        bag::borrow_mut<vector<u8>,T>(&mut entity.components,component_id)
    }

    public fun components_length(entity: &mut Entity) : u64 {
        bag::length(get_mut_components(entity))
    }
}`
  let a = formatAndWriteMove(output, "/Users/feng/Desktop/obelisk/obelisk-engine/packages/cli", "formatAndWriteMove");
  // console.log(output)
}

init();
