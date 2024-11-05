import { OiChain, OiContractConnector } from "@openibex/chain";
import { AssetArtifactWithBlock, ProtocolMap } from "./protocol";
import { oiCorePlugins, OiLoggerInterface, WithPluginServices } from "@openibex/core";

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
@WithPluginServices('openibex.chain/chain', 'openibex.protocols/log')
export class OiChainScraper {
  public chain: OiChain;
  public log: any;
  
  protected assetArtifacts: AssetArtifactWithBlock[] = [];
  protected connectors: OiContractConnector[] = [];
  protected bloomFilter: string[][]

  private protocolMap: ProtocolMap;

  /**
   * Creates a new scraper instance.
   * 
   * @param assetArtifacts List of AssetArtifacts to connect to.
   * @param params Scraper config
   */
  public constructor(assetArtifacts: AssetArtifactWithBlock[], protocolMap: ProtocolMap, bloomFilter?: string[][], params?: any) {
    for( const artifact of assetArtifacts) {
      try {
        const chain: OiChain = oiCorePlugins.getPlugin('openibex', 'chain').getService('chain');
        chain.provider(artifact.assetArtifact);
      } catch {
        const log: OiLoggerInterface = oiCorePlugins.getPlugin('openibex', 'protocols').getService('log') as unknown as OiLoggerInterface;
        log.warn(`Cant scrape ${artifact.assetArtifact.toString()} - Chain or platform not supported.`);
        continue;
      }

      this.assetArtifacts.push(artifact);
    }

    this.bloomFilter = bloomFilter
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
          this.log.warn(`Protocol does not support ${setName} on ${namespace}.`);
          continue;
        }
        const connectorName = this.protocolMap[setName][namespace];
        this.connectors.push(await this.chain.contract(artifact.assetArtifact).getConnector({startBlock: artifact.startBlock}, this.bloomFilter, connectorName));
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
