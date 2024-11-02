import { registerOiPlugin } from "@openibex/core";
import { OiPlugin } from "@openibex/core";

// Plugin Config with defaults. Merged on init with config from core.
const pluginDefaultConfig = {
  wallets: {},
  networks: {}
};

const plugin = new OiPlugin('ethereum', 'openibex', pluginDefaultConfig);
// Register the plugin
registerOiPlugin('ethereum', 'openibex', plugin, ['openibex.core', 'openibex.chain']);
export default plugin;
