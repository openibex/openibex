import { useProtocol, OiChainProtocol, AssetArtifactWithBlock } from "../protocols";

export class OiTokenProtocol extends OiChainProtocol {

  public protocolMap = {
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

useProtocol('token', {eip155: 'erc20', solana: 'token', hedera: 'token'}, OiTokenProtocol);
