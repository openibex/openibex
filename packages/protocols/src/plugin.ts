import { registerOiPlugin } from "@openibex/core";
import { OiPlugin } from "@openibex/core";

export const pluginName = 'protocols';
export const pluginNamespace = 'openibex';

// Plugin Config with defaults. Merged on init with config from core.
const pluginDefaultConfig = {};

export let pluginConfig = pluginDefaultConfig;

export let plugin: OiPlugin = new OiPlugin(pluginName, pluginNamespace);

plugin.onInit('protocols', async (name: string, config: any, plugin: OiPlugin) : Promise<void> => {
  pluginConfig = config;
});

// Register the plugin
registerOiPlugin(pluginName, pluginNamespace, plugin, ['openibex.chain', 'openibex-core']);
