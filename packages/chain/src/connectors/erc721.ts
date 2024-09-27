import { ERC721abi } from "../abi/erc721.abi";
import { OiContractConnector } from "./connector";
import { useABI } from "../contracts";
import { useContractConnector } from "./connectors";

/**
 * A connector registers all the ABIs it uses.
 * The ABI name equals the CAIP-19 Asset Namespace.
 */
useABI('eip155', 'erc721', ERC721abi);

export class OiErc721 extends OiContractConnector {
  
  
}

await useContractConnector('erc721', OiErc721, 'eip155');
