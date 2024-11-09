import { OiChain } from "./chain";
import { OiPlugin, OiPluginRegistry } from "@openibex/core";
import { OiProviderHandler } from "./providers";
import { OiContractHandler } from "./contracts";
import { OiBlockHandler } from "./blocks";
import { OiWalletHandler } from "./wallets";

/**
 * Contract handler registers an abi, api and connector for a contract.
 */
export class OiChainBundle {
  private providerHandler: typeof OiProviderHandler;
  private contractHandler: typeof OiContractHandler;
  private blockHandler: typeof OiBlockHandler;
  private walletHandler: typeof OiWalletHandler
    // txHandler: OiTransactionHandler,
    // nodeHandler: OiNodeHandler,
    // accountHandler: OiAccountHandler,
    // signerHandler: OiSignerHandler,
    // utilsHandler: OiUtilsHandler,
    // indexer: OiEventIndexer,
   
  private caipPlatform: string;
  
  constructor(
    caipPlatform: string, 
    providerHandler: typeof OiProviderHandler,
    contractHandler: typeof OiContractHandler,
    blockHandler: typeof OiBlockHandler,
    walletHandler: typeof OiWalletHandler,
    // txHandler: OiTransactionHandler,
    // nodeHandler: OiNodeHandler,
    // accountHandler: OiAccountHandler,
    // signerHandler: OiSignerHandler,
    // utilsHandler: OiUtilsHandler,
    // indexer: OiEventIndexer,
   ) {
      this.caipPlatform = caipPlatform;
      this.providerHandler = providerHandler;
      this.contractHandler = contractHandler;
      this.blockHandler = blockHandler;
      this.walletHandler = walletHandler;
      // txHandler: OiTransactionHandler,
      // nodeHandler: OiNodeHandler,
      // accountHandler: OiAccountHandler,
      // signerHandler: OiSignerHandler,
      // utilsHandler: OiUtilsHandler,
      // indexer: OiEventIndexer,
  }

  
  public async init(plugin: OiPlugin): Promise<void> {
    const chain: OiChain = OiPluginRegistry.getInstance().getPlugin('openibex', 'chain').getService('chain') as unknown as OiChain;
    chain.registerBundle(this.caipPlatform, this.providerHandler, this.contractHandler, this.blockHandler, this.walletHandler);
  }
}
