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
const userProfileSchema = new mongoose.Schema({
  wallet: { type: String, required: true, unique: true },
  name: String,
  bio: String,
  avatar: String,
  farcaster: {
    username: String,
    verified: Boolean,
  },
  github: String,
  twitter: String,
  blog: String,
  profileNftTokenId: Number,
  supportCount: { type: Number, default: 0 },
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

// 1. POST /api/profile - Create/update user profile
app.post("/api/profile", async (req, res) => {
  try {
    const { wallet, name, bio, avatar, farcaster, github, twitter, blog } =
      req.body;

    if (!ethers.isAddress(wallet)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    const profileData = {
      wallet: ethers.getAddress(wallet),
      name,
      bio,
      avatar,
      farcaster,
      github,
      twitter,
      blog,
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

    // Combine off-chain and on-chain data
    const response = {
      ...profile.toObject(),
      supportCount: onChainSupportCount.toString(),
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

// 5. POST /api/support/log - Log support action
app.post("/api/support/log", async (req, res) => {
  try {
    const { supporter, recipient, amount, txHash, messageIpfs } = req.body;

    if (!ethers.isAddress(supporter) || !ethers.isAddress(recipient)) {
      return res.status(400).json({ error: "Invalid addresses" });
    }

    // Create support log
    const supportLog = new SupportLog({
      supporter: ethers.getAddress(supporter),
      recipient: ethers.getAddress(recipient),
      amount,
      txHash,
      messageIpfs,
    });

    await supportLog.save();

    // Update recipient's support count in MongoDB
    await UserProfile.findOneAndUpdate(
      { wallet: ethers.getAddress(recipient) },
      { $inc: { supportCount: 1 } }
    );

    res.status(201).json(supportLog);
  } catch (error) {
    console.error("Support log error:", error);
    res.status(500).json({ error: "Failed to log support" });
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
