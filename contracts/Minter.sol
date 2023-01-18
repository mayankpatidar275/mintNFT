//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Minter is ERC721URIStorage {

    // Owner of the platform
    address payable owner;

    //The structure to store info about a minted token
    struct ListedToken {
        uint256 tokenId;
        address payable owner;
    }

    //This mapping maps tokenId to token info and is helpful when retrieving details 
    // about a tokenId
    mapping(uint256 => ListedToken) private idToListedToken;

    constructor() ERC721("NFTMarketplace", "NFTM") {
        owner = payable(msg.sender);
    }

    // minting NFT

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    function NFTminter(string memory tokenUri, address payable _recieverAdd)
        public
    {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _safeMint(_recieverAdd, newItemId);
        _setTokenURI(newItemId, tokenUri);

        //Update the mapping of tokenId's to Token details, useful for retrieval functions
        idToListedToken[newItemId] = ListedToken(
            newItemId,
            _recieverAdd
        );
    }

}