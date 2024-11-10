import { KeyValue } from "@orbitdb/core";
import { OiLoggerInterface } from "../core";
import { openDatabase } from "../db";

export type OiCoreSchema = { 
  address: string; 
  type: string; 
  revision: number; 
};

/**
 * DbManager is used to provide taylored DB interfaces, i.e. in plugins.
 */
export class OiDbManager {
  private dottedPath: string;

  public log!: OiLoggerInterface;
  private coreDB!: KeyValue<OiCoreSchema>;

  private dbLocks: Set<string> = new Set<string>();
  
  /**
   * Creates dbManager instance
   * 
   * @param dottedPath DB path (prefix)
   * @param logger 
   * @param coreDB Contains a directory of all databases in your app.
   */
  constructor(dottedPath: string, logger: OiLoggerInterface, coreDB: KeyValue<OiCoreSchema>){
    this.dottedPath = dottedPath;
    this.coreDB = coreDB
    this.log = logger
  }

  /**
   * Opens a database in read / write mode.
   * 
   * @param name - DB identifier
   * @param revision - Schema revision
   * @param type - Orbitdb Type, includes registered custom types.
   * @returns An OrbitDB Database of the specified type.
   */
  public async getDB(revision: number, type: string, name: string, tag?: string): Promise<any> {
    if (!this.coreDB) throw Error('Database coreDB not initialized. Run OiCore.init() first.');
    this.log.info(`Opening DB for ${this.dottedPath}, ${name} with tag "${tag}" in revision ${revision}`);

    const dbName = `${this.dottedPath}.${name}.v${revision}${tag? '.'+ tag : ''}`;

    while(this.dbLocks.has(dbName)) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    this.dbLocks.add(dbName)

    let dbOpts: OiCoreSchema | undefined = await this.coreDB.get(dbName);

    const db = await openDatabase(dbOpts ? dbOpts.address : dbName, dbOpts ? dbOpts.type: type);
    this.log.info(`Opened DB ${dbName} at address ${db.address}`);

    if(!dbOpts) {
      dbOpts = {
        address: db.address,
        type,
        revision
      } as unknown as OiCoreSchema

      await this.coreDB.put(dbName, dbOpts)
    }
    
    this.dbLocks.delete(dbName);
    return db;
  }
}
