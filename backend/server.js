const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { ethers } = require("ethers");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("Connected to MongoDB"));

// MongoDB Schemas

// Work Schema (for nested documents)
const workSchema = new mongoose.Schema({
  title: String,
  description: String,
  url: String,
});

const userProfileSchema = new mongoose.Schema({
  wallet: { type: String, required: true, unique: true },
  name: String,
  bio: String,
  avatar: String,
  farcaster: String,
  github: String,
  twitter: String,
  lens: String, // Added lens field
  blog: String,
  profilePictureUrl: String, // Added for profile picture URL
  works: [workSchema], // Changed from projects to works array with proper schema
  profileNftTokenId: Number,
  supportCount: { type: Number, default: 0 },
  contributionWallet: String, // Added contribution wallet field
  lastUpdated: { type: Date, default: Date.now },
});
const UserProfile = mongoose.model("UserProfile", userProfileSchema);

const supportLogSchema = new mongoose.Schema({
  supporter: { type: String, required: true },
  recipient: { type: String, required: true },
  amount: { type: Number, required: true },
  txHash: { type: String, required: true },
  messageIpfs: String,
  timestamp: { type: Date, default: Date.now },
});
const SupportLog = mongoose.model("SupportLog", supportLogSchema);

// Initialize provider and contract
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  [
    "function getSupportCount(address) view returns (uint256)",
    "function getSupporters(address) view returns (address[])",
    "function profileNFTs(address) view returns (uint256)",
    "event Supported(address indexed supporter, address indexed creator, uint256 amount)",
    "event ProfileMinted(address indexed user, uint256 tokenId)",
    "event EndorsementMinted(address indexed from, address indexed to, uint256 tokenId)",
  ],
  provider
);

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Helper function to verify transaction
async function verifyTransaction(txHash, expectedType, expectedParams = {}) {
  try {
    // Get transaction receipt
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt || !receipt.status) {
      return { verified: false, reason: "Transaction failed or not found" };
    }

    // Parse logs based on transaction type
    let verified = false;
    let eventData = null;

    // Loop through logs and find matching event
    for (const log of receipt.logs) {
      // Skip logs from other contracts
      if (
        log.address.toLowerCase() !== process.env.CONTRACT_ADDRESS.toLowerCase()
      ) {
        continue;
      }

      try {
        const parsedLog = contract.interface.parseLog(log);

        if (!parsedLog) continue;

        // Check for specific event types
        if (expectedType === "support" && parsedLog.name === "Supported") {
          // Verify supporter and recipient addresses
          const supporter = parsedLog.args.supporter.toLowerCase();
          const recipient = parsedLog.args.creator.toLowerCase();

          if (
            supporter === expectedParams.supporter.toLowerCase() &&
            recipient === expectedParams.recipient.toLowerCase()
          ) {
            verified = true;
            eventData = {
              supporter,
              recipient,
              amount: parsedLog.args.amount.toString(),
            };
            break;
          }
        } else if (
          expectedType === "profileNFT" &&
          parsedLog.name === "ProfileMinted"
        ) {
          // Verify user address
          const user = parsedLog.args.user.toLowerCase();

          if (user === expectedParams.user.toLowerCase()) {
            verified = true;
            eventData = {
              user,
              tokenId: parsedLog.args.tokenId.toString(),
            };
            break;
          }
        } else if (
          expectedType === "endorsement" &&
          parsedLog.name === "EndorsementMinted"
        ) {
          // Verify from and to addresses
          const from = parsedLog.args.from.toLowerCase();
          const to = parsedLog.args.to.toLowerCase();

          if (
            from === expectedParams.from.toLowerCase() &&
            to === expectedParams.to.toLowerCase()
          ) {
            verified = true;
            eventData = {
              from,
              to,
              tokenId: parsedLog.args.tokenId.toString(),
            };
            break;
          }
        }
      } catch (error) {
        console.error("Error parsing log:", error);
        // Continue to next log even if this one fails to parse
      }
    }

    return {
      verified,
      data: eventData,
      receipt,
    };
  } catch (error) {
    console.error("Error verifying transaction:", error);
    return { verified: false, reason: "Error verifying transaction" };
  }
}

