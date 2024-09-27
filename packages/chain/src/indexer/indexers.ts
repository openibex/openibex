import { AssetArtifact } from '../resolver';
import { getSubscriptionId } from '../subscriber';
import { plugin } from '../plugin';
import { getNodeId } from '@openibex/core';
import { isSupportedPlatform } from '../providers';
import { OiEventIndexer } from './indexer';


const platformIndexers: Record<string, new (assetArtifact: AssetArtifact, eventName: string, callback:  (...args: any[]) => Promise<void> , bloomFilters?: any) => OiEventIndexer> = {};

/**
 * Add a platform specific provider indexer.
 * 
 * @param platform Platform of the indexer.
 * @param factory Factory instance.
 */
export function addPlatformIndexer(platform: string, indexerClass: new (assetArtifact: AssetArtifact, eventName: string, callback:  (...args: any[]) => Promise<void> , bloomFilters?: any) => OiEventIndexer) {
    platformIndexers[platform] = indexerClass;
}
/**
 * Subscribes to a contract event and calls a processing callback. If processing is successfull log entry is added to processed index..
 * 
 * @param assetArtifact Asset type to subscribe to.
 * @param eventName Topic ABI in human-readable form.
 * @param callback Callback function that returns a boolean indicating success.
 * @param fromBlock Start Block, default 'latest'
 * @param bloomFilters A topic bloom filter
 */
export async function indexEvents(
  assetArtifact: AssetArtifact,
  eventName: string = "*",
  callback: (...args: any[]) => Promise<void>,
  fromBlock: number | string = 'latest',
  bloomFilters?: any
) {
  isSupportedPlatform(assetArtifact);

  const subscriptionId = getSubscriptionId(assetArtifact, eventName, bloomFilters)
  const indexer: OiEventIndexer = new platformIndexers[assetArtifact.chainId.namespace](assetArtifact, eventName, callback, bloomFilters);
  // Indexer class will handle mutexes and failover once it's implemented.
  await plugin.setVal(getNodeId(), 'mutex', subscriptionId);

  plugin.log.info(`Starting indexer on ${assetArtifact.toString()}/${eventName} from ${fromBlock}`);
  indexer.startIndexer(fromBlock);
}
