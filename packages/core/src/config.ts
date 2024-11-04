
export interface OiConfigHelia {
  libp2p: {
    mode: 'standalone' | 'public' | 'airgap' | 'browser';
  };
  blockstore: any;
  datastore: any;
}

export interface OiConfigDatabase {
  namespace: string;
  address: string;
  path: string;
}

export interface OiConfig {
  helia: OiConfigHelia;
  wallets: any;
  plugins: any;
  database: any;
}
