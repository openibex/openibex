import { OiChainBundle } from '@openibex/chain';
import { EthereumProviderHandler } from './provider';
import { EthereumContractHandler } from './contract';
import { EthereumBlockHandler } from './blocks';
import { OnPluginInitHook } from '@openibex/core';
import { EthereumWalletHandler } from './wallet';

export { EthereumProviderHandler } from './provider';
export { EthereumContractHandler } from './contract';
export { EthereumBlockHandler } from './blocks';
export { EthereumWalletHandler } from './wallet';

export { EthereumEventIndexer } from './indexer';
export { EthereumContractAPI } from './api';

@OnPluginInitHook('openibex.ethereum', 'register eip155 chain')
class EthereumChainBundle extends OiChainBundle {}

export default new EthereumChainBundle(
  'eip155', 
  EthereumProviderHandler, 
  EthereumContractHandler, 
  EthereumBlockHandler,
  EthereumWalletHandler
);
