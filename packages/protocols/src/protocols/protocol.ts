import { OiDataConsumer, WithPluginServices } from "@openibex/core";
import { AssetArtifact, OiChain, OiContractAPI} from "@openibex/chain";
import { OiChainScraper } from "./scraper";

export type AssetArtifactWithBlock = {
  assetArtifact: AssetArtifact, startBlock: number
}

export type ProtocolMap = Record<string, Record<string, string>>;

/**
 * A protocol (i.e. in DeFi) is a set of smart contracts offering a set of functions.
 * In OpenIbex protocols are represented by data collections which are built using scrapers.
 * 
 * Protocols can have a pre-defined set of AssetArtifacts which can be overwritten in the constructor.
 * - If a protocol is started, all AssetArtifact databases are subscribed to.
 * - If it's started with a subset of addresses, only that subset is subscribed to.
 * - If a database is not found (because there's no scraper in the ecosystem) the protocol logs an error.
 */
@WithPluginServices('openibex.chain/chain')
export class OiChainProtocol {
  public chain: OiChain;

  /**
   * Protocol handle
   */
  public handle: string;

  /**
   * On which platforms the protocol is deployed.
   */
  public handlePlatforms: string[];

  /**
   * Protocol ABIs per platform
   */
  public abis: Record<string, any>;

  /**
   * Asset artifacts your protocol contains, and their startblocks.
   * Overwrite this in the inherited class.
   */
  public assetArtifacts: AssetArtifactWithBlock[] = [];

  /**
   * Mapping your protocol: Which standard implements functionality on each platform.
   */
  public protocolMap: ProtocolMap;

  /**
   * Bloom filters to apply on this protocol instance
   */
  public bloomFilter!: string[][];

  /**
   * Consumer / producer names this protocol processes. Overwrite.
   */
  public datasetNames: string[] = [];

  /**
   * Dataset map: Same as protocol map but for the data side.
   */
  public datasetMap: Record<string, string[]>

  /**
   * Protocol constructor. Can overwrite the protocolMap and AssetArtifacts.
   * 
   * @param bloomFilter - BloomFilters for this instance.
   * @param customAssetArtifacts - I.e. when running on Testnet
   */
  public constructor(bloomFilter?: string[][], customAssetArtifacts?: AssetArtifactWithBlock[]) {
    if(customAssetArtifacts) {
      this.assetArtifacts = customAssetArtifacts;
    }

    // If no assetArtifacts are set.
    if(!this.assetArtifacts) {
      throw(`Error: Protocol has no predefined or dynamically defined assets.`);
    }

    this.bloomFilter = bloomFilter;
  }

  /**
   * Initialize protocol
   */
  public init() {

  }

  /**
   * Initialize the protocol dataset listeners.
   * 
   * @param dataSetName Data set name to listen to.
   */
  private initListener(dataSetName: string, assetArtifact: AssetArtifact) {

  }

  /**
   * Initializes the scraper for this protocol. Scrapers can have bloom filters.
   */
  public async getScraper() {
    return new OiChainScraper(this.assetArtifacts, this.protocolMap);
  }

  /**
   * Returns the API for this protocol.
   */
  public getAPI(assetArtifact: AssetArtifact, walletName?: string): OiContractAPI {
    //TODO: assetArtifacts needs to be in the artifact list.
    return this.chain.contract(assetArtifact).getAPI(walletName);
  }

  /**
   * A callback that's executed when a database record is inserted.
   * This includes updates as well due to the nature of log based DBs.
   * 
   * @param dataSetName 
   * @param callback 
   */
  public onInsert(dataSetName: string, callback: any) {

  }

  /**
   * A callback that is executed on delete operations. Required for Reorg awareness.
   * 
   * @param dataSetName 
   * @param callback 
   */
  public onDelete(dataSetName: string, callback: any) {

  }
}
