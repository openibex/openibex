import { getOiCore, OiConfig, OiCore } from '@openibex/core';
import { oiLogger } from './logger';

import { getOiChain } from '@openibex/chain';
import { AssetId, AssetType } from 'caip-js';

/**
 * Start an initialized app.
 * 
 * @param config The app configuration.
 */
export async function startOpenIbex(config: OiConfig, argv: any) {
  oiLogger.info(`Starting the node with for dApp with address ${config.database.address}...`);
  const core: OiCore = await getOiCore(config, oiLogger);

  if (argv.connect) {
    const chain = await getOiChain();
    const protocol = await chain.connect(new AssetType(argv.connect), 6082465);
    const scraper = await protocol.getScraper();
    await scraper.init();
    await scraper.start();
  }

  core.log.info('Entering Endless loop to run worker. stop with ctrl-C');
  while(true){await new Promise(resolve => setTimeout(resolve, 5000)); }
}
