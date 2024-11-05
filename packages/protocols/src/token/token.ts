import { WithPluginServices } from "@openibex/core";
import { OiChainProtocol, type AssetArtifactWithBlock, type ProtocolMap } from "../protocols";

@WithPluginServices('openibex.protocols/protocols')
export class OiTokenProtocol extends OiChainProtocol {

  /**
   * Protocol handle
   */
  public handle = 'token';

  /**
   * On which platforms the protocol is deployed.
   */
  public handlePlatforms = ['eip155', 'solana'];

  /**
   * Protocol ABIs per platform
   */
  public abis = {
    'eip155': 'erc20'
  }

  /**
   * Asset artifacts your protocol contains, and their startblocks.
   * Overwrite this in the inherited class.
   */
  public assetArtifacts: AssetArtifactWithBlock[] = [];

  /**
   * Mapping your protocol: Which standard implements functionality on each platform.
   */
  public protocolMap: ProtocolMap = {
    'token': {
      'eip155': 'erc20',
      'solana': 'token',
      'hedera': 'token'
    }
  }

  /**
   * Consumer / producer names this protocol processes. Overwrite.
   */
  public datasetNames: string[] = ['supply'];

  /**
   * Dataset map: Same as protocol map but for the data side.
   */
  public datasetMap: Record<string, string[]> = {
    'token': ['supply']
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

  public async init() {

  }
}
