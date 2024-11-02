import { WebSocketProvider, JsonRpcProvider, getDefaultProvider, Provider } from 'ethers';
import { OiProviderHandler, OiRateLimiter } from '@openibex/chain';
import plugin from '../plugin';
import { OiPlugin } from '@openibex/core';

// Restructure the configuration for easier lookup
export const chainMap = {};

/**
 * Initializes the chainmap when the plugin is initialized. Chainmaps are mapping CAIP-Denominated chains
 * to human readable names (i.e. 'eip155:1' becomes 'mainnet' as it's Ethereum mainnet).
 */
plugin.onInit('chainmap', async (plugin: OiPlugin) : Promise<void> => {
  for (const chainName in plugin.conf['networks']) {
    const chainId = plugin.conf['networks'][chainName].chainId;
    chainMap[`eip155:${chainId}`] = chainName;
  }
});


/**
 * Provider factory for Ethereum, based on ethers.
 */
export class EthereumProviderHandler extends OiProviderHandler {
  /**
   * Provider instance.
   */
  protected provider!: Provider;

  /**
   * Returns a specific instance of the provider.
   * 
   * @param chainName Which chain the provider is configured for.
   * @param chainConfig Chain configurations.
   * @param providerName Type (defaults to default)
   * @param params Provider parameters (if any)
   */
  public get(): Provider {
    if(!this.provider) {
      const chainName = chainMap[this.chainId.toString()];
      const providerConf = plugin.conf.networks[chainName].providers[this.providerName];
      const params = providerConf.params;
      const className = providerConf.className;

      let provider: Provider;

      if (className === 'WebSocketProvider') {
        provider = new WebSocketProvider(params.endpoint);
      } else if (className === 'JsonRpcProvider') {
        provider = new JsonRpcProvider(params.endpoint);
      } else if (className === 'DefaultProvider') {
        provider = getDefaultProvider(params.endpoint);
      } else {
        throw new Error(`Unsupported provider class name: ${className}`);
      }

      provider.on('error', this.handleEIP155Error);
      this.provider = provider
    }
    return this.provider;
  }

  /**
   * Error Handler for eip155 environments.
   * 
   * @param error any error thrown by the provider.
   */
  public handleEIP155Error(error: any) {
    // TODO: Error Handling (i.e. 429ers, connection lost etc.)
    if (error.code) {
      switch (error.code) {
        case 'NETWORK_ERROR':
          console.error("Network error:", error.message);
          break;
        case 'SERVER_ERROR':
          console.error("Server error:", error.message);
          break;
        case 'TIMEOUT':
          console.error("Timeout error:", error.message);
          break;
        case 'INVALID_ARGUMENT':
          console.error("Invalid argument error:", error.message);
          break;
        case 'UNPREDICTABLE_GAS_LIMIT':
          console.error("Unpredictable gas limit error:", error.message);
          break;
        default:
          console.error("Unknown error:", error.message);
      }
    } else {
      console.error("Error:", error.message || error);
    }
  }

  /**
   * Gets a setting from the provider config.
   * 
   * @param settingName Name of the setting
   */
  public getSetting(
    settingName: string
  ): any {
    const chainName = chainMap[this.chainId.toString()];
    const providerConf = plugin.conf.networks[chainName].providers[this.providerName];

    return providerConf.settings[settingName];
  }

  /**
   * Returns the rate limiter for this provider
   * 
   * @returns 
   */
  getRateLimiter(): OiRateLimiter {
    if(!this.rateLimiter) {
      this.rateLimiter = new OiRateLimiter(
        this.getSetting('rateLimit')
      );
    }

    return this.rateLimiter;
  }
}
