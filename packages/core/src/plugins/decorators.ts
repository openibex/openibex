import { OiPlugin } from "./plugin";
import { OiPluginRegistry } from "./plugins";

/**
 * Adds a plugin init hook. Class needs to have an async init(plugin:OiPlugin) method.
 * 
 * @param pluginFullName Full plugin name 'openibex.chain'
 * @param hookName Hook name.
 * @returns 
 */
export function OnPluginInitHook(pluginFullName: string, hookName: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    // Check if the class has an `init` method
    if (typeof constructor.prototype.init !== 'function') {
      throw new Error(`Class ${constructor.name} must have an async init(plugin: OiPlugin) method to use @OnPluginInit`);
    }

    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);

        // Retrieve the plugin directly by namespace and name
        const [pluginNamespace, pluginName] = pluginFullName.split('.');
        const plugin = OiPluginRegistry.getInstance().getPlugin(pluginNamespace, pluginName);
        if (!plugin) {
          throw new Error(`Plugin ${pluginFullName} is not available.`);
        }

        // Call onInit with the current instance context and the init method bound to this
        plugin.onInit(hookName, this['init'].bind(this));
      }
    }
  };
};


/**
 * Register a plugin class.
 * 
 * @param namespace Plugin namespace (i.e. 'openibex')
 * @param pluginName Plugin name (i.e. 'chain')
 * @param pluginDefaultConfig Plugin default config
 * @param dependencies Plugin dependencies.
 * @returns 
 */
export function RegisterPlugin() {
  return function <T extends OiPlugin>(target: new (...args: any[]) => T) {
    const newConstructor: any = function (...args: any[]) {
      const instance = new target(...args);
      
      // Register the plugin with the provided name, namespace, and dependencies
      OiPluginRegistry.getInstance().register(instance.namespace, instance.name, instance);
      return instance;
    };

    // Copy prototype so instanceof operator still works
    newConstructor.prototype = target.prototype;

    return newConstructor as new () => T; 
  };
}


/**
 * Adds services to any class. Service is available as instance.serviceName.doSomething()
 * 
 * @param serviceIdentifiers In format 'openibex.chain/caip'
 * @returns 
 */
export function WithPluginServices(...serviceIdentifiers: string[]) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);
        for (const identifier of serviceIdentifiers) {
          const [namespace, serviceName] = identifier.split("/");
          if (!namespace || !serviceName) {
            throw new Error(`Service identifier '${identifier}' must be in the 'namespace/serviceName' format.`);
          }

          // Retrieve the plugin directly by namespace and name
          const [pluginNamespace, pluginName] = namespace.split('.');
          const plugin = OiPluginRegistry.getInstance().getPlugin(pluginNamespace, pluginName);
          if (!plugin) {
            throw new Error(`Plugin ${namespace} is not available.`);
          }

          const serviceMap: Record<string, any> = {
            db: plugin.db,
            log: plugin.log
          };
          
          const service = serviceMap[serviceName] ?? plugin.getService(serviceName);
          
          if (!service) {
            throw new Error(`Service ${serviceName} is not available in plugin ${namespace}.`);
          }

          // Assign the service to the class instance under the serviceName property
          (this as any)[serviceName] = service;
        }
      }
    };
  };
}
