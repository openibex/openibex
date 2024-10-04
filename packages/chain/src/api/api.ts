import { Contract, AbiCoder, ethers, FunctionFragment } from "ethers";
import type { AssetArtifact } from "../resolver";
import { getContract } from "../contracts";

/**
 * OiApi is a smart contract API wrapper, that wraps API functions in a chain-agnostic
 * manner.
 * 
 * It can use on-chain data as well as off-chain OrbitDB databases and producers / consumers.
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
