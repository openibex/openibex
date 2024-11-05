import { OnPluginInitHook } from "@openibex/core";
import { OiProtocolRegister } from "../protocols";
import { OiTokenProtocol } from "./token";

export { OiTokenProtocol } from './token';

@OnPluginInitHook('openibex.protocols', 'registring token')
class OiTokenProtocolRegister extends OiProtocolRegister {}

export default new OiTokenProtocolRegister('token', OiTokenProtocol);
