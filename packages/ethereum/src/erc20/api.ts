import { OiEthereumApi } from "../api";
import { useContractAPI } from "@openibex/chain";

/**
 * API of the ERC20 contract
 */
export class OiErc20Api extends OiEthereumApi {
  
}

useContractAPI("erc20", OiErc20Api)
