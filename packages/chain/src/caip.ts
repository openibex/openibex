import { OiPluginService } from "@openibex/core";
import { ChainId, AccountId, AssetId, AssetType } from "caip";

/**
 * Any CAIP object can be a ChainArtifact.
 */
export type ChainArtifact = ChainId | AccountId | AssetId | AssetType;

/**
 * CAIP Assets and AssetTypes.
 */
export type AssetArtifact = AssetId | AssetType;

/**
 * CAIP AccountId
 */
export type AccountArtifact = AccountId;

/**
 * This submodule manages CAIP-19 formatting of addresses.
 */
export class OiCaipHelper extends OiPluginService {
  
  /**
   * Type Guard for Chain Ids.Returns true if object is an ChainId.
   * 
   * @param object Probably a ChainId.
   * @returns 
   */
  public isChainId(object: any): object is ChainId {
    return typeof object === 'object' && object !== null && 'namespace' in object && 'reference' in object;
  }

  /**
   * Type Guard for Asset Types.Returns true if object is an AccountId.
   * 
   * @param object Probably an AccountId.
   * @returns 
   */
  public isAccountId(object: any): object is AccountId {
    return typeof object === 'object' && object !== null && 'chainId' in object && 'address' in object;
  }

  /**
   * Type guard for asset IDs. Returns true if object is an AssetId.
   * 
   * @param object Probably an AssetId.
   * @returns 
   */
  public isAssetId(object: any): object is AssetId {
    return typeof object === 'object' && object !== null && 'chainId' in object && 'assetName' in object && 'tokenId' in object;
  }

  /**
   * Type Guard for Asset Types.Returns true if object is an AssetType.
   * 
   * @param object Probably an AssetType.
   * @returns 
   */
  public isAssetType(object: any): object is AssetType {
    return typeof object === 'object' && object !== null && 'chainId' in object && 'assetName' in object && !('tokenId' in object);
  }

  /**
   * Extracts the chainId object from any caip type
   * 
   * @param chainArtifact CAIP ChainId
   */
  public getCAIPChain(chainArtifact: ChainArtifact) : ChainId {
    if (this.isChainId(chainArtifact)) {
      return chainArtifact;
    } else if (this.isAccountId(chainArtifact)) {
      return chainArtifact.chainId as ChainId;
    } else if (this.isAssetId(chainArtifact)) {
      return chainArtifact.chainId as ChainId;
    } else if (this.isAssetType(chainArtifact)) {
      return chainArtifact.chainId as ChainId;
    } else {
      throw new Error(`Unsupported chainArtifact type ${chainArtifact}`);
    }
  }

  /**
   * Returns the underlying AssetType of an AssetArtifact.
   * 
   * @param assetArtifact Artifact to type.
   * @returns 
   */
  public getCAIPAssetType(assetArtifact: AssetArtifact ) : AssetType {
    if (!('tokenId' in assetArtifact))  {
      return assetArtifact as AssetType;
    } else {
      const asset = assetArtifact.toJSON();

      return new AssetType({
        chainId: asset.chainId,
        assetName: asset.assetName
      });
    } 
  }

  /**
   * Returns the appropriate CAIP object for a string input.
   * 
   * @param caipInput A string that represents a CAIP-Object
   * @returns 
   */
  public caipFactory(caipInput: string) {
    try {
        return new ChainId(caipInput);
    } catch (error) {
        // Not a valid ChainId, continue checking
    }

    try {
        return new AccountId(caipInput);
    } catch (error) {
        // Not a valid AccountId, continue checking
    }

    try {
        return new AssetId(caipInput);
    } catch (error) {
        // Not a valid AssetId, continue checking
    }

    try {
        return new AssetType(caipInput);
    } catch (error) {
        // Not a valid AssetType, continue checking
    }

    throw new Error(`Invalid CAIP input ${caipInput}`);
  }
}
