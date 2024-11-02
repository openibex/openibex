import { protocols } from '@openibex/protocols';
import { OiUSDCircleProtocol } from "./protocol";
import { plugin } from "./plugin";
import { USDCircleAbi } from './abi';

export { OiUSDCircleProtocol } from "./protocol";
export { USDCircleAbi } from './abi';

plugin.onInit('register usd-circle', async (plugin) => {
  protocols.register('usd-circle', {eip155: 'usd-circle', solana: 'usd-circle', hedera: 'usd-circle'}, {'eip155': USDCircleAbi}, OiUSDCircleProtocol);
})

