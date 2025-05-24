const { ethers } = require("ethers");
require("dotenv").config();

// Initialize provider and contract
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Main support contract
const supportContract = new ethers.Contract(
  process.env.SUPPORT_CONTRACT_ADDRESS,
  [
    // Read functions
    "function getSupportCount(address) view returns (uint256)",
    "function getSupporters(address) view returns (address[])",

    // Write functions
    "function supportCreator(address recipient) payable",
    "function supportCreatorWithMessage(address recipient, string memory messageHash) payable",
  ],
  signer
);

// NFT Profile contract
const profileNftContract = new ethers.Contract(
  process.env.PROFILE_NFT_CONTRACT_ADDRESS,
  [
    "function mintProfileNFT(address recipient) returns (uint256)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function tokenURI(uint256 tokenId) view returns (string)",
  ],
  signer
);

/**
 * Get on-chain data for a profile
 * @param {string} address - Wallet address
 * @returns {Promise<Object>} Support count and supporters
 */
async function getProfileOnChainData(address) {
  try {
    const supportCount = await supportContract.getSupportCount(address);
    const supporters = await supportContract.getSupporters(address);

    return {
      supportCount: supportCount.toString(),
      supporters: supporters.map((addr) => addr.toLowerCase()),
    };
  } catch (error) {
    console.error("Error fetching on-chain profile data:", error);
    throw error;
  }
}

/**
 * Mint a profile NFT for a user
 * @param {string} recipient - Recipient wallet address
 * @returns {Promise<Object>} Transaction details and token ID
 */
async function mintProfileNFT(recipient) {
  try {
    const tx = await profileNftContract.mintProfileNFT(recipient);
    const receipt = await tx.wait();

    // Parse logs to find the minted token ID
    // This assumes the contract emits an event with the token ID
    // The exact implementation depends on your contract's events

    // Example log parsing (adjust based on your contract's event structure)
    const event = receipt.logs
      .filter(
        (log) =>
          log.address.toLowerCase() ===
          process.env.PROFILE_NFT_CONTRACT_ADDRESS.toLowerCase()
      )
      .map((log) => profileNftContract.interface.parseLog(log))
      .find((event) => event.name === "ProfileNFTMinted");

    const tokenId = event ? event.args.tokenId.toString() : null;

    return {
      txHash: receipt.hash,
      tokenId,
      success: true,
    };
  } catch (error) {
    console.error("Error minting profile NFT:", error);
    throw error;
  }
}

/**
 * Support a creator with ETH
 * @param {Object} params - Support parameters
 * @param {string} params.supporter - Supporter wallet address
 * @param {string} params.recipient - Recipient wallet address
 * @param {string} params.amount - Amount in ETH as string
 * @param {string} params.messageIpfs - Optional IPFS hash of the message
 * @returns {Promise<Object>} Transaction details
 */
async function supportCreator({ supporter, recipient, amount, messageIpfs }) {
  try {
    const amountWei = ethers.parseEther(amount);

    let tx;
    if (messageIpfs) {
      tx = await supportContract.supportCreatorWithMessage(
        recipient,
        messageIpfs,
        { value: amountWei }
      );
    } else {
      tx = await supportContract.supportCreator(recipient, {
        value: amountWei,
      });
    }

    const receipt = await tx.wait();

    return {
      txHash: receipt.hash,
      success: true,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.error("Error supporting creator:", error);
    throw error;
  }
}

module.exports = {
  getProfileOnChainData,
  mintProfileNFT,
  supportCreator,
};
