import { getOiCore, OiConfig, OiCore } from '@openibex/core';
import { oiLogger } from './logger';

import { AssetType } from 'caip-js';

import '@openibex/ethereum';
import '@openibex/usd-circle';
import { OiChain } from '@openibex/chain';
import { OiChainProtocols } from '@openibex/protocols';

/**
 * Start an initialized app.
 * 
 * @param config The app configuration.
 */
export async function startOpenIbex(config: OiConfig, argv: any) {
  oiLogger.info(`Starting the node with for dApp with address ${config.database.address}...`);
  const core: OiCore = await getOiCore(config, oiLogger);
  const chain: OiChain = await core.getService('openibex.chain', 'chain') as OiChain;
  const protocols: OiChainProtocols = await core.getService('openibex.protocols', 'protocols') as OiChainProtocols;

  if (argv.connect) {
    const connector = chain.contract(new AssetType(argv.connect)).getConnector({startBlock: argv.block? argv.block : 0});
    await connector.init();
    connector.addEventPostProcessor('Transfer', async (contract, event, record) => {
      core.log.info(`Connector reads: On ${contract.toString()} ${record.event.blockNumber}-${record.event.logIndex} : ${record?.fromAddress}, ${record?.toAddress}, ${record?.amount}`);
    })
    await connector.start();
  }

  if (argv.scrape) {
    const protocol = await protocols.get(argv.scrape);
    const scraper = await protocol.getScraper();
    await scraper.init();
    await scraper.start();
  }

  core.log.info('Entering Endless loop to run worker. stop with ctrl-C');
  while(true){await new Promise(resolve => setTimeout(resolve, 5000)); }
}
