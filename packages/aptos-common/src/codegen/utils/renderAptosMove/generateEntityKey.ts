import { ObeliskConfig } from '../../types';
import { formatAndWriteMove } from '../formatAndWrite';

export function generateEntityKey(config: ObeliskConfig, srcPrefix: string) {
  let code = `module ${config.projectName}::entity_key {
    use sui::object;

    public fun object_to_entity_key<T: key + store>(object: &T): vector<u8> {
        object::id_bytes(object)
    }
}
`
  formatAndWriteMove(code, `${srcPrefix}/contracts/${config.projectName}/sources/entity_key.move`, "formatAndWriteMove");
}