import { KeyValue } from "@orbitdb/core";

import { OiConfig, OiConfigDatabase, OiConfigHelia } from "./config";

import { OiPlugin, OiPluginRegistry, OiPluginService, type OiCoreSchema } from "./plugins";
import { OiDatabase, OiDbManager, registerDatabaseTypes } from "./db";
import { OiNode } from "./node";
import { OiLoggerInterface } from "./types";

// OiCore-Singleton
let core: OiCore | undefined = undefined;
let coreInitLock: boolean = false;

// Either keeps the logger when defined
// or returns a BaseLogger
// This is for startup-procedure only, then the OiCore has the logger internally.
function getLogger(logger: OiLoggerInterface | undefined): OiLoggerInterface {
  return logger ? logger : new BaseLogger();  
}

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
    getLogger(logger).warn("OiCore is currently initializing... wait")
    await new Promise(resolve => setTimeout(resolve, 25))
  }
  
  if(!core) {
    if(config === undefined) {
      throw Error("Core still needs to be initialized. For initialization, config and logger are required");
    }

    registerDatabaseTypes();
    await initOiCore(config!, getLogger(logger));
  } 

  if(!core.isInitialized) {
    throw new Error("OiCore is not fully initialized yet. Have you used getOiCore() in plugin inits?")
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

  await core.init(config, coreDB, logger);
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
  private _isInitialized: boolean = false;


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
    this._isInitialized = false;
  }

  public isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * Sets logger, coreDB, valueDB and calls all initFragments.
   * 
   * The core is no plugin itself, yet this calls the init-functions of the plugins
   * 
   * @param config Application config object.
   * @param coreDB Core database
   * @param logger 
   */
  public async init(config: OiConfig, coreDB: KeyValue<OiCoreSchema>, logger: any): Promise<void> {
    if(this.isInitialized()) {
      throw new Error("OiCore can only be initialized once");
    }
    this.log = logger;
    this.appDbManager = new OiDbManager(`${this.dbConf.namespace}`, logger, coreDB);
    this.valuesDB = await this.appDbManager.getDB(1, 'keyvalue', `values`) as unknown as KeyValue<any>;
    
    await OiPluginRegistry.getInstance().initPlugins(config, coreDB, logger);
    this._isInitialized = true;
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

  /**
   * Returns a plugin service. Shorthand abstraction of plugin registry.
   * 
   * @param pluginDottedName Dotted plugin name in format <namespace>.<pluginName> as registered
   * @param serviceName Name of the service as registered in the plugin.
   * @returns Instance derived from OiService
   */
  public getService(pluginDottedName, serviceName): OiPluginService {
    let dotCount: number = pluginDottedName.split('.').length - 1;
    if(dotCount != 1) {
      throw new Error("pluginDottedName needs to follow format <namespace>.pluginName");
    }

    const [namespace, pluginName] = pluginDottedName.split('.');
    return OiPluginRegistry.getInstance().getPlugin(namespace, pluginName).getService(serviceName);
  }

  /**
   * Get a fully initialized OiPlugin by name.
   * 
   * @param namespace Namespace for the plugins
   * @param pluginName The name of the plugin, as registered
   * @returns Initialized OiPlugin
   */
  public getPlugin(namespace:string, pluginName:string): OiPlugin {
    if(!this.isInitialized()) {
      throw new Error("Plugins are only available and initialized after OiCore.init()")
    }
    return OiPluginRegistry.getInstance().getPlugin(namespace, pluginName);
  }

  public async stop() {
    await OiNode.getInstance().stop();
  }
}
