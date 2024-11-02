import { OiLoggerInterface } from "../core";
import { OiConfig } from "../core.config";
import { OiPlugin } from "./plugin";

const pluginRegister: { [namespace: string]: { [pluginName: string]: { plugin: OiPlugin, dependencies: string[]}} } = {};

/**
 * Register a plugin.
 * 
 * @param plugin Module name 
 * @param namespace Module namespace. If none is given, the configured db namespace is used.
 * @returns Module configuration
 */
export function registerOiPlugin(pluginName: string, namespace: string, plugin: OiPlugin, dependencies?: string[])  {
  if (!pluginRegister[namespace]) {
    pluginRegister[namespace] = {};
  }

  pluginRegister[namespace][pluginName] = {plugin, dependencies};
}

/**
 * Is called on core init, prepares all plugins.
 * 
 * @param config App configurations with plugins section.
 * @param logger 
 */
export async function initPlugins(config: OiConfig, coreDB: any, logger: OiLoggerInterface) {
  const initializedPlugins = new Set<string>();

  const initializePlugin = async (namespace: string, pluginName: string, pluginConf: any) => {
    const pluginKey = `${namespace}.${pluginName}`;
    if (initializedPlugins.has(pluginKey)) return; // Skip if already initialized

    const pluginEntry = pluginRegister[namespace][pluginName];
    for (const dependency of pluginEntry.dependencies || []) {
      const [depNamespace, depName] = dependency.split(".");
      await initializePlugin(depNamespace, depName, config.plugins[depNamespace]?.[depName] || {});
    }

    await pluginEntry.plugin.init(pluginConf, coreDB, logger);
    logger.info(`Initialized plugin ${pluginKey}.`)
    initializedPlugins.add(pluginKey);
  };

  for (let namespace in pluginRegister) {
    for (let pluginName in pluginRegister[namespace]) {
      const pluginConf = config.plugins[namespace]?.[pluginName] || {};
      await initializePlugin(namespace, pluginName, pluginConf);
    }
  }
}

export function getPlugin(namespace: string, pluginName: string) {
  return pluginRegister[namespace][pluginName].plugin;
}
