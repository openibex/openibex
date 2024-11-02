import { type AssetArtifact, type ChainArtifact } from "./caip";
import { OiPluginService } from "@openibex/core";
import { OiContractAPI, OiContractConnector, OiContractHandler } from "./contracts";
import { OiBlockHandler } from "./blocks";
import { OiProviderHandler, OiProvidersList } from "./providers";
import { caip, plugin } from './plugin';

/**
 * OiChain provides access to all chain resources (scrapers, protocols, APIs, accounts, blocks and transactions)
 * that are present within OpenIbex.
 * 
 * It provides the main interface to program applications. Just use getOiChain() to retrieve a chain instance.
 * 
 */
export class OiChain extends OiPluginService {
  /**
   * Keeps an instance of every platforms provider handler.
   */
  private providerHandler: Record<string, typeof OiProviderHandler> = {};
  
  /**
   * Singleton for provider handlers
   */
  protected providerInstances: OiProvidersList = {};

  /**
   * Keeps an instance of every platforms contract handler / abi-management.
   */
  private blockHandler: Record<string, typeof OiBlockHandler> = {};

  /**
   * Keeps an instance of every platforms contract handler / abi-management.
   */
  private contractHandler: Record<string, typeof OiContractHandler> = {};

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
    const platform = caip.getCAIPChain(chainArtifact).namespace;
    const chain = caip.getCAIPChain(chainArtifact).toString();

    if(!this.providerInstances[chain]) this.providerInstances[chain] = {}
    if(!this.providerInstances[chain][providerName]) {
      const handler = new this.providerHandler[platform](chainArtifact);
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
        : caip.getCAIPChain(chainArtifact).namespace;

    const handler = new this.blockHandler[platform](chainArtifact);

    if (!handler) throw new Error(`Contracts are not supported on platform ${platform}.`);

    return handler;
  }

  /**
   * Returns a contract handler for a platform (i.e. all EVM-Chains)
   * 
   * @param assetArtifact Any type of asset artifact.
   */
  public contract(assetArtifact: AssetArtifact, abiName?:string): OiContractHandler {
    const platform = caip.getCAIPChain(assetArtifact).namespace;
    const name = abiName ? abiName : assetArtifact.assetName.namespace

    if(!this.contractRegister[platform][name]) throw new Error(`No contract ${name} registered for ${platform}`);
    
    const handler = new this.contractHandler[platform](assetArtifact, this.contractRegister[platform][name]);

    if (!handler) throw new Error(`Contracts are not supported on platform ${platform}.`);

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
    this.providerHandler[caipPlatform] = providerHandler;
    this.contractHandler[caipPlatform] = contractHandler;
    this.blockHandler[caipPlatform] = blockHandler;
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

    plugin.log.info(`Registered contract ${caipAssetNamespace} on platform ${caipPlatform}`);
  }

  public async init() {

  }
}

plugin.addPluginService('chain', new OiChain());
