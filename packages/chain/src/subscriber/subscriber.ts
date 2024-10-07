import { AssetArtifact, ChainArtifact } from "../resolver";
import { ChainId } from "caip";

export abstract class OiSubscriberFactory {

  /**
   * Generates an unique id for address / filters used.
   * 
   * @param assetArtifact ChainArtifact the subscription is for.
   * @param filters (Topic) Filters used.
   * @returns 
   */
  public abstract getSubscriptionId(assetArtifact: AssetArtifact, eventName: string, filters?: any[]): string;

  /**
   * Subscribes to a contract with the filters specified. Subscription always comes from
   * 'latest' block. Use indexer to import older blocks.
   * 
   * @param assetArtifact ChainArtifact the subscription is for.
   * @param filters (Topic) Filters used.
   * @returns 
   */
  public abstract subscribeContract(
    assetArtifact: AssetArtifact,
    eventName: string,
    callback: (...args: any[]) => void,
    filters?: any[]
  ) : Promise<any>;

  /**
   * Register a callback to receive the latest blocknumber.
   * Ethereum: The block numbers are drawn from the provider keepalive without additional RPC-Requests
   * 
   * @param chainArtifact ChainId or other ChainArtifact
   * @param callback 
   */
  public abstract subscribeBlocks(chainArtifact: ChainArtifact, callback: (chainId: ChainId, block: number) => void): Promise<void>;
}
