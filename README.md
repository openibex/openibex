# OpenIbex Core

OpenIbex is a crypto-native distributed application development framework based on IPFS. It allows to extract and process multichain data through ETF pipelines and into any IT Service or API.

OpenIbex includes OrbitDB, a distributed database, and thus allows to share data & state permissionless and gasless. Oi can be run in browser or as a worker / agent style service. Each OpenIbex instance starts their node which includes an IPFS-server based on Helia as data persistency layer.

## Concept

Oi is intended to be orchestrated through frameworks like Vue, Express, React or NestJs. However: To facilitate development and small setups, the @openibex/cli package contains a command that allows to init and run a standalone node.

### Try it

Checkout the repository, copy the config and preload examples. Then run init to create your application:

```bash
$> yarn install; yarn build; yarn run oi init
.... coreDB address: /orbitdb/xxxx
```

Once your application is initialized, edit the config and connect to an ERC-20 contract to create an index:

- Specify your coreDB address (from output of `yarn run oi init`) as `database/address` in `config.yaml`
- Replace the Node-URIs (`https://example.com/<someKey>`) through your actual nodes, e.g. `https://ethereum-mainnet.core.chainstack.com/<your-key>`


```bash
$> yarn run oi start --connect eip155:1/erc20:0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
```

Note it may take ~30s until you see the first Blockchain events dripping in.


### Initializing Apps

When a new dApp is created it requires a core database which resides in IPFS. Oi can setup a core database according to a predefined config. This database can be used globally (as in "all around the world") to start an openibex node with the configured dApp. The init command reads the config.yaml and sets up the database. The DB-Address then is added to the config yaml and Oi is started.

### About distributed applications

Distributed applications, commonly known as dApps, usually run as local-first applications and interact with blockchains and distributed databases. In a simple scenario dApp a single codebase interacts with a smart contract.

OpenIbex supports other architecture patterns by enabling to split the app in several code bases and roles. While the common browser-dapp remains local first dApp users can also choose to deploy workers and agents to fulfill the role.

While agents subscribe to blockchain events and snapshots, workers read from databases and execute tasks. An example:

- An user buys an AI-Generated metaverse character through the browser dapp by executing a blockchain transaction.
- An agent parses the transaction into a blockchain-agnostic primitive.
- The worker reads the queue of primitives, generates the AI characters and uploads the images and metadata into ipfs.
- The worker uses an approved signer wallet to write into the database and thus can be paid through blockchain.

## Working with Oi

To start using Oi you have to retrieve a core and provide a config :

```typescript
import { OiConfig, getOiCore} from '@openibex/core';
let config: OiConfig = {...} // Your config as an OiConfig object
const core = await getOiCore(config); // initializes on first call based on config. You can optionally pass a logger
```

Now whenever you need the core subsequently, just call getOiCore() without arguments.

```typescript
import { OiCore, getOiCore } from '@openibex/core';

const core: OiCore = await getOiCore();
// Register a module demo in the example namespace
const modConfig = core.registerModule('demo', 'documents', 'example')
// Store a number in the value store
core.setVal('demo', 'exampleNo', 3);
// Get a documents DB
const db = core.getDB('demo', 1, 'documents', 'example') as unknown as Documents<yourType>;
```

## Developing Oi Plugins

Any piece of software can be an oi module and use the oi databases and global state store. It is as well possible to develop own database types.

To write a plugin, see packages/chain/src/plugin.ts. All plugins are initialized together with the core and fully usable as soon as the core is accessed for the first time.

For local development, this repository offers a hardhat-based "localchain", which is a playground to test new functionality and interact with smart contracts etc. Refer [utils/localchain/README](utils/localchain/README.md) for details.

## Build Status

[![Build Status Master](https://deploy.ibex.host/api/badges/templates/base/status.svg)](https://deploy.ibex.host/templates/base)

## Deployment

Use drone, adapt the .drone.yml. IMPORTANT: The Example drone config is designed to fail
