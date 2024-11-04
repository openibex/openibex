import { OiDataSeriesProducer, WithPluginServices } from "@openibex/core";
import { AssetArtifact } from "../caip";
import { OiAddressTagResolver } from "../resolver";

/**
 * ChainLog is a blockchain-specific type of DataSeries designed to aggregate events
 * into per-block dataframes, then derive averages, means, totals and other useful
 * information that is stored on a per block basis.
 * 
 */
@WithPluginServices('openibex.chain/resolver')
export class OiChainLogProducer extends OiDataSeriesProducer {
  public resolver: OiAddressTagResolver;

  protected assetArtifact: AssetArtifact;
  protected assetArtifactTag: string;

  protected producerName: string;
  protected pluginName: string;
  protected pluginNamespace: string;

  protected currentBlock: number = -1;

  protected producerDb: any;

  /**
   * Constructor.
   * 
   * @param assetArtifact AssetArtifact that is contained in the dataseries.
   * @param producerName NodeId of the current producer
   * @param namespace Plugin namespace used for DB-Name
   * @param pluginName Plugin name, used for DB-Name
   */
  constructor(assetArtifact: AssetArtifact, producerName: string, namespace, pluginName) {
    super(namespace, pluginName, producerName, assetArtifact.toString());

    this.producerName = producerName;
    this.pluginName = pluginName;
    this.pluginNamespace = namespace;

    this.assetArtifact = assetArtifact;
    this.assetArtifactTag = this.resolver.tagCaipArtifact(assetArtifact) as string;
    
  }

  /**
   * Add an entry to the DataFrame. Overwrite to create your new data series.
   * 
   * @param params DataSeries specific parameters.
   * @returns 
   */
  public async add(params: any) {
    return;
  }

  /**
   * Init the DataSeries, overwrite this to init your own data series.
   * Opens the DBs and sets the last block pointer.
   * 
   * @returns void
   */
  public async init() {
    return;
  }

  /**
   * Aggregates and saves the data for a certain block.
   * 
   * @param blockNumber Block number to save.
   * @returns 
   */
  public async saveBlock(blockNumber: number) {
    // Sometimes a block does not have data.
    // This is covered here and can be super called.
    if(this.currentBlock !== blockNumber - 1) {
      return
    }
  }
}
