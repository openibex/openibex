import { AssetArtifact, OiEventIndexer } from "@openibex/chain";
import { Contract, EventLog, ContractEventPayload } from "ethers";

/**
 * Ethereum-specific indexer using ethers.
 */
export class EthereumEventIndexer extends OiEventIndexer{

  private importer!: Contract;
  private importFilter: any;

  /**
   * Create an Ethereum indexer instance.
   * 
   * @param assetArtifact Asset artifact to index
   * @param eventName Event name that is indexed.
   * @param callback Callback in indexers processEvents()
   * @param bloomFilters 
   */
  public constructor(assetArtifact: AssetArtifact, eventName: string, startBlock: number | string, bloomFilters?: any) {
    super(assetArtifact, eventName, startBlock, bloomFilters);
  }

  /**
   * Subscribe to the contract once indexing historical events is done.
   * Called internally.
   */
  protected async subscribe() {
    await this.chain.contract(this.assetArtifact).subscribe(this.eventName, async (...args: any) => { await this.processEvent(...args); }, this.bloomFilters);
  }

  /**
   * Import a batch of events.
   * 
   * @param startBlock Block to start historical index from.
   * @param endBlock Block to end historical index with.
   * @returns An array of events.
   */
  protected async importBatch(startBlock: number, endBlock: number): Promise<any[]> {
    if(!this.importer) {
      this.importer = await this.chain.contract(this.assetArtifact).get();
      this.importFilter = this.eventName;
      
      if (this.importFilter !== '*' && this.bloomFilters && this.bloomFilters.length > 0)
        this.importFilter = this.importer.filters[this.eventName](...this.bloomFilters);
    }

    const rateLimiter = this.chain.provider(this.assetArtifact).getRateLimiter();
    return rateLimiter.execute(() => this.importer.queryFilter(this.importFilter, startBlock, endBlock));
  }

  /**
   * Internal method, checks the event and calls callbacks / updates blocks if applicable.
   * 
   * @param args 
   */
  protected async processEvent(
    ...args: any[]
  ): Promise<void> {
    let event: EventLog | ContractEventPayload = args.pop();
    let sendEvent: EventLog | undefined = undefined;

    if (event instanceof ContractEventPayload) {
      sendEvent = event.log;
    } else if (event instanceof EventLog) {
      sendEvent = event;
    } else {
      this.log.error(`An Event in unknown format was retrieved`);
      return
    }
    if(!sendEvent) {
      this.log.error(`No event found.`);
      return;
    }

    if (sendEvent.removed || sendEvent.blockNumber == null) {
      return;
    }
    if (args.length == 0) {
      sendEvent.args.map((arg) => {args.push(arg)});
    }

    args.push(sendEvent)
    await super.processEvent(...args);
  }
}
