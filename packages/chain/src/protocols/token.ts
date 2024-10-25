import { OiChainProtocol } from "./protocol";
import { useProtocol } from "./protocols";

export class OiTokenProtocol extends OiChainProtocol {

  public datasetNames: string[] = ['supply'];

  public async init() {

  }
}

useProtocol('token', {eip155: 'erc20', solana: 'token', hedera: 'token'}, OiTokenProtocol);
