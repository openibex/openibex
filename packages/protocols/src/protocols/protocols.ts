import { AssetArtifact, getCAIPChain } from "../resolver";
import { AssetArtifactWithBlock, OiChainProtocol } from "./protocol";

const protocolRegister: { [protocol: string]: typeof OiChainProtocol } = {};
const protocolHandles: Record<string, Record<string, string>> = {};

/**
 * Register a contract connector for later use with the factory. Also registers handlers this protocol provides
 * amongst the various chains.
 * 
 * @param name Name of the ABI
 * @param protocol ABI definition in chain specific format
 * @param handles ABIs that get handled by this protocol on a platform (i.e. ERC20 on EIP155)
 * @param namespace Namespace for the connector, defaults to 'eip155'
 */
export function useProtocol(name: string, handles: Record<string, string>, protocol: typeof OiChainProtocol) {
  protocolRegister[name] = protocol;

  for (const [namespace, handleName] of Object.entries(handles)) {
    if (!protocolHandles[namespace]) {
      protocolHandles[namespace] = {};
    }
    protocolHandles[namespace][handleName] = name;
  }
}

/**
 * Initializes and returns a protocol.
 * 
 * @param protocolName 
 * @param bloomFilters 
 * @param customAssetArtifacts 
 * @returns 
 */
export function getProtocol(protocolName: string, bloomFilters?: any, customAssetArtifacts?: AssetArtifactWithBlock[]): OiChainProtocol {
  const protocol = protocolRegister[protocolName];
  
  if (!protocol) {
    throw new Error(`Protocol ${protocolName} not found.`);
  }
  
  return new protocol(bloomFilters, customAssetArtifacts);
}

export function getProtocolForArtifact(assetArtifact: AssetArtifact, startBlock: number, bloomFilter?: any) {
  const platform = getCAIPChain(assetArtifact).namespace;
  const namespace = assetArtifact.assetName.namespace;

  if(!protocolHandles[platform]) {
    throw Error(`Platform ${platform} is not configured. Cant retrieve protocol for ${assetArtifact.toString()}`);
  }

  if(!protocolHandles[platform][namespace]) {
    throw Error(`Asset ${namespace} of ${assetArtifact.toString()} does not have a protocol.`);
  }

  return getProtocol(protocolHandles[platform][namespace], bloomFilter, [{assetArtifact, startBlock}]);
}
