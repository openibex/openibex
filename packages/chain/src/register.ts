import { OiChain } from "./chain";
import { oiCorePlugins, OiPlugin } from "@openibex/core";
import { OnPluginInitHook } from "@openibex/core";
import { OiProviderHandler } from "./providers";
import { OiContractHandler } from "./contracts";
import { OiBlockHandler } from "./blocks";

/**
 * Contract handler registers an abi, api and connector for a contract.
 */
export class OiChainRegister {
  private providerHandler: typeof OiProviderHandler;
  private contractHandler: typeof OiContractHandler;
  private blockHandler: typeof OiBlockHandler;
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
      // txHandler: OiTransactionHandler,
      // nodeHandler: OiNodeHandler,
      // accountHandler: OiAccountHandler,
      // signerHandler: OiSignerHandler,
      // utilsHandler: OiUtilsHandler,
      // indexer: OiEventIndexer,
  }

  
  public async init(plugin: OiPlugin): Promise<void> {
    const chain: OiChain = oiCorePlugins.getPlugin('openibex', 'chain').getService('chain') as unknown as OiChain;
    chain.register(this.caipPlatform, this.providerHandler, this.contractHandler, this.blockHandler);
  }
}
