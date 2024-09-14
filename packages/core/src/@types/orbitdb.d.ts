declare module "@orbitdb/core" {
  import EventEmitter from "events";
  import type { Helia, HeliaInit, HeliaLibp2p } from "helia";

  export type DatabaseParams = {
    ipfs: HeliaLibp2p;
    identity?: Identity;
    address: string;
    name?: string;
    access?: AccessController;
    directory?: string;
    meta?: object;
    headsStorage?: Storage;
    entryStorage?: Storage;
    indexStorage?: Storage;
    referencesCount?: number;
    syncAutomatically?: boolean;
    onUpdate?: () => void;
  };
  
  export type OiDbElements =
    | number
    | boolean
    | string
    | bigint;
  
  export type OiDbArrays = 
    | Array<Object>
    | Array<OiDbElements>;
  
  export type OiDbSchema = {};

  export type OiDbObjects = 
    | { [key: string]: OiDbElements | OiDbArrays }
    | OiDbSchema
    | Object;
  

  export type Database = {
    type: string;
    addOperation: (args: {
      op: string;
      key: string | null;
      value: unknown;
    }) => Promise<string>;
    address: string;
    close(): Promise<void>;
    drop(): Promise<void>;
    events: EventEmitter<{ update: [entry: LogEntry] }>;
    access: AccessController;
    log: Log;
    identity: Identity;
  };

  export function Database(args: {
    ipfs: Helia;
    identity?: Identity;
    address: string;
    name?: string;
    access?: AccessController;
    directory?: string;
    meta?: object;
    headsStorage?: Storage;
    entryStorage?: Storage;
    indexStorage?: Storage;
    referencesCount?: number;
    syncAutomatically?: boolean;
    onUpdate?: () => void;
  }): Promise<Database>;

  export function Documents({ indexBy: string }): any;

  export function KeyValueIndexed(): any;
  export function KeyValue(): any;

  module Databases {
    type Events<T extends OiDbElements | OiDbObjects | OiDbArrays> = Database & {
      add: (value: T) => Promise<string>;
      get: (hash: string) => Promise<T | null>;
      iterator: <TReturn = any, TNext = unknown>(filters?: {
        gt?: string;
        gte?: string;
        lt?: string;
        lte?: string;
        amount?: string;
      }) => AsyncGenerator<{ hash: any; value: any }, TReturn, TNext>;
      all: () => Promise<[hash: string, value: string][]>;
    };

    type Documents<T extends OiDbObjects> = Database & {
      put: (doc: T) => Promise<string>;
      all: () => Promise<{ hash: string; key: string; value: T }[]>;
      del: (key: string) => Promise<string>;
      get: (key: string) => Promise<T | null>;
      iterator: (filters?: {
        amount?: string;
      }) => AsyncGenerator<
        { hash: string; key: string; value: T },
        void,
        unknown
      >;
      query: (
        findFn: (doc: T) => WithImplicitCoercion<boolean>
      ) => Promise<T[]>;
    };

    type KeyValue<T = OiDbElements | OiDbArrays | OiDbObjects> = Database & {
      put: (key: string, value: T) => Promise<string>;
      del: (key: string) => Promise<any>;
      get: (key: string) => Promise<T | null>;
      all: () => Promise<{ key: string; value: T; hash: string }[]>;
      iterator: (filters?: {
        amount?: string;
      }) => AsyncGenerator<
        { key: string; value: T; hash: string },
        void,
        unknown
      >;
    };
  }

  export type Identity = {
    id: string;
    publicKey: string;
    signatures: {
      id: string;
      publicKey: string;
    };
    type: string;
    sign: (identity: Identity, data: string) => Promise<string>;
    verify: (
      signature: string,
      publicKey: string,
      data: string
    ) => Promise<boolean>;
  };

  export type OrbitDB = {
    id: string;
    open: (
      address: string,
      params?: OrbitDBDatabaseOptions
    ) => ReturnType<typeof Database>;
    stop;
    ipfs;
    directory;
    keystore;
    identity: Identity;
    peerId;
  };
  export function createOrbitDB(params: {
    ipfs: Helia;
    id?: string;
    identity?: Identity | { provider?: Function };
    identities?: typeof Identities;
    directory?: string;
  }): Promise<OrbitDB>;

  export function useAccessController(accessController: { type: string }): void;
  export function isValidAddress(address: unknown): boolean;

  export type Log = {
    id;
    clock: Clock;
    heads: () => Promise<LogEntry[]>;
    traverse: () => AsyncGenerator<LogEntry, void, unknown>;
  };

  export function AccessControllerGenerator(options: {
    orbitdb: OrbitDB;
    identities: IdentitiesType;
    address?: string;
  }): Promise<AccessController>;

  export class AccessController {
    write: string[];
    type: string;
    address: string;
    canAppend: (entry: LogEntry) => Promise<boolean>;
  }

  export function useDatabaseType(type: { type: string }): void;

  export function OrbitDBAccessController(options?: {
    write?: string[];
  }): (args: {
    orbitdb: OrbitDB;
    identities: IdentitiesType;
    address?: string;
  }) => Promise<
    AccessController & {
      type: "orbitdb";
      capabilities: () => Promise<any>;
      close: () => Promise<void>;
      drop: () => Promise<void>;
      get: (capability: string) => Promise<Array<any>>;
      grant: (capability: string, key: string) => Promise<void>;
      hasCapability: (capability: string, key: string) => Promise<boolean>;
      revoke: (capability: string, key: string) => Promise<void>;
    }
  >;

  export function IPFSAccessController(options?: {
    write?: string[];
    storage?: Storage;
  }): (args: {
    orbitdb: OrbitDB;
    identities: IdentitiesType;
    address?: string;
  }) => Promise<AccessController & { type: "ipfs" }>;

  export function Identities(args: {
    keystore?: KeyStoreType;
    path?: string;
    storage?: Storage;
    ipfs?: Helia;
  }): Promise<IdentitiesType>;
  export class IdentitiesType {
    createIdentity;
    getIdentity;
    verifyIdentity: (identity) => boolean;
    sign;
    verify;
    keystore;
  }
  export const Entry: {
    create: (
      identity: Identity,
      id: string,
      payload: unknown,
      clock?: Clock,
      next?: string[],
      refs?: string[]
    ) => Promise<LogEntry>;
    verify: (identities: IdentitiesType, entry: LogEntry) => Promise<boolean>;
    decode: (bytes: Uint8Array) => Promise<LogEntry>;
    isEntry: (obj: object) => boolean;
    isEqual: (a: LogEntry, b: LogEntry) => boolean;
  };
  export class Storage {
    put;
    get;
  }
  export function IPFSBlockStorage({
    ipfs: IPFS,
    pin: boolean,
  }): Promise<Storage>;
  export function LRUStorage({ size: number }): Promise<Storage>;
  export function ComposedStorage(...args: Storage[]): Promise<Storage>;

  export type OrbitDBDatabaseOptions = {
    type?: string;
    AccessController?: typeof AccessControllerGenerator;
    syncAutomatically?: boolean;
    sync?: boolean;
    Database?: typeof Documents;
    headsStorage?: Storage;
    entryStorage?: Storage;
    indexStorage?: Storage;
    referencesCount?: number;
  };

  export type Clock = {
    id: string;
    time: number;
  };

  export type LogEntry<T = unknown> = {
    id: string;
    payload: { op: string; key: string | null; value?: T };
    next: string[];
    refs: string[];
    clock: Clock;
    v: Number;
    key: string;
    identity: string;
    sig: string;
    hash: string;
  };

  export type KeyValue<T extends OiDbElements | OiDbSchema> = {
    type: "keyvalue";
    address: string;
    put(key: string, value: unknown): Promise<string>;
    del(key: string): Promise<string>;
    get(key: string): Promise<T | undefined>;
    all(): Promise<{ key: string; value: T; hash: string }[]>;
    close(): Promise<void>;
    drop(): Promise<void>;
    events: EventEmitter;
    access: AccessController;
    log: Log;
  };

  export function KeyStore(args: {
    storage?: Storage;
    path?: string;
  }): Promise<KeyStoreType>;

  export type KeyStoreType = {
    clear;
    close;
    hasKey;
    addKey;
    createKey;
    getKey;
    getPublic;
  };
}
