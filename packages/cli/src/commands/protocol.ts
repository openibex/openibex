import { OiChainProtocols } from '@openibex/protocols';
import { OiCommand } from '../command';
import { OiCore, OiConfig, OiLoggerInterface } from '@openibex/core';

export default class ProtocolCommand extends OiCommand {
  constructor(core: OiCore, config: OiConfig, logger: OiLoggerInterface) {
    super(core, config, logger);
    this.name('protocol')
      .description('Work with protocols')
      .argument('<name>', 'Protocol Name')
      .option('--details', 'List protocol details.')
      .option('--watch', 'Use the protocol (TBD how exactly)')
      .option('--scrape', 'Scrape data from a protocol (e.g., USDC on every supported chain "usd-circle")', '[false]')
      .option('--block', 'Specify the start block (e.g., USDC on ETH 6082465)')
      .action(this.execute.bind(this));
  }

  async execute(name, options: { connect?: string; block?: string; scrape?: boolean }) {
    // Access the logger and config
    this.logger.info(`Executing protocol command with: ${name}`);
    const protocols: OiChainProtocols = this.oiCore.getService('openibex.protocols', 'protocols') as OiChainProtocols;

    if (options.scrape) {
      const protocol = await protocols.get(name);
      const scraper = await protocol.getScraper();
      await scraper.init();
      await scraper.start();
      this.logger.info('scraping');
    }
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
