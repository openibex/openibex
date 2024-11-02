import { KeyValue } from "@orbitdb/core";

import { OiConfig, OiConfigDatabase, OiConfigHelia } from "./core.config";
import { getPlugin, initPlugins, OiPlugin, OiPluginService, registerOiPlugin, type OiCoreSchema } from "./plugins";
import { OiDbManager, openDatabase, registerDatabaseTypes } from "./db";

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

  core = new OiCore(config);

  // the core is a plugin itself, register it
  registerOiPlugin('core', 'openibex', core, []);

  const coreDB = await openDatabase(config.database.address, 'keyvalue') as unknown as KeyValue<OiCoreSchema>;
  
  await initPlugins(config, coreDB, logger);
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
export class OiCore extends OiPlugin {
  private dbConf: OiConfigDatabase;
  private heliaConf: OiConfigHelia;
  private pluginConf: any;

  private appDbManager!: OiDbManager;
  private valuesDB!: KeyValue<any>
  /**
   * Construtor for OiCore
   * 
   * @param config A configuration in OiConfig format
   * @param logger A logger object.
   */
  constructor(config: OiConfig) {
    super('core', 'openibex', {});

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
  public async init(config: any, coreDB: KeyValue<OiCoreSchema>, logger: any): Promise<void> {
    super.init(config, coreDB, logger);

    this.appDbManager = new OiDbManager(`${this.dbConf.namespace}`, logger, coreDB);
    this.valuesDB = await this.appDbManager.getDB(1, 'keyvalue', `values`) as unknown as KeyValue<any>;
  }

  public getPlugin(dottedPluginName: string): OiPlugin {
    const [namespace, pluginName] = dottedPluginName.split('.');
    return getPlugin(namespace, pluginName);
  }

  public async getService(dottedPluginName: string, serviceName?: string): Promise<OiPluginService> {
    return this.getPlugin(dottedPluginName).getPluginService(serviceName);
  }

    /**
   * Stores a settings value for a plugin (persistent, among all workers)
   * 
   * @param value Value to store
   * @param name Setting name
   * @param tag Tag, will be added to the name for entity-specific settings. (i.e. a connector setting that can be changed per contract.)
   */
  public async setVal(value: any, name: string, tag?: string): Promise<void> {
    if (!this.valuesDB) throw Error('Database valuesDB not initialized. Run OiCore.init() first.');

    await this.valuesDB.put(`${this.namespace}.${this.name}.${name}.${tag ? '.' + tag : ''}`, value);
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

    return this.valuesDB.get(`${this.namespace}.${this.name}.${name}.${tag ? '.' + tag : ''}`);
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
}
