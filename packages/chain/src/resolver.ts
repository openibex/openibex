import { OiKeyValueExtended, OiPlugin, OiPluginService } from "@openibex/core";
import { AssetArtifact, ChainArtifact } from "./caip";

import { caip, plugin } from "./plugin";
import { createHash } from "crypto";


export class OiAddressTagResolver extends OiPluginService {
  /**
   * Resolver creates unique id's, known as tags, out of CAIP types. This saves storage amongst the databases
   * and grants pseudoanonymity.
   */
  private resolverDB: OiKeyValueExtended<Uint8Array>;

  public async init(plugin: OiPlugin) : Promise<void> {
    this.resolverDB = await plugin.db.getDB(1, 'oikeyvalue-extended', 'resolver') as unknown as OiKeyValueExtended<Uint8Array>;
  };

  /**
   * Create a tag (keccak256 checksum) for a chain artifact.
   * 
   * @param chainArtifact ChainArtifact or AssetArtifact to be tagged.
   * @param asString Defaults to true, if false an Uint8Array is returned.
   * @returns 
   */
  public tagCaipArtifact(chainArtifact: ChainArtifact | AssetArtifact, asString: boolean = true) {
    return createHash('sha256').update(`${chainArtifact.toString()}`).digest('hex');
  }

  /**
   * Adds a CAIP-Tag to the resolver.
   * 
   * @param chainArtifact ChainArtifact or AssetArtifact.
   * @returns 
   */
  public async addCaipTagResolver(chainArtifact: ChainArtifact | AssetArtifact) {
    const strTag = this.tagCaipArtifact(chainArtifact);

    if (await this.resolverDB.has(`${strTag}`) == false) {
      const encoder = new TextEncoder();
      await this.resolverDB.put(`${strTag}`, encoder.encode(chainArtifact.toString()));
    }
    return strTag
  }

  /**
   * Do a CAIP-Tag lookup, return a CAIP-Object.
   * 
   * @param tag CAIP-Tag.
   * @returns 
   */
  public async lookupCaipTag(tag: string ) {
    const caipStr = await this.resolverDB.get(`${tag}`);
    if(!caipStr) {
      return `CAIP Tag not found ${tag}`;
    }
    // FIXME @Lukas: Argument of type 'Uint8Array' is not assignable to parameter of type 'string'.
    // @ts-ignore
    return caip.caipFactory(caipStr);
  }

}

plugin.addPluginService('resolver', new OiAddressTagResolver);
