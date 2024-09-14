import { OiPrimitive } from "@openibex/core";
import { AssetArtifact, tagCaipArtifact } from "../resolver";
import { pluginName, pluginNamespace } from "../plugin";

export class OiBlockchainPrimitive extends OiPrimitive {
  protected index: boolean;
  protected assetArtifact: AssetArtifact;
  protected assetArtifactTag: string;
  

  protected primitiveName: string;
  protected pluginName: string;
  protected pluginNamespace: string;

  protected currentBlock: number = -1;

  protected primitiveDb: any;

  constructor(assetArtifact: AssetArtifact, primitiveName: string, index?: boolean, namespace = pluginNamespace, plugin = pluginName) {
    super(pluginNamespace, pluginName, primitiveName, tagCaipArtifact(assetArtifact) as string);

    this.primitiveName = primitiveName;
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
