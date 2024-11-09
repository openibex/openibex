#!/usr/bin/env node

import { Command } from 'commander';
import { CommandsManager } from './manager';
import { getOiLogger } from './utils/logger';
import { loadConfig } from './utils/config';

import './imports';
import { getOiCore, OiCore } from '@openibex/core';

import StartCommand from './commands/start';
import InitCommand from './commands/init';
import ProtocolCommand from './commands/protocol';
import ConnectCommand from './commands/connect';
import ExecCommand from './commands/execute';
import ValueCommand from './commands/value';
import WatchCommand from './commands/watch';
import path from 'path';
import { pathToFileURL } from 'url';



/**
 * Add new plugins here
 */
let localCommands = [
  InitCommand, 
  StartCommand, 
  ProtocolCommand, 
  ConnectCommand, 
  ExecCommand, 
  ValueCommand,
  WatchCommand
];

let core: OiCore;

const program = new Command();

async function main() {
  // Define CLI options and commands
  program
    .name('@openibex/cli')
    .description('A CLI for OpenIbex applications')
    .allowUnknownOption()
    .version('1.0.0')
    .option('--import <package>', 'Dynamically import a package from a path before executing commands')
    .option('--config <path>', 'Specify a custom configuration file', 'config.yaml')
    .option('--logdest <path>', 'Specify the log destination file', 'logs/app.log')
    .helpOption('--help', 'Display help for the CLI');

  // Parse CLI options
  program.parse(process.argv);
  const options = program.opts();

  // Load configuration and initialize logger
  const config = await loadConfig(options.config);
  const oiLogger = getOiLogger(options.logdest);
  oiLogger.info('Configuration loaded successfully.');

  // Import package
  if (options.import) {
    const importPackage = options.import;
    try {
      const packagePath = path.isAbsolute(importPackage)
        ? pathToFileURL(importPackage)
        : pathToFileURL(path.resolve(process.cwd(), importPackage));
      
      // Dynamically import the package
      import(packagePath.toString())
        .then((pkg) => oiLogger.info(`Successfully imported package: ${importPackage}`))
        .catch((err) => oiLogger.error(`Failed to import package "${importPackage}": ${err.message}`));
    } catch (error) {
      oiLogger.error(`Error importing package: ${error.message}`);
    }
  }

  try {
    core = await getOiCore(config, oiLogger);
  } catch (error) {
    localCommands = [ InitCommand ];
    oiLogger.error(`Core not initialized. Run init and add the new CoreDB address to the config.`);
  }
  // Initialize PluginManager with loaded config
  const pluginsDir = config.plugins.cli?.pluginPath || 'commands';
  const pluginManager = new CommandsManager(pluginsDir, core, config);
    
  await pluginManager.registerPlugins(program, localCommands);

  // If no arguments are provided, display help
  if (!program.args.length) {
    program.outputHelp();
  }

  handleInterruptSignal();

  // Execute CLI command asynchronously and log any errors
  await program.parseAsync(process.argv).catch(error => {
    oiLogger.error(`Error executing command: ${error.message}`);
    throw error;
  });
}

function handleInterruptSignal() {
  process.on('SIGINT', async () => {
    const oiLogger = getOiLogger();
    oiLogger.info('Process interrupted. Closing OpenIbex core.');
    
    await (await getOiCore()).stop()

    oiLogger.info('Core closed. Exiting gracefully.');
    process.exit(0);
  });
}

// Initialize main process with error handling
main()
