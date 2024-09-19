import { ChainArtifact, getCAIPChain } from "./caip";
import { plugin } from "../plugin";
import { OiPlugin } from "@openibex/core";

// Restructure the configuration for easier lookup
const chainMap = {};

plugin.onInit('chainmap', async (name: string, config: any, plugin: OiPlugin) : Promise<void> => {
  for (const namespace in config) {
    chainMap[namespace] = {};
    
    for (const chainName in config[namespace]['networks']) {
      const chainId = config[namespace]['networks'][chainName].chainId;
      chainMap[namespace][chainId.toString()] = chainName;
    }
  }
});

// Function to get the chain name
export function getChainName(chainArtifact: ChainArtifact) {
  const chainId = getCAIPChain(chainArtifact);

  if (chainMap[chainId.namespace] && chainMap[chainId.namespace][`${chainId.reference}`]) {
    return chainMap[chainId.namespace][chainId.reference];
  } else {
    throw new Error(`Chain with namespace '${chainId.namespace}' and reference '${chainId.reference}' not found.`);
  }
}
