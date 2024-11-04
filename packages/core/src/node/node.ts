// From @orbit-db/core (MIT)
import { createHelia, Helia } from "helia";
import { createLibp2p, Libp2p } from "libp2p";
import { MemoryBlockstore } from "blockstore-core";
import { LevelBlockstore } from "blockstore-level";
import { OrbitDB } from "@orbitdb/core";
import { OiConfigHelia } from "../config";
import { NodeLibp2pConfig } from './libp2p';
import { getOrbitDB, initOrbitDB, isDBReady, stopDatabase } from '../db';
import { monitorPeers } from "./peers";

let namespace: string;
let nodeStarted: boolean = false;

let ipfsNode: Helia;
let libp2pNode: Libp2p;

/**
 * Internal function to configure Helia backends according to config.
 * @param type Backend type
 * @param params Custom backend params.
 * @returns 
 */
function createBlockstore(type: string, params: any) {
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

/**
 * Starts the helia node and returns an orbitdb instance.
 * @param heliaConf Helia configuration object.
 * @param databaseConf Database Configuration object.
 * @returns 
 */
export async function startNode(
  heliaConf: OiConfigHelia,
  databaseConf: any,
  logger: any
): Promise<OrbitDB> {
  if (!isDBReady() && !nodeStarted) {
    // Create Helia instance with libp2p and blockstore
    libp2pNode = await createLibp2p(NodeLibp2pConfig[heliaConf.libp2p.mode]);

    const heliaInstance = await createHelia({
      blockstore: createBlockstore(heliaConf.blockstore.plugin, heliaConf.blockstore.params),
      libp2p: libp2pNode
    });

    // Create OrbitDB instance with Helia
    await initOrbitDB({ ipfs: heliaInstance, directory: databaseConf.path }, logger);
    // Set namespace
    namespace = databaseConf.namespace;
    nodeStarted = true;

    ipfsNode = heliaInstance;

    monitorPeers(libp2pNode, logger);
  }
  return getOrbitDB();
}

/**
 * Stops the Helia node by closing all databases and shutting down related services.
 *
 * @param {object} logger - The logger object used for logging informational messages.
 * @returns {Promise<void>} A promise that resolves when all operations are complete.
 */
export async function stopNode(logger: any): Promise<void> {
  await stopDatabase(logger);

  logger.info(`stopNode: Stopping Orbitdb and Helia. Please wait.`);
  await getOrbitDB().stop();
  nodeStarted = false;
}


