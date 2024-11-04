import { OiContractRegister } from '@openibex/chain';
import { ERC20abi } from './abi';
import { OiErc20API } from './api';
import { OiErc20Connector } from './connector';
import { OnPluginInitHook } from '@openibex/core';

export { ERC20abi } from './abi';
export { OiErc20Connector } from './connector';
export { OiErc20API } from './api';

@OnPluginInitHook('openibex.ethereum', 'registring erc20')
class Erc20ContractRegister extends OiContractRegister {}
export default new Erc20ContractRegister('eip155', 'erc20', ERC20abi, OiErc20API, OiErc20Connector);
