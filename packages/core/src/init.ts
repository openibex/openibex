import { KeyValue } from "@orbitdb/core";
import { OiConfig } from "./config";
import { OiNode } from "./node";
import { OiDatabase } from "./db";
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
export async function initApp(config: OiConfig, logger: any, preload?: OiPreload) {
  logger.info('Starting Helia IPFS Server...');
  const node = await OiNode.getInstance(config.helia, config.database, logger);
  await node.start();
    
  const coreDB = await OiDatabase.getInstance().open(
    `${config.database.namespace}.core.v1`, 'keyvalue'
  ) as unknown as KeyValue<OiCoreSchema>;

  logger.info(`=========================================================================`)
  logger.info(`= OpenIbex successfully initialized.                                    =`)
  logger.info(`= ----------------------------------                                    =`)
  logger.info(`= CoreDB at: ${coreDB.address} =`)
  logger.info(`= Put it in your config at database.address to activate.                =`)
  logger.info(`=========================================================================`)

  if(preload) {
    // CoreDB contains a set of databases. This preloads overwrites for module
    // Databases, as specified in the preload.yaml.
    for(const value of preload.database) {
      await coreDB.put(value.name, {address: value.address, type: value.type})
    }
  }

  await node.stop();

  return coreDB.address;
}

