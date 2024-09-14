import { OiCore, registerOiPlugin } from "@openibex/core";
import { createChainMap } from "./resolver";
import { initResolver } from "./resolver/resolver";
import { initIndexer } from "./indexer";

export const pluginName = 'chain';
export const pluginNamespace = 'openibex';

// Plugin Config with defaults. Merged on init with config from core.
const pluginDefaultConfig = {
  eip155: {
    mainnet: {
      chainId: 1,
      plugins: {
        etherscan: {
          className: 'EtherscanPlugin',
          settings: {
            rateLimit: 50,
            batchSize: 4000
          },
          params: {
            url: 'https://exp.example.com'
          }
        }
      },
      providers: {
        default: {
          className: 'DefaultProvider',
          params: {
            endpoint: 'wss://example.com'
          },
        },
        rpc: {
          className: 'RpcProvider',
          params: {
            endpoint: 'https://www.example.com'
          }
        }
      }
    }
  }
};

export let pluginConfig = pluginDefaultConfig;

export let coreApp: OiCore;

// Register the plugin
registerOiPlugin(pluginName, pluginNamespace, (name: string, config: any, core: OiCore) => {
  pluginConfig = {...pluginDefaultConfig, ...config};
  coreApp = core;
  createChainMap(config);
  initResolver(coreApp);
  initIndexer(coreApp);
});
