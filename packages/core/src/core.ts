import { KeyValue } from "@orbitdb/core";

import { OiConfig, OiConfigDatabase, OiConfigHelia } from "./core.config";
import type { OiCoreSchema } from "./core.d";
import { getPluginNamespace, initPlugins, isRegisteredPlugin, registerOiPlugin } from "./plugins";
import { openDatabase, registerDatabaseTypes } from "./db";
import { getPrimitive } from "./primitives";

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


// OiCore-Singleton
let core: OiCore | undefined = undefined;

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

  core = new OiCore(config, logger);
  await core.init();
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
 * The core application class. The core stores settings, administers databases and primitives.
 */
export class OiCore {
  private dbConf: OiConfigDatabase;
  private heliaConf: OiConfigHelia;
  private pluginConf: any;

  private coreDB: KeyValue<OiCoreSchema> | undefined;
  private valuesDB: KeyValue<any> | undefined;
  private isInitialized: boolean = false;

  public log: OiLoggerInterface;

  /**
   * Construtor for OiCore
   * 
   * @param config A configuration in OiConfig format
   * @param logger A logger object.
   */
  constructor(config: OiConfig, logger: OiLoggerInterface) {
    this.dbConf = config.database;
    this.heliaConf = config.helia;
    this.pluginConf = config.plugins;
    this.log = logger

    if (!this.dbConf.address) throw Error('No DB address for coreDB in config. Please edit your config or run npx oi init');
  }
  

  /**
   * Init method. Retrieves the database, starts the node and initializes all the plugins (including the core-plugin).
   */
  public async init(){
    if(this.isInitialized) {
      throw Error("Core was already initialized earlier, init() can only be called once!");
    }
    // Safeguard to ensure method can only be called once!
    this.isInitialized = true;

    // the core is a plugin itself, register it
    registerOiPlugin('core', this.dbConf.namespace, (name: string, config: any, core: OiCore) => {})

    this.coreDB = await openDatabase(this.dbConf.address, 'keyvalue') as unknown as KeyValue<OiCoreSchema>;
    this.valuesDB = await this.getDB(1, 'keyvalue', 'core.values') as unknown as KeyValue<any>;

    await initPlugins(this.pluginConf, this);
  }

  /**
   * Opens a database in read / write mode.
   * @param name - DB identifier
   * @param revision - Schema revision
   * @param type - Orbitdb Type, includes registered custom types.
   * @returns An OrbitDB Database of the specified type.
   */
  public async getDB(revision: number, type: string, name: string, pluginName: string = 'core', tag?: string): Promise<any> {
    if (!this.coreDB) throw Error('Database coreDB not initialized. Run OiCore.init() first.');
    if (!(isRegisteredPlugin(pluginName))) throw Error(`Module ${pluginName} is not registered. Please register first`);;

    const dbName = `${getPluginNamespace(pluginName)}.${pluginName}.${name}.v${revision}${tag? '.'+ tag : ''}`;
    let dbOpts: OiCoreSchema | undefined = await this.coreDB.get(dbName);

    const db = await openDatabase(dbOpts ? dbOpts.address : dbName, dbOpts ? dbOpts.type: type);

    this.log.info(`Opened DB ${dbName} at address ${db.address}`);

    if(!dbOpts) {
      dbOpts = {
        address: db.address,
        type,
        revision
      } as unknown as OiCoreSchema

      await this.coreDB.put(dbName, dbOpts)
    }
    
    return db;
  }

  /**
   * Stores a settings value for a plugin (persistent, among all workers)
   * 
   * @param value Value to store
   * @param name Setting name
   * @param pluginName Plugin Name (core if default).
   * @param namespace Namespace (system config as default, otherwise plugin namespace)
   * @param tag Tag, will be added to the name for entity-specific settings. (i.e. a connector setting that can be changed per contract.)
   */
  public async setVal(value: any, name: string, pluginName: string = 'core', tag?: string): Promise<void> {
    if (!this.valuesDB) throw Error('Database valuesDB not initialized. Run OiCore.init() first.');
    if (!(isRegisteredPlugin(pluginName))) throw Error(`Module ${pluginName} is not registered. Please register first`);;

    await this.valuesDB.put(`${getPluginNamespace(pluginName)}.${pluginName}.${name}`, value);
  }

  /**
   * Get a stored settings value.
   * 
   * @param value Value to store
   * @param name Setting name
   * @param pluginName Plugin Name (core if default).
   * @param namespace Namespace (system config as default, otherwise plugin namespace)
   * @param tag Tag, will be added to the name for entity-specific settings. (i.e. a connector setting that can be changed per contract.)
   * @returns 
   */
  public async getVal(name: string, pluginName: string = 'core', tag?: string): Promise<any> {
    if (!this.valuesDB) throw Error('Database valuesDB not initialized. Run OiCore.init() first.');
    if (!(isRegisteredPlugin(pluginName))) throw Error(`Module ${pluginName} is not registered. Please register first`);

    return this.valuesDB.get(`${getPluginNamespace(pluginName)}.${pluginName}.${name}`);
  }

  /**
   * Returns a specific primitive.
   * 
   * @param name Primitive name
   * @param pluginName Plugin Name (core if default).
   * @param namespace Namespace (system config as default, otherwise plugin namespace)
   * @param tag Tag, will be added to the name for entity-specific settings. (i.e. a connector setting that can be changed per contract.)
   */
  public async getPrimitive(name: string, pluginName: string = 'core', namespace: string = this.dbConf.namespace, tag?: string) {
    getPrimitive(name, pluginName, namespace, tag);
  }
}
