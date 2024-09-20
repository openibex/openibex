import { ChainId } from "caip";
import { getCAIPChain } from "./resolver";
import type {ChainArtifact} from "./resolver";
import { getChainProvider } from "./providers";
import { subscribeBlocks } from "./subscriber";
import { isSupportedPlatform } from "./providers";

let blocks: {[key: string]: number} = {};

/**
 * Internal function, keeps track of the latest blocks without
 * requiring additional requests. This is achieved through
 * subscription to the latest block event in the chain-specific
 * provider.
 * 
 * @param chainId Chain the block is for.
 * @param block Block number
 */
function trackBlocks(chainId: ChainId, block: number) {
  blocks[chainId.toString()] = block;
}

/**
 * Returns the latest block number of the respective chain.
 * 
 * @param chainId The chain for which to retrieve.
 * @returns 
 */
export async function latestBlock(chainId: ChainArtifact) {
  const chain = getCAIPChain(chainId).toString();

  if(!(chain in blocks)) {
    subscribeBlocks(chainId, trackBlocks);
    blocks[chain] = (await getChainProvider(chainId)).getBlockNumber();
  }

  return blocks[chain];
}
