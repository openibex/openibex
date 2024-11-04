import { OiPluginService, WithPluginServices } from "@openibex/core";
import { AssetArtifact, OiCaipHelper, OiChain } from "@openibex/chain";
import { AssetArtifactWithBlock, OiChainProtocol } from "./protocol";

@WithPluginServices('openibex.chain/caip', 'openibex.chain/chain')
export class OiChainProtocols extends OiPluginService {
  public chain: OiChain;
  public caip: OiCaipHelper;
  
  protected protocolRegister: { [protocol: string]: typeof OiChainProtocol } = {};
  protected protocolHandles: Record<string, Record<string, string>> = {};

  /**
   * Retrieves a protocol based on the handles map. I.e. contracts on testnets.
   * Example: ...
   * @param assetArtifact Asset Artifact
   * @param startBlock 
   * @param bloomFilter 
   * @returns 
   */
  public getForArtifact(assetArtifact: AssetArtifact, startBlock: number, bloomFilter?: any) {
    const platform = this.caip.getCAIPChain(assetArtifact).namespace;
    const namespace = assetArtifact.assetName.namespace;

    if(!this.protocolHandles[platform]) {
      throw Error(`Platform ${platform} is not configured. Cant retrieve protocol for ${assetArtifact.toString()}`);
    }

    if(!this.protocolHandles[platform][namespace]) {
      throw Error(`Asset ${namespace} of ${assetArtifact.toString()} does not have a protocol.`);
    }

    return this.get(this.protocolHandles[platform][namespace], bloomFilter, [{assetArtifact, startBlock}]);
  }

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
   * @param name Name, i.e. usd-circle
   * @param handles Mappings between contract ABI and protocol.
   * @param protocol 
   */
  public register(name: string, handles: Record<string, string>, abis: Record<string, any>, protocol: typeof OiChainProtocol) {
    this.protocolRegister[name] = protocol;

    for (const [namespace, handleName] of Object.entries(handles)) {
      if (!this.protocolHandles[namespace]) {
        this.protocolHandles[namespace] = {};
      }
      this.protocolHandles[namespace][handleName] = name;
    }

    for(const [platform, abi] of Object.entries(abis)) {
      this.chain.registerContract(platform, name, abi );
    }
  }
}
