// From @orbit-db/core (MIT)
import { identify } from "@libp2p/identify";
import { webSockets } from "@libp2p/websockets";
import { webRTC } from "@libp2p/webrtc";
import { all } from "@libp2p/websockets/filters";
import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { circuitRelayTransport } from "@libp2p/circuit-relay-v2";

/**
 * Libp2p configuration.
 * Find the full reference at https://github.com/libp2p/js-libp2p/blob/main/doc/CONFIGURATION.md
 */
export const NodeLibp2pConfig: Record<string, any> = {
  standalone: {
    addresses: {
      listen: ['/ip4/127.0.0.1/tcp/0/ws'],
    },
    transports: [
      webSockets({
        filter: all,
      }),
    ],
    connectionEncryption: [noise()],
    streamMuxers: [yamux()],
    connectionGater: {
      denyDialMultiaddr: () => true,
    },
    services: {
      identify: identify(),
      pubsub: gossipsub({ allowPublishToZeroTopicPeers: true }),
    },
  },
  airgap: {
    addresses: {
      listen: ["/ip4/0.0.0.0/tcp/0/ws"],
    },
    transports: [
      webSockets({
        filter: all,
      }),
      webRTC(),
      circuitRelayTransport(),
    ],
    connectionEncryption: [noise()],
    streamMuxers: [yamux()],
    connectionGater: {
      denyDialMultiaddr: () => false,
    },
    services: {
      identify: identify(),
      pubsub: gossipsub({ allowPublishToZeroTopicPeers: true }),
    },
  },
  browser: {
    addresses: {
      listen: ["/webrtc"],
    },
    transports: [
      webSockets({
        filter: all,
      }),
      webRTC(),
      circuitRelayTransport(),
    ],
    connectionEncryption: [noise()],
    streamMuxers: [yamux()],
    connectionGater: {
      denyDialMultiaddr: () => false,
    },
    services: {
      identify: identify(),
      pubsub: gossipsub({ allowPublishToZeroTopicPeers: true }),
    },
  },
};
