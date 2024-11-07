import { getOiCore, initApp, OiConfig, OiCore, OiLoggerInterface, OiPreload } from '@openibex/core';
import { OiCommand } from '../command';

import * as fs from 'fs';
import * as yaml from 'yaml';

export default class InitCommand extends OiCommand {

  constructor(core: OiCore, config: OiConfig, logger: OiLoggerInterface) {
    super(core, config, logger); // Call the parent class constructor
    this.name('init')
      .description('Initialize a new app by creating a new core database.')
      .option('--preload <preloadFilePath>', 'A preload.yaml for the values database')
      .action(this.execute.bind(this));

  }

  async execute(options: { preload?: string }) {
    if (this.config.database?.address) {
      throw new Error('Your config already has a dapp-address configured. Cannot overwrite.');
    }

    let preload: OiPreload;

    if(options.preload) {
      const preloadFile = fs.readFileSync(options.preload, 'utf8');
      preload = yaml.parse(preloadFile) as OiPreload;
      this.logger.info('Loaded preload values for init');
    }
    
    const address = await initApp(this.config, this.logger, preload);

    if(preload) {
      this.config.database.address = address;
      const core = await getOiCore(this.config, this.logger);

      for(const entry of preload.settings){
        await core.setVal(entry.value, `${entry.namespace}.${entry.plugin}.${entry.name}`);
        this.logger.info(`Preload entry ${entry.namespace}.${entry.plugin}.${entry.name} to value: ${await core.getVal( entry.name, `${entry.namespace}.${entry.plugin}.${entry.name}`)}`);
      }
      
      await core.stop();
    }

    this.logger.info(`Initialization finished.`);
  }
}

