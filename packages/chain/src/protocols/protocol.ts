import { AssetArtifact } from "../resolver";
import { getContractAPI, OiApi } from "../api";
import { OiChainScraper } from "./scraper";
import { OiDataConsumer } from "@openibex/core";

export type AssetArtifactWithBlock = {
  assetArtifact: AssetArtifact, startBlock: number
}

/**
 * A protocol (i.e. in DeFi) is a set of smart contracts offering a set of functions.
 * In OpenIbex protocols are represented by data collections which are built using scrapers.
 * 
 * Protocols can have a pre-defined set of AssetArtifacts which can be overwritten in the constructor.
 * - If a protocol is started, all AssetArtifact databases are subscribed to.
 * - If it's started with a subset of addresses, only that subset is subscribed to.
 * - If a database is not found (because there's no scraper in the ecosystem) the protocol logs an error.
 */
export class OiChainProtocol {
  /**
   * Asset artifacts your protocol contains, and their startblocks.
   * Overwrite this in the inherited class.
   */
  public assetArtifacts!: AssetArtifactWithBlock[];

  /**
   * Event names this protocol processes. Overwrite.
   */
  public eventNames!: string[];

  /**
   * Consumers, sorted by contract event.
   */
  protected consumers: Record<string, OiDataConsumer[]> = {};

  /**
    * Creates a new protocol instance. 
    * 
    * @param customAssetArtifacts List of AssetArtifacts to connect to.
    * @param params Scraper config
    */
  public constructor(bloomFilters?: any, customAssetArtifacts?: AssetArtifactWithBlock[]) {
    if(customAssetArtifacts) {
      this.assetArtifacts = customAssetArtifacts;
    }

    // If no assetArtifacts are set.
    if(!this.assetArtifacts) {
      throw(`Error: Protocol has no predefined or dynamically defined assets.`);
    }
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
    return new OiChainScraper();
  }

  /**
   * Returns the API for this protocol.
   */
  public async getAPI(assetArtifact: AssetArtifact, walletName?: string): Promise<OiApi> {
    //TODO: assetArtifacts needs to be in the artifact list.

    return await getContractAPI(assetArtifact, walletName);
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
