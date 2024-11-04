import { AccountId, ChainId } from "caip";
import { ChainArtifact, OiCaipHelper } from "../caip";
import { OiRateLimiter } from "./ratelimiter";
import { WithPluginServices } from "@openibex/core";

export interface OiProvidersList {
  [chainId: string]: {
    [type: string]: any;
  };
}

/**
 * Provider singleton factory. Multiple providers can be configured
 * per chain. Each provider type is initialized once as a singleton.
 */
@WithPluginServices('openibex.chain/caip')
export class OiProviderHandler {
  public caip: OiCaipHelper;
  /**
   * Providers chain ID.
   */
  protected chainArtifact: ChainArtifact;

  /**
   * Provider name
   */
  protected providerName = 'default';

  /**
   * Rate limiter. Created on demand, kept forever (singleton, it's shared).
   */
  protected rateLimiter!: OiRateLimiter;
  /**
   * 
   * @param chainArtifact 
   * @param providerName 
   */

  constructor(chainArtifact: ChainArtifact, providerName: string = 'default') {
    this.chainArtifact = chainArtifact;
    this.providerName = providerName;
  }

  /**
   * Returns the chainId object of this provider.
   * 
   * @returns 
   */
  public getChainId(): ChainId {
    return this.caip.getCAIPChain(this.chainArtifact);
  }

  /**
   * Returns a specific instance of the provider.
   */
  public get(): any {
    throw new Error("Method 'get' must be implemented on platform specific contract handler.");
  }

  /**
   * Gets a setting from the provider config.
   * 
   * @param settingName Name of the setting
   */
  public getSetting(
    settingName: string
  ): any {
    throw new Error("Method 'get' must be implemented on platform specific contract handler.");
  }

  /**
   * Returns the rate limiter for this provider
   * 
   * @returns 
   */
  getRateLimiter(): OiRateLimiter {
    throw new Error("Method 'get' must be implemented on platform specific contract handler.");
  }
  
  public getMintAddress(): AccountId {
    throw new Error("Method 'getMintAddress' must be implemented on platform specific contract handler.");
  }
  
  public getBurnAddress(): AccountId {
    throw new Error("Method 'getBurnAddress' must be implemented on platform specific contract handler.");
  }
}
