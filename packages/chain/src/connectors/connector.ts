import { AssetArtifact, ChainArtifact, tagCaipArtifact, addCaipTagResolver} from "../resolver";
import { subscribeContract } from "../subscriber";
import { indexEvents } from "../indexer";
import { OiBlockchainPrimitive } from "../primitives/blockchain";

export type OiContractConnectorParams = {
  resolve?: boolean,
  index?: boolean,
  filter?: string[][]
}

export class OiContractConnector {
  protected assetNamespace: string;
  protected caipNamespace: string;
  protected assetArtifact: AssetArtifact;

  protected currentBlock: Record<string, number> = {};
  protected primitives: Record<string, OiBlockchainPrimitive[]> = {};

  protected indexer: boolean;
  protected resolver: boolean;

  constructor(assetArtifact: AssetArtifact, params: OiContractConnectorParams) {
    this.assetArtifact = assetArtifact;
    
    this.assetNamespace = this.assetArtifact.assetName.namespace;
    this.caipNamespace = this.assetArtifact.chainId.namespace;

    this.indexer = params?.index ? params.index : false;
    this.resolver = params?.resolve ? params.resolve : false;
  }

  /**
   * Indexes an event from startblock.
   * 
   * @param event Event to listen to.
   * @param callback Callback to call
   * @param bloomFilter Optional Bloom Filter
   */
  protected async index(event: string, callback: any, fromBlock: number, bloomFilter?: string[][]) {
    await indexEvents(this.assetArtifact, event, callback, fromBlock, bloomFilter);
  }

  /**
   * Subscribes to an event from the current block on.
   * 
   * @param event Event to listen to.
   * @param callback Callback to call
   * @param bloomFilter Optional Bloom Filter 
   */
  protected async subscribe(event: string, callback: any, bloomFilter?: string[][] ) {
    await subscribeContract(this.assetArtifact, event, callback, bloomFilter);
  }

  /**
   * Init method, intended to be overwritten in your subclass.
   */
  public async init() {}

  /**
   * Initialization of Primitives.
   */
  protected async initPrimitives(event: string) {
    this.primitives[event].forEach(async primitive => {
      await primitive.init();
    });
  }

  /**
   * Adds a primitive for later initialization.
   * 
   * @param primitive instance of primitive.
   */
  protected addPrimitive(event: string, primitive: OiBlockchainPrimitive) {
    if(!this.primitives[event]) {
      this.primitives[event] = [];
    }
    this.primitives[event].push(primitive);
  }

  /**
   * Add an event to all primitives.
   * 
   * @param event Event the log is for.
   * @param params Log Params
   * @returns 
   */
  protected async addLog(event: string, params: any) {
    if (! this.primitives[event]) {
      return;
    }
    this.primitives[event].forEach(primitive => {
      primitive.add(params);
    });
  }

  protected async saveBlock(event: string, blockNumber: number){
    if(!this.currentBlock[event]) {
      this.currentBlock[event] = blockNumber;
    } else if (this.currentBlock[event] < blockNumber) {
      if (! this.primitives[event]) {
        return;
      }
      this.primitives[event].forEach(async primitive => {
        await primitive.saveBlock(this.currentBlock[event]);
      });
      this.currentBlock[event] = blockNumber;
    }
  }

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
