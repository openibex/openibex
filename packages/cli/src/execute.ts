import { getOiCore, OiConfig, OiCore } from '@openibex/core';
import { oiLogger } from './logger';
import 'yargs'

import { OiChain } from '@openibex/chain';
import { AssetType } from 'caip-js';

/**
 * Start an initialized app.
 * 
 * @param config The app configuration.
 */
export async function executeContractFunction(config: OiConfig, argv: any) {
  const core: OiCore = await getOiCore(config, oiLogger);
  const chain: OiChain = core.getService('openibex.chain', 'chain') as OiChain;
  
  oiLogger.info(`Signer '${argv.signer}' calls ${argv.function}(${argv.args}) of ${argv.contract}`)

  // get the API 
  const myContract = chain.contract(new AssetType(argv.contract)).getAPI(argv.signer)

  const functionName = argv.function;
  const returnValue = await myContract.execute(functionName, argv.args)

  
  oiLogger.info(`Calling function '${functionName}' returns ${returnValue}`);
}

export function executeArgs(yargs: any) {
  return yargs.option('contract', {
    describe: 'The contract to interact with. Example: ERC20 (USDC) on ETH eip155:1/erc20:0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    default: undefined,
    demandOption: true
  })
  .option('function', {
    describe: 'The function execute. Example: transfer. Needs to match the contract ABI as specified in the CAIP of the --contract argument.',
    demandOption: true
  })
  .option('args', {
    describe: 'The arguments for --function. 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC, 20000. Needs to match contract ABI as specified in the CAIP of the --contract argument.',
    default: undefined,
    demandOption: false,
    type: "string"
  })
  .option('signer', {
    describe: 'The name of the signer, has to match the signer-entry in config.yml',
    default: 'default',
    demandOption: false
  });
}
