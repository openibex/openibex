import { KeyValue } from "@orbitdb/core";

import { OiConfig, OiConfigDatabase, OiConfigHelia } from "./core.config";
import { initPlugins, OiPlugin, registerOiPlugin, type OiCoreSchema } from "./plugins";
import { openDatabase, registerDatabaseTypes } from "./db";

/**
 * A simplistic Logger Interface compatible with standard loggers out there
 * (e.g. winston logging library
 */
export interface OiLoggerInterface {
  log(level: string, message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  // Add other methods if needed
}


// OiCore-Singleton
let core: OiCore | undefined = undefined;

/**
 * Retrieves the core (and initializes it on first call)
 * 
 * Throughout the whole application, a single instance of OiCore is kept, which is retrieved
 * using this method. 
 * 
 * Typically, getOiCore() is called at startup of the application with the config and the logger passed as argument to
 * initialize the core-object accordingly.
 *  
 * On any subsequent calls of `getOiCore()`, config and logger do not need to be provided and will be ignored.
 * 
 * @param config Parsed OiConfig
 * @param logger Logger, if not provided on first call, OiLogger will be used
 * 
 * @returns Fully operational OiCore instance representing the app.
 */
export async function getOiCore(config: OiConfig | undefined = undefined, logger: OiLoggerInterface | undefined = undefined): Promise<OiCore> {
  if(!core) {
    if(config === undefined) {
      throw Error("Core still needs to be initialized. For initialization, config and logger are required");
    }

    // Per default, initialize the oiLogger
    if(logger === undefined) {
      logger = new BaseLogger();
    }
    registerDatabaseTypes();
    await initOiCore(config!, logger);
  } 
  return core!;
}


// ##################################### INTERNAL FUNCTIONALITY
/**
 * Initializes the core, will be called from the first call of getOiCore.
 */
async function initOiCore(config: OiConfig, logger: OiLoggerInterface): Promise<void> {
  if(core != undefined) {
    throw Error("Core was already initialized earlier, it can only be initialized once!");
  }
  
  if (!config.database.address) throw Error('No DB address for coreDB in config. Please edit your config or run npx oi init');

  core = new OiCore(config);

  // the core is a plugin itself, register it
  registerOiPlugin('core', config.database.namespace, core);

  const coreDB = await openDatabase(config.database.address, 'keyvalue') as unknown as KeyValue<OiCoreSchema>;
  
  await initPlugins(config, coreDB, logger);
}

class BaseLogger implements OiLoggerInterface {
  private logMessage(level: string, message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} [${level.toUpperCase()}]: ${message}`);
  }

  public log(level: string, message: string): void {
    this.logMessage(level, message);
  }

  public info(message: string): void {
    this.logMessage('info', message);
  }

  public warn(message: string): void {
    this.logMessage('warn', message);
  }

  public error(message: string): void {
    this.logMessage('error', message);
  }

  // Other log level methods can be added similarly
}

/**
 * The core application class. The core stores settings, administers databases and producers.
 */
export class OiCore extends OiPlugin {
  private dbConf: OiConfigDatabase;
  private heliaConf: OiConfigHelia;
  private pluginConf: any;

  /**
   * Construtor for OiCore
   * 
   * @param config A configuration in OiConfig format
   * @param logger A logger object.
   */
  constructor(config: OiConfig) {
    super('core', config.database.namespace);

    this.dbConf = config.database;
    this.heliaConf = config.helia;
    this.pluginConf = config.plugins;
  }
}
