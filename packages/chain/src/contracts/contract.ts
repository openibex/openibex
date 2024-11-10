import { createHash } from "crypto";
import { OiContractAPI } from "./api";
import { OiContractConnector, OiContractConnectorParams } from "./connector";
import { AssetArtifact, OiCaipHelper } from "../caip";
import { AssetType } from "caip";
import { OiChain } from "../chain";
import { WithPluginServices } from "@openibex/core";


/**
 * Contract factory.
 */
@WithPluginServices('openibex.chain/chain', 'openibex.chain/caip')
export class OiContractHandler {
  public chain: OiChain;
  public caip: OiCaipHelper;

  /**
   * Asset covered by handler.
   */
  protected assetArtifact: AssetArtifact;

  /**
   * Contract artifacts
   */
  protected abi: any;
  protected api: typeof OiContractAPI;
  protected connector: typeof OiContractConnector;


  /**
   * Active subscriptions, required for connection sharing. If a subscription for the combination
   * of contract, eventName and filter is already initialized, the callback is attached to that
   * subscription and no new one is opened.
   */
  protected subscriptions: Record<string, any> = {};

  /**
   * Creates new ContractHandler instance.
   * 
   * @param assetArtifact Contract address in CAIP-19 notation.
   */
  constructor(assetArtifact: AssetArtifact, config: {abi?: any, api?: typeof OiContractAPI, connector?: typeof OiContractConnector}) {
    this.assetArtifact = assetArtifact;

    this.abi = config?.abi;
    this.api = config?.api;
    this.connector = config?.connector;
  }

  protected getAssetType(): AssetType {
    return this.caip.getCAIPAssetType(this.assetArtifact);
  }
  /**
   * Generates an unique id for address / filters used.
   * 
   * @param assetArtifact ChainArtifact the subscription is for.
   * @param filters (Topic) Filters used.
   * @returns 
   */
  public getSubscriptionId(eventName: string = '*', startBlock: number | string,  filters?: any[]) {
    return createHash('sha256').update(`${this.assetArtifact.toString()}.${eventName}.${startBlock}.${filters ? JSON.stringify(filters): ''}`).digest('hex');
  }
      
  /**
   * Subscribes to a contract event. Subscription starts at current block.
   * 
   * @param assetArtifact Asset type to subscribe to.
   * @param eventName Topic ABI in human-readable form.
   * @param callback Callback function that returns a boolean indicating success.
   * @param filters A topic bloom filter
   */
  public async subscribe(
    eventName: string = "*",
    callback: (...args: any[]) => void,
    filters?: any[]
  ): Promise<any> {
    throw new Error("Method 'subscribe()' must be implemented on platform specific contract handler.");
  }

  /**
   * Returns a contract based on a registered ABI as chain specific contract instance.
   * Default instance type for Ethereum is an ethers contract.
   * 
   * This is a chain specific implementation: I.e. if ethers EVM connector is used an ethers
   * contract is returned.
   * 
   * @param assetArtifact Contract Account.
   * @param walletName A valid signer / wallet if the contract should be writable.
   * @param abiName Name of the registered abi. Not required if the ABI is named after an asset namespace.
   * @returns Contract instance.
   */
  public async get(walletName?: string): Promise<any> {
    throw new Error("Method 'get' must be implemented on platform specific contract handler.");
  }

  /**
   * Returns a contract based on a registered ABI as chain specific contract instance.
   * Default instance type for Ethereum is an ethers contract.
   * 
   * @param assetArtifact Contract Account.
   * @param walletName A valid signer / wallet if the contract should be writable.
   * @param abiName Name of the registered abi. Not required if the ABI is named after an asset namespace.
   * @returns Contract instance.
   */
  public getAPI(walletName?: string, abiName?: string): OiContractAPI {
    if(!abiName && !this.api) throw Error(`No API defined for ${this.getAssetType().toString()}`);
    return abiName ? 
      this.chain.contract(this.assetArtifact, abiName).getAPI(walletName) 
      : new this.api(this.assetArtifact, walletName);
  }

  /**
   * Returns a contract based on a registered ABI as chain specific contract instance.
   * Default instance type for Ethereum is an ethers contract.
   * 
   * @param assetArtifact Contract Account.
   * @param walletName A valid signer / wallet if the contract should be writable.
   * @param abiName Name of the registered abi. Not required if the ABI is named after an asset namespace.
   * @returns Contract instance.
   */
  public getConnector(params: OiContractConnectorParams, bloomFilter?: string[][], connectorName?: string): OiContractConnector  {
    if(!connectorName && !this.connector) throw Error(`No Connector defined for ${this.getAssetType().toString()}`);
    return connectorName ? 
      this.chain.contract(this.assetArtifact, connectorName).getConnector(params, bloomFilter) 
      : new this.connector(this.assetArtifact, params, bloomFilter);
  }
}
