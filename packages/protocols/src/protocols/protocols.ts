import { OiPluginService, WithPluginServices } from "@openibex/core";
import { AssetArtifact, OiCaipHelper, OiChain } from "@openibex/chain";
import { AssetArtifactWithBlock, OiChainProtocol } from "./protocol";
import { OiProtocolAPI } from "./api";
import { OiProtocolConnector } from "./connector";


@WithPluginServices('openibex.chain/caip', 'openibex.chain/chain')
export class OiChainProtocols extends OiPluginService {
  public chain: OiChain;
  public caip: OiCaipHelper;
  
  protected protocolRegister: { [protocol: string]: typeof OiChainProtocol } = {};
  protected protocolHandles: Record<string, Record<string, string>> = {};

  /**
   * Returns a protocol instance.
   * 
   * @param protocolName 
   * @param bloomFilter 
   * @param customAssetArtifacts 
   * @returns 
   */
  public get(protocolName: string, bloomFilter?: any, customAssetArtifacts?: AssetArtifact[] | AssetArtifactWithBlock[]) {
    const protocol = this.protocolRegister[protocolName];
  
    if (!protocol) {
      throw new Error(`Protocol ${protocolName} not found.`);
    }
  
    if(customAssetArtifacts) {
      let assetArtifacts: AssetArtifactWithBlock[];

      customAssetArtifacts.map((assetArtifact) => {
        if ('startBlock' in assetArtifact)
          assetArtifacts.push(assetArtifact);
        else
         assetArtifacts.push({assetArtifact, startBlock: 0})
      })

      return new protocol(bloomFilter, assetArtifacts);
    }

    return new protocol(bloomFilter);
  }

  /**
   * Register a protocol. 
   * 
   * @param handle Name, i.e. usd-circle
   * @param handles Mappings between contract ABI and protocol.
   * @param protocol 
   */
  public register(handle: string, protocol: typeof OiChainProtocol) {
    this.protocolRegister[handle] = protocol;

    const protoInstance = new this.protocolRegister[handle]();

    for (const platform of protoInstance.handlePlatforms) {
      this.chain.registerContract(
        platform, 
        protoInstance.handle, 
        protoInstance.abis[platform],
        OiProtocolAPI, 
        OiProtocolConnector
      );
    }
  }
}
