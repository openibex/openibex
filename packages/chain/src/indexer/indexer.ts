import { OiNKeyValue, getNodeId } from "@openibex/core";
import { getSubscriptionId } from "../subscriber";
import { latestBlock } from "../blocks";
import { plugin } from "../plugin";
import { getProviderSetting, } from "../providers";
import { AssetArtifact } from "../resolver";

/**
 * Generic indexer class. All other indexers are inherited from this class.
 * The generic indexer remembers the last block, and distincts between historic
 * imports and up to date event listening.
 * 
 * To create your own indexer (see @openibex/ethereum for an example) overwrite:
 * - importBatch(startBlock: number, endBlock: number), historic import of events in batches.
 * - subscribe(), live-event subscription, called once historic indexing is done.
 * - protected async processEvent(...args: any[]), executed on each imported event in sequential order.
 * 
 * For a practical example check the ethereum package.
 */
export class OiEventIndexer{
  protected subscriptionId: string;
  protected assetArtifact: AssetArtifact;
  protected eventName: string = '*';
  protected bloomFilters?: any;
  protected callback: (...args: any[]) => Promise<void>;
  
  protected processedDB: OiNKeyValue<number>;

  protected dbPeers: Record<string, number> = {};

  /**
   * Constructor for indexer instance.
   * 
   * @param assetArtifact Asset Artifact to index
   * @param eventName event name to index
   * @param callback Callback function to call on index
   * @param bloomFilters Filters for import.
   */
  public constructor(assetArtifact: AssetArtifact, eventName: string, callback:  (...args: any[]) => Promise<void> , bloomFilters?: any) {
    this.subscriptionId = getSubscriptionId(assetArtifact, eventName, bloomFilters)
    this.assetArtifact = assetArtifact;
    this.eventName = eventName;
    this.bloomFilters = bloomFilters;
    this.callback = callback;  }

  public async startIndexer(fromBlock: number | string) {
    
    this.processedDB = await plugin.getDB(1, 'oinkeyvalue', 'indexer.processor', this.subscriptionId) as OiNKeyValue<string>;

    // Track peers that connect to this database, hence run indexers as well.
    this.processedDB.events.on('join', async (peerId, heads) => {
      this.dbPeers[peerId] = Date.now();
    });

    this.processedDB.events.on('leave', async (peerId) => {
      delete(this.dbPeers[peerId]);
    });

    const returnValue = await this.processedDB.newest();
    const key = (returnValue === undefined) ? 0 : returnValue.key;

    let lastBlock = key + 1
    fromBlock = lastBlock > fromBlock ? lastBlock: fromBlock; 

    if(fromBlock && typeof fromBlock === 'number')
      await this.import(fromBlock);
    else if (fromBlock !== 'latest')
      return;
    
    this.subscribe()
  }

  /**
   * Overwrite this method to implement provider specific historical import in batches.
   * 
   * @param startBlock Starting block of batch
   * @param endBlock End block of batch.
   * @returns 
   */
  protected async importBatch(startBlock: number, endBlock: number): Promise<any[]> {
    return [];
  }

  /**
   * Overwrite this method to subscribe according to the provider defined way.
   * It is called once historical import completed successfully and intended
   * to connect the contract to its event subscribers.
   */
  protected async subscribe() {
  }

  /**
   * Import historical events.
   * 
   * @param fromBlock Start block for import.
   */
  protected async import(fromBlock: number) {
    let lastBlock: number = fromBlock - 1;
    const batchSize: number = getProviderSetting(this.assetArtifact, 'batchSize');
    
    for (let startBlock = fromBlock; startBlock <= await latestBlock(this.assetArtifact); startBlock += batchSize) {
      const endBlock = Math.min(startBlock + batchSize - 1, await latestBlock(this.assetArtifact));
      const events = await this.importBatch(startBlock, endBlock);
  
      plugin.log.info(`Found ${events.length} events for ${this.assetArtifact} in blocks ${startBlock} to ${endBlock}`);

      if(events.length == 0) {
        lastBlock = endBlock;
        await this.processedDB.put(endBlock, getNodeId() + ':0');
        continue;
      }

      let numEvents = 0
      for (const event of events) {
        await this.processEvent(event);
        numEvents++;

        if (event.blockNumber > lastBlock) {
          await this.processedDB.put(lastBlock, getNodeId() + ':' + (numEvents - 1));
          lastBlock = event.blockNumber;
          numEvents = 1;
        }
      }
    }
  }

  /**
   * Overwrite this method to process events. It is called in sequential order when events are
   * imported.
   * 
   * @param args - Platform specific argument set.
   */
  protected async processEvent(...args: any[]): Promise<void> { }
}
