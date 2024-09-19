import { registerOiPlugin } from "@openibex/core";
import { OiPlugin } from "@openibex/core";

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

export let plugin: OiPlugin = new OiPlugin(pluginName, pluginNamespace);

plugin.onInit('chain', async (name: string, config: any, plugin: OiPlugin) : Promise<void> => {
  pluginConfig = config;
});

// Register the plugin
registerOiPlugin(pluginName, pluginNamespace, plugin);
