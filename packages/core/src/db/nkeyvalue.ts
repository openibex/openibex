import { Database, DatabaseParams, OiDbArrays, OiDbElements, OiDbObjects, useDatabaseType } from "@orbitdb/core";

const type = 'oinkeyvalue';


export type OiNKeyValue<T = OiDbElements | OiDbArrays | OiDbObjects> = Database & {
  put: (key: number, value: T) => Promise<string>;
  del: (key: number) => Promise<any>;
  get: (key: number) => Promise<T | null>;
  has: (key: number) => Promise<boolean>;
  all: () => Promise<{ key: number; value: T; hash: string }[]>;
  iterator: (filters?: {
    amount?: string;
  }) => AsyncGenerator<
    { key: number; value: T; hash: string },
    void,
    unknown
  >;
};

/**
 * NKeyValue works similar to "KeyValueIndexed" but with a numeric (integer) key.
 * 
 * It is extended by a "has"-method which makes querying faster.
 * The get function allows you to get a "nearest" position to a numeric value. This allows
 * for smart indexing.
 * 
 * Example: If the number represents a timestamp and the database tracks a token supply, only
 * the blocks with actual supply changes will have to be indexed. If supply is queried for a block
 * with no supply change, the last block with supply change will be returned.
 * 
 * @returns 
 */
export const OiNKeyValueDatabase = () => async ({
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
  const database = await Database({ ipfs, identity, address, name, access, directory, meta, headsStorage, entryStorage, indexStorage, referencesCount, syncAutomatically, onUpdate });

  const { addOperation, log } = database;

  /**
   * Puts an item to the database. 
   * 
   * @param key Numeric Key
   * @param value
   * 
   * @returns 
   */
  const put = async (key: number, value: any): Promise<string> => {
    return await addOperation({ op: 'PUT', key: key.toString(), value })
  };

  /**
   * Deletes an item from the underlying database. You will probably want to
   * call Database's addOperation here with an op code 'DEL'.
   */
  const del = async (key: number): Promise<string> => {
    return await addOperation({ op: 'DEL', key: key.toString(), value: null });
  };

  /**
   * Gets an item from the underlying database. Use a numeric key to retrieve 
   * the value.
   * 
   * @param key Numeric Key
   * @param exact Exact matching, <= matching if false (default)
   * 
   * @returns Value stored at key or <= key.
   */
  const get = async (key: number, exact = false): Promise<any> => {
    const keystr = key.toString();
    // Implement your GET logic here
    for await (const entry of log.traverse()) {
      const { op, key: k, value } = entry.payload

      if (exact && op === 'PUT' && k === keystr) {
        return value
      } else if (!exact && op === 'PUT' && Number(k) <= key) {
        return value
      } else if (exact && op === 'DEL' && Number(k) === key) {
        return
      }
    }
  };

  /**
   * Iterate through the stored keys. Iteration is a reverse traverse (newest element first.)
   * 
   * @param param0 Query object.
   */
  const iterator = async function* ({ amount }: { amount: number } = { amount: 20 }): AsyncGenerator<
  {
    key: number
    value: unknown;
    hash: string;
  },
  void,
  unknown> 
  {
    const keys = {}
    let count = 0

    for await (const entry of log.traverse()) {
      if(!entry.payload.key) {
        continue;
      }
      const { op, key, value } = entry.payload

      if (op === 'PUT' && !keys[key]) {
        keys[key] = true;
        count++;
        const hash = entry.hash;
        yield { key: Number(key), value, hash }
      } else if (op === 'DEL' && !keys[key]) {
        keys[key] = true
      }

      if (count >= amount) {
        break
      }
    }
  };

  /**
   * Queries the index and returns true if the item exists.
   */
  const has = async (key: number): Promise<boolean> => {
    return (await get(key, true)) ? true : false;
  };

  /**
   * Returns the newest element
   */
  const newest = async (): Promise<{
    key: number,
    value: unknown,
    hash: string,
  }| void> => {
    
    let retval: {
      key: number
      value: unknown;
      hash: string;
    } | undefined;

    for await (const entry of iterator({amount: 1})){
      retval = {
        key: entry.key,
        value: entry.value,
        hash: entry.hash
      }
    }

    if (retval)
      return retval;
  }

  return {
    ...database,
    type,
    put,
    del,
    get,
    has,
    newest,
    iterator,
  };
};

OiNKeyValueDatabase.type = type;
