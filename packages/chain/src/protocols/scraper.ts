import { getContractConnector, OiContractConnector } from "../connectors";
import { isSupportedChain } from "../providers";
import { AssetArtifactWithBlock } from "./protocol";

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

  /**
   * Creates a new scraper instance.
   * 
   * @param assetArtifacts List of AssetArtifacts to connect to.
   * @param params Scraper config
   */
  public constructor(assetArtifacts?: AssetArtifactWithBlock[], params?: any) {
    if(!assetArtifacts) {
      assetArtifacts = this.assetArtifacts;
      this.assetArtifacts = [];
    }

    for( const artifact of assetArtifacts) {
      if (!isSupportedChain(artifact.assetArtifact)) {
        continue;
      }

      this.assetArtifacts.push(artifact);
    }
  }

  /**
   * Init and start the scraper by initializing all the connectors.
   */
  public async init() {
    this.assetArtifacts.map(async (artifact: AssetArtifactWithBlock) => {
      this.connectors.push(await getContractConnector(artifact.assetArtifact, {startBlock: artifact.startBlock}));
    });

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
