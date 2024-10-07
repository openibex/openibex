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
   * Connects to an Asset / Contract
   * 
   * @param assetArtifact Any chain artifact.
   */
  public async connect(assetArtifact: AssetArtifact, params: OiContractConnectorParams = {}) {
    const connector = await getContractConnector(assetArtifact, params);
    await connector.init();
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
