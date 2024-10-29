import { useABI, useProtocol } from "@openibex/chain";
import { USDCircleAbi } from "./abi";
import { OiUSDCircleProtocol } from "./protocol";

export { OiUSDCircleProtocol } from "./protocol";

useABI('eip155', 'usd-circle', USDCircleAbi);
useProtocol('usd-circle', {eip155: 'usd-circle', solana: 'usd-circle', hedera: 'usd-circle'}, OiUSDCircleProtocol);
