import { KeyValueIndexed, DatabaseParams, OiDbElements, OiDbArrays, OiDbObjects, Database, useDatabaseType } from "@orbitdb/core";

const type = 'oikeyvalue-extended';

export type OiNKeyValueIndexed<T = OiDbElements | OiDbArrays | OiDbObjects> = Database & {
  put: (key: string, value: T) => Promise<string>;
  del: (key: string) => Promise<any>;
  get: (key: string) => Promise<T | null>;
  has: (key: string) => Promise<boolean>;
  all: () => Promise<{ key: string; value: T; hash: string }[]>;
  iterator: (filters?: {
    amount?: string;
  }) => AsyncGenerator<
    { key: string; value: T; hash: string },
    void,
    unknown
  >;
};

/**
 * OiNKeyValueIndexed is based on "KeyValueIndexed", thus has similar capabilities and behavior.
 * It is extended by a "has"-method which makes querying faster.
 * 
 * OiNKeyValueIndexed is the recommended DB-format for databases with a high query load. 
 * 
 * @returns 
 */
export const OiNKeyValueIndexedDatabase = () => async ({
  ipfs,
  identity,
  address,
  name,
  access,
  directory,
  meta,
  headsStorage, entryStorage, indexStorage, referencesCount, 
  syncAutomatically,
  onUpdate
}: DatabaseParams)  => {
  const database = await KeyValueIndexed()({ ipfs, identity, address, name, access, directory, meta, headsStorage, entryStorage, indexStorage, referencesCount, syncAutomatically, onUpdate });

  /**
   * Queries the index and returns true if the item exists.
   */
  const has = async (key: string): Promise<boolean> => {
    return (await database.get(key)) ? true : false;
  };

  return {
    ...database,
    type,
    put: database.put,
    del: database.del,
    get: database.get,
    has,
    iterator: database.iterator,
  };
};

OiNKeyValueIndexedDatabase.type = type;

