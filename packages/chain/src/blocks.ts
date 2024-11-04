import { ChainId } from "caip";
import type { ChainArtifact, OiCaipHelper } from "./caip";
import { WithPluginServices } from "@openibex/core";

@WithPluginServices('openibex.chain/caip')
export class OiBlockHandler {
  public caip: OiCaipHelper;
  
  protected chainArtifact: ChainArtifact;

  constructor(chainArtifact: ChainArtifact) {
    this.chainArtifact = chainArtifact;
  }

  /**
   * Returns the chainId object of this provider.
   * 
   * @returns 
   */
  public getChainId(): ChainId {
    return this.caip.getCAIPChain(this.chainArtifact);
  }
  
  /**
   * Register a callback to receive the latest blocknumber.
   * Ethereum: The block numbers are drawn from the provider keepalive without additional RPC-Requests
   * 
   * @param chainArtifact ChainId or other ChainArtifact
   * @param callback 
   */
  public subscribeLatest(chainArtifact: ChainArtifact, callback: (chainId: ChainId, block: number) => void): Promise<void> {
    throw new Error("Method 'latest' must be implemented on platform specific contract handler.");
  }

  /**
   * Returns the latest block number of the respective chain.
   * 
   * @param chainId The chain for which to retrieve.
   * @returns 
   */
  public latest(chainId: ChainArtifact): Promise<number> {
    throw new Error("Method 'latest' must be implemented on platform specific contract handler.");
  }
}
