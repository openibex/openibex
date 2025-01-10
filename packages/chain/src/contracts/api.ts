import { Contract, AbiCoder, ethers, FunctionFragment } from "ethers";
import type { AssetArtifact } from "../caip";
import { OiPluginRegistry, WithPluginServices } from "@openibex/core";
import { OiChain } from "../chain";


/**
 * OiApi is a smart contract API wrapper, that wraps API functions in a chain-agnostic
 * manner.
 * 
 * It can use on-chain data as well as off-chain OrbitDB databases and producers / consumers.
 */
@WithPluginServices('openibex.chain/chain')
export class OiContractAPI {
  public chain: OiChain;

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
    this.contract = (OiPluginRegistry.getInstance().getPlugin('openibex', 'chain').getService('chain') as unknown as OiChain).contract(assetArtifact).get(walletName);
  }

  public getRawContract(): Promise<Contract> {
    return this.contract;
  }

  /**
 * Tokenizes a string of arguments into an array, handling nested JSON and quotes.
 * @param input The input string to tokenize.
 * @returns An array of arguments.
 */
private tokenizeArguments(input: string): string[] {
  const tokens: string[] = [];
  let currentToken = '';
  let insideQuotes = false;
  let bracketDepth = 0;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (char === '"' && (i === 0 || input[i - 1] !== '\\')) {
      insideQuotes = !insideQuotes;
    } else if (!insideQuotes) {
      if (char === '{') {
        bracketDepth++;
      } else if (char === '}') {
        bracketDepth--;
      } else if (char === ',' && bracketDepth === 0) {
        tokens.push(currentToken.trim());
        currentToken = '';
        continue;
      }
    }
    currentToken += char;
  }
  if (currentToken.trim() !== '') {
    tokens.push(currentToken.trim());
  }

  return tokens;
}

  private async prepareCall(functionName: string, functionArgs: string): Promise<any> {
    const actualContract = await this.getRawContract();
    const fragments = actualContract.interface.fragments;
  
    // Find the corresponding FunctionFragment
    let myFragment: FunctionFragment | undefined = undefined;
    for (const f of fragments) {
      if (!ethers.FunctionFragment.isFunction(f)) {
        continue;
      }
      if ((f as FunctionFragment).name === functionName) {
        myFragment = f as FunctionFragment;
      }
    }
  
    if (myFragment === undefined) {
      throw new Error(`Cannot find ABI-definition of function ${functionName}`);
    }
  
    // Regex to split the functionArgs while preserving JSON and quoted strings
    const argsArray = this.tokenizeArguments(functionArgs);
  
    // Convert the arguments to the correct types using ABI coder
    const abiCoder = new AbiCoder();
    const convertedArgs = argsArray.map((arg, index) => {
      const inputType = myFragment!.inputs[index].type;
  
      // Ignore arguments wrapped in '...'
      if (arg.startsWith("'") && arg.endsWith("'")) {
        return arg.slice(1, -1); // Strip the quotes and use as-is
      }
  
      // Parse JSON objects
      try {
        if (arg.startsWith('{') && arg.endsWith('}')) {
          return JSON.parse(arg); // JSONs are usually structs - keep them.
        }
      } catch {
        // If JSON parsing fails, fall back to treating as a string/number        
      }
  
      // Treat as a string or number
      return abiCoder.decode([inputType], abiCoder.encode([inputType], [arg]))[0];
    });
  
    return { args: convertedArgs, fragment: myFragment };
  }
  

  public async execute(functionName: string, functionArgs: string) {
    const callData = await this.prepareCall(functionName, functionArgs);
    const actualContract = (await this.getRawContract());

    if(callData.fragment.stateMutability == "nonpayable" || callData.fragment.stateMutability == "payable") {
      // Execute the transfer function and modify blockchain state
      const tx = await actualContract[functionName](...callData.args);
      const receipt = await tx.wait();
      return JSON.stringify(receipt);
    }
    else {
      const returnValue = await actualContract[functionName](...callData.args);
      // TODO consider a JSON or defined return value here
      // When using json, think about json-bigint or other packages!
      return returnValue;
    }   
  }
}
