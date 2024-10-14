import { getCAIPChain } from '../resolver';
import { isSupportedPlatform } from '../providers';

import type { ChainArtifact, AssetArtifact } from '../resolver';
import { ChainId } from 'caip';
import { OiSubscriberFactory } from './subscriber';

const subscriberFactories: Record<string, OiSubscriberFactory> = {};

/**
 * Add a platform specific provider factory.
 * 
 * @param platform Platform of the factory.
 * @param factory Factory instance.
 */
export function addSubscriberFactory(platform: string, factory: OiSubscriberFactory) {
    subscriberFactories[platform] = factory;
}

function checkSubscriberFactory(chainId: ChainId) {
  if (!(chainId.namespace in subscriberFactories))
    throw Error(`No subscriber factory registered for platform ${chainId.namespace}`);
}

/**
   * Generates an unique id for address / filters used.
   * 
   * @param assetArtifact ChainArtifact the subscription is for.
   * @param filters (Topic) Filters used.
   * @returns 
   */
export function getSubscriptionId(assetArtifact: AssetArtifact, eventName: string = '*', filters?: any[]) {
  checkSubscriberFactory(assetArtifact.chainId);
  return subscriberFactories[assetArtifact.chainId.namespace].getSubscriptionId(assetArtifact, eventName, filters);
}

/**
 * Subscribes to a contract event. Subscription starts at current block.
 * 
 * @param assetArtifact Asset type to subscribe to.
 * @param eventName Topic ABI in human-readable form.
 * @param callback Callback function that returns a boolean indicating success.
 * @param filters A topic bloom filter
 */
export async function subscribeContract(
  assetArtifact: AssetArtifact,
  eventName: string = "*",
  callback: (...args: any[]) => void,
  filters?: any[]
) {
  isSupportedPlatform(assetArtifact);
  checkSubscriberFactory(assetArtifact.chainId);

  return await subscriberFactories[assetArtifact.chainId.namespace].subscribeContract(assetArtifact, eventName, callback, filters);
}

/**
 * Register a callback to receive the latest blocknumber.
 * Ethereum: The block numbers are drawn from the provider keepalive without additional RPC-Requests
 * 
 * @param chainArtifact ChainId or other ChainArtifact
 * @param callback 
 */
export async function subscribeBlocks(chainArtifact: ChainArtifact, callback: (chainId: ChainId, block: number) => void) {
  const chain = getCAIPChain(chainArtifact);
  checkSubscriberFactory(chain);

  await subscriberFactories[chain.namespace].subscribeBlocks(chainArtifact, callback);
}

