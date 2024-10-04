import { OiDataSeriesProducer } from "@openibex/core";
import { AssetArtifact, tagCaipArtifact } from "../resolver";
import { pluginName, pluginNamespace } from "../plugin";

export class OiChainLogProducer extends OiDataSeriesProducer {
  protected index: boolean;
  protected assetArtifact: AssetArtifact;
  protected assetArtifactTag: string;
  

  protected producerName: string;
  protected pluginName: string;
  protected pluginNamespace: string;

  protected currentBlock: number = -1;

  protected producerDb: any;

  constructor(assetArtifact: AssetArtifact, producerName: string, index?: boolean, namespace = pluginNamespace, plugin = pluginName) {
    super(pluginNamespace, pluginName, producerName, tagCaipArtifact(assetArtifact) as string);

    this.producerName = producerName;
    this.pluginName = plugin;
    this.pluginNamespace = namespace;

    this.assetArtifact = assetArtifact;
    this.assetArtifactTag = tagCaipArtifact(assetArtifact) as string;
    
    this.index = index ? index : false;
  }

  public async add(params: any) {
    return;
  }

  public async init() {
    return;
  }

  public async saveBlock(blockNumber: number) {
    // Sometimes a block does not have data.
    // This is covered here and can be super called.
    if(this.currentBlock !== blockNumber - 1) {
      return
    }
  }
}
