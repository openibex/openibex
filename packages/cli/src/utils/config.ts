import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';

import { OiConfig } from '@openibex/core';

const defaultConfigPath = path.resolve('config.yaml');
let configInstance: OiConfig | null = null;

export async function loadConfig(configPath: string = defaultConfigPath): Promise<OiConfig> {
  // If config is already loaded, return the instance
  if (configInstance) {
    return configInstance;
  }

  try {
    const configFile = fs.readFileSync(configPath, 'utf8');
    configInstance = yaml.load(configFile) as OiConfig;

    return configInstance;
  } catch (error) {
    throw new Error(`Failed to load config: ${error.message}`);
  }
}
