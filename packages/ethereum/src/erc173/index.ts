import { chain } from '@openibex/chain';
import { OiPlugin } from '@openibex/core';
import  plugin from '../plugin';
import { ERC173abi } from './abi';
import { OiErc173API } from './api';
import { OiErc173Connector } from './connector';

export { ERC173abi } from './abi';
export { OiErc173Connector } from './connector';
export { OiErc173API } from './api';

plugin.onInit('register eip155, erc173', async (plugin: OiPlugin) => {
  chain.registerContract('eip155', 'erc173', ERC173abi, OiErc173API, OiErc173Connector);
});
