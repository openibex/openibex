import { EthersFactory } from "./ethereum";

import { pluginConfig } from "../plugin";
import { getCAIPChain } from "../resolver";
import { ChainArtifact } from "../resolver";
import { Provider } from "ethers";
import { getChainName } from "../resolver";

export { getRateLimiter, RateLimiter } from "./ratelimiter";

/**
 * Configures providers based on a CAIP object.
 * 
 * @param chainArtifact A caip-js denominated blockchain artifact.
 * @param providerType The provider type, defaults to 'default'.
 * @returns An ethers provider
 */
export async function getChainProvider(chainArtifact: ChainArtifact, providerType: string = 'default') : Promise<any> {
  const chain = getCAIPChain(chainArtifact);
  const chainName = getChainName(chain)

  if (chain.namespace == 'eip155') {
    const className = pluginConfig['eip155']['networks'][chainName].providers[providerType].className;

    const provider: Provider = EthersFactory.getProvider(
      getChainName(chain),
      providerType,
      className,
      pluginConfig['eip155']['networks'][chainName].providers[providerType].params
    );

    provider.on('error', handleEIP155Error)
    return provider;
  } else {
    throw Error(`Network ${chain.toString()} is not yet supported`);
  }
}

export function getProviderSetting(chainArtifact: ChainArtifact, settingName: string, providerType: string = 'default'): any {
  const chain = getCAIPChain(chainArtifact);
  const chainName = getChainName(chain);
  return pluginConfig['eip155']['networks'][chainName].providers[providerType]['settings'][settingName];
}

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
