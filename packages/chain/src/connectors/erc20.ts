import { ERC20abi } from "../abi/erc20.abi";
import { OiConnector, OiConnectorConf } from "./connector";
import { useContractConnector } from "./connectors";
import { AssetArtifact, lookupCaipTag } from "../resolver";
import { useABI } from "../contracts";
import { coreApp } from "../plugin";
import { AccountId } from "caip";
import { OiChainTokenSupply } from "../primitives/supply";
import { EventLog } from "ethers";

/**
 * The OiErc20Connector is listening to the standard events of ERC20 and creates a few primitives:
 * - Supply: All mints and burns, new supply and tries of all minters and burners in that block and whole chain.
 * - Transfers: Transfer volumes, all senders and recipients in that block and on chain until block.
 * - Holders: All holders in that block and on-chain as trie. As well a holders table that represents latest status.
 *
 */
export class OiErc20 extends OiConnector {

  constructor(assetArtifact: AssetArtifact, params: OiConnectorConf) {
    super(assetArtifact, params);
    super.addPrimitive('Transfer', new OiChainTokenSupply(assetArtifact, params?.index));
  }

  public async init() {
    super.initPrimitives('Transfer');

    super.index('Transfer', async (from: string, to: string, amount: bigint, event: EventLog) => {
      await super.saveBlock('Transfer', event.blockNumber);
      
      const fromAccount = new AccountId({chainId: this.assetArtifact.chainId, address: from});
      const toAccount = new AccountId({chainId: this.assetArtifact.chainId, address: to});

      const [caipTagFrom, caipTagTo] = await super.tagAndResolve(fromAccount, toAccount);
      
      coreApp.log.info(`ERC20 transfer ${amount}, ${fromAccount.toString()}, ${toAccount.toString()}`);

      await super.addLog('Transfer', { block: event.blockNumber, caipTagFrom, caipTagTo, amount, event});

      coreApp.log.info(`ERC20 transfer CAIP-Tags from ${caipTagFrom} (${fromAccount.toString()}), to ${caipTagTo} (${fromAccount.toString()})`);
      coreApp.log.info(`ERC20 transfer looking up addresses: ${await lookupCaipTag(caipTagFrom)} (${caipTagFrom}), ${await lookupCaipTag(caipTagTo)} (${caipTagTo})`);
    }, 
    20740100 );
  }
}

await useContractConnector('erc20', OiErc20, 'eip155');
await useABI('eip155', 'erc20', ERC20abi);
