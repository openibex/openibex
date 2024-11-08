import { KeyValue } from "@orbitdb/core";

import { OiConfig, OiConfigDatabase, OiConfigHelia } from "./config";
import { oiCorePlugins, type OiCoreSchema } from "./plugins";
import { OiDatabase, OiDbManager, registerDatabaseTypes } from "./db";
import { OiNode } from "./node";
import { OiLoggerInterface } from "./types";

// OiCore-Singleton
let core: OiCore | undefined = undefined;
let coreInitLock: boolean = false;

/**
 * Retrieves the core (and initializes it on first call)
 * 
 * Throughout the whole application, a single instance of OiCore is kept, which is retrieved
 * using this method. 
 * 
 * Typically, getOiCore() is called at startup of the application with the config and the logger passed as argument to
 * initialize the core-object accordingly.
 *  
 * On any subsequent calls of `getOiCore()`, config and logger do not need to be provided and will be ignored.
 * 
 * @param config Parsed OiConfig
 * @param logger Logger, if not provided on first call, OiLogger will be used
 * 
 * @returns Fully operational OiCore instance representing the app.
 */
export async function getOiCore(config: OiConfig | undefined = undefined, logger: OiLoggerInterface | undefined = undefined): Promise<OiCore> {
  while(coreInitLock) {
    await new Promise(resolve => setTimeout(resolve, 25))
  }
  
  if(!core) {
    if(config === undefined) {
      throw Error("Core still needs to be initialized. For initialization, config and logger are required");
    }

    // Per default, initialize the oiLogger
    if(logger === undefined) {
      logger = new BaseLogger();
    }
    registerDatabaseTypes();
    await initOiCore(config!, logger);
  } 
  return core!;
}


// ##################################### INTERNAL FUNCTIONALITY
/**
 * Initializes the core, will be called from the first call of getOiCore.
 */
async function initOiCore(config: OiConfig, logger: OiLoggerInterface): Promise<void> {
  if(core != undefined) {
    throw Error("Core was already initialized earlier, it can only be initialized once!");
  }
  
  coreInitLock = true;

  if (!config.database.address) throw Error('No DB address for coreDB in config. Please edit your config or run npx oi init');
  logger.info('Starting Helia IPFS Server...');
  const node = await OiNode.getInstance(config.helia, config.database, logger);
  await node.start()

  core = new OiCore(config);
  logger.info('Core created, proceed to core init.');

  const coreDB = await OiDatabase.getInstance().open(config.database.address, 'keyvalue') as unknown as KeyValue<OiCoreSchema>;
  logger.info('CoreDB successfully opened.');

  await core.init(coreDB, logger);
  await oiCorePlugins.initPlugins(config, coreDB, logger);

  coreInitLock = false;
}

class BaseLogger implements OiLoggerInterface {
  private logMessage(level: string, message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} [${level.toUpperCase()}]: ${message}`);
  }

  public log(level: string, message: string): void {
    this.logMessage(level, message);
  }

  public info(message: string): void {
    this.logMessage('info', message);
  }

  public warn(message: string): void {
    this.logMessage('warn', message);
  }

  public error(message: string): void {
    this.logMessage('error', message);
  }

  // Other log level methods can be added similarly
}

/**
 * The core application class. The core stores settings, administers databases and producers.
 */
export class OiCore {
  private namespace: 'openibex';
  private name: 'core';

  private dbConf: OiConfigDatabase;
  private heliaConf: OiConfigHelia;
  private pluginConf: any;

  private appDbManager!: OiDbManager;
  private valuesDB!: KeyValue<any>
  public log!: OiLoggerInterface;

  /**
   * Construtor for OiCore
   * 
   * @param config A configuration in OiConfig format
   * @param logger A logger object.
   */
  constructor(config: OiConfig) {
    this.dbConf = config.database;
    this.heliaConf = config.helia;
    this.pluginConf = config.plugins;
  }

  /**
   * Plugin initialization. Sets logger, coreDB, valueDB and calls all initFragments.
   * 
   * @param config Application config object.
   * @param coreDB Core database
   * @param logger 
   */
  public async init(coreDB: KeyValue<OiCoreSchema>, logger: any): Promise<void> {
    this.log = logger;
    this.appDbManager = new OiDbManager(`${this.dbConf.namespace}`, logger, coreDB);
    this.valuesDB = await this.appDbManager.getDB(1, 'keyvalue', `values`) as unknown as KeyValue<any>;
  }

    /**
   * Stores a settings value for a plugin (persistent, among all workers)
   * 
   * @param value Value to store
   * @param name Setting name recommendation is to have dotted names.
   * @param tag Tag, will be added to the name for entity-specific settings. (i.e. a connector setting that can be changed per contract.)
   */
  public async setVal(value: any, name: string, tag?: string): Promise<void> {
    if (!this.valuesDB) throw Error('Database valuesDB not initialized. Run OiCore.init() first.');

    await this.valuesDB.put(`${this.namespace}.${name}.${tag ? '.' + tag : ''}`, value);
  }

  /**
   * Get a stored settings value by name. All settings are namespaced
   * and thus names only need to be unique within your plugin.
   * 
   * @param name Setting name
   * @param tag Tag, will be added to the name for entity-specific settings. (i.e. a connector setting that can be changed per contract.)
   * @returns 
   */
  public async getVal(name: string, tag?: string): Promise<any> {
    if (!this.valuesDB) throw Error('Database valuesDB not initialized. Run OiCore.init() first.');

    return await this.valuesDB.get(`${this.namespace}.${name}.${tag ? '.' + tag : ''}`);
  }

  /**
   * Deletes a value.
   * 
   * @param name Setting name
   * @param tag Tag, will be added to the name for entity-specific settings. (i.e. a connector setting that can be changed per contract.)
   * @returns 
   */
  public async delVal(name: string, tag?: string): Promise<any> {
    if (!this.valuesDB) throw Error('Database valuesDB not initialized. Run OiCore.init() first.');

    await this.valuesDB.del(`${this.namespace}.${name}.${tag ? '.' + tag : ''}`);
  }
    
  //TODO: onUpdateValue(dottedName: string, callback: (key, value) => {})

  /**
   * Opens a database in read / write mode.
   * 
   * @param name - DB identifier
   * @param revision - Schema revision
   * @param type - Orbitdb Type, includes registered custom types.
   * @returns An OrbitDB Database of the specified type.
   */
  public async getDB(revision: number, type: string, name: string, tag?: string): Promise<any> {
    return await this.appDbManager.getDB(revision, type, name, tag);
  }

  /**
   * Returns a plugin service. Shorthand abstraction of plugin registry.
   * 
   * @param pluginDottedName 
   * @param serviceName 
   * @returns 
   */
  public getService(pluginDottedName, serviceName) {
    const [namespace, pluginName] = pluginDottedName.split('.');
    return oiCorePlugins.getPlugin(namespace, pluginName).getService(serviceName);
  }

  public async stop() {
    await OiNode.getInstance().stop();
  }
}
