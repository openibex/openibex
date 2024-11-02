import { OiDataLogConsumer } from "@openibex/core";
import { AssetArtifact } from "../caip";
import { pluginName, pluginNamespace, tagResolver } from "../plugin";

/**
 * ChainLog is a blockchain-specific type of DataSeries designed to aggregate events
 * into per-block dataframes, then derive averages, means, totals and other useful
 * information that is stored on a per block basis.
 * 
 */
export class OiChainLogConsumer extends OiDataLogConsumer {
  protected assetArtifact: AssetArtifact;
  protected assetArtifactTag: string;

  protected consumerName: string;
  protected pluginName: string;
  protected pluginNamespace: string;

  protected consumerDb: any;

  /**
   * Constructor.
   * 
   * @param assetArtifact AssetArtifact that is contained in the dataseries.
   * @param producerName NodeId of the current producer
   * @param namespace Plugin namespace used for DB-Name
   * @param plugin Plugin name, used for DB-Name
   */
  constructor(assetArtifact: AssetArtifact, producerName: string, namespace = pluginNamespace, plugin = pluginName) {
    super(pluginNamespace, pluginName, producerName, tagResolver.tagCaipArtifact(assetArtifact) as string);

    this.consumerName = producerName;
    this.pluginName = plugin;
    this.pluginNamespace = namespace;

    this.assetArtifact = assetArtifact;
    this.assetArtifactTag = tagResolver.tagCaipArtifact(assetArtifact) as string;
  }
}
