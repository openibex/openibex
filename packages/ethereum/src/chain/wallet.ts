import { Wallet } from "ethers";
import * as fs from 'fs';
import { ChainArtifact, OiWalletHandler } from "@openibex/chain";
import { WithPluginServices } from "@openibex/core";


@WithPluginServices('openibex.ethereum/config')
export class EthereumWalletHandler extends OiWalletHandler{
  public config: any;

  public init() {
    for (const walletName in this.config.wallets) {
      const walletInfo = this.config.wallets[walletName];

      if (walletInfo.file && walletInfo.password) {
        const walletJsonString = fs.readFileSync(walletInfo.file, 'utf-8');
        const wallet = Wallet.fromEncryptedJsonSync(walletJsonString, walletInfo.password);

        if (!this.wallets) {
          this.wallets = {};
        }
        this.wallets[walletName] = wallet;
        this.log.info(`Initialized wallet ${walletName} on eip155`);
      } else {
        this.log.error(`Missing file or password for ${walletName} wallet on eip155`);
      }
    }
  }

  /**
   * Void Wallets are wallets without private key. Useful to i.e. simulate TX on behalf of an user or a multisig.
   * 
   * @param assetArtifact Any Asset Artifact or Accountid
   * @param walletName Default is wallet address.
   */
  public createVoidWallet(walletName?: string) {
    throw new Error("Method 'createVoidWallet' must be implemented on platform specific contract handler.");
  }

  public signMessage(walletName: string, message: string) {
    throw new Error("Method 'signMessage' must be implemented on platform specific contract handler.");
  }

  public verifyMessage(sender: ChainArtifact, signedMessage: string) {
    throw new Error("Method 'verifyMessage' must be implemented on platform specific contract handler.");
  }
}
