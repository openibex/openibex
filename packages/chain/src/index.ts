import './plugin';

export type {ChainArtifact, AssetArtifact, AccountArtifact} from './caip';
export { OiCaipHelper } from './caip';
export { OiAddressTagResolver } from './resolver';
export { OiChain } from './chain';
export { OiChainRegister } from './register';

export { OiProviderHandler, OiProvidersList, OiRateLimiter } from './providers';
export { OiContractHandler, OiContractConnector, type OiContractConnectorParams, OiContractAPI, OiEventIndexer, OiContractRegister } from './contracts';
export { OiBlockHandler } from './blocks';

export { OiChainLogProducer } from './producers/chainlog';
export { OiChainLogConsumer } from './consumers/chainlog';

// TODO with proper PluginStructure
// initWallets shall be done internally in this file
// remove export!
export { initWallets, getWallet } from './wallets'
