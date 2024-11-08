// From @orbit-db/core (MIT)
import { createHelia, Helia } from "helia";
import { createLibp2p, Libp2p } from "libp2p";
import { MemoryBlockstore } from "blockstore-core";
import { LevelBlockstore } from "blockstore-level";
import { OrbitDB } from "@orbitdb/core";
import { OiConfigDatabase, OiConfigHelia } from "../config";
import { NodeLibp2pConfig } from './libp2p';
import { monitorPeers } from "./peers";
import { OiLoggerInterface } from "../types";
import { OiDatabase } from "../db";

export class OiNode {
  private static instance: OiNode;

  private heliaConf: OiConfigHelia;
  private dbConf: OiConfigDatabase;
  private log: OiLoggerInterface;

  private nodeStarted: boolean = false;
  private ipfsNode: Helia;
  private libp2pNode: Libp2p;

  private constructor(
    heliaConf: OiConfigHelia,
    databaseConf: OiConfigDatabase,
    logger: OiLoggerInterface
  ) {
    this.heliaConf = heliaConf;
    this.dbConf = databaseConf;
    this.log = logger;
  }

  static getInstance(
    heliaConf?: OiConfigHelia,
    databaseConf?: any,
    logger?: any): OiNode
  {
    if (!OiNode.instance) {
      OiNode.instance = new OiNode(
        heliaConf, databaseConf, logger
      );
    }
    return OiNode.instance;
  }

  public async start() {
    if (this.nodeStarted) {
      this.log.info(`Node is already started, will not proceed.`);
      return;
    }

    // Create Helia instance with libp2p and blockstore
    this.libp2pNode = await createLibp2p(NodeLibp2pConfig[this.heliaConf.libp2p.mode]);

    const heliaInstance = await createHelia({
      blockstore: this.createBlockstore(this.heliaConf.blockstore.plugin, this.heliaConf.blockstore.params),
      libp2p: this.libp2pNode
    });
    // const heliaInstance = await createHelia();

    // Create OrbitDB instance with Helia
    const db = OiDatabase.getInstance(heliaInstance, this.dbConf.path, this.log);
    await db.start();
    
    this.nodeStarted = true;

    this.ipfsNode = heliaInstance;

    monitorPeers(heliaInstance.libp2p, this.log);
  }

  async stop() {
    this.nodeStarted = false;
  
    this.log.info(`stopNode: Stopping Orbitdb. Please wait.`);
    await OiDatabase.getInstance().stop();
    this.log.info(`stopNode: Stopping Helia. Please wait.`);
    await this.ipfsNode.stop();
    //this.log.info(`stopNode: Stopping Libp2p. Please wait.`);
    await this.libp2pNode.stop();
    this.log.info(`stopNode: Orbitdb and Helia stopped.`);
  }

  /**
   * Internal function to configure Helia backends according to config.
   * @param type Backend type
   * @param params Custom backend params.
   * @returns 
   */
  private createBlockstore(type: string, params: any) {
    switch (type) {
      case 'memory':
        return new MemoryBlockstore();
      case 'level':
        return new LevelBlockstore(`${params.path}`);
      // Add cases for other blockstore types
      default:
        throw new Error(`Unsupported blockstore type: ${type}`);
    }
  }
}


