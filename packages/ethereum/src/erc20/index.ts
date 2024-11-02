import { chain } from '@openibex/chain';
import { OiPlugin } from '@openibex/core';
import plugin from '../plugin';

import { ERC20abi } from './abi';
import { OiErc20API } from './api';
import { OiErc20Connector } from './connector';

export { ERC20abi } from './abi';
export { OiErc20Connector } from './connector';
export { OiErc20API } from './api';

plugin.onInit('register ethereum contracts', async (plugin: OiPlugin) => {
  chain.registerContract('eip155', 'erc20', ERC20abi, OiErc20API, OiErc20Connector);
})
