import { OiCaipHelper, type AssetArtifact, type ChainArtifact } from "./caip";
import { OiPlugin, OiPluginService } from "@openibex/core";
import { OiContractAPI, OiContractConnector, OiContractHandler } from "./contracts";
import { OiBlockHandler } from "./blocks";
import { OiProviderHandler, OiProvidersList } from "./providers";

/**
 * OiChain provides access to all chain resources (scrapers, protocols, APIs, accounts, blocks and transactions)
 * that are present within OpenIbex.
 * 
 * It provides the main interface to program applications. Just use getOiChain() to retrieve a chain instance.
 * 
 */
export class OiChain extends OiPluginService {
  public caip: OiCaipHelper;
  public log: any;

  /**
   * Keeps an instance of every platforms provider handler.
   */
  private providerHandlers: Record<string, typeof OiProviderHandler> = {};
  
  /**
   * Singleton for provider handlers
   */
  protected providerInstances: OiProvidersList = {};

  /**
   * Keeps an instance of every platforms contract handler / abi-management.
   */
  private blockHandlers: Record<string, typeof OiBlockHandler> = {};

  /**
   * Keeps an instance of every platforms contract handler / abi-management.
   */
  private contractHandlers: Record<string, typeof OiContractHandler> = {};

  /**
   * Contract register: Contains all the required info to launch a contract handler.
   */
  private contractRegister: Record<string, Record<string, {abi: any, api?: typeof OiContractAPI, connector?: typeof OiContractConnector }>> = {};

  /**
   * Returns a provider handler.
   * 
   * @param chainArtifact Any chain artifact, or the CAIP platform name as string
   * @returns 
   */
  public provider(chainArtifact: ChainArtifact, providerName: string = 'default'): OiProviderHandler {
    const platform = this.caip.getCAIPChain(chainArtifact).namespace;
    const chain = this.caip.getCAIPChain(chainArtifact).toString();

    if(!this.providerInstances[chain]) this.providerInstances[chain] = {}
    if(!this.providerInstances[chain][providerName]) {
      const handler = new this.providerHandlers[platform](chainArtifact);
      if (!handler) throw new Error(`Contracts are not supported on platform ${platform}.`);
      this.providerInstances[chain][providerName]= handler;
    }
    return this.providerInstances[chain][providerName];
  }

  /**
   * Returns a provider handler.
   * 
   * @param chainArtifact Any chain artifact, or the CAIP platform name as string
   * @returns 
   */
  public blocks(chainArtifact: ChainArtifact): OiBlockHandler {
    const platform = typeof chainArtifact === 'string'
        ? chainArtifact
        : this.caip.getCAIPChain(chainArtifact).namespace;

    const handler = new this.blockHandlers[platform](chainArtifact);

    if (!handler) throw new Error(`Contracts are not supported on platform ${platform}.`);

    return handler;
  }

  /**
   * Returns a contract handler for a platform (i.e. all EVM-Chains)
   * 
   * @param assetArtifact Any type of asset artifact.
   */
  public contract(assetArtifact: AssetArtifact, abiName?:string): OiContractHandler {
    const platform = this.caip.getCAIPChain(assetArtifact).namespace;
    const name = abiName ? abiName : assetArtifact.assetName.namespace

    if(!this.contractHandlers[platform]) throw new Error(`Contracts are not supported on platform ${platform}.`);
    if(!this.contractRegister[platform][name]) throw new Error(`No contract ${name} registered for ${platform}`);
    
    const handler = new this.contractHandlers[platform](assetArtifact, this.contractRegister[platform][name]);

    return handler;
  }

  public register(
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
    this.providerHandlers[caipPlatform] = providerHandler;
    this.contractHandlers[caipPlatform] = contractHandler;
    this.blockHandlers[caipPlatform] = blockHandler;
  }

  /**
   * Register a contract for a specific asset type, i.e. 'erc20'. Contracts have three parts: The ABI, the connector and the API.
   * 
   * @param caipAssetNamespace Asset Namespace, i.e. 'erc20'.
   * @param abi ABI object.
   * @param api An implementation of OiContractAPI
   * @param connector An implementation of OiContractConnector.
   */
  public registerContract(
    caipPlatform: string,
    caipAssetNamespace: string,
    abi: any,
    api?: typeof OiContractAPI,
    connector?: typeof OiContractConnector) {
    
    if(!this.contractRegister[caipPlatform]) this.contractRegister[caipPlatform] = {}
    if(this.contractRegister[caipPlatform][caipAssetNamespace]) throw new Error(`Contract ${caipAssetNamespace} is already registered, can't register twice.`);

    this.contractRegister[caipPlatform][caipAssetNamespace] = {
      abi: abi,
      api: api,
      connector: connector
    }

    this.log.info(`Registered contract ${caipAssetNamespace} on platform ${caipPlatform}`);
  }

  /**
   * Service initializer
   * @param plugin 
   */
  public async init(plugin: OiPlugin) {
    this.log = plugin.log;
    this.caip = plugin.getService('caip');
  }
}
