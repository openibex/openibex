import { OiChainProtocol, AssetArtifactWithBlock, ProtocolMap } from '@openibex/protocols';
import { AssetType } from "caip";
import { USDCircleAbi } from './abi';
import { OiDataConsumer } from '@openibex/core';

export class OiUSDCircleProtocol extends OiChainProtocol {

  /**
   * USDC rebranded to USDC a while ago: USD Circle.
   */
  public handle = 'usd-circle';

  /**
   * USDC is deployed on more platforms than listed here, but we only have eip155 support now.
   */
  public handlePlatforms = ['eip155', 'solana'];

  /**
   * ABIs: The token abis for different platforms.
   */
  public abis = {
    'eip155': USDCircleAbi
  }

  /**
   * USDC token contracts with their respective startBlocks.
   */
  public assetArtifacts: AssetArtifactWithBlock[] = [
    {assetArtifact: new AssetType('eip155:1/usd-circle:0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'), startBlock: 6082465}
  ];

  /**
   * Which connectors to use on various platforms. CAIP proposes 'token' on both, Hedera and Solana.
   * Further investigation is needed, also Pausable needs to be implemented yet.
   */
  public protocolMap: ProtocolMap = {
    'token': {
      'eip155': 'erc20',
      'solana': 'token',
      'hedera': 'token'
    },
    'ownable': {
      'eip155': 'erc173'
    },
    'pausable': {}
  }

  /**
   * Consumer / producer names this protocol processes. Overwrite.
   */
  public datasetNames: string[] = [];

  /**
   * Dataset map: Same as protocol map but for the data side.
   */
  public datasetMap: Record<string, string[]> = {
    // TODO: Enter dataset classes here. (i.e. supply, balance etc...)
    'token': [  ]
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
}
