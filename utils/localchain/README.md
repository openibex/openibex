# Localchain

The Localchain is a local blockchain including an RPC-Node for development purposes and as a playground.

Execute the following list of commands to spawn a new node, deploy demo-contracts 

```
# From this directory
# using NPM is recommended due to hardhat-toolbox dependency issues
npm install

# Compile the solidity contracts
npx hardhat compile

# Start new node
npx hardhat node &
# Deploy contracts and execute initial transactions for permissions, token-distribution etc.
# This serves a well-defined state for development and steps-to-reproduce
npx hardhat run scripts/deployStack.ts --network localhost
```

You may then proceed (from the root of this repository) with the CLI tool to initialize OpenIbex and e.g. subscribe to the ERC-20 default contract:

```
# From project root
yarn install
yarn build
yarn run oi init
# MANUAL STEP! Copy the created Orbit-DB address to config.yml
# Then, connect to the ERC-20 contract on localchain
yarn run oi start --connect eip155:31337/erc20:0x5FbDB2315678afecb367f032d93F642f64180aa3
```

Alternatively (you need to close an eventually running observer!) you can execute smart-contract functions directly.
The following queries the balance of wallet `0x6d4cc96bd9135c25cbcaa4d38a0b514798a60360`, [then the signer alice](../../wallets/eip155/alice.json)
transfers `1234` tokens and then queries the balance again (which should now have increased by 1234 tokens).

Note this only works because alice (`0x904de374105a106609480d213d59798833a75a81`) was funded via [deployStack.ts](scripts/deployStack.ts) above.
- Received tokens at contract `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- Received ETH to pay for Gas-Fees

A quick look at the CAIP `eip155:31337/erc20:0x5FbDB2315678afecb367f032d93F642f64180aa3`
- `eip155` is our standard namespace
- `31337` is the chain-id of the local hardhat chain/node which was started above.
  - This matches the `plugins.openibex.chain.eip155.networks.hardhat` block in [config.yaml](../../config.yaml)
- `erc20` is the standard/ABI we will use
- `0x5FbDB2315678afecb367f032d93F642f64180aa3` is the smart-contract address, at which the contract was deployed to via [deployStack.ts](scripts/deployStack.ts)

```
### Will return 0 (as it does not have any tokens yet)
yarn run oi exec --contract eip155:31337/erc20:0x5FbDB2315678afecb367f032d93F642f64180aa3 --function balanceOf --args 0x6d4cc96bd9135c25cbcaa4d38a0b514798a60360

### Send 1234 tokens to address 0x6d4cc96bd9135c25cbcaa4d38a0b514798a60360 from alice (which is the signer)
yarn run oi exec --contract eip155:31337/erc20:0x5FbDB2315678afecb367f032d93F642f64180aa3 --signer=alice --function transfer --args 0x6d4cc96bd9135c25cbcaa4d38a0b514798a60360,1234

### The balance now reads as 1234
yarn run oi exec --contract eip155:31337/erc20:0x5FbDB2315678afecb367f032d93F642f64180aa3 --function balanceOf --args 0x6d4cc96bd9135c25cbcaa4d38a0b514798a60360
```

