import { oiCorePlugins, OiPlugin } from "@openibex/core";
import { OiChainProtocol } from "./protocol";
import { OiChainProtocols } from "./protocols";
import { OiChain } from "@openibex/chain";

/**
 * Contract handler registers an abi, api and connector for a contract.
 */
export class OiProtocolRegister {
  private protocol: typeof OiChainProtocol;
   
  private protocolHandle: string;
  private abis: Record<string, any>;
  
  constructor(
    protocolHandle: string,
    protocol: typeof OiChainProtocol
   ) {
      this.protocolHandle = protocolHandle;
      this.protocol = protocol;
  }

  public async init(plugin: OiPlugin): Promise<void> {
    const protocolRegistry: OiChainProtocols = oiCorePlugins.getPlugin('openibex', 'protocols').getService('protocols');
    protocolRegistry.register(this.protocolHandle, this.protocol);
  }
}
