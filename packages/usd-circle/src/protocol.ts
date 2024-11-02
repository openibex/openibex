import { OiChainProtocol, AssetArtifactWithBlock, ProtocolMap } from '@openibex/protocols';
import { AssetType } from "caip";

export class OiUSDCircleProtocol extends OiChainProtocol {

  public assetArtifacts: AssetArtifactWithBlock[] = [
    {assetArtifact: new AssetType('eip155:1/usd-circle:0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'), startBlock: 6082465}
  ];

  public protocolMap: ProtocolMap = {
    'token': {
      'eip155': 'erc20',
      'solana': 'token',
      'hedera': 'token'
    },
    'ownable': {
      'eip155': 'erc173'
    }
  }

  /**
   * Protocol constructor. Can overwrite the protocolMap and AssetArtifacts.
   * 
   * @param bloomFilter - BloomFilters for this instance.
   * @param customAssetArtifacts - I.e. when running on Testnet
   */
  public constructor(bloomFilter?: string[][], customAssetArtifacts?: AssetArtifactWithBlock[]) {
    super(bloomFilter, customAssetArtifacts)
  }
  
  public datasetNames: string[] = ['supply'];
}
