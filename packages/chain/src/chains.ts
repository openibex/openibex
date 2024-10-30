import { type AssetArtifact, type ChainArtifact } from "./resolver";
import { getChainProvider } from "./providers";
import { getContractConnector } from "./connectors";
import { getContractAPI } from "./api";
import { OiContractConnectorParams } from "./connectors/connector";

/**
 * OiChain provides access to all chain resources (scrapers, protocols, APIs, accounts, blocks and transactions)
 * that are present within OpenIbex.
 * 
 * It provides the main interface to program applications. Just use getOiChain() to retrieve a chain instance.
 * 
 */
export class OiChain {
  
  /**
   * Returns a connector for an assetArtifact. The connector needs to be configured with DataSets and callbacks as needed.
   * 
   * @param assetArtifact Any assetArtifact
   * @param params Connector Configuration
   * @param altConnectorName Alternative connectorName if different from ABI of assetArtifact.
   * @returns 
   */
  public async getContractConnector(assetArtifact: AssetArtifact, params: OiContractConnectorParams = {startBlock: 0}, altConnectorName?: string) {
    const connector = await getContractConnector(assetArtifact, params);
    return connector;
  }

  /**
   * Returns an API for a blockchain contract or token.
   * 
   * @param assetArtifact Any type of asset artifact.
   */
  public async getContractApi(assetArtifact: AssetArtifact, walletName?: string) {
    return getContractAPI(assetArtifact, walletName);
  }

  /**
   * Returns a chain provider in case if special functionality needs to be implemented,
   * which is not covered by API.
   * 
   * @param chainArtifact Any chain artifact.
   * @param providerType Provider name according to configuration.
   * @returns 
   */
  public async getProvider(chainArtifact: ChainArtifact, providerType: string = 'default') {
    return await getChainProvider(chainArtifact, providerType)
  }
}
