import { Types } from 'aptos';
export type ContractFactoryParams = {
  packageId?: string;
  metadata?: Types.MoveModule;
};

export type MoveModuleValueType = {
  address: string;
  name: string;
  friends: Types.MoveModuleId[];
  structs: Types.MoveStruct[];
  exposed_functions: Types.MoveFunction[];
};

export type MoveModuleFuncType = {
  contractAddress: string;
  moduleName: string;
  funcName: string;
  visibility: Types.MoveFunctionVisibility;
  isEntry: boolean;
  isView: boolean;
  typeParameters: Types.MoveFunctionGenericTypeParam[];
  parameters: Types.MoveType[];
  return: Types.MoveType[];
};
