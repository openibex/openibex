import { OiNKeyValue, WithPluginServices } from "@openibex/core";
import { AssetArtifact, OiChain, OiChainLogProducer } from "@openibex/chain";

/**
 * The state of supply (mints, burns, total) in that block.
 * - number: amount minted in block.
 * - any: Merkle tree with minters of current block.
 * - any: Patricia tree for all minters in the chain at that block.
 * - number: amount burned in block.
 * - any: Merkle tree of burners in current block.
 * - any: Patricia tree of burners in the chain at that block.
 * - number: supply at the current block.
 */
export type TokenSupplyRecord = [number, any, any, number, any, any, number];

@WithPluginServices('openibex.chain/resolver', 'openibex.protocols/db', 'openibex.chain/chain')
export class OiChainTokenSupplyProducer extends OiChainLogProducer {
  public db: any;
  public chain: OiChain;

  private burnAddrTag: string = '';
  private mintAddrTag: string = '';

  private supplyDb: OiNKeyValue;

  private mintAmount: bigint = 0n;
  private mintCount: number = 0;
  private currentMintTree: any = {};
  private allMintsTrie: any = {};

  private burnAmount: bigint = 0n;
  private burnCount: number = 0;
  private currentBurnTree: any = {};
  private allBurnsTrie: any = {};

  private supplyAmount: bigint = 0n;

  /**
   * Creates new producer. AssetArtifact, startBlock and bloomFilter are used to
   * generate a DB-ID 
   * 
   * @param assetArtifact Asset Artifact we're producing from.
   * @param startBlock Startblock
   * @param bloomFilter Bloom Filter
   * @param namespace Plugin namespace
   * @param pluginName Plugin name
   */
  constructor(assetArtifact: AssetArtifact, tag: string, namespace: string, pluginName: string) {
    super(assetArtifact, `supply-${tag}`, namespace, pluginName);
  }

  public async init() {
    this.burnAddrTag = this.resolver.tagCaipArtifact(this.chain.provider(this.assetArtifact).getBurnAddress()) as string;
    this.mintAddrTag = this.resolver.tagCaipArtifact(this.chain.provider(this.assetArtifact).getBurnAddress()) as string;

    this.supplyDb = await this.db.getDB(1, 'oinkeyvalue', 'supply', this.assetArtifactTag) as OiNKeyValue<TokenSupplyRecord>; 
  }

  /**
   * Adds a a log to the producer.
   * 
   * @param params 
   */
  public async add(params: {block: number, caipTagFrom: string, caipTagTo: string, amount: bigint, event: any}) {
    const { block, caipTagFrom, caipTagTo, amount, event: EventLog } = params;
    
    // Some ERC20 use 0xff for minting as well and vice versa.
    this.currentBlock = block;

    if(caipTagFrom === this.mintAddrTag || this.burnAddrTag) {
      this.mintCount++;

      this.mintAmount += amount;
      this.supplyAmount += amount;
    } 
    else if (caipTagTo === this.mintAddrTag || this.burnAddrTag ) 
    {
      this.burnCount++

      this.burnAmount += amount;
      this.supplyAmount -= amount;
    }
    
  }

  /**
   * Saves and resets the counters and tries if the currentBlock contains data.
   * @param blockNumber Active block number of latest event.
   * @returns 
   */
  public async saveBlock(blockNumber: number) {
    if(this.currentBlock == -1) {
      return;
    }

    await this.supplyDb.put(
      this.currentBlock,
      [this.mintAmount, this.currentMintTree, this.allMintsTrie, this.burnAmount, this.currentBurnTree, this.allBurnsTrie, this.supplyAmount]
    );

    this.mintAmount, this.burnAmount = 0n;
    this.mintCount, this.burnCount = 0;
    this.currentMintTree, this.currentBurnTree = 0;
    this.currentBlock = -1;
  }
}
