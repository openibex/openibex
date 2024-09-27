import { pluginConfig } from "../plugin";
import { ChainArtifact, getCAIPChain, getChainName } from "../resolver";
import { OiProviderFactory } from "./provider";

const providerFactories: Record<string, OiProviderFactory> = {};

/**
 * Add a platform specific provider factory.
 * 
 * @param platform Platform of the factory.
 * @param factory Factory instance.
 */
export function addProviderFactory(platform: string, factory: OiProviderFactory) {
    providerFactories[platform] = factory;
}

/**
 * Throws error if platform is not supported. To support a platform you need:
 * - OiProviderFactory
 * - OiIndexer
 * - OiSubscriberFactory
 * 
 * This function only checks for OiProviderFactory, as platforms can only be
 * added via PR.
 * 
 * @param chainArtifact Any chain artifact
 */
export function isSupportedPlatform(chainArtifact: ChainArtifact) {
    const chain = getCAIPChain(chainArtifact);
        
        if (!(chain.namespace in providerFactories)) {
            throw Error(`Platform ${chain.namespace} is not yet supported`);
        }
}

/**
 * Configures providers based on a CAIP object.
 * 
 * @param chainArtifact A caip-js denominated blockchain artifact.
 * @param providerType The provider type, defaults to 'default'.
 * @returns An ethers provider
 */
export async function getChainProvider(chainArtifact: ChainArtifact, providerType: string = 'default') : Promise<any> {
    isSupportedPlatform(chainArtifact);

    const chain = getCAIPChain(chainArtifact);
    const chainName = getChainName(chain)
  
    try {
        const provider = providerFactories[chain.namespace].getProvider(
        chainName,
        pluginConfig['eip155']['networks'][chainName],
        providerType,
        pluginConfig[chain.namespace]['networks'][chainName].providers[providerType].params
        );

        return provider;
    } catch {
        throw Error(`No provider configured for ${chainName} (${chain.toString()}).`)
    }
  }
  
  /**
   * Returns a configuration for the specified provider type a specific chain.
   * 
   * @param chainArtifact Any chain address, protocol or token.
   * @param settingName Name of the setting to retrieve.
   * @param providerType Provider type as in config.
   * @returns 
   */
  export function getProviderSetting(chainArtifact: ChainArtifact, settingName: string, providerType: string = 'default'): any {
    isSupportedPlatform(chainArtifact);

    const chain = getCAIPChain(chainArtifact);
    const chainName = getChainName(chain);
    return pluginConfig[chain.namespace]['networks'][chainName].providers[providerType]['settings'][settingName];
  }
