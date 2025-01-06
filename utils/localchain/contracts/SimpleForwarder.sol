// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/metatx/ERC2771Forwarder.sol";

contract SimpleForwarder is ERC2771Forwarder {
    constructor() ERC2771Forwarder("MySignatureNamespace") {}
}
