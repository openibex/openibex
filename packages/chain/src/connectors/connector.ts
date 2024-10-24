import { AssetArtifact, ChainArtifact, tagCaipArtifact, addCaipTagResolver} from "../resolver";
import { OiChainLogProducer } from "../producers/chainlog";
import { OiEventIndexer } from "../indexer";

export type OiContractConnectorParams = {
  resolve?: boolean,
  index?: boolean,
  startBlock?: number,
  filter?: string[][]
}

/**
 * Connectors orchestrate the indexer and the producers of a smart contract.
 * 
 */
export class OiContractConnector {
  protected assetNamespace: string;
  protected caipNamespace: string;
  protected assetArtifact: AssetArtifact;

  protected startBlock: number;
  protected currentBlock: Record<string, number> = {};
  protected bloomFilter: string[][];

  protected indexers!: Record<string, OiEventIndexer>;
  protected producers!: Record<string, OiChainLogProducer[]>;
  protected eventProcessors!: Record<string, (...args: unknown[]) => Promise<unknown[]>>;
  protected eventPostProcessors!: Record<string, (...args: unknown[]) => Promise<unknown[]>>;

  protected resolver: boolean;

  constructor(assetArtifact: AssetArtifact, params?: OiContractConnectorParams, bloomFilter?: string[][]) {
    this.assetArtifact = assetArtifact;
    
    this.assetNamespace = this.assetArtifact.assetName.namespace;
    this.caipNamespace = this.assetArtifact.chainId.namespace;

    this.bloomFilter = bloomFilter;
    this.startBlock = params?.startBlock ? params.startBlock : 0;
    this.resolver = params?.resolve ? params.resolve : false;
  }

  /**
   * Starts the indexing. Connector has to be initialized before.
   */
  public async start() {
    for (const event of Object.keys(this.indexers)) {
      if (!this.indexers[event]) {
        throw Error(`No indexer set for event ${event} on ${this.assetArtifact}`);
      }

      this.indexers[event].start();
    }
  }

  /**
   * Init method, intended to be overwritten in your subclass.
   */
  public async init() {
    for (const event of Object.keys(this.indexers)) {
      this.indexers[event].init(async (...args: unknown[]): Promise<void> => {
        const record = await this.eventProcessors[event](args);
        this.addLog(event, record);
      }, this.saveBlock);

      this.producers[event].forEach(async producer => {
        await producer.init();
      });
    }
  }

  /**
   * Adds a producer for later initialization.
   * 
   * @param producer instance of producer.
   */
  public addProducer(event: string, producer: OiChainLogProducer) {
    if(!this.producers[event]) {
      this.producers[event] = [];
    }
    this.producers[event].push(producer);
  }

  /**
   * Adds a producer for later initialization.
   * 
   * @param producer instance of producer.
   */
  public addIndexer(event: string, indexer: OiEventIndexer) {
    if(this.indexers[event]) {
      throw Error(`An indexer is already registered for ${event} on ${this.assetArtifact.toString()}.`)
    }
    this.indexers[event] = indexer;
  }

  /**
   * An EventProcessor callback formats the event before it's sent to the producers to create data records.
   * Each event type can have one eventProcessor. 
   * 
   * @param event 
   * @param callback 
   */
  public addEventProcessor(event: string, callback: (...args: unknown[]) => Promise<any>) {
    if (this.eventProcessors[event]) {
      throw Error(`An event processor is already registered for ${event} on ${this.assetArtifact}.`);
    }
    this.eventProcessors[event] = callback;
  }

  /**
   * An EventPostProcessor callback is fired once the event has been processed and the logs were added.
   * It can be used for custom extensions of the scraper. 
   * 
   * @param event 
   * @param callback 
   */
  public addEventPostProcessor(event: string, callback: (...args: unknown[]) => Promise<any>) {
    if (this.eventPostProcessors[event]) {
      throw Error(`An event post processor is already registered for ${event} on ${this.assetArtifact}.`);
    }
    this.eventPostProcessors[event] = callback;
  }

  /**
   * Add an event to all producers.
   * 
   * @param event Event the log is for.
   * @param params Log Params
   * @returns 
   */
  protected async addLog(event: string, params: any) {
    if (! this.producers[event]) {
      return;
    }
    
    await Promise.all(this.producers[event].map(async producer => {
      await producer.add(params);
    }));
  }

  /**
   * Calls saveBlock on each producer registered for an event.
   * 
   * @param event Event name
   * @param blockNumber Block number that reached indexer finality.
   * @returns 
   */
  protected async saveBlock(event: string, blockNumber: number){
    if(!this.currentBlock[event]) {
      this.currentBlock[event] = blockNumber;
    } else if (this.currentBlock[event] < blockNumber) {
      if (! this.producers[event]) {
        return;
      }

      await Promise.all(this.producers[event].map(async producer => {
        await producer.saveBlock(this.currentBlock[event]);
      }));

      this.currentBlock[event] = blockNumber;
    }
  }

  /**
   * Creates tags and adds resolver entries from imported ChainArtifacts if params.resolve is true.
   * 
   * @param artifacts Multiple chain artifacts.
   * @returns 
   */
  protected async tagAndResolve(...artifacts: ChainArtifact[]): Promise<string[]> {
    const tags: string[] = [];

    for (const artifact of artifacts) {
      // If resolve is true, call addCaipArtifact and wait for it to complete
      if (this.resolver) {
        tags.push(await addCaipTagResolver(artifact) as string);
      } else {
        tags.push(tagCaipArtifact(artifact) as string);
      }
    }

    return tags;
  }
}
