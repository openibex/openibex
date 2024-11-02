import plugin from '../plugin';
import { OiPlugin } from '@openibex/core';
import { chain } from '@openibex/chain';

import { EthereumProviderHandler } from './provider';
import { EthereumContractHandler } from './contract';
import { EthereumBlockHandler } from './blocks';

export { EthereumProviderHandler } from './provider';
export { EthereumContractHandler } from './contract';
export { EthereumBlockHandler } from './blocks';

export { EthereumEventIndexer } from './indexer';
export { EthereumContractAPI } from './api';

plugin.onInit('register ethereum chain', async (plugin: OiPlugin) => {
  chain.register('eip155', EthereumProviderHandler, EthereumContractHandler, EthereumBlockHandler)
});

