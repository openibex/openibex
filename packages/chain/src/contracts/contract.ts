import { AssetArtifact } from "../resolver";
import { AccountId } from "caip";

/**
 * Contract factory.
 */
export abstract class OiContractFactory {

  /**
   * Returns a contract based on a registered ABI as chain specific contract instance.
   * Default instance type for Ethereum is an ethers contract.
   * 
   * @param assetArtifact Contract Account.
   * @param walletName A valid signer / wallet if the contract should be writable.
   * @param abiName Name of the registered abi. Not required if the ABI is named after an asset namespace.
   * @returns Contract instance.
   */
  public abstract getContract(assetArtifact: AssetArtifact | AccountId, walletName?: string, abiName?: string): Promise<any>

  /**
   * Register an ABI for a specific asset type, i.e. 'erc20'.
   * 
   * @param caipNamespace Namespace of the ABI
   * @param abi ABI definition in chain specific format
   */
  public abstract registerABI(caipAssetNamespace: string, abi: any);
  
}
