import { ChainArtifact, getCAIPChain } from "./caip";
import { plugin } from "../plugin";
import { OiPlugin } from "@openibex/core";

// Restructure the configuration for easier lookup
const chainMap = {};

/**
 * Initializes the chainmap when the plugin is initialized. Chainmaps are mapping CAIP-Denominated chains
 * to human readable names (i.e. 'eip155:1' becomes 'mainnet' as it's Ethereum mainnet).
 */
plugin.onInit('chainmap', async (name: string, config: any, plugin: OiPlugin) : Promise<void> => {
  for (const namespace in config) {
    chainMap[namespace] = {};
    
    for (const chainName in config[namespace]['networks']) {
      const chainId = config[namespace]['networks'][chainName].chainId;
      chainMap[namespace][chainId.toString()] = chainName;
    }
  }
});

/**
 * Returns the chain name on which the chainArtifact resides.
 * 
 * @param chainArtifact Chain Artifact, any CAIP-Resource that starts with a chainId
 * @returns 
 */
export function getChainName(chainArtifact: ChainArtifact) {
  const chainId = getCAIPChain(chainArtifact);

  if (chainMap[chainId.namespace] && chainMap[chainId.namespace][`${chainId.reference}`]) {
    return chainMap[chainId.namespace][chainId.reference];
  } else {
    throw new Error(`Chain with namespace '${chainId.namespace}' and reference '${chainId.reference}' not found.`);
  }
}
