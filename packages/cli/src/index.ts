#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import * as fs from 'fs';
import * as yaml from 'yaml';

import { oiLogger } from './logger';
import { OiConfig, OiPreload, initApp, startNode, stopNode } from '@openibex/core';
import { startOpenIbex } from './start';
import { executeArgs, executeContractFunction } from './execute';

import '@openibex/chain';
import '@openibex/ethereum';

/**
 * Load the configuration from an yaml-file.
 * 
 * @returns An OpenIbex App configuration.
 */
async function loadConfig(): Promise<OiConfig> {
  const configFile = fs.readFileSync('config.yaml', 'utf8');
  const config = yaml.parse(configFile) as OiConfig;
  return config;
}

/**
 * Loads preload.yaml with plugin-specific entries. I.e. plugin databases
 * that are customized.
 * 
 * @returns An OiPreload object.
 */
async function loadPreloadValues(): Promise<OiPreload> {
  const configFile = fs.readFileSync('preload.yaml', 'utf8');
  const config = yaml.parse(configFile) as OiPreload;
  return config;
}

async function main() {
  // Load configuration from config.yaml
  const config: OiConfig = await loadConfig();
  const { helia, database, wallets, plugins } = config;

  // Define the commands using yargs
  await yargs(hideBin(process.argv))
    .scriptName("@openibex/cli").version('0.1.0')
    .usage('npx run $0 <cmd> [args]')
    .command('init', 'Initialize the project', 
    (yargs) => {
      return yargs.option('start', {
        describe: 'If run is on, the node is started straight after init. Useful for memory-only config.',
        choices: ['yes', 'no'] as const,
        default: 'no',
        demandOption: false
      });
    },
    async (argv) => {
      oiLogger.info(`Initializing dapp, start enabled: ${argv.start}..`);

      // Add your initialization logic here
      if(config.database.address) {
        throw Error('Your config already has a dapp-address configured. Cannot overwrite.');
      } 
      const preload: OiPreload = await loadPreloadValues();
      await initApp(config, preload, oiLogger);

      if(argv.start === 'yes') { 
        return startOpenIbex(config, argv);
      } else {
        return stopNode(oiLogger);
      }
    })
    .command('upgrade', 'Upgrade the project settings and databases.\nReserved for later.', () => {}, () => {
     //  if(!config.database.address) throw Error('Your config has no coreDB address set. Please set one or run oi init.');
      oiLogger.info('Upgrading, currently reserved for later...');
      // Add your upgrade logic here
    })
    .command('start', 'Start an  runner', 
    (yargs) => {
      // FIXME move this to startArgs in start.ts
      return yargs.option('connect', {
        describe: 'This command connects any protocol that has a connector. Example: ERC20 (USDC) on ETH eip155:1/erc20:0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        default: undefined,
        demandOption: false
      });
    },
    async (argv) => {
      await startNode(config.helia, database, oiLogger);
      
      return startOpenIbex(config, argv);
    })
    .command(
        'exec', 
        'Execute a smart contract function or view',
        executeArgs,
        async (argv) => {
          await startNode(config.helia, database, oiLogger);
          await executeContractFunction(config, argv);
          console.log("Call contract finished...")
        }
      )
      /* .command('stop', 'Stop the project', () => {}, () => {
      oiLogger.info('Stopping the project...');
      // Add your stop logic here
    }) */
    .demandCommand(1, 'You need to specify a command')
    .help()
    .parse();
}

await main().catch(err => {
  oiLogger.error(err);
  yargs().exit(1, err);
});
