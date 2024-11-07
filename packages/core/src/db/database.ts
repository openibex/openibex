import { createOrbitDB, OrbitDB } from '@orbitdb/core';
import { getDefaultIdentityID, getIdentitiesManager, initIdentitiesManager } from './identity';
import { OiLoggerInterface } from '../types';
import { Helia } from "helia";


export class OiDatabase {
  private static instance: OiDatabase;

  private ipfs: Helia;
  private directory: string;

  private runningDB: Record<string, any> = [];
  private orbitdb: OrbitDB;
  private log: OiLoggerInterface;

  private constructor(
    ipfsNode: Helia,
    directory: string,
    logger: OiLoggerInterface
  ) {
    this.ipfs = ipfsNode;
    this.directory = directory
    this.log = logger
  }

  static getInstance(
    ipfsNode?: Helia,
    directory?: string,
    logger?: OiLoggerInterface
  ) {
    if (!OiDatabase.instance) {
      OiDatabase.instance = new OiDatabase(
        ipfsNode, directory, logger
      );
    }
    return OiDatabase.instance;
  }

  /**
   * Sets the OrbitDB base instance.
   * 
   * @param db The orbit DB instance to use.
   */
  public async start() {
    let dbSettings: any = {
      ipfs: this.ipfs,
      directory: this.directory
    }

    await initIdentitiesManager(dbSettings.ipfs, dbSettings.directory);
    dbSettings.identities = getIdentitiesManager();
    dbSettings.id = getDefaultIdentityID();

    this.orbitdb = await createOrbitDB(dbSettings);
    this.log.info(`Initialized OrbitDB, identity: ${this.orbitdb.identity.id}`);
  }

  /**
   * Returns true if DB is ready.
   * 
   * @returns 
   */
  public isDBReady() {
    if(this.orbitdb)
      return true;

    return false;
  }

  /**
   * Returns the OrbitDB instance.
   * 
   * @returns OrbitDB instance
   */
  public getOrbitDB() {
    if(this.orbitdb)
      return this.orbitdb

    throw Error('DB: No OrbitDB configured. OiDatabase.start() is required.');
  }

  /**
   * Opens a database. Will create DB if it doesn't exist.
   * @param address Address starting with /orbitdb/ (or name if not initialized)
   * @param type OrbitDB type, default "events"
   * @returns An opened OrbitDB database.
   */
  public async open(address: string, type: string = 'keyvalue'): Promise<any> {
    if(!this.orbitdb) throw new Error(`No OrbitDB initialized. Run OiDatabase.getInstance().start() first.`);
    
    if(address in this.runningDB.keys) {
      return this.runningDB[address];
    }

    const db = await this.orbitdb.open(address, {type, syncAutomatically: true})

    this.runningDB[db.address]= db;

    return db;
  }

  public async close(address: string) {
    if(address in this.runningDB.keys) {
      throw new Error(`No database with such address found, will not close: ${address}`)
    }

    this.log.info(`Databases: Closing database ${address}`);
    await this.runningDB[address].close();
  }

  /**
   * Stopping the databases.
   * @param logger 
   */
  public async stop() {
    for (const address in this.runningDB) {
      await this.close(address);
    }
    
    this.log.info(`stopNode: Closing OrbitDB`);
    await this.orbitdb.stop();
  }
}
