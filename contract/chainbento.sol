// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ChainBentoEnhanced is ERC721URIStorage {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIds;

    // Core mappings from original contract
    mapping(address => uint256) public profileNFTs;
    mapping(address => uint256) public supportCount;
    mapping(address => address[]) public supporters;

    // New mappings for name support
    mapping(string => bool) public usedNames;
    mapping(uint256 => string) public tokenIdToName;
    mapping(string => address) public nameToOwner;

    // Events
    event ProfileMinted(address indexed user, uint256 tokenId, string name);
    event Supported(
        address indexed supporter,
        address indexed creator,
        uint256 amount
    );
    event EndorsementMinted(
        address indexed from,
        address indexed to,
        uint256 tokenId
    );

    constructor() ERC721("ChainBentoProfile", "CBP") {}

    // Original function - maintained for backward compatibility
    function mintProfileNFT() external returns (uint256) {
        require(profileNFTs[msg.sender] == 0, "Already has profile NFT");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(msg.sender, newTokenId);
        profileNFTs[msg.sender] = newTokenId;

        emit ProfileMinted(msg.sender, newTokenId, "");
        return newTokenId;
    }

    // New function with name support
    function mintProfileNFTWithName(
        string memory name
    ) external returns (uint256) {
        require(profileNFTs[msg.sender] == 0, "Already has profile NFT");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(!usedNames[name], "Name already taken");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(msg.sender, newTokenId);
        profileNFTs[msg.sender] = newTokenId;

        // Store name associations
        usedNames[name] = true;
        tokenIdToName[newTokenId] = name;
        nameToOwner[name] = msg.sender;

        emit ProfileMinted(msg.sender, newTokenId, name);
        return newTokenId;
    }

    // Modified support function to allow using names
    function support(address creator) external payable {
        require(msg.value > 0, "Must send ETH to support");
        require(profileNFTs[creator] != 0, "Creator has no profile");
        require(creator != msg.sender, "Cannot support yourself");

        supportCount[creator] += 1;
        supporters[creator].push(msg.sender);

        payable(creator).transfer(msg.value);
        emit Supported(msg.sender, creator, msg.value);
    }

    // Additional function to support by name
    function supportByName(string memory creatorName) external payable {
        address creator = nameToOwner[creatorName];
        require(creator != address(0), "Creator name not found");
        require(msg.value > 0, "Must send ETH to support");
        require(creator != msg.sender, "Cannot support yourself");

        supportCount[creator] += 1;
        supporters[creator].push(msg.sender);

        payable(creator).transfer(msg.value);
        emit Supported(msg.sender, creator, msg.value);
    }

    function mintEndorsement(address to) external {
        require(profileNFTs[to] != 0, "Recipient has no profile");
        require(to != msg.sender, "Cannot endorse yourself");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(msg.sender, newTokenId);
        emit EndorsementMinted(msg.sender, to, newTokenId);
    }

    // Utility functions
    function getSupporters(
        address profileOwner
    ) external view returns (address[] memory) {
        return supporters[profileOwner];
    }

    function getSupportCount(
        address profileOwner
    ) external view returns (uint256) {
        return supportCount[profileOwner];
    }

    function getProfileOwnerByName(
        string memory name
    ) external view returns (address) {
        return nameToOwner[name];
    }

    function getProfileNameByAddress(
        address owner
    ) external view returns (string memory) {
        uint256 tokenId = profileNFTs[owner];
        require(tokenId != 0, "No profile NFT found");
        return tokenIdToName[tokenId];
    }
}
