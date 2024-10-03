import { OiDataProducer } from "./producer";


const dataProducers: { [namespace: string]: { [pluginName: string ]: { [primitiveName: string]: typeof OiDataProducer } }} = {
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
export async function useProducer(namespace: string, plugin: string, name: string, primitive: typeof OiDataProducer) {

  if (!dataProducers[namespace]) {
    dataProducers[namespace] = {};
  }
  if (!dataProducers[namespace][plugin]) {
    dataProducers[namespace] = {};
  }
  dataProducers[namespace][plugin][name] = primitive;
}

/**
 * Initializes and returns a primitive.
 * 
 * @param name
 * @param namespace 
 * @returns 
 */
export async function getProducer(name: string, pluginName: string, namespace: string, tag: string | undefined = undefined): Promise<OiDataProducer> {
  const primitive = dataProducers[namespace][pluginName][name];
  
  if (!primitive) {
    throw new Error(`Plugin not found ${namespace}.${pluginName}.${name}`);
  }
  
  return new primitive(namespace, pluginName, name, tag);
}
