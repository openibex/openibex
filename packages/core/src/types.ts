/**
 * A simplistic Logger Interface compatible with standard loggers out there
 * (e.g. winston logging library
 */
export interface OiLoggerInterface {
  log(level: string, message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  // Add other methods if needed
}

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

export interface OiConfigHelia {
  libp2p: {
    mode: 'standalone' | 'public' | 'airgap' | 'browser';
  };
  blockstore: any;
  datastore: any;
}

export interface OiConfigDatabase {
  namespace: string;
  address: string;
  path: string;
}

export interface OiConfig {
  helia: OiConfigHelia;
  wallets?: any;
  plugins: any;
  database: OiConfigDatabase;
}
