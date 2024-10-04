import { OiChain } from './chains';

// Low level API for module development
export { getChainProvider, addProviderFactory, getRateLimiter } from './providers';
export { addPlatformIndexer, indexEvents } from './indexer';
export { addContractFactory, useABI, getContract } from './contracts';
export { useContractConnector, getContractConnector } from './connectors';
export { latestBlock } from './blocks';
export { getCAIPAssetType, getCAIPChain, lookupCaipTag, isAssetId, isAssetType, isChainId} from './resolver';
export { subscribeBlocks, getSubscriptionId, subscribeContract, addSubscriberFactory } from './subscriber';
export { useContractAPI, getContractAPI } from './api';

// TODO with proper PluginStructure
// initWallets shall be done internally in this file
// remove export!
export { initWallets } from './wallets'

export { OiContractFactory } from './contracts';
export { OiContractConnector, OiContractConnectorParams } from './connectors';
export { OiChainTokenSupply } from './producers/supply';
export { OiProviderFactory, OiProvidersList } from './providers';
export { OiEventIndexer } from './indexer';
export { OiSubscriberFactory } from './subscriber';
export { OiApi } from './api';

// Users use OiChain to access the blockchain.
export { OiChain } from './chains';

export type {ChainArtifact, AssetArtifact, AccountArtifact} from './resolver';

// Register the plugin.
import './plugin';

let chain: OiChain;

/**
 * Singleton for chain instances, returns an OiChain which is used connect
 * smart contracts, retrieve producers / consumers and initiate apis.
 * 
 * @returns A chain instance.
 */
export async function getOiChain(): Promise<OiChain> {
  if(!chain) {
    chain = new OiChain();
    // Make sure APIs are available.
    // await initAPIs();

    //TODO once proper plugin-structure is available
    // init wallets here via
    // await initWallets(config from openibex.chain)
  } 

  return chain;
}
