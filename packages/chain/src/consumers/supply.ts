import { OiNKeyValue } from "@openibex/core";
import { AssetArtifact, } from "../resolver";
import { pluginName, pluginNamespace } from "../plugin";
import { OiChainLogConsumer } from "./chainlog";
import { plugin } from "../plugin";

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

export class OiChainTokenSupplyProducer extends OiChainLogConsumer {

  private supplyDb!: OiNKeyValue;

  /**
   * Creates new producer. AssetArtifact, startBlock and bloomFilter are used to
   * generate a DB-ID 
   * 
   * @param assetArtifact Asset Artifact we're producing from.
   * @param startBlock Startblock
   * @param bloomFilter Bloom Filter
   * @param namespace Plugin namespace
   * @param plugin Plugin name
   */
  constructor(assetArtifact: AssetArtifact, tag: string, namespace = pluginNamespace, plugin = pluginName) {
    super(assetArtifact, `supply-${tag}`, namespace, plugin);
  }

  public async init() {
    const idAsInProducer = '';
    this.supplyDb = await plugin.getDB(1, 'oinkeyvalue', 'supply', idAsInProducer) as OiNKeyValue<TokenSupplyRecord>; 
  }
}
