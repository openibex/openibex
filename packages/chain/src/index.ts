export type {ChainArtifact, AssetArtifact, AccountArtifact} from './caip';
export { OiCaipHelper } from './caip';
export { OiAddressTagResolver } from './resolver';
export { OiChain } from './chain';

export { chain, caip, tagResolver } from './plugin';

export { OiProviderHandler, OiProvidersList, OiRateLimiter } from './providers';
export { OiContractHandler, OiContractConnector, type OiContractConnectorParams, OiContractAPI, OiEventIndexer } from './contracts';
export { OiBlockHandler } from './blocks';

export { getBurnAddress, getMintAddress } from './utils';
export { OiChainLogProducer } from './producers/chainlog';
export { OiChainLogConsumer } from './consumers/chainlog';

// TODO with proper PluginStructure
// initWallets shall be done internally in this file
// remove export!
export { initWallets, getWallet } from './wallets'

// Register the plugin.
import './plugin';

