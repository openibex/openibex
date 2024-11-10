import { OiPlugin } from "@openibex/core";
import { RegisterPlugin } from "@openibex/core";

// Plugin Config with defaults. Merged on init with config from core.
const pluginDefaultConfig = {
  wallets: {},
  networks: {}
};

@RegisterPlugin()
export default class USDCirclePlugin extends OiPlugin {}

new USDCirclePlugin('openibex', 'usd-circle', {
  config: pluginDefaultConfig,
  dependencies: [ 'openibex.protocols'],
  services: {}
});
