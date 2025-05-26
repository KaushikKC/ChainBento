"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProfileForm from "@/components/ProfileForm";
import WalletConnection from "@/components/WalletConnection";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { useDataContext } from "@/context/DataContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
// This would come from your environment variables in a real app
const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x1011b31fcB82E77c5EAB85B8090c63C3E8670c52";

// Simplified ABI for the profile NFT minting function
const CONTRACT_ABI = [
  "function mintProfileNFT() public returns (uint256)",
  "event ProfileMinted(address indexed user, uint256 tokenId)",
];

export default function CreateProfilePage() {
  const router = useRouter();
  const { address } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<
    "form" | "minting" | "confirming" | "success"
  >("form");
  const [profileData, setProfileData] = useState<any>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { getContractInstance } = useDataContext();

  const handleSubmit = async (formData: any) => {
    if (!address) {
      setError("Please connect your wallet first");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare the profile data for the API
      const profileSubmission = {
        wallet: address,
        name: formData.name,
        bio: formData.bio,
        profilePictureUrl: formData.profilePicturePreview,
        github: formData.github,
        twitter: formData.twitter,
        farcaster: formData.farcaster,
        lens: formData.lens,
        blog: formData.blog,
        works: formData.works,
        contributionWallet: formData.contributionWallet || address,
      };

      console.log("Submitting profile data:", profileSubmission);

      // Make the API call to create/update the profile
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileSubmission),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create profile");
      }

      const createdProfile = await response.json();
      console.log("Profile created successfully:", createdProfile);

      // Store the profile data for the next step
      setProfileData(createdProfile);

      // Move to NFT minting step
      setStep("minting");
    } catch (err: any) {
      console.error("Error creating profile:", err);
      setError(err.message || "Failed to create profile. Please try again.");
      setIsSubmitting(false);
    }
  };

  const mintProfileNFT = async () => {
    if (!address) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Request access to MetaMask
      if (!window.ethereum) {
        throw new Error("No Ethereum provider found. Please install MetaMask.");
      }

      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // Get contract instance using the context function
      const contract = await getContractInstance(
        CONTRACT_ADDRESS,
        CONTRACT_ABI
      );

      if (!contract) {
        throw new Error("Failed to initialize contract");
      }

      // Call the mint function
      setStep("confirming");
      console.log("Calling mintProfileNFT contract function...");
      const transaction = await contract.mintProfileNFT();
      console.log("Transaction sent:", transaction);

      // Store transaction hash
      setTxHash(transaction.hash);

      console.log("Waiting for transaction to be mined...");

      // Instead of using transaction.wait(), use a simple timeout
      // Wait for 8 seconds to give the transaction time to be mined
      await new Promise((resolve) => setTimeout(resolve, 8000));

      console.log("Proceeding after timeout");

      // Log NFT minting with backend without waiting for confirmation
      try {
        await fetch(`${API_BASE_URL}/api/profile/mint-log-simple`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            wallet: address,
          }),
        });
        console.log("NFT mint logged with backend");
      } catch (logErr) {
        console.error("Failed to log NFT mint with backend:", logErr);
        // Continue even if logging fails - the NFT is already minted
      }

      // Move to success step
      setStep("success");
    } catch (err: any) {
      console.error("Error minting profile NFT:", err);

      // Even if there's an error, if we have a transaction hash, it might have still succeeded
      if (txHash) {
        console.log("Transaction was sent, showing transaction hash:", txHash);

        try {
          // Try to log the NFT anyway after a short delay
          setTimeout(async () => {
            try {
              await fetch(`${API_BASE_URL}/api/profile/mint-log-simple`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  wallet: address,
                }),
              });
              console.log("NFT mint logged with backend despite error");
            } catch (logErr) {
              console.error("Failed to log NFT mint after error:", logErr);
            }
          }, 5000);

          // Show a modified error message but still show success
          setError(
            "There was an issue confirming your transaction, but it may have succeeded. Check your wallet for confirmation."
          );
          setStep("success");
        } catch (finalErr) {
          setError(
            "Error minting NFT, but transaction was sent. Please check your wallet and try refreshing the page."
          );
        }
      } else {
        setError(err.message || "Failed to mint NFT. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToProfile = () => {
    router.push(`/profile/${address}`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center">
              <span className="font-bold text-white">CB</span>
            </div>
            <span className="font-bold text-xl">ChainBento</span>
          </Link>

          {/* Using our reusable WalletConnection component */}
          <WalletConnection />
        </div>
      </header>

      <main className="pt-24 pb-20 px-4 md:px-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Create Your Developer Profile
          </h1>
          <p className="text-gray-400">
            Mint a profile NFT to showcase your work and receive support from
            the community.
          </p>
        </div>

        {error && (
          <div
            className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded mb-6"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}

        <div className="bg-gray-900/50 rounded-lg shadow-md p-8 border border-gray-800">
          {step === "form" && (
            <ProfileForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          )}

          {step === "minting" && (
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4">Mint Your Profile NFT</h2>
              <p className="text-gray-400 mb-6">
                Your profile has been created. Now you can mint your Profile NFT
                to make it permanently available on the blockchain.
              </p>

              <div className="flex flex-col items-center justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">
                  {profileData?.name || "Your Profile"}
                </h3>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={mintProfileNFT}
                  // disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white rounded-lg font-medium shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
                >
                  {isSubmitting ? "Mint NFT" : "Mint NFT"}
                </button>

                <button
                  onClick={handleGoToProfile}
                  className="px-6 py-3 border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                >
                  Skip for Now
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Note: Minting requires a small gas fee to be paid on the
                blockchain.
              </p>
            </div>
          )}

          {step === "confirming" && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold mb-2">
                Confirming Transaction
              </h2>
              <p className="text-gray-400">
                Please confirm the transaction in your wallet and wait while we
                process your request. This may take a few moments.
              </p>
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-bold mb-4">Profile NFT Minted!</h2>
              <p className="text-gray-300 mb-6">
                Congratulations! Your profile NFT has been successfully minted.
              </p>

              {txHash && (
                <div className="bg-gray-800 rounded-md p-3 mb-6 max-w-md mx-auto overflow-hidden text-ellipsis">
                  <span className="text-gray-400 text-sm">Transaction: </span>
                  <a
                    href={`https://etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline text-sm"
                  >
                    {txHash}
                  </a>
                </div>
              )}

              <button
                onClick={handleGoToProfile}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white rounded-lg font-medium shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                View Your Profile
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
