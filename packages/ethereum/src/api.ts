import { AssetArtifact, OiApi } from "@openibex/chain";
import { BaseContractMethod } from "ethers";

export class OiEthereumApi extends OiApi {
  constructor(assetArtifact: AssetArtifact, walletName?: string) {
    super(assetArtifact, walletName);

    // TB 2024-08-25 Proxies do not work, as discussed in Discord, needs debugging
    /*// Create a Proxy to intercept function calls
    return new Proxy(this, {
      get: (target, propKey) => {
        // Check if the property already exists on the object
        const origMethod = target[propKey as keyof typeof target];
        if (typeof origMethod === "function") {
          return origMethod.bind(target);
        }

        // If the method doesn't exist, assume it's a contract method
        return async (...args: any[]) => {
          if (target.contract[propKey]) {
            return await target.contract[propKey].call(...args);
          } else {
            throw new Error(`Method ${String(propKey)} does not exist on the contract.`);
          }
        };
      },
    }); */
  }

  public async simulateTx(callFunction: BaseContractMethod, funcArguments: any, params: any ) {
    // TB 2024-08-27 this function was not tested
    // return await callFunction.staticCall(...funcArguments);
    throw new Error("Not implemented yet.")
  }

  public async estimateTx(callFunction: BaseContractMethod, funcArguments: any, params: any) {
    // TB 2024-08-27 this function was not tested
    // return await callFunction.estimateGas(...funcArguments);
    throw new Error("Not implemented yet.")
  }
}
