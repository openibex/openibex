export interface OiProvidersList {
  [chainId: string]: {
    [type: string]: any;
  };
}

/**
 * Provider singleton factory. Multiple providers can be configured
 * per chain. Each provider type is initialized once as a singleton.
 */
export abstract class OiProviderFactory {
  protected abstract providers: OiProvidersList;

  /**
   * Returns a specific instance of the provider.
   * 
   * @param chainName Which chain the provider is configured for.
   * @param chainConfig Chain configurations.
   * @param providerType Type (should default to 'default')
   * @param params Provider parameters (if any)
   */
  public abstract getProvider(
    chainName: string,
    chainConfig: any,
    providerType: string,
    params: any
  ): any;
  
}
