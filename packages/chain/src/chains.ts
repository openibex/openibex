import { type AssetArtifact, type ChainArtifact } from "./resolver";
import { getChainProvider } from "./providers";
import { getContractConnector } from "./connectors";
import { getContractAPI } from "./api";
import { OiConnectorConf } from "./connectors/connector";

export class OiChain {
  /**
   * Connects to an Asset / Contract
   * 
   * @param assetArtifact Any chain artifact.
   */
  public async connect(assetArtifact: AssetArtifact, params: OiConnectorConf = {}) {
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
