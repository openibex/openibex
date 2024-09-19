import { KeyValue } from "@orbitdb/core";
import { OiConfig } from "./core.config";
import { startNode } from "./node";
import { openDatabase } from "./db";
import { getOiCore } from "./index";
import type { OiCoreSchema } from "./plugins";

// Define the type for the database entry
export interface DatabaseEntry {
  name: string;
  address: string;
  type: string;
}

// Define the type for the settings entry
export interface SettingsEntry {
  name: string;
  plugin: string;
  namespace: string;
  value: boolean | string | number | object;  // Assuming default can be any value matching the format
}

// Define the IbexPreload type
export interface OiPreload {
  database: DatabaseEntry[];
  settings: SettingsEntry[];
}

/**
 * Initializes an app that previously wasnt configured. To persist the configuration note the
 * address in the log output and add it to the config as core database.
 * 
 * @param config OiConfig to initialize the app with.
 * @param preload The preload databases and values.
 * @param logger The logger instance to use.
 */
export async function initApp(config: OiConfig, preload: OiPreload, logger: any) {
  logger.info('Starting Helia IPFS Server...');
  await startNode(config.helia, config.database, logger);
    
  const coreDB = await openDatabase(
    `${config.database.namespace}.core.v1`, 'keyvalue'
  ) as unknown as KeyValue<OiCoreSchema>;

  logger.info(`Initializing Dapp with coreDB Address: ${coreDB.address}`);

  // CoreDB contains a set of databases. This preloads overwrites for module
  // Databases, as specified in the preload.yaml.
  for(const value of preload.database) {
    await coreDB.put(value.name, {address: value.address, type: value.type})
  }

  config.database.address = coreDB.address;
  
  const core = await getOiCore(config, logger);

  for(const entry of preload.settings){
    await core.setVal(entry.value, `${entry.namespace}.${entry.plugin}.${entry.name}`);
    logger.info(`Preload entry ${entry.namespace}.${entry.plugin}.${entry.name} to value: ${await core.getVal( entry.name, `${entry.namespace}.${entry.plugin}.${entry.name}`)}`);
  }

  // Currently no other workaround for that: KeyValueIndexed creates a LevelStorage index.
  // This requires a lot of async calls, and does not prevent the DB from closing.
  // OrbitDB databases by default do not have any locks that would prevent a DB from closing
  // while index is created.
  logger.info(`Resolver Database is creating index, waiting for 5 seconds.`);
  await new Promise(resolve => setTimeout(resolve, 5000));
}
