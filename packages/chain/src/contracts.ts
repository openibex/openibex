import { AccountId, AssetId, AssetType } from "caip";
import { Provider, Contract } from "ethers";
import { getCAIPAssetType, isAssetId, isAssetType } from "./resolver";
import { getChainProvider } from "./providers";

import { AssetArtifact } from "./resolver";
import { getWallet } from "./wallets";

const abiRegister: { [namespace: string]: { [assetNamespace: string]: any } } = {
  eip1155: {}
};

/**
 * Register an ABI for a specific asset type, i.e. 'erc20'.
 * 
 * @param caipNamespace Namespace of the ABI
 * @param abi ABI definition in chain specific format
 */
export async function useABI(caipNamespace: string, caipAssetNamespace: string, abi) {
  if(!abiRegister[caipNamespace]) {
    abiRegister[caipNamespace] = {};
  }
  abiRegister[caipNamespace][caipAssetNamespace] = abi;
}

/**
 * Returns a contract based on a registered ABI as chain specific contract instance.
 * Default instance type for Ethereum is an ethers contract.
 * 
 * @param assetArtifact Contract Account.
 * @param abiName Name of the registered abi. Not required if the ABI is named after an asset namespace.
 * @returns Contract instance.
 */
export async function getContract(assetArtifact: AssetArtifact | AccountId, walletName?: string, abiName?: string): Promise<Contract> {
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

  const contract = new Contract(address, abiRegister[assetArtifact.chainId.namespace][abiName], provider);

  if(walletName) {
    const wallet = getWallet(walletName, assetArtifact.chainId);
    if (wallet)
      return contract.connect(wallet.connect(provider)) as Contract;
  }

  return contract
}