// 1. POST /api/profile - Create/update user profile
app.post("/api/profile", async (req, res) => {
  try {
    const {
      wallet,
      name,
      bio,
      profilePictureUrl, // Changed from avatar to profilePictureUrl to match frontend
      farcaster,
      github,
      twitter,
      lens, // Added lens field
      blog,
      works, // Changed from projects to works
      contributionWallet, // Added contribution wallet
    } = req.body;

    if (!ethers.isAddress(wallet)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    const profileData = {
      wallet: ethers.getAddress(wallet),
      name,
      bio,
      profilePictureUrl, // Changed from avatar to profilePictureUrl
      farcaster,
      github,
      twitter,
      lens,
      blog,
      works, // Added works array
      contributionWallet,
      lastUpdated: new Date(),
    };

    const existingProfile = await UserProfile.findOne({
      wallet: profileData.wallet,
    });

    if (existingProfile) {
      // Update existing profile
      const updatedProfile = await UserProfile.findOneAndUpdate(
        { wallet: profileData.wallet },
        profileData,
        { new: true }
      );
      res.json(updatedProfile);
    } else {
      // Create new profile
      const newProfile = new UserProfile(profileData);
      await newProfile.save();
      res.status(201).json(newProfile);
    }
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Failed to process profile" });
  }
});

// 2. GET /api/profile/:address - Fetch profile
app.get("/api/profile/:address", async (req, res) => {
  try {
    const { address } = req.params;

    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    // Get from MongoDB
    const profile = await UserProfile.findOne({
      wallet: ethers.getAddress(address),
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Get on-chain data
    const onChainSupportCount = await contract.getSupportCount(address);
    const supporters = await contract.getSupporters(address);

    // Combine off-chain and on-chain data
    const response = {
      ...profile.toObject(),
      supportCount: onChainSupportCount.toString(),
      supporters: supporters.map((addr) => addr.toLowerCase()),
    };

    res.json(response);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// 3. GET /api/profiles/trending - Trending profiles
app.get("/api/profiles/trending", async (req, res) => {
  try {
    // Get top 10 profiles by support count (from MongoDB)
    const trendingProfiles = await UserProfile.find()
      .sort({ supportCount: -1 })
      .limit(10)
      .lean();

    // Enrich with on-chain data
    const enrichedProfiles = await Promise.all(
      trendingProfiles.map(async (profile) => {
        const supporters = await contract.getSupporters(profile.wallet);
        return {
          ...profile,
          supporters: supporters.map((addr) => addr.toLowerCase()),
          supportCount: (
            await contract.getSupportCount(profile.wallet)
          ).toString(),
        };
      })
    );

    res.json(enrichedProfiles);
  } catch (error) {
    console.error("Trending profiles error:", error);
    res.status(500).json({ error: "Failed to fetch trending profiles" });
  }
});

// 4. POST /api/farcaster/verify - Verify Farcaster
app.post("/api/farcaster/verify", async (req, res) => {
  try {
    const { wallet, farcasterUsername, signature } = req.body;

    // In a real implementation, you would verify the signature here
    // This is a simplified version

    await UserProfile.findOneAndUpdate(
      { wallet: ethers.getAddress(wallet) },
      {
        farcaster: {
          username: farcasterUsername,
          verified: true,
        },
        lastUpdated: new Date(),
      }
    );

    res.json({ success: true, message: "Farcaster verified" });
  } catch (error) {
    console.error("Farcaster verify error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

// 5. POST /api/verify/transaction - Verify a blockchain transaction
app.post("/api/verify/transaction", async (req, res) => {
  try {
    const { txHash, type, params } = req.body;

    if (!txHash) {
      return res.status(400).json({ error: "Transaction hash is required" });
    }

    if (!type || !["support", "profileNFT", "endorsement"].includes(type)) {
      return res.status(400).json({ error: "Invalid transaction type" });
    }

    const verification = await verifyTransaction(txHash, type, params);

    if (!verification.verified) {
      return res.status(400).json({
        error: "Transaction verification failed",
        reason: verification.reason,
      });
    }

    res.json({
      success: true,
      verified: true,
      data: verification.data,
    });
  } catch (error) {
    console.error("Transaction verification error:", error);
    res.status(500).json({ error: "Failed to verify transaction" });
  }
});

// 6. POST /api/support/log - Log support action from frontend transaction
app.post("/api/profile/mint-log-simple", async (req, res) => {
  try {
    const { wallet } = req.body;

    if (!ethers.isAddress(wallet)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    // Call the profileNFTs function directly to get token ID
    console.log(`Getting token ID for wallet: ${wallet}`);
    const tokenId = await contract.profileNFTs(wallet);
    console.log(`Retrieved token ID: ${tokenId.toString()}`);

    // Update profile with token ID
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { wallet: ethers.getAddress(wallet) },
      {
        profileNftTokenId: tokenId.toString(),
        lastUpdated: new Date(),
      },
      { new: true }
    );

    if (!updatedProfile) {
      // Create minimal profile if one doesn't exist
      const newProfile = new UserProfile({
        wallet: ethers.getAddress(wallet),
        profileNftTokenId: tokenId.toString(),
        lastUpdated: new Date(),
      });
      await newProfile.save();

      return res.status(201).json({
        success: true,
        profile: newProfile,
        nft: {
          tokenId: tokenId.toString(),
        },
      });
    }

    res.json({
      success: true,
      profile: updatedProfile,
      nft: {
        tokenId: tokenId.toString(),
      },
    });
  } catch (error) {
    console.error("Simplified NFT minting log error:", error);
    res
      .status(500)
      .json({ error: "Failed to log profile NFT: " + error.message });
  }
});

// 7. POST /api/profile/mint-log - Log profile NFT minting from frontend
app.post("/api/profile/mint-log", async (req, res) => {
  try {
    const { wallet, txHash } = req.body;

    if (!ethers.isAddress(wallet)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    if (!txHash) {
      return res.status(400).json({ error: "Transaction hash is required" });
    }

    // Verify the transaction happened on-chain
    const verification = await verifyTransaction(txHash, "profileNFT", {
      user: wallet,
    });

    if (!verification.verified) {
      return res.status(400).json({
        error: "Invalid or unconfirmed transaction",
        details: verification.reason,
      });
    }

    const tokenId = verification.data.tokenId;

    // Update profile with token ID
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { wallet: ethers.getAddress(wallet) },
      {
        profileNftTokenId: tokenId,
        lastUpdated: new Date(),
      },
      { new: true }
    );

    if (!updatedProfile) {
      // Create minimal profile if one doesn't exist
      const newProfile = new UserProfile({
        wallet: ethers.getAddress(wallet),
        profileNftTokenId: tokenId,
        lastUpdated: new Date(),
      });
      await newProfile.save();

      return res.status(201).json({
        success: true,
        profile: newProfile,
        nft: {
          tokenId,
          txHash,
        },
      });
    }

    res.json({
      success: true,
      profile: updatedProfile,
      nft: {
        tokenId,
        txHash,
      },
    });
  } catch (error) {
    console.error("NFT minting log error:", error);
    res.status(500).json({ error: "Failed to log profile NFT minting" });
  }
});

// 8. POST /api/endorsement/log - Log endorsement from frontend
app.post("/api/endorsement/log", async (req, res) => {
  try {
    const { from, to, txHash } = req.body;

    if (!ethers.isAddress(from) || !ethers.isAddress(to)) {
      return res.status(400).json({ error: "Invalid addresses" });
    }

    if (!txHash) {
      return res.status(400).json({ error: "Transaction hash is required" });
    }

    // Verify the transaction happened on-chain
    const verification = await verifyTransaction(txHash, "endorsement", {
      from,
      to,
    });

    if (!verification.verified) {
      return res.status(400).json({
        error: "Invalid or unconfirmed transaction",
        details: verification.reason,
      });
    }

    // In a more complete implementation, you might store endorsement data
    // For now, we just return success and the verified data

    res.json({
      success: true,
      endorsement: {
        from: ethers.getAddress(from),
        to: ethers.getAddress(to),
        tokenId: verification.data.tokenId,
        txHash,
      },
    });
  } catch (error) {
    console.error("Endorsement log error:", error);
    res.status(500).json({ error: "Failed to log endorsement" });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
