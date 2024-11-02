import { registerOiPlugin, OiPlugin } from "@openibex/core";
import { OiChainProtocols } from "./protocols";

export const pluginName = 'protocols';
export const pluginNamespace = 'openibex';

// Plugin Config with defaults. Merged on init with config from core.
const pluginDefaultConfig = {};

export let protocols!: OiChainProtocols;

export let plugin: OiPlugin = new OiPlugin(pluginName, pluginNamespace, pluginDefaultConfig);

plugin.onInit('exporting protocol', async (plugin: OiPlugin) => {
  protocols = plugin.getPluginService('protocols') as OiChainProtocols;
});

// Register the plugin
registerOiPlugin(pluginName, pluginNamespace, plugin, ['openibex.chain', 'openibex.core', 'openibex.ethereum']);
