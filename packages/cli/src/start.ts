import { getOiCore, OiConfig, OiCore } from '@openibex/core';
import { oiLogger } from './logger';

import { getOiChain } from '@openibex/chain';
import { AssetType } from 'caip-js';

import '@openibex/ethereum';
import '@openibex/usd-circle';

/**
 * Start an initialized app.
 * 
 * @param config The app configuration.
 */
export async function startOpenIbex(config: OiConfig, argv: any) {
  oiLogger.info(`Starting the node with for dApp with address ${config.database.address}...`);
  const core: OiCore = await getOiCore(config, oiLogger);
  const chain = await getOiChain();

  if (argv.connect) {
    const protocol = await chain.connect(new AssetType(argv.connect), argv.block? argv.block : 0);
    const scraper = await protocol.getScraper();
    await scraper.init();
    await scraper.start();
  }

  if (argv.scrape) {
    const protocol = await chain.getProtocol(argv.scrape);
    const scraper = await protocol.getScraper();
    await scraper.init();
    await scraper.start();
  }

  core.log.info('Entering Endless loop to run worker. stop with ctrl-C');
  while(true){await new Promise(resolve => setTimeout(resolve, 5000)); }
}
