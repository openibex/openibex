import { OiContractAPI } from "./api";
import { OiContractConnector } from "./connector";
import { OiChain } from "../chain";
import { oiCorePlugins, OiPlugin } from "@openibex/core";
import { OnPluginInitHook } from "@openibex/core";

/**
 * Contract handler registers an abi, api and connector for a contract.
 */
export class OiContractRegister {
  private abi: any;
  private api: typeof OiContractAPI;
  private connector: typeof OiContractConnector;

  private caipAssetNamespace: string;
  private caipPlatform: string;
  
  constructor(caipPlatform: string, caipAssetNamespace: string, abi: any, api: typeof OiContractAPI, connector: typeof OiContractConnector) {
    this.caipPlatform = caipPlatform;
    this.caipAssetNamespace = caipAssetNamespace;
    this.abi = abi;
    this.api = api;
    this.connector = connector;
  }

  
  public async init(plugin: OiPlugin): Promise<void> {
    const chain: OiChain = oiCorePlugins.getPlugin('openibex', 'chain').getService('chain') as unknown as OiChain;
    chain.registerContract(this.caipPlatform, this.caipAssetNamespace, this.abi, this.api, this.connector);
  }
}
