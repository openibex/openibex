import { OiLoggerInterface, registerOiPlugin, OiPlugin, OiCoreSchema } from "@openibex/core";
import { KeyValue } from "@orbitdb/core";
import { OiChain } from "./chain";
import { OiCaipHelper } from "./caip";
import { OiAddressTagResolver } from "./resolver";

export const pluginName = 'chain';
export const pluginNamespace = 'openibex';

// Plugin Config with defaults. Merged on init with config from core.
const pluginDefaultConfig = {};

export let pluginConfig = pluginDefaultConfig;

export let chain: OiChain;
export let caip: OiCaipHelper;
export let tagResolver: OiAddressTagResolver;

export class OiChainPlugin extends OiPlugin {

  public async init(config: any, coreDB: KeyValue<OiCoreSchema>, logger: OiLoggerInterface ) {
    await super.init(config, coreDB, logger);
    pluginConfig = config;
    
    chain = this.getPluginService('chain') as OiChain;
    caip = this.getPluginService('caip') as OiCaipHelper;
    tagResolver = this.getPluginService('resolver') as OiAddressTagResolver;
  }
}
export let plugin: OiPlugin = new OiChainPlugin(pluginName, pluginNamespace, pluginDefaultConfig);

// Register the plugin
registerOiPlugin(pluginName, pluginNamespace, plugin, ['openibex.core']);
