import { ChainArtifact, OiBlockHandler, OiCaipHelper, OiChain } from "@openibex/chain";
import { WithPluginServices } from "@openibex/core";
import { ChainId } from "caip";

@WithPluginServices('openibex.chain/chain', 'openibex.chain/caip')
export class EthereumBlockHandler extends OiBlockHandler {
  public chain: OiChain;
  
  /**
   * Latest Blocks
   */
  protected latestBlocks: {[key: string]: number} = {};

  /**
   * Register a callback to receive the latest blocknumber.
   * Ethereum: The block numbers are drawn from the provider keepalive without additional RPC-Requests
   * 
   * @param chainArtifact ChainId or other ChainArtifact
   * @param callback 
   */
  public async subscribeLatest(chainArtifact: ChainArtifact, callback: (chainId: ChainId, block: number) => void) {
    const provider = await this.chain.provider(chainArtifact).get();
    const chainId = this.caip.getCAIPChain(chainArtifact);

    provider.on('block', (blockNumber: number) => {
      callback(chainId, blockNumber);
    });
  }

  /**
   * Returns the latest block number of the respective chain.
   * 
   * @param chainId The chain for which to retrieve.
   * @returns 
   */
  public async latest(chainId: ChainArtifact): Promise<number> {
    const chainName = this.caip.getCAIPChain(chainId).toString();

    if(!(chainName in this.latestBlocks)) {
      this.subscribeLatest(chainId, (chain, block) => {this.latestBlocks[chain.toString()] = block;});
      this.latestBlocks[chainName] = await this.chain.provider(chainId).get().getBlockNumber();
    }

    return this.latestBlocks[chainName];
  }
}