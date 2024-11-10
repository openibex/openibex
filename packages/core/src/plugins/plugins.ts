import { OiLoggerInterface } from "../types";
import { OiConfig } from "../config";
import { OiPlugin } from "./plugin";
import { OiPluginService } from "./service";

export class OiPluginRegistry {
  private static instance: OiPluginRegistry;
  private pluginRegister: Record<string, Record<string, OiPlugin>> = {};
  private initializedPlugins = new Set<string>();

  private constructor() {}

  static getInstance(): OiPluginRegistry {
    if (!OiPluginRegistry.instance) {
      OiPluginRegistry.instance = new OiPluginRegistry();
    }
    return OiPluginRegistry.instance;
  }

  /**
   * Register a plugin.
   * 
   * @param namespace Module namespace
   * @param pluginName Module name
   * @param plugin Plugin instance
   */
  register(namespace: string, pluginName: string, plugin: OiPlugin): void {
    if (!this.pluginRegister[namespace]) {
      this.pluginRegister[namespace] = {};
    }
    this.pluginRegister[namespace][pluginName] = plugin;
  }

  /**
   * Initialize all plugins as per configuration.
   * 
   * @param config Application configuration with plugins section
   * @param coreDB Database instance
   * @param logger Logger instance
   */
  async initPlugins(config: OiConfig, coreDB: any, logger: OiLoggerInterface): Promise<void> {
   
    const initializePlugin = async (namespace: string, pluginName: string, pluginConf: any) => {
      const pluginKey = `${namespace}.${pluginName}`;
      if (this.initializedPlugins.has(pluginKey)) return; // Skip if already initialized
  
      const pluginInstance = this.getPlugin(namespace, pluginName);
      
      for (const dependency of pluginInstance.dependencies || []) {
        const [depNamespace, depName] = dependency.split(".");
        await initializePlugin(depNamespace, depName, config.plugins[depNamespace]?.[depName] || {});
      }
  
      await pluginInstance.init(pluginConf, coreDB, logger);
      logger.info(`Initialized plugin ${pluginKey}.`)
      this.initializedPlugins.add(pluginKey);
    };
  
    for (let namespace in this.pluginRegister) {
      for (let pluginName in this.pluginRegister[namespace]) {
        const pluginConf = config.plugins[namespace]?.[pluginName] || {};
        await initializePlugin(namespace, pluginName, pluginConf);
      }
    }
  }
  
  /**
   * Retrieve a plugin instance by namespace and name.
   * 
   * @param namespace Plugin namespace
   * @param pluginName Plugin name
   * @returns Plugin instance
   */
  public getPlugin<T extends OiPlugin>(namespace: string, pluginName: string): T {
    if (!this.pluginRegister[namespace]) {
      throw new Error(`Plugin namespace ${namespace} not found when looking for ${namespace}.${pluginName}`);
    }

    if (!this.pluginRegister[namespace][pluginName]) {
      throw new Error(`Plugin ${namespace}.${pluginName} not found`);
    }
    
    return this.pluginRegister[namespace][pluginName] as T;
  }

  /**
   * Get plugin service.
   * 
   * @param dottedPluginName 
   * @param serviceName 
   * @returns 
   */
  public async getService(dottedPluginName: string, serviceName?: string): Promise<OiPluginService> {
    const [namespace, plugin] = dottedPluginName.split('.');
    return this.getPlugin(namespace, plugin).getService(serviceName);
  }
}
