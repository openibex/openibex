import { KeyValue } from "@orbitdb/core";
import { OiLoggerInterface } from "../core";
import { OiDbManager, openDatabase } from "../db";
import { OiPluginService } from "./service";

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

  protected pluginName: string;
  protected pluginNamespace: string;

  protected initFragments: Record< string, (name: string, config: any, plugin: OiPlugin) => Promise<void>> = {};
  protected pluginServices: Record< string, OiPluginService> = {};

  public log!: OiLoggerInterface;
  public db!: OiDbManager;
  
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
   * @param config Application config object.
   * @param coreDB Core database
   * @param logger 
   */
  public async init(config: any, coreDB: KeyValue<OiCoreSchema>, logger: any): Promise<void> {
    if(this.isInitialized) {
      throw Error("Core was already initialized earlier, init() can only be called once!");
    }
    // Safeguard to ensure method can only be called once!
    this.isInitialized = true;

    this.log = logger;
    this.db = new OiDbManager(`${this.pluginNamespace}.${this.pluginName}`, logger, coreDB);
    
    let promises = Object.keys(this.initFragments).map(fragName => 
      this.initFragments[fragName](this.pluginName, config, this)
    );
    await Promise.all(promises);

    promises = Object.keys(this.pluginServices).map(serviceName => 
      this.pluginServices[serviceName].init()
    );

    await Promise.all(promises);
  }

  public addPluginService(name: string, serviceInstance: OiPluginService) {
    this.pluginServices[name] = serviceInstance;
  }

  public getPluginService(name?: string): OiPluginService {
    if(!name) name = this.pluginName;
    if(!this.pluginServices[name]) throw Error(`Service ${name} not found in ${this.pluginNamespace}.${this.pluginName}`);

    return this.pluginServices[name];
  }
}
