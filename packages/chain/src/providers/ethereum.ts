import { WebSocketProvider, JsonRpcProvider, getDefaultProvider } from 'ethers';
import type { Provider as ProviderType } from 'ethers';

interface ProvidersList {
  [chainId: string]: {
    [type: string]: ProviderType;
  };
}

export class EthersFactory {
  static providers: ProvidersList = {};

  static getProvider(
    chainId: string,
    providerType: string = 'default',
    className: string = 'WebSocketProvider',
    params: any
  ): ProviderType {

    if (!(chainId in EthersFactory.providers)) {
      EthersFactory.providers[chainId] = {};
    }

    if (!(providerType in EthersFactory.providers[chainId])) {
      let provider: ProviderType;

      if (className === 'WebSocketProvider') {
        provider = new WebSocketProvider(params.endpoint);
      } else if (className === 'JsonRpcProvider') {
        provider = new JsonRpcProvider(params.endpoint);
      } else if (className === 'DefaultProvider') {
        provider = getDefaultProvider(params.endpoint);
      } else {
        throw new Error(`Unsupported provider class name: ${className}`);
      }

      EthersFactory.providers[chainId][providerType] = provider;
    }

    return EthersFactory.providers[chainId][providerType];
  }
}
