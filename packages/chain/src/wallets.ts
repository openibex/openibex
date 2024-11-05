import { type AssetArtifact, ChainArtifact, OiCaipHelper } from "./caip";
import { OiLoggerInterface, OiPlugin, WithPluginServices } from "@openibex/core";;


@WithPluginServices('openibex.chain/log', 'openibex.chain/caip')
export class OiWalletHandler {
  public log: OiLoggerInterface;
  public caip: OiCaipHelper;

  protected wallets: Record<string, any>;

  /**
   * 
   * @param pluginConf 
   */
  public init() {
    throw new Error("Method 'init' must be implemented on platform specific contract handler.");
  }

  /**
   * Returns a preconfigured wallet object or undefined if not found.
   * 
   * @param name Wallet name.
   * @param chainArtifact Target namespace / platform.
   * @returns 
   */
  public get(walletName: string) {

    if(this.wallets[walletName])
      return this.wallets[walletName];

    this.log.warn(`Wallet ${walletName} for eip155 was not found.`);
    
    return undefined;
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

  /**
   * 
   * @param walletName 
   * @param message 
   */
  public signMessage(walletName: string, message: string) {
    throw new Error("Method 'signMessage' must be implemented on platform specific contract handler.");
  }

  /**
   * 
   * @param sender 
   * @param signedMessage 
   */
  public verifyMessage(sender: ChainArtifact, signedMessage: string) {
    throw new Error("Method 'verifyMessage' must be implemented on platform specific contract handler.");
  }
}
