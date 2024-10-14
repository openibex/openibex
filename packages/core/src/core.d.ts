

export type OiValueSchema = { 
  datatype: string, 
  value: string 
};

export enum OiValueType {
  String = "string",
  Number = "number",
  Boolean = "boolean",
  BigInt = "bigint",
  Symbol = "symbol",
  Null = "null",
  Undefined = "undefined"
}
