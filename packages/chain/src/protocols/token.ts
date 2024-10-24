import { OiChainProtocol } from "./protocol";
import { useProtocol } from "./protocols";

export class OiTokenProtocol extends OiChainProtocol {

  public datasetNames: string[] = ['supply'];

  public init() {

  }
}

useProtocol('token', OiTokenProtocol);
