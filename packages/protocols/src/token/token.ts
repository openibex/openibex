import { plugin, protocols } from "../plugin";
import { OiChainProtocol, type AssetArtifactWithBlock, type ProtocolMap } from "../protocol";

export class OiTokenProtocol extends OiChainProtocol {

  public protocolMap: ProtocolMap = {
    'token': {
      'eip155': 'erc20',
      'solana': 'token',
      'hedera': 'token'
    }
  }

  public datasetNames: string[] = ['supply'];

  /**
   * Protocol constructor. Can overwrite the protocolMap and AssetArtifacts.
   * 
   * @param bloomFilter - BloomFilters for this instance.
   * @param customAssetArtifacts - I.e. when running on Testnet
   */
  public constructor(bloomFilter?: string[][], customAssetArtifacts?: AssetArtifactWithBlock[]) {
    super(bloomFilter, customAssetArtifacts)
  }

  public async init() {

  }
}
