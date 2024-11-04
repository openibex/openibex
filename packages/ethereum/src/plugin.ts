import { OiPlugin } from "@openibex/core";
import { RegisterPlugin } from "@openibex/core";

// Plugin Config with defaults. Merged on init with config from core.
const pluginDefaultConfig = {
  wallets: {},
  networks: {}
};

@RegisterPlugin()
export default class EthereumPlugin extends OiPlugin {}

new EthereumPlugin('openibex', 'ethereum', {
  config: pluginDefaultConfig,
  dependencies: ['openibex.chain'],
  services: {}
});
