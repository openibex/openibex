export interface ProvidersList {
  [chainId: string]: {
    [type: string]: any;
  };
}

export class OiProviderFactory {
  protected providers: ProvidersList = {};

  public getProvider(
    chainName: string,
    providerType: string = 'default',
    params: any
  ): any { }
  
}
