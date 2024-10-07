import { WebSocketProvider, JsonRpcProvider, getDefaultProvider, Provider } from 'ethers';
import { addProviderFactory, OiProviderFactory, OiProvidersList } from '@openibex/chain';

/**
 * Provider factory for Ethereum, based on ethers.
 */
export class EthereumProviderFactory extends OiProviderFactory {
  protected providers: OiProvidersList = {};

  /**
   * Returns a specific instance of the provider.
   * 
   * @param chainName Which chain the provider is configured for.
   * @param chainConfig Chain configurations.
   * @param providerType Type (defaults to default)
   * @param params Provider parameters (if any)
   */
  public getProvider(
    chainName: string,
    chainConfig: any,
    providerType: string = 'default',
    params: any
  ): Provider {

    if (!(chainName in this.providers)) {
      this.providers[chainName] = {};
    }

    const className = chainConfig.providers[providerType].className;

    if (!(providerType in this.providers[chainName])) {
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

      provider.on('error', handleEIP155Error);
      this.providers[chainName][providerType] = provider;
    }

    return this.providers[chainName][providerType];
  }
}

/**
 * Error Handler for eip155 environments.
 * 
 * @param error any error thrown by the provider.
 */
function handleEIP155Error(error: any) {
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

addProviderFactory('eip155', new EthereumProviderFactory());
