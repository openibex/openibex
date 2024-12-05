import { Command } from 'commander';
import { getOiLogger } from './utils/logger';
import { loadConfig } from './utils/config';
import { getOiCore, OiConfig, OiCore, OiLoggerInterface } from '@openibex/core';

export class OiCommand extends Command {
  protected logger: OiLoggerInterface;
  protected config: OiConfig;
  protected oiCore: OiCore;

  constructor(core: OiCore, config: OiConfig, logger: OiLoggerInterface) {

    super();
    // Initialize logger and config as singletons
    this.logger = getOiLogger();
    this.config = config; // Default empty config until async loading
    this.oiCore = core;
    
    // Load the config asynchronously
    this.init();
  }

  // Method to asynchronously load configuration on initialization
  private async init() {
  }
}
