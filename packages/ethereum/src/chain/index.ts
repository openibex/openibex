import { OiChainRegister } from '@openibex/chain';
import { EthereumProviderHandler } from './provider';
import { EthereumContractHandler } from './contract';
import { EthereumBlockHandler } from './blocks';
import { OnPluginInitHook } from '@openibex/core';

export { EthereumProviderHandler } from './provider';
export { EthereumContractHandler } from './contract';
export { EthereumBlockHandler } from './blocks';

export { EthereumEventIndexer } from './indexer';
export { EthereumContractAPI } from './api';

@OnPluginInitHook('openibex.ethereum', 'register eip155 chain')
class EthereumChainRegister extends OiChainRegister {}

export default new EthereumChainRegister(
  'eip155', 
  EthereumProviderHandler, 
  EthereumContractHandler, 
  EthereumBlockHandler
);
