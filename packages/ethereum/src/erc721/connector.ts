import { AssetArtifact, OiContractConnector, OiContractConnectorParams} from "@openibex/chain";
import { EthereumEventIndexer } from "../chain";
import { AccountId } from "caip";
import { EventLog } from "ethers";

/**
 * A connector registers all the ABIs it uses.
 * The ABI name equals the CAIP-19 Asset Namespace.
 */
export class OiErc721Connector extends OiContractConnector {

  // TODO Add indexer for current owners

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
  }

  public async processTransfer(from: string, to: string, tokenId: bigint, event: EventLog): Promise<any> {
    const fromAccount = new AccountId({chainId: this.assetArtifact.chainId, address: from});
    const toAccount = new AccountId({chainId: this.assetArtifact.chainId, address: to});

    const [fromAddress, toAddress] = await super.tagAndResolve(fromAccount, toAccount);
   
    return { block: event.blockNumber, fromAddress, toAddress, tokenId, event}
  }

  
}
