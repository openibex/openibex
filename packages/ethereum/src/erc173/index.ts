import { OiContractBundle } from '@openibex/chain';
import { ERC173abi } from './abi';
import { OiErc173API } from './api';
import { OiErc173Connector } from './connector';
import { OnPluginInitHook } from '@openibex/core';

export { ERC173abi } from './abi';
export { OiErc173Connector } from './connector';
export { OiErc173API } from './api';

@OnPluginInitHook('openibex.ethereum', 'registring erc173')
class Erc173ContractRegister extends OiContractBundle {}
export default new Erc173ContractRegister('eip155', 'erc173', ERC173abi, OiErc173API, OiErc173Connector);
