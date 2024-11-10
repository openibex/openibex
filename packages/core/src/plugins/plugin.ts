import { KeyValue } from "@orbitdb/core";
import { OiLoggerInterface } from "../types";
import { OiDbManager } from "../db";
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
  protected isInitialized: boolean = false;

  public name: string;
  public namespace: string;
  public config: any = {};
  public dependencies: string[] = []

  protected initHooks: Record< string, (plugin: OiPlugin) => Promise<void>> = {};
  protected pluginServices: Record< string, OiPluginService> = {};

  public log!: OiLoggerInterface;
  public db!: OiDbManager;
  
  /**
   * After constructor the Plugin will not be initialized but is ready to run init()
   * Use registerOiPlugin to register the plugin for initialization.
   * 
   * @param pluginName Name of the plugin.
   * @param pluginNamespace Namespace of the plugin.
   * @param setup Plugin configuration.
   */
  constructor(pluginNamespace: string, pluginName: string, setup: {config?: any, dependencies?: string[], services?: Record<string, OiPluginService>}){
    this.name = pluginName;
    this.namespace = pluginNamespace;
    this.config = setup.config ? setup.config : {};
    this.dependencies = setup.dependencies ? setup.dependencies : [];

    for(const serviceName of Object.keys(setup.services)) {
      this.pluginServices[serviceName] = setup.services[serviceName];
    }
  }
  
  /**
   * Adds an init callback which is executed in the init function. Init callbacks
   * are used by TypeScript modules within the plugin to initialize databases,
   * configuration and other required init tasks.
   * 
   * @param name Name of the module filing the init callback
   * @param callback The init callback.
   */
  public onInit(name: string, callback: (plugin: OiPlugin) => Promise<void>) {
    if(this.isInitialized) {
      throw Error(`Plugin ${this.namespace}.${this.name} is already initialized cant add hook ${name}`)
    }

    this.initHooks[name] = callback;
  }
  
  /**
   * Plugin initialization. Sets logger, coreDB and calls all initHooks.
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
    this.db = new OiDbManager(`${this.namespace}.${this.name}`, logger, coreDB);
    this.config = config;
    
    let promises = Object.keys(this.pluginServices).map( (serviceName) => { 
      this.log.info(`Plugin ${this.namespace}.${this.name} initializing service ${serviceName}.`);
      return this.pluginServices[serviceName].init(this);
    });

    await Promise.all(promises);

    promises = Object.keys(this.initHooks).map((fragName) => {
      this.log.info(`Plugin ${this.namespace}.${this.name} running hook ${fragName}.`);
      return this.initHooks[fragName](this);
    });
    await Promise.all(promises);
  }

  public addService<T extends OiPluginService>(name: string, serviceInstance: T) {
    this.pluginServices[name] = serviceInstance;
  }

  public getService<T extends OiPluginService>(name?: string): T {
    if(!name) name = this.name;
    if(!this.pluginServices[name]) throw Error(`Service ${name} not found in ${this.namespace}.${this.name}`);

    return this.pluginServices[name] as unknown as T;
  }
}
