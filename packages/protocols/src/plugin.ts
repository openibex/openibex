import { OiPlugin, RegisterPlugin } from "@openibex/core";
import { OiChainProtocols } from "./protocols";

// Plugin Config with defaults. Merged on init with config from core.
const pluginDefaultConfig = {
  wallets: {},
  networks: {}
};

@RegisterPlugin()
export default class OiProtocolsPlugin extends OiPlugin {}

new OiProtocolsPlugin('openibex', 'protocols', {
  config: pluginDefaultConfig,
  dependencies: ['openibex.chain'],
  services: {
    "protocols": new OiChainProtocols()
  }
});
