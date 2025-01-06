import { OiContractBundle } from '@openibex/chain';
import { OnPluginInitHook } from '@openibex/core';
import { ERC721abi } from './abi';
import { OiErc721API } from './api';
import { OiErc721Connector } from './connector';

export { ERC721abi } from './abi';
export { OiErc721Connector } from './connector';
export { OiErc721API } from './api';

@OnPluginInitHook('openibex.ethereum', 'registring erc721')
class Erc721ContractBundle extends OiContractBundle {}
export default new Erc721ContractBundle('eip155', 'erc721', ERC721abi, OiErc721API, OiErc721Connector);