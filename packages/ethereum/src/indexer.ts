import { AssetArtifact, getContract, OiEventIndexer, subscribeContract, getRateLimiter, addPlatformIndexer } from "@openibex/chain";
import { plugin } from "./plugin";
import { Contract, EventLog, ContractEventPayload } from "ethers";

export class EthereumEventIndexer extends OiEventIndexer{
  private importer!: Contract;
  private importFilter: any;

  public constructor(assetArtifact: AssetArtifact, eventName: string, callback:  (...args: any[]) => Promise<void> , bloomFilters?: any) {
    super(assetArtifact, eventName, callback, bloomFilters);
  }

  protected async subscribe() {
    await subscribeContract(this.assetArtifact, this.eventName, async (...args: any) => { await this.processEvent(...args); }, this.bloomFilters);
  }

  protected async importBatch(startBlock: number, endBlock: number): Promise<any[]> {
    if(!this.importer) {
      this.importer = await getContract(this.assetArtifact);
      this.importFilter = this.eventName;
      
      if (this.importFilter !== '*' && this.bloomFilters && this.bloomFilters.length > 0)
        this.importFilter = this.importer.filters[this.eventName](...this.bloomFilters);
    }

    const rateLimiter = getRateLimiter(this.assetArtifact);
    return rateLimiter.execute(() => this.importer.queryFilter(this.importFilter, startBlock, endBlock));
  }

  /**
   * Internal method, checks the event and calls callbacks / updates blocks if applicable.
   * 
   * @param event 
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

addPlatformIndexer('eip155', EthereumEventIndexer);

