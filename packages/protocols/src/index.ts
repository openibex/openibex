import { ERC20abi } from '@openibex/ethereum/src/erc20';
import { plugin } from './plugin';
import { OiChainProtocols } from './protocols';
import { OiTokenProtocol } from './token';

export { OiChainProtocol, type AssetArtifactWithBlock, type ProtocolMap } from './protocol';
export { OiTokenProtocol } from './token';
export { OiChainTokenSupplyProducer } from './producers/supply';

plugin.addPluginService('protocols', new OiChainProtocols());
plugin.onInit('register protocols', async (plugin) =>{
  const protocols = plugin.getPluginService('protocols') as OiChainProtocols;
  protocols.register('token', {eip155: 'erc20', solana: 'token', hedera: 'token'}, {'eip155': ERC20abi}, OiTokenProtocol);
})

export { protocols } from './plugin';
