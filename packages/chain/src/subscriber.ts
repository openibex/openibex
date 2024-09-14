import { Contract, id } from 'ethers';
import { getCAIPChain } from './resolver';
import { getContract } from './contracts';
import { getChainProvider } from './providers';

import type { ChainArtifact, AssetArtifact } from './resolver';
import { ChainId } from 'caip';
import { coreApp } from './plugin';

/**
 * Active subscriptions, required for connection sharing. If a subscription for the combination
 * of contract, eventName and filter is already initialized, the callback is attached to that
 * subscription and no new one is opened.
 */
const subscriptions: Record<string, any> = {};

/**
 * Generates an unique id for address / filters used.
 * 
 * @param assetArtifact ChainArtifact the subscription is for.
 * @param filters (Topic) Filters used.
 * @returns 
 */
export function getSubscriptionId(assetArtifact: AssetArtifact, eventName: string = '*', filters?: any[]) {
  return id(`${assetArtifact.toString()}.${eventName}.${filters ? JSON.stringify(filters): ''}`);
}

/**
 * Subscribes to a contract even. Subscription starts at current block.
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
  const subscrId = getSubscriptionId(assetArtifact, eventName, filters);

  const chain = getCAIPChain(assetArtifact);
  coreApp.log.info(`Subscribing to event ${eventName} contract ${assetArtifact.toString()}`);

  if (chain.namespace !== 'eip155') {
    throw new Error(`Unsupported blockchain ${chain.namespace}`);
  }

  if (!(subscrId in subscriptions)) {
    const contract: Contract = await getContract(assetArtifact);
    if (filters) {
      coreApp.log.info(`Setting filters for ${assetArtifact.toString()}`);
      await contract.filters[eventName](...filters);
    }

    subscriptions[subscrId] = contract;
  }

  const subscrContract = subscriptions[subscrId];
  return await subscrContract.on(eventName, callback);
}

/**
 * Register a callback to receive the latest blocknumber.
 * Ethereum: The block numbers are drawn from the provider keepalive without additional RPC-Requests
 * 
 * @param chainArtifact ChainId or other ChainArtifact
 * @param callback 
 */
export async function subscribeBlocks(chainArtifact: ChainArtifact, callback: (chainId: ChainId, block: number) => void) {
  const provider = await getChainProvider(chainArtifact);
  const chain = getCAIPChain(chainArtifact);

  if (chain.namespace !== 'eip155') throw Error(`Block Subscriber: Unsupported chain ${chain.namespace}`);

  provider.on('block', (blockNumber: number) => {
    callback(chain, blockNumber);
  });
}

