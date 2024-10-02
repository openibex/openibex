import { Contract, Provider } from "ethers";
import { AccountId } from "caip";
import { getCAIPAssetType, getChainProvider, AssetArtifact, OiContractFactory, addContractFactory } from "@openibex/chain";
import { isAssetId, isAssetType } from "@openibex/chain/dist/resolver";
import { getWallet } from "@openibex/chain/dist/wallets";

/**
 * Contract factory.
 */
export class EthereumContractFactory extends OiContractFactory {

  private abiRegister: Record<string, any> = {}

  /**
   * Returns a contract based on a registered ABI as chain specific contract instance.
   * Default instance type for Ethereum is an ethers contract.
   * 
   * @param assetArtifact Contract Account.
   * @param walletName A valid signer / wallet if the contract should be writable.
   * @param abiName Name of the registered abi. Not required if the ABI is named after an asset namespace.
   * @returns Contract instance.
   */
  public async getContract(assetArtifact: AssetArtifact | AccountId, walletName?: string, abiName?: string): Promise<Contract> {
    let address: string;

    if(assetArtifact instanceof AccountId){
      if(!abiName) throw Error("An ABI name is required when requesting a contract for an account.");
      address = assetArtifact.address;
    } else if(!abiName && (isAssetId(assetArtifact)|| isAssetType(assetArtifact))) {
      abiName = getCAIPAssetType(assetArtifact).assetName.namespace;
      address = getCAIPAssetType(assetArtifact).assetName.reference;
    } else {
      throw Error(`Chain combination not supported for ${assetArtifact.toString()}.`);
    }
  
    const provider: Provider = await getChainProvider(assetArtifact, 'default');
  
    const contract = new Contract(address, this.abiRegister[abiName], provider);
  
    if(walletName) {
      const wallet = getWallet(walletName, assetArtifact.chainId);
      if (wallet)
        return contract.connect(wallet.connect(provider)) as Contract;
    }
  
    return contract
  }
  
  /**
   * Register an ABI for a specific asset type, i.e. 'erc20'.
   * 
   * @param caipNamespace Namespace of the ABI
   * @param abi ABI definition in chain specific format
   */
  public registerABI(caipAssetNamespace: string, abi: any) {
    this.abiRegister[caipAssetNamespace] = abi;
  }
}

addContractFactory('eip155', new EthereumContractFactory());
