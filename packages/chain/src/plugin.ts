import { OiPlugin, RegisterPlugin } from "@openibex/core";
import { OiCaipHelper } from "./caip";
import { OiAddressTagResolver } from "./resolver";
import { OiChain } from "./chain";

// Plugin Config with defaults. Merged on init with config from core.
const pluginDefaultConfig = {};

@RegisterPlugin()
export default class OiChainPlugin extends OiPlugin {}

new OiChainPlugin(
  'openibex', 'chain',
  { config: pluginDefaultConfig,
    dependencies: [],
    services: {
      'caip': new OiCaipHelper(),
      'resolver': new OiAddressTagResolver(),
      'chain': new OiChain()
    }
});
