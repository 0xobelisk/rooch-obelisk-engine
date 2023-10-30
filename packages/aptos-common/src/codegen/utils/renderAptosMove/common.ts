// import { ComponentMapType, isSingletonType, SingletonType } from '../../types';
import { ComponentMapType, SingletonType, isSingletonType } from '../../types';
import fs from 'fs';

export function deleteFolderRecursive(path: string) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file) => {
      const curPath = `${path}/${file}`;
      if (fs.lstatSync(curPath).isDirectory()) {
        // 递归删除子文件夹
        deleteFolderRecursive(curPath);
      } else {
        // 删除文件
        fs.unlinkSync(curPath);
      }
    });
    // 删除空文件夹
    fs.rmdirSync(path);
  }
}

export function capitalizeFirstLetter(input: string): string {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

/**
 *
 * @param projectName
 * @param values
 * @return [use projectName::name_component, use projectName::info_component]
 */
export function getUseComponent(projectName: string, values: Record<string, ComponentMapType>): string[] {
  return Object.entries(values).map(([key, _]) => `\tuse ${projectName}::${key}_component;`)
}

/**
 * @param values
 * @return [ name_component::register(&mut world, ctx) ,info_component::register(&mut world, ctx) ]
 */
export function getRegisterComponent(values: Record<string, ComponentMapType>): string[] {
  return Object.entries(values).map(([key, _]) => `\t\t${key}_component::register(&mut world, ctx);`)
}

/**
 * @param values
 * @return [ name_component::register(&mut world) ,info_component::register(&mut world) ]
 */
export function getRegisterSingletonComponent(values: Record<string, ComponentMapType>): string[] {
  return Object.entries(values).map(([key, _]) => `\t\t${key}_component::register(&mut world);`)
}

/**
 *
 * @param projectName
 * @param values
 * @return [ friend projectName::name_system, friend projectName::info_system ]
 */
export function getFriendSystem(projectName: string, values: string[]): string {
  return values.map((key) => `\tfriend ${projectName}::${key};`).join("\n")
}

/**
 *
 * @param values
 * @param prefixArgs
 * @return [ name, age, birth_time ]
 */
export function getStructAttrs(values: ComponentMapType, prefixArgs: string): string[] {
  return typeof values === 'string'
    ? [`${prefixArgs}value`]
    : Object.entries(values).map(([key, _]) => `${prefixArgs}${key}`)
}

/**
 *
 * @param values
 * @return ( bool , u64 , u64)
 */
export function getStructTypes(values: ComponentMapType): string {
  return typeof values === 'string'
    ? values
    : `(${Object.entries(values).map(([_, type]) => `${type}`)})`
}

/**
 *
 * @param values
 * @return Attributes and types of the struct. [ name: string, age: u64 ]
 */
export function getStructAttrsWithType(values: ComponentMapType, prefix: string): string[] {
  return typeof values === 'string'
    ? [`${prefix}value: ${values}`]
    : Object.entries(values).map(([key, type]) => `${prefix}${key}: ${type}`)
}

/**
 * @param values
 * @param prefixArgs
 * @return [ data.name = name , data.age = age ]
 */
export function getStructAttrsUpdate(values: ComponentMapType, prefixArgs: string): string[] {
  return typeof values === 'string'
    ? [`${prefixArgs}data.value = value`]
    : Object.entries(values).map(([key, _]) => `${prefixArgs}data.${key} = ${key}`)
}

/**
 * @param values
 * @param prefixArgs
 * @return [ data.name, data.age ]
 */
export function getStructAttrsQuery(values: ComponentMapType, prefixArgs: string): string[] {
  return typeof values === 'string'
    ? [`${prefixArgs}data.value`]
    : Object.entries(values).map(([key, _]) => `${prefixArgs}data.${key}`)
}

export function renderStruct(componentName: string, values: ComponentMapType | SingletonType): string {
  let map = values
  if (isSingletonType(values)) {
    let singleValue = values as SingletonType;
    map = singleValue.type
  }

  return `\tstruct ${capitalizeFirstLetter(componentName)}Data has drop, store {
${getStructAttrsWithType(map, "\t\t").join(',\n')}
\t}\n`
}

export function renderNewStructFunc(componentName: string, values: ComponentMapType | SingletonType): string {
  let map = values
  if (isSingletonType(values)) {
    let singleValue = values as SingletonType;
    map = singleValue.type
  }

  return `\tpublic fun new(${getStructAttrsWithType(map, "").join(', ')}): ${capitalizeFirstLetter(componentName)}Data {
\t\t${capitalizeFirstLetter(componentName)}Data {
${getStructAttrs(map, "\t\t\t").join(", \n")}
\t\t}
\t}\n`
}

export function renderRegisterFunc(componentName: string): string {
  return `\tpublic fun register(world: &mut World, ctx: &mut TxContext) {
  \t\tworld::add_component<Table<vector<u8>, ${capitalizeFirstLetter(componentName)}Data>>(
\t\t\tworld,
\t\t\tCOMPONENT_NAME,
\t\t\ttable::new<vector<u8>, ${capitalizeFirstLetter(componentName)}Data>(ctx)
\t\t);
\t}
  `
}

export function renderAddFunc(componentName: string, values: ComponentMapType): string {
  return `\tpublic(friend) fun add(world: &mut World, key: vector<u8>, ${getStructAttrsWithType(values, "").join(", ")}) {
\t\tlet component = world::get_mut_component<Table<vector<u8>, ${capitalizeFirstLetter(componentName)}Data>>(world, COMPONENT_NAME);
\t\ttable::add(component, key, new(${getStructAttrs(values, "").join(", ")}));
\t}
`
}

export function renderRemoveFunc(componentName: string): string {
  return `\tpublic(friend) fun remove(world: &mut World, key: vector<u8>) {
\t\tlet component = world::get_mut_component<Table<vector<u8>, ${capitalizeFirstLetter(componentName)}Data>>(world, COMPONENT_NAME);
\t\ttable::remove(component, key);
\t}
`
}

export function renderUpdateFunc(componentName: string, values: ComponentMapType | SingletonType): string {
  let map = values
  if (isSingletonType(values)) {
    let singleValue = values as SingletonType;
    map = singleValue.type
  }
  
  const total =  `\tpublic(friend) fun update(world: &mut World, key: vector<u8>, ${getStructAttrsWithType(map, "").join(", ")}) {
\t\tlet component = world::get_mut_component<Table<vector<u8>, ${capitalizeFirstLetter(componentName)}Data>>(world, COMPONENT_NAME);
\t\tlet data =  table::borrow_mut<vector<u8>, ${capitalizeFirstLetter(componentName)}Data>(component, key);
${getStructAttrsUpdate(map, "\t\t").join(";\n")}
\t}\n`

  const all =  typeof map === 'string'
    ? ''
    : Object.entries(map).map(([key, type]) =>
    `\tpublic(friend) fun update_${key}(world: &mut World, key: vector<u8>, ${key}: ${type}) {
\t\tlet component = world::get_mut_component<Table<vector<u8>, ${capitalizeFirstLetter(componentName)}Data>>(world, COMPONENT_NAME);
\t\ttable::borrow_mut<vector<u8>, ${capitalizeFirstLetter(componentName)}Data>(component, key).${key} = ${key};
\t}
`).join("\n");

  return total + all
}

export function renderSingletonUpdateFunc(componentName: string, values: SingletonType): string {
  return `\tpublic(friend) fun update(world: &mut World, ${getStructAttrsWithType(values.type, "").join(", ")}) {
\t\tworld::get_mut_component<${capitalizeFirstLetter(componentName)}Data>(world, COMPONENT_NAME).value = value; 
\t}\n`
}

export function renderQueryFunc(componentName: string, values: ComponentMapType | SingletonType): string {
  let map = values
  if (isSingletonType(values)) {
    let singleValue = values as SingletonType;
    map = singleValue.type
  }

  const total = `\tpublic fun get(world: &World, key: vector<u8>): ${getStructTypes(map) } {
\t\tlet component = world::get_component<Table<vector<u8>, ${capitalizeFirstLetter(componentName)}Data>>(world, COMPONENT_NAME);
\t\tlet data = table::borrow<vector<u8>, ${capitalizeFirstLetter(componentName)}Data>(component, key);
\t\t(
${getStructAttrsQuery(map, "\t\t\t").join(",\n")}
\t\t)
\t} \n`

  const all = typeof map === 'string'
    ? ''
    : Object.entries(map).map(([key, type]) => `\tpublic fun get_${key}(world: &World, key: vector<u8>): ${type} {
\t\tlet component = world::get_component<Table<vector<u8>, ${capitalizeFirstLetter(componentName)}Data>>(world, COMPONENT_NAME);
\t\ttable::borrow<vector<u8>, ${capitalizeFirstLetter(componentName)}Data>(component, key).${key}
\t}
`).join("\n");

  return total + all
}

export function renderSingletonQueryFunc(componentName: string, values: SingletonType): string {
  return  `\tpublic fun get(world: &World): ${getStructTypes(values.type)} {
\t\tworld::get_component<${capitalizeFirstLetter(componentName)}Data>(world, COMPONENT_NAME).value
\t}`
}

export function renderContainFunc(componentName: string): string {
  return `\tpublic fun contains(world: &World, key: vector<u8>): bool {
\t\tlet component = world::get_component<Table<vector<u8>, ${capitalizeFirstLetter(componentName)}Data>>(world, COMPONENT_NAME);
\t\ttable::contains<vector<u8>, ${capitalizeFirstLetter(componentName)}Data>(component, key)
\t}`
}

function formatData(value: SingletonType): string {
  // TODO: Support other type (string, time, table, bag...)
  let fmtData = value.init
  if (value.type === 'address') {
    fmtData = `@` + value.init
  // } else if (value.type === "table") {
  //   fmtData = ''
  }

  return fmtData

}

export function renderRegisterFuncWithInit(componentName: string, values: SingletonType): string {
  const initData = formatData(values);

  return `\tpublic fun register(world: &mut World) {
  \t\tworld::add_component<${capitalizeFirstLetter(componentName)}Data>(
\t\t\tworld,
\t\t\tCOMPONENT_NAME,
\t\t\tnew(${initData})
\t\t);
\t}
  `
}
