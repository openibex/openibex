import { OiPrimitive } from "./primitive";


const primitivesRegister: { [namespace: string]: { [pluginName: string ]: { [primitiveName: string]: typeof OiPrimitive } }} = {
  eip1155: {}
};

/**
 * Register a contract connector for later use with the factory.
 * 
 * @param name Name of the ABI
 * @param plugin name of the plugin.
 * @param primitive API implementation class
 * @param namespace Namespace for the connector, defaults to 'eip155'
 */
export async function usePrimitive(namespace: string, plugin: string, name: string, primitive: typeof OiPrimitive) {

  if (!primitivesRegister[namespace]) {
    primitivesRegister[namespace] = {};
  }
  if (!primitivesRegister[namespace][plugin]) {
    primitivesRegister[namespace] = {};
  }
  primitivesRegister[namespace][plugin][name] = primitive;
}

/**
 * Initializes and returns a primitive.
 * 
 * @param name
 * @param namespace 
 * @returns 
 */
export async function getPrimitive(name: string, pluginName: string, namespace: string, tag: string | undefined = undefined): Promise<OiPrimitive> {
  const primitive = primitivesRegister[namespace][pluginName][name];
  
  if (!primitive) {
    throw new Error(`Plugin not found ${namespace}.${pluginName}.${name}`);
  }
  
  return new primitive(namespace, pluginName, name, tag);
}
