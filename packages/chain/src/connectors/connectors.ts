import { isSupportedPlatform } from "../providers";
import { AssetArtifact, getCAIPAssetType } from "../resolver";
import { OiContractConnector, OiContractConnectorParams } from "./connector";

const connectorRegister: { [namespace: string]: { [connectorName: string]: typeof OiContractConnector } } = {
  eip1155: {}
};

/**
 * Register a contract connector for later use with the factory.
 * 
 * @param name Name of the ABI
 * @param connector ABI definition in chain specific format
 * @param namespace Namespace for the connector, defaults to 'eip155'
 */
export async function useContractConnector(name: string, connector: typeof OiContractConnector, namespace: string = 'eip155') {
  if (!connectorRegister[namespace]) {
    connectorRegister[namespace] = {};
  }
  connectorRegister[namespace][name] = connector;
}

/**
 * Initializes and returns a chain connector.
 * 
 * @param assetArtifact 
 * @returns 
 */
export async function getContractConnector(assetArtifact: AssetArtifact, params: OiContractConnectorParams): Promise<OiContractConnector> {
  const assetType = getCAIPAssetType(assetArtifact);
  const namespace = assetType.chainId.namespace;

  const connector = connectorRegister[namespace][assetType.assetName.namespace];
  
  if (!connector) {
    throw new Error(`Connector not found for name: ${assetType.assetName.reference} in namespace: ${namespace}`);
  }
  
  return new connector(assetArtifact, params);
}
