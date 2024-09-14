let libp2pConns: any;
let lostPeerCallback: ((peerId: string) => Promise<void>)[] = [];
let newPeerCallback: ((peerId: string) => Promise<void>)[] = [];

/**
 * Function to get the list of currently connected peers
 * @returns list of connected peers
 */
function getConnectedPeers(): string[] {
    const connections = libp2pConns.getConnections();
    return connections.map(conn => conn.remotePeer.toString());
}

/**
 * Function to detect missing peers (those who were connected previously but are now disconnected)
 * 
 * @param initialPeers - Previous list of peers
 * @param currentPeers - Current list of peers
 * @returns List of missing peers.
 */
function detectLostPeers(initialPeers, currentPeers) {
    return initialPeers.filter(peerId => !currentPeers.includes(peerId));
}

/**
 * Function to detect new peers (those who have connected after the initial check)
 * 
 * @param initialPeers - Previous list of peers
 * @param currentPeers - Current list of peers
 * @returns List of new peers.
 */
function detectNewPeers(initialPeers, currentPeers) {
    return currentPeers.filter(peerId => !initialPeers.includes(peerId));
}

/**
 * Function to continuously monitor peers, accounting for both missing and new peers.
 * Runs continuously and is started with every node start.
 * 
 * @param libp2pNode Libp2p instance
 * @param logger Logger instance
 */
export async function monitorPeers(libp2pNode: any, logger: any ) {
  libp2pConns = libp2pNode;

    logger.info('Peer monitoring started...');

    // Step 1: Get the initial list of connected peers
    let initialConnectedPeers = getConnectedPeers();
    logger.info(`Node status, PeerId: ${getNodeId()} connected peers: ${initialConnectedPeers.length > 0 ? initialConnectedPeers : 'standalone'}`);

    // Step 2: Start an interval to check peers every 10 seconds
    setInterval(() => {
        // Get the current list of connected peers
        const currentConnectedPeers = getConnectedPeers();

        // Detect missing peers
        const lostPeers = detectLostPeers(initialConnectedPeers, currentConnectedPeers);
        if (lostPeers.length > 0) {
            logger.info('Network lost peers:', lostPeers);
            logger.info(`Node status, PeerId: ${getNodeId()} connected peers: ${currentConnectedPeers.length > 0 ? currentConnectedPeers : 'standalone'}`);

            lostPeers.forEach((peerId) => {
              lostPeerCallback.map((callback) => {
                callback(peerId);
              })
            })
        }

        // Detect new peers
        const newPeers = detectNewPeers(initialConnectedPeers, currentConnectedPeers);
        if (newPeers.length > 0) {
            logger.info('Network joined by peers:', newPeers);
            logger.info(`Node status, PeerId: ${getNodeId()} connected peers: ${currentConnectedPeers.length > 0 ? currentConnectedPeers : 'standalone'}`);
            newPeers.forEach((peerId) => {
              newPeerCallback.map((callback) => {
                callback(peerId);
              })
            })
        }

        // Update the initial peer list for the next comparison
        initialConnectedPeers = currentConnectedPeers;
    }, 10000); // Repeat every 10 seconds
}

/**
 * Register a callback that is called if a peer is lost.
 * @param callback 
 */
export function registerLostPeerCallback(callback: (peerId: string) => Promise<void>) {
  lostPeerCallback.push(callback);
}

/**
 * Reggister a callback that is called with new peers.
 * 
 * @param callback 
 */
export function registerNewPeerCallback(callback: (peerId: string) => Promise<void>) {
  newPeerCallback.push(callback)
}

/**
 * Get the PeerID.
 * 
 * @returns PeerID as string
 */
export function getNodeId(): string {
  return libp2pConns.peerId.toString();
}
