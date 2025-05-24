"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";

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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Create Your Developer Profile
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
            Mint a profile NFT to showcase your work and receive support from
            the community.
          </p>

          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
              role="alert"
            >
              <p>{error}</p>
            </div>
          )}

          <ProfileForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </div>
    </div>
  );
}
