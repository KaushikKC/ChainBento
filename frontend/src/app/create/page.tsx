"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProfileForm from "@/components/ProfileForm";
import WalletConnection from "@/components/WalletConnection";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { CheckCircleIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

// Define API base URL - replace with your actual API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Define steps for the creation process
const steps = [
  { name: "Connect Wallet", description: "Connect your wallet to continue" },
  { name: "Create Profile", description: "Fill out your profile information" },
  {
    name: "Publish On-Chain",
    description: "Sign transaction to publish your profile",
  },
];

interface ProfileFormData {
  name: string;
  bio: string;
  profilePicturePreview?: string;
  github?: string;
  twitter?: string;
  farcaster?: string;
  lens?: string;
  blog?: string;
  works?: Array<{
    title: string;
    description: string;
    url: string;
  }>;
  contributionWallet?: string;
}

interface CreatedProfile extends ProfileFormData {
  wallet: string;
  txHash?: string;
  profileNftTokenId?: number;
}

export default function CreateProfilePage() {
  const router = useRouter();
  const { address } = useAccount();
  const { authenticated } = usePrivy();

  // State management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"connect" | "form" | "publish" | "minting">(
    authenticated ? "form" : "connect"
  );
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  // const [createdProfile, setCreatedProfile] = useState<CreatedProfile | null>(
  //   null
  // );

  useEffect(() => {
    // If the user is authenticated, skip the connect step
    if (authenticated) {
      setStep("form");
    }
  }, [authenticated]);

  // Handle form submission
  const handleSubmit = async (formData: ProfileFormData) => {
    if (!address) {
      setError("Please connect your wallet first");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare the profile data for the API
      const profileSubmission: Omit<
        CreatedProfile,
        "txHash" | "profileNftTokenId"
      > = {
        wallet: address,
        name: formData.name,
        bio: formData.bio,
        profilePicturePreview: formData.profilePicturePreview, // Changed from profilePictureUrl to match the interface
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

      const responseData = await response.json();
      const createdProfileData = responseData as CreatedProfile;
      console.log("Profile created successfully:", createdProfileData);

      // Store the profile data for the next step (if needed)
      // setCreatedProfile(createdProfileData);

      // Move to NFT minting step
      setStep("minting");

      // If there's a transaction hash in the response
      if (createdProfileData?.txHash) {
        setTxHash(createdProfileData.txHash);
        // Redirect to profile page after successful submission
        setTimeout(() => {
          router.push(`/profile/${address}`);
        }, 3000);
      }
    } catch (error: unknown) {
      console.error("Error creating profile:", error);

      // Handle different error types properly
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to create profile. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Back Button */}
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Home
          </Link>
          {/* Wallet Connection */}
          <WalletConnection />
        </div>

        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Create Your Profile
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Set up your profile to showcase your work, connect with others, and
            participate in the ecosystem.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto mb-12">
          <ol className="flex items-center w-full">
            {steps.map((s, i) => {
              // Determine step status
              let status: "upcoming" | "current" | "complete" = "upcoming";
              if (
                (step === "connect" && i === 0) ||
                (step === "form" && i === 1) ||
                (step === "publish" && i === 2)
              ) {
                status = "current";
              } else if (
                (step === "form" && i === 0) ||
                (step === "publish" && i === 0) ||
                (step === "publish" && i === 1)
              ) {
                status = "complete";
              }

              return (
                <li
                  key={s.name}
                  className={`flex items-center ${
                    i < steps.length - 1
                      ? "w-full after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:mx-6 after:inline-block"
                      : "flex-1"
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0 ${
                        status === "complete"
                          ? "bg-blue-600 text-white"
                          : status === "current"
                          ? "bg-blue-100 text-blue-600 ring-2 ring-blue-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {status === "complete" ? (
                        <CheckCircleIcon className="w-6 h-6" />
                      ) : (
                        <span className="text-lg font-semibold">{i + 1}</span>
                      )}
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium ${
                        status === "complete"
                          ? "text-blue-600"
                          : status === "current"
                          ? "text-blue-600"
                          : "text-gray-500"
                      }`}
                    >
                      {s.name}
                    </span>
                    <span className="text-xs mt-1 text-gray-500 hidden sm:block">
                      {s.description}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Connect Wallet Step */}
          {step === "connect" && !authenticated && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="text-center space-y-6">
                <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-blue-600"
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
                <h2 className="text-2xl font-semibold text-gray-800">
                  Connect Your Wallet
                </h2>
                <p className="text-gray-600">
                  To create a profile, please connect your wallet first. This
                  will be used to sign your profile creation transaction.
                </p>
                <div className="pt-4">
                  <WalletConnection />
                </div>
              </div>
            </div>
          )}

          {/* Form Step */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            {step === "form" && (
              <ProfileForm
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            )}

            {/* Publishing Step */}
            {step === "publish" && (
              <div className="text-center space-y-6 py-8">
                {isSubmitting ? (
                  <>
                    <div className="mx-auto w-24 h-24 flex items-center justify-center">
                      <ArrowPathIcon className="w-16 h-16 text-blue-500 animate-spin" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800">
                      Publishing Profile
                    </h2>
                    <p className="text-gray-600">
                      Your profile is being published to the blockchain. This
                      may take a moment...
                    </p>
                  </>
                ) : txHash ? (
                  <>
                    <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="w-16 h-16 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800">
                      Profile Created!
                    </h2>
                    <p className="text-gray-600">
                      Your profile has been successfully created and published
                      to the blockchain.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-sm font-medium text-gray-700">
                        Transaction Hash:
                      </p>
                      <p className="text-sm text-gray-500 break-all">
                        {txHash}
                      </p>
                    </div>
                    <div className="pt-4">
                      <Link
                        href={`/profile/${address}`}
                        className="inline-flex px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                      >
                        View Your Profile
                      </Link>
                    </div>
                  </>
                ) : error ? (
                  <>
                    <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800">
                      Error
                    </h2>
                    <div className="bg-red-50 text-red-800 p-4 rounded-lg">
                      {error}
                    </div>
                    <div className="pt-4">
                      <button
                        onClick={() => setStep("form")}
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                      >
                        Back to Form
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
