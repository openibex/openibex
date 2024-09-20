import { Contract, ContractEventPayload, DeferredTopicFilter, EventLog } from 'ethers';
import { getContract } from './contracts';
import { AssetArtifact } from './resolver';
import { getSubscriptionId, subscribeContract } from './subscriber';
import { latestBlock } from './blocks';
import { plugin } from './plugin';
import { getNodeId, OiNKeyValue } from '@openibex/core';
import { getRateLimiter, isSupportedPlatform } from './providers';

/**
 * Subscribes to a contract event and calls a processing callback. If processing is successfull log entry is added to processed index..
 * 
 * @param assetArtifact Asset type to subscribe to.
 * @param eventName Topic ABI in human-readable form.
 * @param callback Callback function that returns a boolean indicating success.
 * @param fromBlock Start Block, default 'latest'
 * @param bloomFilters A topic bloom filter
 */
export async function indexEvents(
  assetArtifact: AssetArtifact,
  eventName: string = "*",
  callback: (...args: any[]) => Promise<void>,
  fromBlock: number | string = 'latest',
  bloomFilters?: any
) {
  isSupportedPlatform(assetArtifact);

  const subscriptionId = getSubscriptionId(assetArtifact, eventName, bloomFilters)
  const indexer: OiEventIndexer = new OiEventIndexer(assetArtifact, eventName, callback, bloomFilters)
  // Indexer class will handle mutexes and failover once it's implemented.
  await plugin.setVal(getNodeId(), 'mutex', subscriptionId);

  plugin.log.info(`Starting indexer on ${assetArtifact.toString()}/${eventName} from ${fromBlock}`);
  indexer.startIndexer(fromBlock);
}

class OiEventIndexer{
  private subscriptionId: string;
  private assetArtifact: AssetArtifact;
  private eventName: string = '*';
  private bloomFilters?: any;
  private callback: (...args: any[]) => Promise<void>;
  
  private processedDB: OiNKeyValue<number>;

  private dbPeers: Record<string, number> = {};

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
    
    const contract = await getContract(this.assetArtifact);
    subscribeContract(this.assetArtifact, this.eventName, async (...args: any) => { await this.processEvent(...args); }, this.bloomFilters);
  }

  private getFilter(contract: Contract): DeferredTopicFilter {
    let filter = contract.filters[this.eventName]();
    if (this.bloomFilters && this.bloomFilters.length > 0)
      filter = contract.filters[this.eventName](...this.bloomFilters);

    return filter;
  }

  private async import(fromBlock: number) {
    const rateLimiter = getRateLimiter(this.assetArtifact);
    const contract = await getContract(this.assetArtifact);

    const filter = this.eventName == '*' ? this.eventName : this.getFilter(contract);

    let lastBlock: number = fromBlock - 1;

    for (let startBlock = fromBlock; startBlock <= await latestBlock(this.assetArtifact); startBlock += 4000) {
      const endBlock = Math.min(startBlock + 4000 - 1, await latestBlock(this.assetArtifact));
      const events = await rateLimiter.execute(() => contract.queryFilter(filter, startBlock, endBlock));
  
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
  private async processEvent(
    ...args: any[]
  ): Promise<void> {
    let event: EventLog | ContractEventPayload = args.pop();
    let sendEvent: EventLog | undefined = undefined;

    if (event instanceof ContractEventPayload) {
      sendEvent = event.log;
    } else if (event instanceof EventLog) {
      sendEvent = event;
    } else {
      plugin.log.error(`An Event in unknown format was retrieved`);
      return
    }
    if(!sendEvent) {
      plugin.log.error(`No event found.`);
      return;
    }

    if (sendEvent.removed || sendEvent.blockNumber == null) {
      return;
    }
    if (args.length == 0) {
      sendEvent.args.map((arg) => {args.push(arg)});
    }

    args.push(sendEvent)

    plugin.log.info(`Log at ${sendEvent.blockNumber}-${sendEvent.index}: Arguments ${args.join(', ')}`);
    await this.callback(...args);
  }
}
