import { ObeliskConfig } from '../../types';
import { formatAndWriteMove } from '../formatAndWrite';

export function generateSystem(config: ObeliskConfig, srcPrefix: string) {
  config.systems.map((systemName) => {
    let code = `module ${config.projectName}::${systemName} {

}
`
    formatAndWriteMove(code, `${srcPrefix}/contracts/${config.projectName}/sources/system/${systemName}.move`, "formatAndWriteMove");
  })
}