import { Database, DatabaseParams } from "@orbitdb/core";

const type = 'oiscoredset';

/**
 * OiStream is an OrbitDB database that works like a Redis stream.
 * Messages submitted to streams require an id in format number1-number2
 * The numbers need to increment. If a number is missing, it's automatically incremented.
 * 
 * Example:
 * - Number1 is the block-number.
 * - Number2 is the EventLog number.
 * - EventLogs have to be written sequentially. The ID system ensures the sequence.
 * 
 * @param param0 
 * @returns 
 */
export const OiStreamDatabase = async ({
  ipfs,
  identity,
  address,
  name,
  access,
  directory,
  meta,
  syncAutomatically,
}: DatabaseParams): Promise<typeof OiStreamDatabase> => {
  const database = await Database({ ipfs, identity, address, name, access, directory, meta, syncAutomatically });

  const { addOperation, log } = database;

  /**
   * Puts an item to the underlying database. You will probably want to call 
   * Database's addOperation here with an op code 'PUT'.
   */
  const put = async (doc: any): Promise<void> => {
    // Implement your PUT logic here
  };

  /**
   * Deletes an item from the underlying database. You will probably want to
   * call Database's addOperation here with an op code 'DEL'.
   */
  const del = async (key: string): Promise<void> => {
    // Implement your DELETE logic here
  };

  /**
   * Gets an item from the underlying database. Use a hash or key to retrieve 
   * the value.
   */
  const get = async (key: string): Promise<any> => {
    // Implement your GET logic here
  };

  /**
   * Iterates over the data set.
   */
  const iterator = async function* ({ amount }: { amount?: number } = {}): AsyncGenerator<any, void, unknown> {
    // Implement your iterator logic here
  };

  return {
    ...database,
    type,
    put,
    del,
    get,
    iterator,
  };
};

OiStreamDatabase.type = type;
