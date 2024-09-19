import { KeyValue } from "@orbitdb/core";
import { OiLoggerInterface } from "../core";
import { openDatabase } from "../db";

export type OiCoreSchema = { 
  address: string; 
  type: string; 
  revision: number; 
};

/**
 * OpenIbex plugins facilitate access to the node, distributed value store and orchestrate
 * the starting sequence of OpenIbex.
 * 
 * The core / plugin system in detail:
 * 
 * The core database "coreDB" contains a directory of all databases used. It ensures that all 
 * databases open with the same settings amongst different nodes.
 * 
 * The values database "valuesDB" contains a distributed key / value store.
 * It is intended to share configuration and state amongst all nodes.
 * 
 * All plugins share the same coreDB and valuesDB.
 * 
 * Plugins need to be registered with registerOiPlugin and provide an init method. Upon
 * the first call to getOiCore() plugins are initialized.
 */
export class OiPlugin {
  private isInitialized: boolean = false;

  private pluginName: string;
  private pluginNamespace: string;

  private initFragments: Record< string, (name: string, config: any, plugin: OiPlugin) => Promise<void>>;

  public log!: OiLoggerInterface;
  private coreDB!: KeyValue<OiCoreSchema>;
  private valuesDB!: KeyValue<any>;
  
  /**
   * After constructor the Plugin will not be initialized but is ready to run init()
   * Use registerOiPlugin to register the plugin for initialization.
   * 
   * @param pluginName Name of the plugin.
   * @param pluginNamespace Namespace of the plugin.
   */
  constructor(pluginName: string, pluginNamespace: string){
    this.pluginName = pluginName;
    this.pluginNamespace = pluginNamespace;

    this.initFragments = {};
  }

  /**
   * Adds an init callback which is executed in the init function. Init callbacks
   * are used by TypeScript modules within the plugin to initialize databases,
   * configuration and other required init tasks.
   * 
   * @param name Name of the module filing the init callback
   * @param callback The init callback.
   */
  public onInit(name: string, callback: (name: string, config: any, plugin: OiPlugin) => Promise<void>) {
    this.initFragments[name] = callback;
  }
  
  /**
   * Plugin initialization. Sets logger, coreDB, valueDB and calls all initFragments.
   * 
   * @param appNamespace Application namespace
   * @param config Application config object.
   * @param coreDB Core database
   * @param logger 
   */
  public async init(appNamespace: string, config: any, coreDB: KeyValue<OiCoreSchema>, logger: any): Promise<void> {
    if(this.isInitialized) {
      throw Error("Core was already initialized earlier, init() can only be called once!");
    }
    // Safeguard to ensure method can only be called once!
    this.isInitialized = true;

    this.log = logger;
    this.coreDB = coreDB;
    this.valuesDB = await this.getDB(1, 'keyvalue', `${appNamespace}.core.values`) as unknown as KeyValue<any>;
    
    if(!this.initFragments)
      this.log.warn(`Init Plugin: No init fragments found for ${this.pluginNamespace}.${this.pluginName}`);

    const promises = Object.keys(this.initFragments).map(fragName => 
      this.initFragments[fragName](this.pluginName, config, this)
    );
  
    await Promise.all(promises);
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

    await this.valuesDB.put(`${this.pluginNamespace}.${this.pluginName}.${name}.${tag ? '.' + tag : ''}`, value);
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

    return this.valuesDB.get(`${this.pluginNamespace}.${this.pluginName}.${name}.${tag ? '.' + tag : ''}`);
  }

  /**
   * Opens a database in read / write mode.
   * 
   * @param name - DB identifier
   * @param revision - Schema revision
   * @param type - Orbitdb Type, includes registered custom types.
   * @returns An OrbitDB Database of the specified type.
   */
  public async getDB(revision: number, type: string, name: string, tag?: string): Promise<any> {
    if (!this.coreDB) throw Error('Database coreDB not initialized. Run OiCore.init() first.');

    const dbName = `${this.pluginNamespace}.${this.pluginName}.${name}.v${revision}${tag? '.'+ tag : ''}`;
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
}
