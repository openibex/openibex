import { OiNKeyValue, getNodeId } from "@openibex/core";
import { getSubscriptionId } from "../subscriber";
import { latestBlock } from "../blocks";
import { plugin } from "../plugin";
import { getProviderSetting, } from "../providers";
import { AssetArtifact } from "../resolver";

export class OiEventIndexer{
  protected subscriptionId: string;
  protected assetArtifact: AssetArtifact;
  protected eventName: string = '*';
  protected bloomFilters?: any;
  protected callback: (...args: any[]) => Promise<void>;
  
  protected processedDB: OiNKeyValue<number>;

  protected dbPeers: Record<string, number> = {};

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

  protected async importBatch(startBlock: number, endBlock: number): Promise<any[]> {
    return [];
  }

  protected async subscribe() {
  }

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
   * Internal method, checks the event and calls callbacks / updates blocks if applicable.
   * 
   * @param event 
   */
  protected async processEvent(...args: any[]): Promise<void> { }
}
