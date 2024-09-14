import { BaseContractMethod, Contract, AbiCoder, ethers, FunctionFragment } from "ethers";
import type { AssetArtifact } from "../resolver";
import { getContract } from "../contracts";

/**
 * OiApi is a smart contract API wrapper, that wraps API functions in a chain-agnostic
 * manner.
 * 
 * It can use on-chain data as well as off-chain OrbitDB databases and primitives.
 */
export class OiApi {

  public contract: Promise<Contract>;
  public walletName: any;
  public assetArtifact: AssetArtifact

  /**
   * Construct new API 
   * @param assetArtifact Contract or Token to connect to.
   * @param walletName Name of the wallet, as specified in keystore.
   */
  constructor(assetArtifact: AssetArtifact, walletName?: string) {
    this.walletName = walletName;
    this.assetArtifact = assetArtifact;
    this.contract = getContract(assetArtifact, walletName);
  }

  public getRawContract(): Promise<Contract> {
    return this.contract;
  }

  private async prepareCall(functionName: string, functionArgs: string): Promise<any> {
    const actualContract = (await this.getRawContract());
    const argsArray = functionArgs.split(',');  // Split into array based on a delimiter (adjust as necessary)
    
    let myFragment: FunctionFragment | undefined = undefined;

    const fragments = actualContract.interface.fragments;
    for(const f of fragments) {
      if(!ethers.FunctionFragment.isFunction(f)) {
        continue;
      }
      if((f as FunctionFragment).name == functionName) {
        myFragment = f as FunctionFragment;
      }
    }

    if(myFragment == undefined) {
      throw new Error(`Cannot find ABI-definition of function ${functionName}`)
    }

    // Step 3: Convert the arguments to the correct types
    const abiCoder = new AbiCoder();
    const convertedArgs = argsArray.map((arg, index) => {
      const inputType = myFragment.inputs[index].type;
      return abiCoder.decode([inputType], abiCoder.encode([inputType], [arg]))[0];
    });
    
    // FIXME error handling!!
    return {args: convertedArgs, fragment: myFragment}
  }

  public async execute(functionName: string, functionArgs: string) {
    const callData = await this.prepareCall(functionName, functionArgs);
    const actualContract = (await this.getRawContract());

    if(callData.fragment.stateMutability != "view") {
      // Execute the transfer function
      // FIXME check this with the ABI and  transform args accordingly!!!!!!
      const tx = await actualContract[functionName](...callData.args);

      // TODO Optional: Wait for the transaction to be mined
      const receipt = await tx.wait();
      return JSON.stringify(receipt);
    }
    else {
      const returnValue = actualContract[functionName](...callData.args);
      return returnValue;
    }   
  }
}

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
