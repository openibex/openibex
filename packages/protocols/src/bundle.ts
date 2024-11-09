import { OiPlugin, OiPluginRegistry } from "@openibex/core";
import { OiChainProtocols, OiChainProtocol } from "./protocols";

/**
 * Contract handler registers an abi, api and connector for a contract.
 */
export class OiProtocolBundle {
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
    const protocolBundle: OiChainProtocols = OiPluginRegistry.getInstance().getPlugin('openibex', 'protocols').getService('protocols');
    protocolBundle.registerProtocol(this.protocolHandle, this.protocol);
  }
}
