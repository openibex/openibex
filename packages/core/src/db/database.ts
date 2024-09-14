import { createOrbitDB, OrbitDB } from '@orbitdb/core';
import { getDefaultIdentityID, getIdentitiesManager, initIdentitiesManager } from './identity';

let runningDB: Record<string, any> = [];
let orbitdb: OrbitDB;
let oiLogger: any;

/**
 * Sets the OrbitDB base instance.
 * 
 * @param db The orbit DB instance to use.
 */
export async function initOrbitDB(settings: any, logger: any) {
  oiLogger = logger;
  await initIdentitiesManager(settings.ipfs, settings.directory);
  settings.identities = getIdentitiesManager();
  settings.id = getDefaultIdentityID();

  orbitdb = await createOrbitDB(settings);
  oiLogger.info(`Initialized OrbitDB, identity: ${orbitdb.identity.id}`);
}

/**
 * Returns true if DB is ready.
 * 
 * @returns 
 */
export function isDBReady() {
  if(orbitdb)
    return true;

  return false;
}

/**
 * Returns the OrbitDB instance.
 * 
 * @returns OrbitDB instance
 */
export function getOrbitDB() {
  if(orbitdb)
    return orbitdb

  throw Error('DB: No OrbitDB configured yet.');
}

/**
 * Opens a database. Will create DB if it doesn't exist.
 * @param address Address starting with /orbitdb/ (or name if not initialized)
 * @param type OrbitDB type, default "events"
 * @returns An opened OrbitDB database.
 */
export async function openDatabase(address: string, type: string = 'keyvalue'): Promise<any> {
  if(address in runningDB.keys) {
    return runningDB[address];
  }

  const db = await getOrbitDB().open(address, {type, syncAutomatically: true})

  runningDB[db.address]= db;

  return db;
}

/**
 * Stopping the databases.
 * @param logger 
 */
export async function stopDatabase(logger: any) {
  const closePromises: Promise<any>[] = [];

  for (const key in runningDB) {
    logger.info(`stopNode: Closing database ${key}`);
    closePromises.push(runningDB[key].close());
  }
  await Promise.all(closePromises);
  
  logger.info(`stopNode: Closing OrbitDB`);
  await orbitdb.stop();
}
