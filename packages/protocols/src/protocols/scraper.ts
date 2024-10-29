import { getContractConnector, OiContractConnector } from "../connectors";
import { plugin } from "../plugin";
import { isSupportedChain } from "../providers";
import { AssetArtifactWithBlock, ProtocolMap } from "./protocol";

/**
 * A scraper collects all data required for a protocol to operate. It orchestrates
 * the connectors amongst all chains and contracts of a protocol.
 * 
 * I.e. when a token contract is deployed on multiple chains, all instances of the token
 * contract connector are dealt with through the scraper.
 * 
 * This includes contracts that do not only reside on EVM but as well others.
 * 
 */
export class OiChainScraper {
  protected assetArtifacts: AssetArtifactWithBlock[] = [];
  protected connectors: OiContractConnector[] = [];

  private protocolMap: ProtocolMap;

  /**
   * Creates a new scraper instance.
   * 
   * @param assetArtifacts List of AssetArtifacts to connect to.
   * @param params Scraper config
   */
  public constructor(assetArtifacts: AssetArtifactWithBlock[], protocolMap: ProtocolMap, params?: any) {
    for( const artifact of assetArtifacts) {
      if (!isSupportedChain(artifact.assetArtifact)) {
        plugin.log.warn(`Cant scrape ${artifact.assetArtifact.toString()} - Chain or platform not supported.`);
        continue;
      }

      this.assetArtifacts.push(artifact);
    }

    this.protocolMap = protocolMap;
  }

  /**
   * Init and start the scraper by initializing all the connectors.
   */
  public async init() {
    await Promise.all(this.assetArtifacts.map(async (artifact: AssetArtifactWithBlock) => {
      const namespace = artifact.assetArtifact.chainId.namespace;

      for(const setName in this.protocolMap) {
        if(!this.protocolMap[setName][namespace]) {
          plugin.log.warn(`Protocol does not support ${setName} on ${namespace}.`);
          continue;
        }
        const connectorName = this.protocolMap[setName][namespace];
        this.connectors.push(await getContractConnector(artifact.assetArtifact, {startBlock: artifact.startBlock}, connectorName));
      } 
    }));

    await Promise.all(this.connectors.map(async connector => {
      await connector.init();
    }));
  }

  /**
   * Start the scraper (all underlying connectors, indexers etc)
   */
  public async start() {
    this.connectors.map(async connector => {
      connector.start();
    });
  }
}
