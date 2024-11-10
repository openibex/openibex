import { AccountId } from "caip";
import { ChainArtifact, OiCaipHelper } from "./caip";
import { getOiCore } from "@openibex/core";
import OiChainPlugin from "./plugin";

const plugin: OiChainPlugin = getOiCore().getPlugin('openibex', 'chain');
const caip: OiCaipHelper = plugin.getService('caip');

export function getMintAddress(chainArtifact: ChainArtifact) {
  const chainId = caip.getCAIPChain(chainArtifact);

  if (chainId.namespace == 'eip155'){
    return new AccountId({chainId, address: "0x0000000000000000000000000000000000000000" });
  }

  throw Error(`Burn address undefined for chain ${chainId.toString()}.`);
}

export function getBurnAddress(chainArtifact: ChainArtifact) {
  const chainId = caip.getCAIPChain(chainArtifact);

  if (chainId.namespace == 'eip155'){
    return new AccountId({chainId, address: "0xffffffffffffffffffffffffffffffffffffffff" });
  }

  throw Error(`Burn address undefined for chain ${chainId.toString()}.`);
}
