import { ERC173abi } from "./abi";
import { AssetArtifact, useABI, useContractConnector,  OiChainTokenSupplyProducer, OiContractConnectorParams, OiContractConnector  } from "@openibex/chain";
import { AccountId } from "caip";
import { EventLog } from "ethers";
import { EthereumEventIndexer } from '../indexer';
import { OiChainLogProducer } from "@openibex/chain/src/producers";

/**
 * The OiErc173Connector implements the Ownable interface and processes its events.
 */
export class OiErc173Connector extends OiContractConnector {

  /**
   * Constructor.
   * 
   * @param assetArtifact AssetArtifact, detected ABI needs to cover .
   * @param params 
   */
  constructor(assetArtifact: AssetArtifact, params: OiContractConnectorParams, bloomFilter?: string[][]) {
    super(assetArtifact, params, bloomFilter);

    super.addIndexer('OwnershipTransferred', new EthereumEventIndexer(assetArtifact, 'OwnershipTransferred', this.startBlock, this.bloomFilter ))
    super.addEventProcessor('OwnershipTransferred', this.ownershipTransferred.bind(this));
  }

  public async ownershipTransferred(previousOwner: string, newOwner: string, event: EventLog): Promise<any> {
    const previousOwnerAccount = new AccountId({chainId: this.assetArtifact.chainId, address: previousOwner});
    const newOwnerAccount = new AccountId({chainId: this.assetArtifact.chainId, address: newOwner});

    const [caipTagPreviousOwner, caipTagNewOwner ] = await super.tagAndResolve(previousOwnerAccount, newOwnerAccount);
    return { block: event.blockNumber, caipTagPreviousOwner, caipTagNewOwner, event }
  }
}

useContractConnector('erc173', OiErc173Connector, 'eip155');
useABI('eip155', 'erc173', ERC173abi);
