import { AssetArtifact, OiContractConnector, OiContractConnectorParams  } from "@openibex/chain";
import { AccountId } from "caip";
import { EventLog } from "ethers";
import { EthereumEventIndexer } from "../chain";
import { WithPluginServices } from "@openibex/core";

/**
 * The OiErc20Connector is listening to the standard events of ERC20 and creates a few producers:
 * - Supply: All mints and burns, new supply and tries of all minters and burners in that block and whole chain.
 * - Transfers: Transfer volumes, all senders and recipients in that block and on chain until block.
 * - Holders: All holders in that block and on-chain as trie. As well a holders table that represents latest status.
 *
 */
export class OiErc20Connector extends OiContractConnector {

  /**
   * Constructor.
   * 
   * @param assetArtifact AssetArtifact, has to be 'erc20' denominated.
   * @param params 
   */
  constructor(assetArtifact: AssetArtifact, params: OiContractConnectorParams, bloomFilter?: string[][]) {
    super(assetArtifact, params, bloomFilter);
    
    super.addIndexer('Transfer', new EthereumEventIndexer(assetArtifact, 'Transfer', this.startBlock, this.bloomFilter ));
    super.addEventProcessor('Transfer', this.processTransfer.bind(this));
    // super.addProducer('Transfer', new OiChainTokenSupplyProducer(assetArtifact, this.indexers['Transfer'].getSubscriptionId()));
  }

  public async processTransfer(from: string, to: string, amount: bigint, event: EventLog): Promise<any> {
    const fromAccount = new AccountId({chainId: this.assetArtifact.chainId, address: from});
    const toAccount = new AccountId({chainId: this.assetArtifact.chainId, address: to});

    const [fromAddress, toAddress] = await super.tagAndResolve(fromAccount, toAccount);
   
    return { block: event.blockNumber, fromAddress, toAddress, amount, event}
  }
}
