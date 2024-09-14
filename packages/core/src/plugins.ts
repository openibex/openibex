const plugins: string[] = [];

type PluginInit = {
  [key: string]: (plugin: string, pluginConf: any, coreApp: any) => void;
};
const pluginInit: PluginInit = {};

/**
 * Register a plugin.
 * 
 * @param plugin Module name 
 * @param namespace Module namespace. If none is given, the configured db namespace is used.
 * @returns Module configuration
 */
export function registerOiPlugin(plugin: string, namespace: string, initCallback: (plugin: string, pluginConf: any, coreApp: any) => void)  {
  if(plugin in plugins) throw Error(`Module ${plugin} is already registered with namespace ${plugins[plugin]}`);
  plugins[plugin] = namespace;
  pluginInit[plugin] = initCallback;
  
}

/**
 * Checks wether a plugin is registered already.
 * 
 * @param plugin Module name
 * @returns True if plugin is registered.
 */
export function isRegisteredPlugin(plugin: string ) {
  return plugin in plugins;
}

/**
 * Returns a plugin namespace.
 * 
 * @param plugin 
 * @returns 
 */
export function getPluginNamespace(plugin: string) {
  if(!isRegisteredPlugin(plugin)) throw Error(`Module ${plugin} is not registered.`);
  return plugins[plugin];
}

/**
 * Is called on core init, prepares all plugins.
 * 
 * @param pluginConf Plugin configurations.
 * @param logger 
 */
export async function initPlugins(pluginConf: object, coreApp: any){
  for (let namespace in pluginConf) {
    for (let plugin in pluginConf[namespace]) {
      if (pluginInit[plugin]) {
        pluginInit[plugin](plugin, pluginConf[namespace][plugin], coreApp);
      } else {
        coreApp.log.warn(`No init method found for plugin: ${plugin}`);
      }
    }
  }
}
