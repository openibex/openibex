import { OiCommand } from '../command';
import { OiCore, OiConfig, OiLoggerInterface } from '@openibex/core';
import ValueCommand from './value';
import { Command } from 'commander';
import { OiChain } from '@openibex/chain';
import { ChainId } from 'caip';
import ExecCommand from './execute';

export default class WatchCommand extends OiCommand {
  private intervalId: NodeJS.Timeout | null = null;

  constructor(core: OiCore, config: OiConfig, logger: OiLoggerInterface) {
    super(core, config, logger);
    this.name('watch')
      .description('Watch executes the same command every n seconds or n blocks.')
      .option('--seconds <seconds>', 'Watch interval in seconds.')
      .option('--blocks <blocks>', 'Watch interval in blocks. Requires --network.')
      .option('--network <eipNet>', 'Network in CAIP notation, e.g., eip155:1 for Mainnet.')
      .argument('<command>', 'Command to watch, any of exec or value. In quotes.')
      .allowUnknownOption()
      .action(this.execute.bind(this));
  }

  async execute(command: string, options: { seconds?: number; blocks?: number; network?: string }) {
    const { seconds, blocks, network } = options;
    const cmd = command.split(' ');

    // Validate options
    if (blocks && !network) {
      this.logger.error('Error: --network is required when using --blocks.');
      return;
    }
    if (!seconds && !blocks) {
      this.logger.error('Error: Either --seconds or --blocks must be specified.');
      return;
    }

    this.logger.info(`Starting to watch command ${cmd.join(' ')}`);

    const watchprog = new Command();
    if(cmd[0] === 'value') {
      watchprog.addCommand(new ValueCommand(
        this.oiCore, 
        this.config, 
        this.logger
      ).allowUnknownOption());
    } else if(cmd[0] === 'exec') {
      watchprog.addCommand(new ExecCommand(
        this.oiCore, 
        this.config, 
        this.logger
      ).allowUnknownOption());
    }
    
    // If using seconds, set a time-based interval
    if (seconds) {
      this.intervalId = setInterval(async () => {
        this.logger.info(`${cmd.join(' ')}`);
        await watchprog.parseAsync(cmd, {from: 'user'});
      }, seconds * 1000);
    }

    // If using blocks, start block-based watching
    if (blocks && network) {
      const chain: OiChain = this.oiCore.getService('openibex.chain', 'chain') as unknown as OiChain;
      const id = new ChainId(network);

      const moduloval = await chain.blocks(id).latest() % blocks;
      chain.blocks(id).subscribeLatest( async (chainId: ChainId, block: number) => {
        
        if (block % blocks == moduloval) {
          await watchprog.parseAsync(cmd, {from: 'user'});
        }
      });
    }
  }
}
