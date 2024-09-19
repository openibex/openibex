import { Wallet, HDNodeWallet } from "ethers";
import { type AssetArtifact, ChainArtifact, getCAIPChain } from "./resolver";
import { plugin } from "./plugin";
import * as fs from 'fs';
import { AccountId } from "caip";

interface WalletsList {
  [chainId: string]: {
    [name: string]: Wallet | HDNodeWallet;
  };
}

const wallets: WalletsList = {}

export function initWallets(pluginConf: any) {
  for (const namespace in pluginConf) {
    for (const walletName in pluginConf[namespace].wallets) {
      const walletInfo = pluginConf[namespace].wallets[walletName];

      if (walletInfo.file && walletInfo.password) {
        const walletJsonString = fs.readFileSync(walletInfo.file, 'utf-8');
        const wallet = Wallet.fromEncryptedJsonSync(walletJsonString, walletInfo.password);

        if (!wallets[namespace]) {
          wallets[namespace] = {};
        }
        wallets[namespace][walletName] = wallet;
        plugin.log.info(`Initialized wallet ${walletName} on ${namespace}`);
      } else {
        plugin.log.error(`Missing file or password for ${walletName} wallet on ${namespace}`);
      }
    }
  }
}

/**
 * Returns a preconfigured wallet object or undefined if not found.
 * 
 * @param name Wallet name.
 * @param chainArtifact Target namespace / platform.
 * @returns 
 */
export function getWallet(walletName: string, chainArtifact: ChainArtifact) {
  const namespace = getCAIPChain(chainArtifact).namespace;

  if(namespace && wallets[namespace][walletName])
    return wallets[namespace][walletName];

  plugin.log.warn(`Wallet ${name} for ${namespace} was not found.`);
  
  return undefined;
}

/**
 * Void Wallets are wallets without private key. Useful to i.e. simulate TX on behalf of an user or a multisig.
 * 
 * @param assetArtifact Any Asset Artifact or Accountid
 * @param walletName Default is wallet address.
 */
export function createVoidWallet(assetArtifact: AssetArtifact | AccountId, walletName?: string) {
  // TODO
}

export function signMessage(walletName: string, message: string) {
  // TODO
}

export function verifyMessage(sender: ChainArtifact, signedMessage: string) {
  // TODO
}
