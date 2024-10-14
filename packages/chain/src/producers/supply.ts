import { OiNKeyValue } from "@openibex/core";
import { AssetArtifact, tagCaipArtifact } from "../resolver";
import { pluginName, pluginNamespace } from "../plugin";
import { EventLog } from "ethers";
import { OiChainLogProducer } from "./chainlog";
import { plugin } from "../plugin";
import { getBurnAddress, getMintAddress } from "../utils";

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
export type StateOfSupply = [number, any, any, number, any, any, number];

export class OiChainTokenSupply extends OiChainLogProducer {

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

  constructor(assetArtifact: AssetArtifact, namespace = pluginNamespace, plugin = pluginName) {
    super(assetArtifact, 'supply', namespace, plugin);
  }

  public async init() {
    this.burnAddrTag = tagCaipArtifact(getBurnAddress(this.assetArtifact)) as string;
    this.mintAddrTag = tagCaipArtifact(getMintAddress(this.assetArtifact)) as string;

    this.supplyDb = await plugin.getDB(1, 'oinkeyvalue', 'supply', this.assetArtifactTag) as OiNKeyValue<StateOfSupply>; 
  }

  /**
   * Adds a a log to the producer.
   * 
   * @param params 
   */
  public async add(params: {block: number, caipTagFrom: string, caipTagTo: string, amount: bigint, event: EventLog}) {
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

    plugin.log.info(`Logging block ${this.currentBlock} at block no ${this.currentBlock}`);
    await this.supplyDb.put(
      this.currentBlock,
      [this.mintAmount, this.currentMintTree, this.allMintsTrie, this.burnAmount, this.currentBurnTree, this.allBurnsTrie, this.supplyAmount]
    );

    plugin.log.info(`Logged supply data for ${this.assetArtifact.toString()} on block ${this.currentBlock}.`);
    plugin.log.info(`Total minted: ${this.mintAmount}, Total Burned: ${this.burnAmount}, current supply: ${this.supplyAmount}.`);

    this.mintAmount, this.burnAmount = 0n;
    this.mintCount, this.burnCount = 0;
    this.currentMintTree, this.currentBurnTree = 0;
    this.currentBlock = -1;
  }
}
