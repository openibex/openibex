import { HeliaLibp2p } from "helia";
import { AccessController, Identity } from "@orbitdb/core";

export type OiDbSchema = {};

export type OiDbElements =
  | number
  | boolean
  | string
  | bigint;

export type OiDbArrays = 
  | Array<Object>
  | Array<OiDbElements>;

export type OiDbObjects = 
  | { [key: string]: OiDbElements | OiDbArrays }
  | Object;


