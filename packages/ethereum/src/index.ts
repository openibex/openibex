import '@openibex/chain';
import './plugin';

import './erc173';
import './erc20';
import './chain';
import { OiPlugin } from '@openibex/core';
import { ERC173abi, OiErc173API, OiErc173Connector } from './erc173';
import { chain } from '@openibex/chain';
import plugin from './plugin';

export { EthereumProviderHandler, EthereumContractHandler, EthereumBlockHandler } from './chain';

export { EthereumContractAPI, EthereumEventIndexer} from './chain';

export { ERC173abi, OiErc173API, OiErc173Connector } from './erc173';
export { ERC20abi, OiErc20API, OiErc20Connector } from './erc20';

plugin.onInit('register eip155, erc173', async (plugin: OiPlugin) => {
  chain.registerContract('eip155', 'erc173', ERC173abi, OiErc173API, OiErc173Connector);
});
