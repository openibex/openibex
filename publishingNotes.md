# Publishing packages (internal use!)

We have a monorepo structure, hence use lerna to publish. At the moment, publishing is done manually,
later this will be automated by pushing a tag and using github actions. This still requires unit-testing to not publish BS.

1. We stick to the semantic versioning.
   1. All packages will always have the same version number.
   1. The published commit will be tagged as `vX.Y.Z` in this repository, if the version number is `X.Y.Z`
   1. Later we will automate publishing based on this git-tag
1. Ensure your versions in packages/*/package.json are what you want to publish
1. Run `npx lerna run build` (or `yarn build` for convenience)
1. Check status of changes via `npx lerna changed`
1. It is a good idea to check the packages locally before with boilerplate (TODO!) and `npm link`
1. If boilerplate and all tests look fine, use `npx lerna publish`.
   1. You may need to `npm login` before.

## Testing commands (for now)

```bash
# Core: Set, get and delete values.
$> yarn oi value set value.name value
$> yarn oi value get value.name
$> yarn oi value del value.name

# Core: Watch 
# Watch takes any exec or value command and executes it in intervals.
# The command has to be quoted.
$> yarn oi exec watch --seconds 2 watch --blocks 2 --network eip155:1 "value get testval --tag 3"
# Get an account balance at every second block:
$>watch --blocks 2 --network eip155:1 "exec eip155:31337/erc20:0x5FbDB2315678afecb367f032d93F642f64180aa3 balanceOf 0x6d4cc96bd9135c25cbcaa4d38a0b514798a60360"

# Test function calls and execution.
$> yarn oi exec eip155:31337/erc20:0x5FbDB2315678afecb367f032d93F642f64180aa3 balanceOf 0x6d4cc96bd9135c25cbcaa4d38a0b514798a60360
# Use a wallet.
$> yarn oi exec --wallet default eip155:31337/erc20:0x5FbDB2315678afecb367f032d93F642f64180aa3 balanceOf 0x6d4cc96bd9135c25cbcaa4d38a0b514798a60360

# Starts a protocol scraper on all available networks.
# Alternative protocol: Token - for any token contract.
# Do multiple times and check the block status. It should
# continue where you stopped it.
$> yarn oi protocol usd-circle --scrape

# Connects to a contract and dumps all events from startblock.
yarn oi connect eip155:1/erc20:0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 --block 6082465
```
