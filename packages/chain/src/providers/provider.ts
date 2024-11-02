import { ChainId } from "caip";
import { ChainArtifact } from "../caip";
import { caip } from "../plugin";
import { OiRateLimiter } from "./ratelimiter";

export interface OiProvidersList {
  [chainId: string]: {
    [type: string]: any;
  };
}

/**
 * Provider singleton factory. Multiple providers can be configured
 * per chain. Each provider type is initialized once as a singleton.
 */
export class OiProviderHandler {
  /**
   * Providers chain ID.
   */
  protected chainId: ChainId;

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
    this.chainId = caip.getCAIPChain(chainArtifact);
    this.providerName = providerName;
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
  
}
