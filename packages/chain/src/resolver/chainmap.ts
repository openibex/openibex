import { ChainArtifact, getCAIPChain } from "./caip";

// Restructure the configuration for easier lookup
const chainMap = {};

export function createChainMap(config) {
  for (const namespace in config) {
    chainMap[namespace] = {};
    
    for (const chainName in config[namespace]['networks']) {
      const chainId = config[namespace]['networks'][chainName].chainId;
      chainMap[namespace][chainId.toString()] = chainName;
    }
  }
}

// Function to get the chain name
export function getChainName(chainArtifact: ChainArtifact) {
  const chainId = getCAIPChain(chainArtifact);

  if (chainMap[chainId.namespace] && chainMap[chainId.namespace][`${chainId.reference}`]) {
    return chainMap[chainId.namespace][chainId.reference];
  } else {
    throw new Error(`Chain with namespace '${chainId.namespace}' and reference '${chainId.reference}' not found.`);
  }
}
