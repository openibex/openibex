import { OiKeyValueExtended, OiPlugin } from "@openibex/core";
import { KeyValue } from "@orbitdb/core";
import { id, toBeArray } from "ethers"
import { AssetArtifact, caipFactory, ChainArtifact } from "./caip";

import { plugin, pluginName, pluginNamespace } from "../plugin";

/**
 * Resolver creates unique id's, known as tags, out of CAIP types. This saves storage amongst the databases
 * and grants pseudoanonymity.
 */
let resolverDB: KeyValue<Uint8Array>;

plugin.onInit('resolver', async (name: string, config: any, plugin: OiPlugin) : Promise<void> => {
  resolverDB = await plugin.getDB(1, 'oikeyvalue-extended', 'resolver') as unknown as OiKeyValueExtended<Uint8Array>;
});

/**
 * Create a tag (keccak256 checksum) for a chain artifact.
 * 
 * @param chainArtifact ChainArtifact or AssetArtifact to be tagged.
 * @param asString Defaults to true, if false an Uint8Array is returned.
 * @returns 
 */
export function tagCaipArtifact(chainArtifact: ChainArtifact | AssetArtifact, asString: boolean = true) {
  const strTag = id(`${chainArtifact.toString()}.${id(chainArtifact.toString())}`);
  if (!asString) return toBeArray(strTag);

  return strTag
}

/**
 * Adds a CAIP-Tag to the resolver.
 * 
 * @param chainArtifact ChainArtifact or AssetArtifact.
 * @returns 
 */
export async function addCaipTagResolver(chainArtifact: ChainArtifact | AssetArtifact) {
  const strTag = tagCaipArtifact(chainArtifact);

  if (await resolverDB.has(`${strTag}`) == false)
    await resolverDB.put(`${strTag}`, chainArtifact.toString());

  return strTag
}

/**
 * Do a CAIP-Tag lookup, return a CAIP-Object.
 * 
 * @param tag CAIP-Tag.
 * @returns 
 */
export async function lookupCaipTag(tag: string ) {
  const caipStr = await resolverDB.get(`${tag}`);
  if(!caipStr) {
    return `CAIP Tag not found ${tag}`;
  }
  return caipFactory(caipStr);
}

