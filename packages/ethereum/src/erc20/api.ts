import { OiEthereumApi } from "../api";
import { useContractAPI } from "@openibex/chain";


export class OiErc20Api extends OiEthereumApi {
  
}

useContractAPI("erc20", OiErc20Api)
