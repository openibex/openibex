import { AccountId } from "caip";
import { OiContractFactory } from "./contract";
import { AssetArtifact, getCAIPChain } from "../resolver";

const contractFactories: Record<string, OiContractFactory> = {};

/**
 * Add a platform specific provider factory.
 * 
 * @param platform Platform of the factory.
 * @param factory Factory instance.
 */
export function addContractFactory(platform: string, factory: OiContractFactory) {
    contractFactories[platform] = factory;
}

/**
 * Checks whether the platform has a contract factory. Throws an error if not.
 * 
 * @param caipNamespace CAIP namespace as string.
 */
function checkContractFactory(caipNamespace: string) {
  if (!(caipNamespace in contractFactories))
    throw Error(`No contract factory registered for platform ${caipNamespace}`);
}

/**
 * Register an ABI for a specific asset type, i.e. 'erc20'.
 * 
 * @param caipNamespace Namespace of the ABI
 * @param abi ABI definition in chain specific format
 */
export async function useABI(caipNamespace: string, caipAssetNamespace: string, abi) {
  checkContractFactory(caipNamespace);

  contractFactories[caipNamespace].registerABI(caipAssetNamespace, abi);
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
export async function getContract(assetArtifact: AssetArtifact | AccountId, walletName?: string, abiName?: string): Promise<any> {
  const chain = getCAIPChain(assetArtifact);
  
  checkContractFactory(chain.namespace);

  return await contractFactories[chain.namespace].getContract(assetArtifact, walletName, abiName);
}
