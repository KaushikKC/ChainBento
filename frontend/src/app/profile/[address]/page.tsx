"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProfileCard from "@/components/ProfileCard";
import SupportModal from "@/components/SupportModal";
import WalletConnection from "@/components/WalletConnection";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";

// API base URL from environment variable or default to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
// This would come from your environment variables in a real app
const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x123456789...";

// Define the profile data interface to match the backend response
interface ProfileData {
  wallet: string;
  name: string;
  bio: string;
  profilePictureUrl: string;
  farcaster?: string;
  github?: string;
  twitter?: string;
  lens?: string;
  blog?: string;
  works?: {
    title: string;
    description: string;
    url: string;
  }[];
  supportCount: string;
  supporters: string[];
  contributionWallet?: string;
  profileNftTokenId?: number;
  lastUpdated: string;
}

// Interface for our component state
interface Profile {
  name: string;
  bio: string;
  profilePicture: string;
  github: string;
  twitter: string;
  farcaster: string;
  lens: string;
  blog: string;
  supportCount: number;
  visitCount: number;
  contributionWallet?: string;
  works: {
    title: string;
    description: string;
    url: string;
  }[];
  profileNftTokenId?: number;
}

export default function ProfilePage() {
  const { address } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSupportModalOpen, setSupportModalOpen] = useState(false);

  const { address: userAddress } = useAccount();
  const { authenticated } = usePrivy();

  // Convert to string if address is an array
  const profileAddress = Array.isArray(address) ? address[0] : address;
  const isOwnProfile =
    userAddress && userAddress.toLowerCase() === profileAddress?.toLowerCase();

  // Fetch profile data from the backend API
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/api/profile/${profileAddress}`
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const profileData: ProfileData = await response.json();

        // Map backend data to our frontend profile structure
        setProfile({
          name: profileData.name || "Anonymous Developer",
          bio: profileData.bio || "No bio provided",
          profilePicture:
            profileData.profilePictureUrl ||
            "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80",
          github: profileData.github || "",
          twitter: profileData.twitter || "",
          farcaster: profileData.farcaster || "",
          lens: profileData.lens || "",
          blog: profileData.blog || "",
          supportCount: parseInt(profileData.supportCount) || 0,
          visitCount: 0, // Not provided by API, could be tracked separately
          contributionWallet:
            profileData.contributionWallet || profileData.wallet,
          works: profileData.works || [],
          profileNftTokenId: profileData.profileNftTokenId,
        });

        // Log a profile visit (in a real app, you might want to do this only once per session)
        logProfileVisit(profileAddress);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (profileAddress) {
      fetchProfileData();
    }
  }, [profileAddress]);

  // Function to log a profile visit (could be implemented with a backend API call)
  const logProfileVisit = async (address: string) => {
    try {
      // In a complete implementation, you would make an API call here
      // Example: await fetch(`${API_BASE_URL}/api/profile/${address}/visit`, { method: 'POST' });
      console.log(`Visit logged for profile: ${address}`);
    } catch (err) {
      console.error("Failed to log profile visit:", err);
    }
  };

  // Handler for support button click
  const handleSupportClick = () => {
    if (!authenticated) {
      // Prompt user to connect wallet first
      alert("Please connect your wallet to support this developer.");
      return;
    }
    setSupportModalOpen(true);
  };

  const handleMintNFT = () => {
    if (!authenticated) {
      alert("Please connect your wallet first.");
      return;
    }
    // Redirect to the create page which has the minting flow
    window.location.href = "/create";
  };

  // Display loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Display error state
  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg">
          <h2 className="text-xl font-bold text-red-700 dark:text-red-200">
            Error Loading Profile
          </h2>
          <p className="text-red-700 dark:text-red-200">
            {error || "Profile not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with WalletConnection */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center">
              <span className="font-bold text-white">CB</span>
            </div>
            <span className="font-bold text-xl">ChainBento</span>
          </Link>

          {/* WalletConnection Component */}
          <WalletConnection />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card Section */}
          <div className="lg:col-span-1">
            <ProfileCard
              profile={profile}
              address={address as string}
              onSupportClick={handleSupportClick}
            />
          </div>

          {profile.profileNftTokenId ? (
            <div className="mt-4 bg-gray-800 border border-indigo-500 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-indigo-400 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-semibold text-indigo-300">
                  Verified Profile NFT
                </span>
              </div>
              <div className="text-sm text-gray-400">
                Token ID: {profile.profileNftTokenId}
              </div>
              <a
                href={`https://sepolia.basescan.org/nft/0x1011b31fcb82e77c5eab85b8090c63c3e8670c52/${profile.profileNftTokenId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 mt-2 inline-block"
              >
                View on Etherscan →
              </a>
            </div>
          ) : isOwnProfile ? (
            <div className="mt-4 bg-gray-900 border border-gray-700 rounded-lg p-4 text-center">
              <div className="text-gray-400 mb-3">
                You haven't minted your Profile NFT yet.
              </div>
              <button
                onClick={handleMintNFT}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white text-sm font-medium"
              >
                Mint Profile NFT
              </button>
            </div>
          ) : null}

          {/* Profile Details Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <p className="text-gray-300">{profile.bio}</p>
            </div>

            {/* Projects Section */}
            <div className="bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Top Projects</h2>

              {profile.works && profile.works.length > 0 ? (
                <div className="space-y-6">
                  {profile.works.map((work, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-700 pb-4 last:border-0 last:pb-0"
                    >
                      <h3 className="text-xl font-semibold">{work.title}</h3>
                      <p className="text-gray-300 mt-2">{work.description}</p>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {work.url && (
                          <a
                            href={work.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                            Visit Project
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-4">
                  No projects available.
                </p>
              )}
            </div>

            {/* Activity Section - could be expanded with actual on-chain activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Activity</h2>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="font-semibold text-xl">
                    {profile.supportCount}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">
                    Supporters
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-xl">
                    {profile.visitCount}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">
                    Profile Views
                  </span>
                </div>
              </div>
              {/* Recent support activity would go here */}
              <p className="text-gray-600 dark:text-gray-400 text-center mt-4">
                Recent support activity will appear here
              </p>
            </div>
          </div>
        </div>

        {/* Support Modal */}
        {isSupportModalOpen && (
          <SupportModal
            isOpen={isSupportModalOpen}
            onClose={() => setSupportModalOpen(false)}
            profileName={profile.name}
            profileAddress={address as string}
          />
        )}
      </div>
    </div>
  );
}
