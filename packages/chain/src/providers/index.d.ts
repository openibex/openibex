type OiChainPluginConfig = {
  className: string;
  params: {
    url?: string;
    endpoint?: string;
    [key: string]: any; // Arbitrary parameters
  };
};

type OiChainProviderConfig = {
  className: string;
  params: {
    endpoint: string;
    [key: string]: any; // Arbitrary parameters
  };
};

type OiChainConfig = {
  chainId: number | string;
  plugins?: { [key: string]: OiChainPluginConfig };
  providers?: { [key: string]: OiChainProviderConfig };
}

type Eip155ConfigArray = {
  [key: string]: OiChainConfig;
}[];
