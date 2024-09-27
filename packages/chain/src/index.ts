import { initAPIs } from './api';
import { OiChain } from './chains';

// Low level API for module development
export { getChainProvider, addProviderFactory, getRateLimiter } from './providers';
export { addPlatformIndexer, indexEvents } from './indexer';
export { getContract, useABI } from './contracts';
export { useContractConnector, getContractConnector } from './connectors';
export { latestBlock } from './blocks';
export { getCAIPAssetType, getCAIPChain} from './resolver';
export { subscribeBlocks, getSubscriptionId, subscribeContract } from './subscriber';

// TODO with proper PluginStructure
// initWallets shall be done internally in this file
// remove export!
export { initWallets } from './wallets'

export { OiConnector } from './connectors';
export { OiProviderFactory, OiProvidersList } from './providers';
export { OiEventIndexer } from './indexer';

// Users use OiChain to access the blockchain.
export { OiChain } from './chains';

export type {ChainArtifact, AssetArtifact, AccountArtifact} from './resolver';

// Register the plugin.
import './plugin';

let chain: OiChain;

/**
 * Singleton for chain instances, returns an OiChain which is used connect
 * smart contracts, retrieve primitives and initiate apis.
 * 
 * @returns A chain instance.
 */
export async function getOiChain(): Promise<OiChain> {
  if(!chain) {
    chain = new OiChain();
    // Make sure APIs are available.
    await initAPIs();

    //TODO once proper plugin-structure is available
    // init wallets here via
    // await initWallets(config from openibex.chain)
  } 

  return chain;
}
