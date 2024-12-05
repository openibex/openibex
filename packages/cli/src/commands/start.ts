import { OiCore, OiConfig, OiLoggerInterface } from '@openibex/core';
import { OiCommand } from '../command';

export default class StartCommand extends OiCommand {
  constructor(core: OiCore, config: OiConfig, logger: OiLoggerInterface) {
    super(core, config, logger);
    this.name('start')
      .description('Start a runner')
      .option('--connect <protocol>', 'Connect to a protocol (e.g., ERC20 on ETH eip155:1/erc20:0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48)')
      .option('--block <blockNumber>', 'Specify the start block (e.g., USDC on ETH 6082465)')
      .action(this.execute.bind(this));
  }

  async execute(options: { connect?: string; block?: string; scrape?: string }) {
    // Access the logger and config
    this.logger.info(`Executing start command with options: ${options}`);

    // Implement command logic here
    if (options.connect) {
      this.logger.info(`Connecting to protocol: ${options.connect}`);
      // Logic to connect to the specified protocol
    }

    if (options.block) {
      this.logger.info(`Starting at block number: ${options.block}`);
      // Logic to handle the block option
    }

    if (options.scrape) {
      this.logger.info(`Scraping data from protocol: ${options.scrape}`);
      // Logic to scrape data
    }

    this.logger.info('Start command executed successfully.');
  }
}
