import { AssetArtifact } from "@openibex/chain";
import { AssetArtifactWithBlock } from "./protocols/protocol";
import { getProtocol } from "./protocols/protocols";
import { OiPluginService } from "@openibex/core";


class Protocols extends OiPluginService {
  
  public async getProtocol(name: string, bloomFilter?: any, customAssetArtifacts?: AssetArtifact[] | AssetArtifactWithBlock[]) {
    if(customAssetArtifacts) {
      let assetArtifacts: AssetArtifactWithBlock[];

      customAssetArtifacts.map((assetArtifact) => {
        if ('startBlock' in assetArtifact)
          assetArtifacts.push(assetArtifact);
        else
         assetArtifacts.push({assetArtifact, startBlock: 0})
      })

      return getProtocol(name, bloomFilter, assetArtifacts);
    }

    return getProtocol(name, bloomFilter);
  }
}
