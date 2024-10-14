import { OiLoggerInterface } from "../core";
import { OiConfig } from "../core.config";
import { OiPlugin } from "./plugin";

const plugins: string[] = [];

const pluginRegister: { [namespace: string]: { [pluginName: string]: OiPlugin } } = {
  eip1155: {}
};

/**
 * Register a plugin.
 * 
 * @param plugin Module name 
 * @param namespace Module namespace. If none is given, the configured db namespace is used.
 * @returns Module configuration
 */
export function registerOiPlugin(pluginName: string, namespace: string, plugin: OiPlugin)  {
  if (!pluginRegister[namespace]) {
    pluginRegister[namespace] = {};
  }

  pluginRegister[namespace][pluginName] = plugin;
}

/**
 * Is called on core init, prepares all plugins.
 * 
 * @param config App configurations with plugins section.
 * @param logger 
 */
export async function initPlugins(config: OiConfig, coreDB: any, logger: OiLoggerInterface){
  const promises: Promise<void>[] = [];
  const pluginConfigs = config.plugins;

  for (let namespace in pluginRegister) {
    for (let plugin in pluginRegister[namespace]) {
      let pluginConf = {}
      if (namespace in pluginConfigs ) {
        if (plugin in pluginConfigs[namespace]) {
          pluginConf = pluginConfigs[namespace][plugin];
        }
      }
      promises.push(pluginRegister[namespace][plugin].init(config.database.namespace, pluginConf, coreDB, logger));
    }

    await Promise.all(promises);
  }
}
