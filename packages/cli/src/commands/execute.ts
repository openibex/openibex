import { OiCommand } from '../command';
import { OiCore, OiConfig, OiLoggerInterface } from '@openibex/core';
import { OiChain } from '@openibex/chain';
import { AssetType } from 'caip';

import JSONbig, {} from 'json-bigint'

export default class ExecCommand extends OiCommand {
  constructor(core: OiCore, config: OiConfig, logger: OiLoggerInterface) {
    super(core, config, logger);
    this.name('exec')
      .description('Execute smart contract functions')
      .argument('<artifact>', 'AssetArtifact, any CAIP Asset address.')
      .option('--wallet <WALLETNAME>', 'Wallet name to use. Defaults to none (readonly) access. E.g. --wallet=alice')
      .argument('<functionName>', 'Method call to execute')
      .argument('<argString', "Contract function argument string, arguments split by comma. Wrap JSON objects in ticks, i.e. '{....}'")
      .action(this.execute.bind(this));
  }

  async execute(artifact: string, functionName: string, argString: string, options: { wallet?: string;}): Promise<void> {
    // Access the logger and config
    this.logger.info(`Executing function call with: ${artifact}`);

    const assetArtifact = new AssetType(artifact);

    const chain: OiChain = this.oiCore.getService('openibex.chain', 'chain') as unknown as OiChain;
    const api = chain.contract(assetArtifact).getAPI(options.wallet)

    this.logger.info(`API created with ${options.wallet ? `wallet ${options.wallet}`: 'no wallet'}.`);
    
    const returnValue = await api.execute(functionName, argString.split(','))
  
    this.logger.info(`Calling function '${functionName}' returns ${JSONbig.stringify(returnValue)}`);
  }
}
