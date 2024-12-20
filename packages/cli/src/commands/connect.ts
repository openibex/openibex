import { OiCommand } from '../command';
import { OiCore, OiConfig, OiLoggerInterface } from '@openibex/core';
import { OiChain } from '@openibex/chain';
import { AssetType } from 'caip';

export default class ConnectCommand extends OiCommand {
  constructor(core: OiCore, config: OiConfig, logger: OiLoggerInterface) {
    super(core, config, logger);
    this.name('connect')
      .description('Use connectors to retrieve smart contract events.')
      .argument('<artifact>', 'AssetArtifact, any CAIP Asset address.')
      .option('--details', 'List connector details.')
      .option('--block', 'Specify the start block (e.g., USDC on ETH 6082465)')
      .option('--index', 'Indexer keeps track of the last event read and continues from there after interrupts.')
      .action(this.execute.bind(this));
  }

  async execute(artifact: string, options: { details?: boolean; block?: number, index?: boolean;}) {
    // Access the logger and config
    this.logger.info(`Executing connect command with: ${artifact}`);

    const assetArtifact = new AssetType(artifact);

    const params = {
      index: options.index ? options.index : false,
      startBlock: options.block ? options.block : 0
    }

    const chain: OiChain = this.oiCore.getService('openibex.chain', 'chain') as unknown as OiChain;
    const connector = chain.contract(assetArtifact).getConnector(params);

    connector.addEventPostProcessor('Transfer', async (contract, event, record) => {
      this.logger.info(`Connector reads: On ${contract.toString()} ${record.event?.blockNumber}-${record.event.logIndex} : ${record?.fromAddress}, ${record?.toAddress}, ${record?.amount}`);
    })

    this.logger.info(`Connector created and post processor added on event 'Transfer'`);
    
    if (options.details) {
      // TODO: Show details like connectorparams and others.
    }
    
    this.logger.info(`Connector initializing: Creating datasets and initializing connections.`);
    await connector.init();
    this.logger.info('Connector starting');
    await connector.start();
    this.logger.info(`Connector started and processing.`);
  }
}
