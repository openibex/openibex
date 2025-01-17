import { Contract, Provider } from "ethers";
import { OiContractHandler } from "@openibex/chain";
import { WithPluginServices } from "@openibex/core";
/**
 * Contract factory.
 */
@WithPluginServices('openibex.chain/caip', 'openibex.chain/chain', 'openibex.chain/log')
export class EthereumContractHandler extends OiContractHandler {
  public log: any;
  
  /**
   * Returns a contract based on a registered ABI as chain specific contract instance.
   * Default instance type for Ethereum is an ethers contract.
   * 
   * @param assetArtifact Contract Account.
   * @param walletName A valid signer / wallet if the contract should be writable.
   * @param abiName Name of the registered abi. Not required if the ABI is named after an asset namespace.
   * @returns Contract instance.
   */
  public async get(walletName?: string): Promise<Contract> {
    const address = this.caip.getCAIPAssetType(this.assetArtifact).assetName.reference;
  
    const provider: Provider = await this.chain.provider(this.assetArtifact, 'default').get();
  
    const contract = new Contract(address, this.abi, provider);
  
    if(walletName) {
      const wallet = this.chain.wallet(this.assetArtifact.chainId).get(walletName);
      if (wallet)
        return contract.connect(wallet.connect(provider)) as Contract;
    }
  
    return contract
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
  ) {
    const subscrId = this.getSubscriptionId(eventName, 'latest', filters);
    this.log.info(`Subscribing to event ${eventName} contract ${this.assetArtifact.toString()}`);

    if (!(subscrId in this.subscriptions)) {
      const contract: Contract = await this.get();
      if (filters) {
        this.log.info(`Setting filters for ${this.assetArtifact.toString()}`);
        contract.filters[eventName](...filters);
      }

      this.subscriptions[subscrId] = contract;
    }

    const subscrContract = this.subscriptions[subscrId];
    return await subscrContract.on(eventName, callback);
  }
}
