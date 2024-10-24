import { AssetArtifactWithBlock, OiChainProtocol } from "./protocol";

const protocolRegister: { [protocol: string]: typeof OiChainProtocol } = {};

/**
 * Register a contract connector for later use with the factory.
 * 
 * @param name Name of the ABI
 * @param protocol ABI definition in chain specific format
 * @param namespace Namespace for the connector, defaults to 'eip155'
 */
export function useProtocol(name: string, protocol: typeof OiChainProtocol) {
  protocolRegister[name] = protocol;
}

/**
 * Initializes and returns a protocol.
 * 
 * @param assetArtifacts 
 * @returns 
 */
export function getProtocol(protocolName: string, bloomFilters?: any, customAssetArtifacts?: AssetArtifactWithBlock[]): OiChainProtocol {
  const protocol = protocolRegister[protocolName];
  
  if (!protocol) {
    throw new Error(`Protocol ${protocolName} not found.`);
  }
  
  return new protocol(bloomFilters, customAssetArtifacts);
}
