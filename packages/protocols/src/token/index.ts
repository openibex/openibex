import { OnPluginInitHook } from "@openibex/core";
import { OiProtocolBundle } from "../bundle";
import { OiTokenProtocol } from "./token";

export { OiTokenProtocol } from './token';

@OnPluginInitHook('openibex.protocols', 'registring token')
class OiTokenProtocolRegister extends OiProtocolBundle {}

export default new OiTokenProtocolRegister('token', OiTokenProtocol);
