
import { OnPluginInitHook } from '@openibex/core';
import './plugin';
import { OiUSDCircleProtocol } from './protocol';
import { OiProtocolRegister } from '@openibex/protocols';

export { OiUSDCircleProtocol } from "./protocol";
export { USDCircleAbi } from './abi';

@OnPluginInitHook('openibex.protocols', 'registring token')
class OiUSDCircleProtocolRegister extends OiProtocolRegister {}

export default new OiUSDCircleProtocolRegister('usd-circle', OiUSDCircleProtocol);
