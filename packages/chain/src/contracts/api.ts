import { Contract, AbiCoder, ethers, FunctionFragment } from "ethers";
import type { AssetArtifact } from "../caip";
import { OiPluginRegistry, WithPluginServices } from "@openibex/core";
import { OiChain } from "../chain";

import JSONBig, {} from 'json-bigint'


export interface ExecutionResult {
  raw?: any;
  decoded?: Object | undefined;
  receipt?: Object;
}

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

public async prepareCall(functionName: string, argsArray: string[]): Promise<{ args: any[], fragment: FunctionFragment }> {
  const fragments = (await this.getRawContract()).interface.fragments;

  // Find the corresponding FunctionFragment
  let myFragment: FunctionFragment | undefined = undefined;
  for (const f of fragments) {
    if (!FunctionFragment.isFunction(f)) {
      continue;
    }
    if ((f as FunctionFragment).name === functionName) {
      myFragment = f as FunctionFragment;
    }
  }

  if (myFragment === undefined) {
    throw new Error(`Cannot find ABI-definition of function ${functionName}`);
  }

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

  private async doPrepCall(functionName: string, functionArgs: string): Promise<any> {
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
  

  public decodeResultFromAbi( result, fragment: FunctionFragment): {raw: unknown, decoded: Record<string, any>}  {
    const potentialComponents = fragment.outputs;
  
    if (!Array.isArray(potentialComponents)) {
      throw new Error("ABI components must be an array.");
    }
    const components = potentialComponents[0].components ? potentialComponents[0].components : potentialComponents;
    const arrResult = Array.isArray(result)? result : [result];

    let decoded = undefined;
    try {
      decoded = this._decodeResultFromAbi(arrResult, components);
    } catch(error: any) {
      // Failed to decode, at least return raw
    }

    return {
      raw: result, 
      decoded: decoded,
    };
  }

  private _decodeResultFromAbi( result, components) {
    const decoded = {};

    components.forEach((component, index) => {
        const { name, type, components: nestedComponents } = component;

        if (!name) {
            throw new Error(`Missing "name" field in ABI component: ${JSONBig.stringify(component)}`);
        }

        if (type === "tuple" && nestedComponents) {
            // Recursively decode nested tuples
            decoded[name] = this._decodeResultFromAbi(result[index], nestedComponents);
        } else if (type.endsWith("[]")) {
            // Handle arrays
            decoded[name] = result[index].map((item) =>
                nestedComponents ? this._decodeResultFromAbi(item, nestedComponents) : item
            );
        } else {
            // Primitive type
            decoded[name] = result[index];
        }
    });

    return decoded;
  }

  /**
   * Executs a SmartContract interaction. Supported methods are payable or non-payable, state-changing functions as well as views and pure methods.
   * 
   * @param functionName Name of the smart-contract function
   * @param functionArgs Function args as string array. They are automatically converted to the appropriate types using ABI-definition.
   * @returns Execution result with. `receipt` only exists for state-changing executions (payable, non-payable). `raw` and `decoded` are the execution return values (if available). 
   */
  public async execute(functionName: string, functionArgs: string[]): Promise<ExecutionResult> {
    const callData = await this.prepareCall(functionName, functionArgs);
    const actualContract = (await this.getRawContract());

    if(callData.fragment.stateMutability == "nonpayable" || callData.fragment.stateMutability == "payable") {
      // Execute the transfer function and modify blockchain state
      const tx = await actualContract[functionName](...callData.args);
      const receipt = await tx.wait();
      return {receipt: receipt};
    }
    else {
      const returnValue = await actualContract[functionName](...callData.args);
      // TODO consider a JSON or defined return value here
      // When using json, think about json-bigint or other packages!
      return this.decodeResultFromAbi( returnValue, callData.fragment,);
    }   
  }
}
