// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import {ERC721URIStorage, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract DummyNFT is ERC721, ERC2771Context {
    // Counter for token IDs
    uint256 private _tokenIdCounter;

    // Mapping to store additional metadata (uint256) for each token
    mapping(uint256 => uint256) private tokenData;

    // Event to emit the original sender, token ID, and metadata value
    event DummyEvent(address indexed user, uint256 tokenId, uint256 value);

    // Constructor initializes the ERC-721 and sets the trusted forwarder
    constructor(address trustedForwarder)
        ERC721("DummyNFT", "DNFT")
        ERC2771Context(trustedForwarder)
    {}

    // DANGERZONE This is highly insecure and should never be used in production!!!!
    // This allows everybody to mint (for easy testing openibex)

    function mint(address to, uint256 tokenId) external {
      _mint(to, tokenId);
    }

    // Override `_msgSender` and `_msgData` for compatibility with ERC2771Context
    function _msgSender() internal view override(Context, ERC2771Context) returns (address sender) {
        return ERC2771Context._msgSender();
    }

    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    function _contextSuffixLength() internal view override(Context, ERC2771Context) returns (uint256) {
        return ERC2771Context._contextSuffixLength();
    }

    

}
