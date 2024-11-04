import { OiDataLogConsumer, WithPluginServices } from "@openibex/core";
import { AssetArtifact } from "../caip";
import { OiAddressTagResolver } from "../resolver";

/**
 * ChainLog is a blockchain-specific type of DataSeries designed to aggregate events
 * into per-block dataframes, then derive averages, means, totals and other useful
 * information that is stored on a per block basis.
 * 
 */
@WithPluginServices('openibex.chain/resolver')
export class OiChainLogConsumer extends OiDataLogConsumer {
  public resolver: OiAddressTagResolver;

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
   * @param pluginName Plugin name, used for DB-Name
   */
  constructor(assetArtifact: AssetArtifact, producerName: string, namespace, pluginName) {
    super(namespace, pluginName, producerName, assetArtifact.toString());

    this.consumerName = producerName;
    this.pluginName = pluginName;
    this.pluginNamespace = namespace;

    this.assetArtifact = assetArtifact;
    this.assetArtifactTag = this.resolver.tagCaipArtifact(assetArtifact) as string;
  }
}
