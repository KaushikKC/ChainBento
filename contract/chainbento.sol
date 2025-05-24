// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ChainBentoProfileRegistry is
    ERC721,
    ERC721URIStorage,
    Ownable,
    ReentrancyGuard
{
    using Counters for Counters.Counter;

    Counters.Counter private _profileIds;
    Counters.Counter private _endorsementIds;

    // Profile structure
    struct Profile {
        address owner;
        string name;
        string bio;
        string imageURI;
        string github;
        string twitter;
        string farcaster;
        string blog;
        string[] projects;
        uint256 totalSupport;
        uint256 supportCount;
        uint256 createdAt;
        bool exists;
    }

    // Support/Tip structure
    struct Support {
        address supporter;
        address profileOwner;
        uint256 amount;
        address tokenAddress; // address(0) for ETH
        string message;
        uint256 timestamp;
    }

    // Endorsement NFT structure
    struct Endorsement {
        uint256 profileId;
        address endorser;
        string messageURI;
        uint256 timestamp;
    }

    // Mappings
    mapping(address => uint256) public addressToProfileId;
    mapping(uint256 => Profile) public profiles;
    mapping(uint256 => Endorsement) public endorsements;
    mapping(address => Support[]) public userSupports;
    mapping(address => uint256[]) public profileEndorsements;

    // Events
    event ProfileCreated(
        uint256 indexed profileId,
        address indexed owner,
        string name
    );
    event ProfileUpdated(uint256 indexed profileId, address indexed owner);
    event ProfileSupported(
        address indexed supporter,
        address indexed profileOwner,
        uint256 amount,
        address tokenAddress
    );
    event EndorsementMinted(
        uint256 indexed endorsementId,
        uint256 indexed profileId,
        address indexed endorser
    );

    // Platform fee (in basis points, 100 = 1%)
    uint256 public platformFee = 250; // 2.5%
    address public feeRecipient;

    constructor(address _feeRecipient) ERC721("ChainBento Profile", "CBP") {
        feeRecipient = _feeRecipient;
    }

    // Create a new profile and mint profile NFT
    function createProfile(
        string memory _name,
        string memory _bio,
        string memory _imageURI,
        string memory _github,
        string memory _twitter,
        string memory _farcaster,
        string memory _blog,
        string[] memory _projects
    ) external {
        require(addressToProfileId[msg.sender] == 0, "Profile already exists");
        require(bytes(_name).length > 0, "Name cannot be empty");

        _profileIds.increment();
        uint256 newProfileId = _profileIds.current();

        Profile storage newProfile = profiles[newProfileId];
        newProfile.owner = msg.sender;
        newProfile.name = _name;
        newProfile.bio = _bio;
        newProfile.imageURI = _imageURI;
        newProfile.github = _github;
        newProfile.twitter = _twitter;
        newProfile.farcaster = _farcaster;
        newProfile.blog = _blog;
        newProfile.projects = _projects;
        newProfile.totalSupport = 0;
        newProfile.supportCount = 0;
        newProfile.createdAt = block.timestamp;
        newProfile.exists = true;

        addressToProfileId[msg.sender] = newProfileId;

        // Mint profile NFT
        _safeMint(msg.sender, newProfileId);

        emit ProfileCreated(newProfileId, msg.sender, _name);
    }

    // Update existing profile
    function updateProfile(
        string memory _name,
        string memory _bio,
        string memory _imageURI,
        string memory _github,
        string memory _twitter,
        string memory _farcaster,
        string memory _blog,
        string[] memory _projects
    ) external {
        uint256 profileId = addressToProfileId[msg.sender];
        require(profileId > 0, "Profile does not exist");
        require(profiles[profileId].owner == msg.sender, "Not profile owner");

        Profile storage profile = profiles[profileId];
        profile.name = _name;
        profile.bio = _bio;
        profile.imageURI = _imageURI;
        profile.github = _github;
        profile.twitter = _twitter;
        profile.farcaster = _farcaster;
        profile.blog = _blog;
        profile.projects = _projects;

        emit ProfileUpdated(profileId, msg.sender);
    }

    // Support a profile with ETH
    function supportProfile(
        address _profileOwner,
        string memory _message
    ) external payable nonReentrant {
        require(msg.value > 0, "Support amount must be greater than 0");
        uint256 profileId = addressToProfileId[_profileOwner];
        require(profileId > 0, "Profile does not exist");
        require(_profileOwner != msg.sender, "Cannot support your own profile");

        uint256 fee = (msg.value * platformFee) / 10000;
        uint256 supportAmount = msg.value - fee;

        // Update profile support stats
        profiles[profileId].totalSupport += supportAmount;
        profiles[profileId].supportCount += 1;

        // Record support
        Support memory newSupport = Support({
            supporter: msg.sender,
            profileOwner: _profileOwner,
            amount: supportAmount,
            tokenAddress: address(0), // ETH
            message: _message,
            timestamp: block.timestamp
        });

        userSupports[_profileOwner].push(newSupport);

        // Transfer funds
        if (fee > 0) {
            payable(feeRecipient).transfer(fee);
        }
        payable(_profileOwner).transfer(supportAmount);

        emit ProfileSupported(
            msg.sender,
            _profileOwner,
            supportAmount,
            address(0)
        );
    }

    // Support a profile with ERC20 tokens
    function supportProfileWithToken(
        address _profileOwner,
        address _tokenAddress,
        uint256 _amount,
        string memory _message
    ) external nonReentrant {
        require(_amount > 0, "Support amount must be greater than 0");
        uint256 profileId = addressToProfileId[_profileOwner];
        require(profileId > 0, "Profile does not exist");
        require(_profileOwner != msg.sender, "Cannot support your own profile");

        IERC20 token = IERC20(_tokenAddress);
        require(
            token.transferFrom(msg.sender, address(this), _amount),
            "Token transfer failed"
        );

        uint256 fee = (_amount * platformFee) / 10000;
        uint256 supportAmount = _amount - fee;

        // Update profile support stats (convert to ETH equivalent for ranking)
        profiles[profileId].totalSupport += supportAmount; // Note: In production, use oracle for conversion
        profiles[profileId].supportCount += 1;

        // Record support
        Support memory newSupport = Support({
            supporter: msg.sender,
            profileOwner: _profileOwner,
            amount: supportAmount,
            tokenAddress: _tokenAddress,
            message: _message,
            timestamp: block.timestamp
        });

        userSupports[_profileOwner].push(newSupport);

        // Transfer tokens
        if (fee > 0) {
            require(token.transfer(feeRecipient, fee), "Fee transfer failed");
        }
        require(
            token.transfer(_profileOwner, supportAmount),
            "Support transfer failed"
        );

        emit ProfileSupported(
            msg.sender,
            _profileOwner,
            supportAmount,
            _tokenAddress
        );
    }

    // Mint endorsement NFT
    function mintEndorsementNFT(
        address _profileOwner,
        string memory _messageURI
    ) external returns (uint256) {
        uint256 profileId = addressToProfileId[_profileOwner];
        require(profileId > 0, "Profile does not exist");
        require(_profileOwner != msg.sender, "Cannot endorse your own profile");

        _endorsementIds.increment();
        uint256 newEndorsementId = _endorsementIds.current();

        Endorsement storage newEndorsement = endorsements[newEndorsementId];
        newEndorsement.profileId = profileId;
        newEndorsement.endorser = msg.sender;
        newEndorsement.messageURI = _messageURI;
        newEndorsement.timestamp = block.timestamp;

        profileEndorsements[_profileOwner].push(newEndorsementId);

        // Mint endorsement NFT to the endorser
        _safeMint(msg.sender, newEndorsementId);
        _setTokenURI(newEndorsementId, _messageURI);

        emit EndorsementMinted(newEndorsementId, profileId, msg.sender);

        return newEndorsementId;
    }

    // View functions
    function getProfile(address _owner) external view returns (Profile memory) {
        uint256 profileId = addressToProfileId[_owner];
        require(profileId > 0, "Profile does not exist");
        return profiles[profileId];
    }

    function getProfileById(
        uint256 _profileId
    ) external view returns (Profile memory) {
        require(
            _profileId > 0 && _profileId <= _profileIds.current(),
            "Invalid profile ID"
        );
        return profiles[_profileId];
    }

    function getSupportCount(
        address _profileOwner
    ) external view returns (uint256) {
        uint256 profileId = addressToProfileId[_profileOwner];
        if (profileId == 0) return 0;
        return profiles[profileId].supportCount;
    }

    function getTotalSupport(
        address _profileOwner
    ) external view returns (uint256) {
        uint256 profileId = addressToProfileId[_profileOwner];
        if (profileId == 0) return 0;
        return profiles[profileId].totalSupport;
    }

    function getProfileSupports(
        address _profileOwner
    ) external view returns (Support[] memory) {
        return userSupports[_profileOwner];
    }

    function getProfileEndorsements(
        address _profileOwner
    ) external view returns (uint256[] memory) {
        return profileEndorsements[_profileOwner];
    }

    function getEndorsement(
        uint256 _endorsementId
    ) external view returns (Endorsement memory) {
        return endorsements[_endorsementId];
    }

    function getTotalProfiles() external view returns (uint256) {
        return _profileIds.current();
    }

    function getTotalEndorsements() external view returns (uint256) {
        return _endorsementIds.current();
    }

    // Get top profiles by support (for leaderboard)
    function getTopProfilesBySupport(
        uint256 _limit
    ) external view returns (address[] memory, uint256[] memory) {
        uint256 totalProfiles = _profileIds.current();
        require(_limit > 0 && _limit <= totalProfiles, "Invalid limit");

        address[] memory topAddresses = new address[](_limit);
        uint256[] memory topSupport = new uint256[](_limit);

        // Simple sorting (in production, consider using a more efficient approach)
        for (uint256 i = 1; i <= totalProfiles; i++) {
            Profile memory profile = profiles[i];

            // Find position to insert
            for (uint256 j = 0; j < _limit; j++) {
                if (profile.totalSupport > topSupport[j]) {
                    // Shift elements
                    for (uint256 k = _limit - 1; k > j; k--) {
                        topAddresses[k] = topAddresses[k - 1];
                        topSupport[k] = topSupport[k - 1];
                    }
                    // Insert new element
                    topAddresses[j] = profile.owner;
                    topSupport[j] = profile.totalSupport;
                    break;
                }
            }
        }

        return (topAddresses, topSupport);
    }

    // Admin functions
    function setPlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee cannot exceed 10%"); // Max 10%
        platformFee = _newFee;
    }

    function setFeeRecipient(address _newRecipient) external onlyOwner {
        require(_newRecipient != address(0), "Invalid recipient");
        feeRecipient = _newRecipient;
    }

    // Override functions
    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
