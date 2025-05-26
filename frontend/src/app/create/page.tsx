"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProfileForm from "@/components/ProfileForm";
import WalletConnection from "@/components/WalletConnection";

export default function CreateProfilePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // This would be replaced with actual API call to mint the Profile NFT
      // and store the profile data
      console.log("Submitting profile data:", formData);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock successful response
      // In a real implementation, this would handle the NFT minting process

      // Redirect to the newly created profile
      // We're using a mock address here - in a real app, this would be the actual NFT address or user's wallet
      const mockProfileAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
      router.push(`/profile/${mockProfileAddress}`);
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
          <h1 className="text-3xl font-bold mb-2">Create Your Developer Profile</h1>
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
