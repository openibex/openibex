import { Command } from 'commander';
import * as fs from 'fs'; 
import * as path from 'path';
import { OiConfig, OiCore, OiLoggerInterface } from '@openibex/core'; // Correct import
import { OiCommand } from './command';
import { getOiLogger } from './utils/logger';

export class CommandsManager {
  private commandsDir: string;
  private core: OiCore;
  private config: OiConfig;
  private logger: OiLoggerInterface = getOiLogger();

  constructor(commandsDir: string = 'commands', core: OiCore, config: OiConfig) {
    this.commandsDir = commandsDir;
    this.core = core;
    this.config = config;
  }

  
  private async loadExternalPlugins() {
    if (!fs.existsSync(this.commandsDir)) {
      this.logger.warn(`Plugins directory does not exist: ${this.commandsDir}`);
      return []; // Return an empty array if the directory doesn't exist
    }

    const externalPlugins = [];
    const externalPluginFiles = fs.readdirSync(this.commandsDir).filter(file => file.endsWith('.js') || file.endsWith('.ts'));
    
    for (const file of externalPluginFiles) {
      const pluginPath = path.resolve(this.commandsDir, file);
      try {
        const pluginModule = await import(pluginPath);
        if (pluginModule.default) {
          externalPlugins.push(pluginModule.default);
        }
      } catch (error) {
        this.logger.error(`Failed to load external plugin at ${pluginPath}: ${error.message}`);
      }
    }

    return externalPlugins;
  }

  async registerPlugin(program: Command, PluginClass: typeof OiCommand) {
    if (typeof PluginClass === 'function') {
      const pluginInstance = new PluginClass(this.core, this.config, this.logger) as OiCommand;
      if (pluginInstance instanceof OiCommand) {
        program.addCommand(pluginInstance);
        this.logger.info(`Registered CLI command: ${pluginInstance.name()}`);
      } else {
        this.logger.warn(`Skipping plugin: not an instance of OiCommand`);
      }
    }
  }

  
  async registerPlugins(program: Command, localCommands: Array<typeof OiCommand>) {
    const externalPlugins = await this.loadExternalPlugins(); // Load external plugins
    const allPlugins = [...localCommands, ...externalPlugins];

    for (const PluginClass of allPlugins) {
      this.registerPlugin(program, PluginClass);
    }
  }
}
