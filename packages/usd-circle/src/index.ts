
import { OnPluginInitHook } from '@openibex/core';
import './plugin';
import { OiUSDCircleProtocol } from './protocol';
import { OiProtocolBundle } from '@openibex/protocols';

export { OiUSDCircleProtocol } from "./protocol";
export { USDCircleAbi } from './abi';

@OnPluginInitHook('openibex.protocols', 'registring token')
class OiUSDCircleProtocolBundle extends OiProtocolBundle {}

export default new OiUSDCircleProtocolBundle('usd-circle', OiUSDCircleProtocol);
