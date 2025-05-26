"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProfileForm from "@/components/ProfileForm";
import WalletConnection from "@/components/WalletConnection";
import { useAccount } from "wagmi";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function CreateProfilePage() {
  const router = useRouter();
  const { address } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: any) => {
    if (!address) {
      setError("Please connect your wallet first");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare the profile data for the API
      const profileData = {
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

      console.log("Submitting profile data:", profileData);

      // Make the API call to create/update the profile
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create profile");
      }

      const createdProfile = await response.json();
      console.log("Profile created successfully:", createdProfile);

      // In a production app, this is where you would handle minting the NFT
      // by calling a smart contract function
      // For now, we'll just redirect to the profile page

      // Redirect to the newly created profile using the wallet address
      router.push(`/profile/${address}`);
    } catch (err: any) {
      console.error("Error creating profile:", err);
      setError(err.message || "Failed to create profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
          <ProfileForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </main>
    </div>
  );
}
