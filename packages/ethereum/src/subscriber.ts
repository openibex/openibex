import { Contract, id } from "ethers";
import { plugin } from "./plugin";
import { AssetArtifact, ChainArtifact, getCAIPChain, getContract, getChainProvider, addSubscriberFactory, OiSubscriberFactory } from "@openibex/chain";
import { ChainId } from "caip";

export class EthereumSubscriberFactory extends OiSubscriberFactory {

  /**
   * Active subscriptions, required for connection sharing. If a subscription for the combination
   * of contract, eventName and filter is already initialized, the callback is attached to that
   * subscription and no new one is opened.
   */
  private subscriptions: Record<string, any> = {};

  /**
   * Generates an unique id for address / filters used.
   * 
   * @param assetArtifact ChainArtifact the subscription is for.
   * @param filters (Topic) Filters used.
   * @returns 
   */
  public getSubscriptionId(assetArtifact: AssetArtifact, eventName: string = '*', filters?: any[]) {
    return id(`${assetArtifact.toString()}.${eventName}.${filters ? JSON.stringify(filters): ''}`);
  }

  /**
 * Subscribes to a contract event. Subscription starts at current block.
 * 
 * @param assetArtifact Asset type to subscribe to.
 * @param eventName Topic ABI in human-readable form.
 * @param callback Callback function that returns a boolean indicating success.
 * @param filters A topic bloom filter
 */
  public async subscribeContract(
    assetArtifact: AssetArtifact,
    eventName: string = "*",
    callback: (...args: any[]) => void,
    filters?: any[]
  ) {
    const subscrId = this.getSubscriptionId(assetArtifact, eventName, filters);

    const chain = getCAIPChain(assetArtifact);
    plugin.log.info(`Subscribing to event ${eventName} contract ${assetArtifact.toString()}`);

    if (!(subscrId in this.subscriptions)) {
      const contract: Contract = await getContract(assetArtifact);
      if (filters) {
        plugin.log.info(`Setting filters for ${assetArtifact.toString()}`);
        await contract.filters[eventName](...filters);
      }

      this.subscriptions[subscrId] = contract;
    }

    const subscrContract = this.subscriptions[subscrId];
    return await subscrContract.on(eventName, callback);
  }

  /**
   * Register a callback to receive the latest blocknumber.
   * Ethereum: The block numbers are drawn from the provider keepalive without additional RPC-Requests
   * 
   * @param chainArtifact ChainId or other ChainArtifact
   * @param callback 
   */
  public async subscribeBlocks(chainArtifact: ChainArtifact, callback: (chainId: ChainId, block: number) => void) {
    const provider = await getChainProvider(chainArtifact);
    const chain = getCAIPChain(chainArtifact);

    provider.on('block', (blockNumber: number) => {
      callback(chain, blockNumber);
    });
  }
}

addSubscriberFactory('eip155', new EthereumSubscriberFactory());
