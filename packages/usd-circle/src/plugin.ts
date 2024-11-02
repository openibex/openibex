import { registerOiPlugin } from "@openibex/core";
import { OiPlugin } from "@openibex/core";

// Plugin Config with defaults. Merged on init with config from core.
const pluginDefaultConfig = {};

export const plugin: OiPlugin = new OiPlugin('usd-circle', 'openibex', pluginDefaultConfig);

// Register the plugin
registerOiPlugin('usd-circle', 'openibex', plugin, ['openibex.protocols']);
