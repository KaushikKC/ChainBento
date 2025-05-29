"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import SupportModal from "@/components/SupportModal";
import WalletConnection from "@/components/WalletConnection";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { isTouchDevice } from "@/utils/device";
import { useDataContext } from "@/context/DataContext";
import logo from "../../assests/ChainBentoLogo.png";
import { SignInButton, useProfile } from "@farcaster/auth-kit";

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
    id: string; // Added ID for drag and drop
    title: string;
    description: string;
    url: string;
  }[];
  profileNftTokenId?: number;
}

// Interface for the draggable project item
interface DraggableProjectProps {
  id: string;
  index: number;
  work: {
    id: string;
    title: string;
    description: string;
    url: string;
  };
  moveProject: (dragIndex: number, hoverIndex: number) => void;
  isEditable: boolean;
  onEdit: (id: string, field: string, value: string) => void;
  onDelete: (id: string) => void;
}

// Drag and drop types
const ItemTypes = {
  PROJECT: "project",
};

// Draggable Project Component
const DraggableProject = ({
  id,
  index,
  work,
  moveProject,
  isEditable,
  onEdit,
  onDelete,
}: DraggableProjectProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState<{
    title: boolean;
    description: boolean;
    url: boolean;
  }>({
    title: false,
    description: false,
    url: false,
  });

  // For editing fields
  const startEditing = (field: "title" | "description" | "url") => {
    if (!isEditable) return;
    setIsEditing({ ...isEditing, [field]: true });
  };

  const handleChange = (
    field: "title" | "description" | "url",
    value: string
  ) => {
    onEdit(id, field, value);
  };

  const stopEditing = () => {
    setIsEditing({ title: false, description: false, url: false });
  };

  // For drag and drop
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.PROJECT,
    item: { id, index },
    canDrag: isEditable,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.PROJECT,
    hover(item: { id: string; index: number }) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Move the item
      moveProject(dragIndex, hoverIndex);

      // Update the item's index for future drags
      item.index = hoverIndex;
    },
  });

  // Initialize drag and drop refs
  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`border border-gray-200 rounded-xl p-5 transition-all hover:shadow-md hover:border-blue-200 group ${
        isDragging ? "opacity-50" : ""
      } ${isEditable ? "cursor-move" : ""}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="flex justify-between items-start">
        {isEditing.title ? (
          <input
            type="text"
            value={work.title}
            onChange={(e) => handleChange("title", e.target.value)}
            onBlur={stopEditing}
            autoFocus
            className="text-xl font-semibold text-gray-800 bg-blue-50 p-1 rounded border border-blue-200 w-full"
          />
        ) : (
          <h3
            className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors"
            onClick={() => startEditing("title")}
          >
            {work.title}
            {isEditable && (
              <span className="ml-2 text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to edit
              </span>
            )}
          </h3>
        )}

        <div className="flex items-center">
          <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full mr-2">
            Project {index + 1}
          </span>

          {isEditable && (
            <button
              onClick={() => onDelete(id)}
              className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50"
              title="Delete project"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {isEditing.description ? (
        <textarea
          value={work.description}
          onChange={(e) => handleChange("description", e.target.value)}
          onBlur={stopEditing}
          autoFocus
          rows={3}
          className="text-gray-600 mt-3 w-full bg-blue-50 p-2 rounded border border-blue-200"
        />
      ) : (
        <p
          className="text-gray-600 mt-3"
          onClick={() => startEditing("description")}
        >
          {work.description}
          {isEditable && work.description && (
            <span className="ml-2 text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
              Click to edit
            </span>
          )}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        {isEditing.url ? (
          <div className="w-full">
            <input
              type="url"
              value={work.url}
              onChange={(e) => handleChange("url", e.target.value)}
              onBlur={stopEditing}
              autoFocus
              placeholder="https://example.com"
              className="px-4 py-2 bg-blue-50 rounded border border-blue-200 w-full"
            />
          </div>
        ) : (
          <>
            {work.url && (
              <a
                href={work.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition shadow-sm hover:shadow"
              >
                <svg
                  className="w-4 h-4 mr-2"
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

            {isEditable && (
              <button
                onClick={() => startEditing("url")}
                className="inline-flex items-center px-3 py-1 rounded-lg text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                {work.url ? "Edit Link" : "Add Link"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// EditableField component for inline editing
interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  isEditable: boolean;
  isMultiline?: boolean;
  placeholder?: string;
  className?: string;
}

const EditableField = ({
  value,
  onChange,
  isEditable,
  isMultiline = false,
  placeholder = "Click to edit",
  className = "",
}: EditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  const startEditing = () => {
    if (!isEditable) return;
    setIsEditing(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCurrentValue(e.target.value);
  };

  const stopEditing = () => {
    setIsEditing(false);
    onChange(currentValue);
  };

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  if (isEditing) {
    if (isMultiline) {
      return (
        <textarea
          value={currentValue}
          onChange={handleChange}
          onBlur={stopEditing}
          autoFocus
          rows={5}
          className={`p-3 bg-blue-50 rounded-lg border border-blue-200 w-full ${className}`}
        />
      );
    }

    return (
      <input
        type="text"
        value={currentValue}
        onChange={handleChange}
        onBlur={stopEditing}
        autoFocus
        className={`p-2 bg-blue-50 rounded-lg border border-blue-200 w-full ${className}`}
      />
    );
  }

  return (
    <div
      onClick={startEditing}
      className={`group ${
        isEditable
          ? "cursor-text hover:bg-blue-50 hover:rounded-lg hover:p-2 -m-2"
          : ""
      } ${className}`}
    >
      {value ||
        (isEditable && (
          <span className="italic text-gray-400">{placeholder}</span>
        ))}
      {isEditable && (
        <span className="ml-2 text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
          Click to edit
        </span>
      )}
    </div>
  );
};

export default function ProfilePage() {
  const { address } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [originalProfile, setOriginalProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSupportModalOpen, setSupportModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [step, setStep] = useState<"idle" | "confirming" | "success">("idle");
  const [mintError, setMintError] = useState<string | null>(null);
  const { getContractInstance } = useDataContext();
  const farcasterProfile = useProfile();
  const {
    isAuthenticated: isFarcasterAuthenticated,
    profile: farcasterProfileData,
  } = farcasterProfile;

  const { address: userAddress } = useAccount();
  const { authenticated } = usePrivy();

  // Convert to string if address is an array
  const profileAddress = Array.isArray(address) ? address[0] : address;
  const isOwnProfile =
    userAddress && userAddress.toLowerCase() === profileAddress?.toLowerCase();

  // Extract the fetchProfileData logic into a reusable function to call after minting
  const fetchProfileData = async (address: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/profile/${address}`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const profileData: ProfileData = await response.json();

      // Map backend data to our frontend profile structure with IDs for works
      const mappedProfile = {
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
        works: profileData.works
          ? profileData.works.map((work, index) => ({
              id: `work-${index}-${Date.now()}`, // Generate a unique ID
              title: work.title,
              description: work.description,
              url: work.url,
            }))
          : [],
        profileNftTokenId: profileData.profileNftTokenId,
      };

      setProfile(mappedProfile);
      setOriginalProfile(JSON.parse(JSON.stringify(mappedProfile))); // Deep copy for comparison

      // Log a profile visit (in a real app, you might want to do this only once per session)
      logProfileVisit(address);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError("Failed to load profile data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFarcasterAuthenticated && farcasterProfileData && isEditing) {
      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          farcaster: farcasterProfileData.username || prev.farcaster,
        };
      });
    }
  }, [isFarcasterAuthenticated, farcasterProfileData, isEditing]);

  // Add this function to disconnect Farcaster
  const disconnectFarcaster = () => {
    if (profile) {
      updateField("farcaster", "");
    }
  };

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

        // Map backend data to our frontend profile structure with IDs for works
        const mappedProfile = {
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
          works: profileData.works
            ? profileData.works.map((work, index) => ({
                id: `work-${index}-${Date.now()}`, // Generate a unique ID
                title: work.title,
                description: work.description,
                url: work.url,
              }))
            : [],
          profileNftTokenId: profileData.profileNftTokenId,
        };

        setProfile(mappedProfile);
        setOriginalProfile(JSON.parse(JSON.stringify(mappedProfile))); // Deep copy for comparison

        // Log a profile visit (in a real app, you might want to do this only once per session)
        logProfileVisit(profileAddress || "");
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

  // Check for changes when profile data is updated
  useEffect(() => {
    if (profile && originalProfile) {
      const profileString = JSON.stringify(profile);
      const originalString = JSON.stringify(originalProfile);
      setHasChanges(profileString !== originalString);
    } else {
      setHasChanges(false);
    }
  }, [profile, originalProfile]);

  // Handler for support button click
  const handleSupportClick = () => {
    if (!authenticated) {
      // Prompt user to connect wallet first
      alert("Please connect your wallet to support this developer.");
      return;
    }
    setSupportModalOpen(true);
  };

  // Define CONTRACT_ABI for the NFT minting functionality
  const CONTRACT_ABI = [
    "function mintProfileNFT() public returns (uint256)",
    "function profileNFTs(address) view returns (uint256)",
  ];

  // Implement the mintProfileNFT function
  const mintProfileNFT = async () => {
    if (!userAddress) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      setIsSubmitting(true);
      setMintError(null);

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
            wallet: userAddress,
          }),
        });
        console.log("NFT mint logged with backend");

        // Refresh profile data to update NFT status
        if (profileAddress) {
          fetchProfileData(profileAddress);
        }
      } catch (logErr) {
        console.error("Failed to log NFT mint with backend:", logErr);
        // Continue even if logging fails - the NFT is already minted
      }

      // Move to success step
      setStep("success");
    } catch (err: Error | unknown) {
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
                  wallet: userAddress,
                }),
              });
              console.log("NFT mint logged with backend despite error");

              // Refresh profile data to update NFT status
              if (profileAddress) {
                fetchProfileData(profileAddress);
              }
            } catch (logErr) {
              console.error("Failed to log NFT mint after error:", logErr);
            }
          }, 5000);

          // Show a modified error message but still show success
          setMintError(
            "There was an issue confirming your transaction, but it may have succeeded. Check your wallet for confirmation."
          );
          setStep("success");
        } catch {
          // Using catch without defining a variable avoids the unused variable warning
          setMintError(
            "Error minting NFT, but transaction was sent. Please check your wallet and try refreshing the page."
          );
        }
      } else {
        // Properly type check err to extract message safely
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to mint NFT. Please try again.";
        setMintError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit mode handlers
  const toggleEditMode = () => {
    if (isEditing && hasChanges) {
      // Confirm before discarding changes
      if (window.confirm("You have unsaved changes. Discard changes?")) {
        setProfile(JSON.parse(JSON.stringify(originalProfile))); // Reset to original
        setIsEditing(false);
      }
    } else {
      setIsEditing(!isEditing);
    }
  };

  // Save profile changes
  const saveChanges = async () => {
    if (!profile) return;

    setIsSaving(true);

    try {
      // Format the data for the API
      const updatedProfileData = {
        name: profile.name,
        bio: profile.bio,
        github: profile.github,
        twitter: profile.twitter,
        farcaster: profile.farcaster,
        lens: profile.lens,
        blog: profile.blog,
        works: profile.works.map((work) => ({
          title: work.title,
          description: work.description,
          url: work.url,
        })),
        contributionWallet: profile.contributionWallet,
      };

      // Make API request to update the profile
      const response = await fetch(
        `${API_BASE_URL}/api/profile/${profileAddress}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedProfileData),
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Update the original profile with the new data
      setOriginalProfile(JSON.parse(JSON.stringify(profile)));
      setIsEditing(false);
      setHasChanges(false);

      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Field update handlers
  const updateField = (field: keyof Profile, value: string) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  // Project handlers
  const addProject = () => {
    if (!profile) return;
    const newProject = {
      id: `work-${profile.works.length}-${Date.now()}`,
      title: "New Project",
      description: "Add a description of your project here",
      url: "",
    };
    setProfile({ ...profile, works: [...profile.works, newProject] });
  };

  const updateProject = (id: string, field: string, value: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      works: profile.works.map((work) =>
        work.id === id ? { ...work, [field]: value } : work
      ),
    });
  };

  const deleteProject = (id: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      works: profile.works.filter((work) => work.id !== id),
    });
  };

  const moveProject = (dragIndex: number, hoverIndex: number) => {
    if (!profile) return;
    const dragProject = profile.works[dragIndex];

    // Create a new array with the updated order
    const newWorks = [...profile.works];
    newWorks.splice(dragIndex, 1);
    newWorks.splice(hoverIndex, 0, dragProject);

    setProfile({ ...profile, works: newWorks });
  };

  // Display loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-50"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Display error state
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white p-8 rounded-xl shadow-md border border-red-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Error Loading Profile
              </h2>
            </div>
            <p className="text-gray-600 ml-15">
              {error || "Profile not found"}
            </p>
            <div className="mt-6">
              <Link
                href="/explore"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Explore
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Use the appropriate backend based on the device
  const DndBackend = isTouchDevice() ? TouchBackend : HTML5Backend;

  return (
    <DndProvider backend={DndBackend}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        {/* Header with WalletConnection */}
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md fixed top-0 w-full z-50 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-bold">
                <Image
                  src={logo}
                  alt="ChainBento Logo"
                  width={60}
                  height={15}
                  priority
                />
              </span>
            </Link>

            {/* WalletConnection Component */}
            <WalletConnection />
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 pt-24">
          {/* Edit Mode Controls - Only shown to profile owner */}
          {isOwnProfile && (
            <div className="mb-6 flex justify-end">
              <div className="flex items-center gap-4">
                {isEditing && hasChanges && (
                  <div className="text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-100">
                    You have unsaved changes
                  </div>
                )}

                {isEditing && (
                  <button
                    onClick={addProject}
                    className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 border border-blue-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Project
                  </button>
                )}

                {isEditing && hasChanges && (
                  <button
                    onClick={saveChanges}
                    disabled={isSaving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={toggleEditMode}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    isEditing
                      ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {isEditing ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    )}
                  </svg>
                  {isEditing ? "Cancel Editing" : "Edit Profile"}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Profile Card Section (Sticky) - Now only with profile picture, name and bio */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* Simplified Profile Card */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                  {/* Profile Picture and Address Section */}
                  <div className="relative">
                    <div className="h-28 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                    <div className="absolute -bottom-16 left-6">
                      <div className="rounded-full border-4 border-white shadow-md">
                        <Image
                          src={profile.profilePicture}
                          alt={profile.name}
                          width={96}
                          height={96}
                          className="rounded-full w-24 h-24 object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="pt-20 px-6 pb-6">
                    {/* Name */}
                    {isEditing ? (
                      <EditableField
                        value={profile.name}
                        onChange={(value) => updateField("name", value)}
                        isEditable={isEditing}
                        placeholder="Add your name"
                        className="text-2xl font-bold text-gray-800 mb-2"
                      />
                    ) : (
                      <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        {profile.name}
                      </h1>
                    )}

                    {/* Address */}
                    <div className="flex items-center text-gray-500 mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                      <span className="text-sm truncate">{profileAddress}</span>
                    </div>

                    {/* Bio */}
                    {isEditing ? (
                      <EditableField
                        value={profile.bio}
                        onChange={(value) => updateField("bio", value)}
                        isEditable={isEditing}
                        isMultiline={true}
                        placeholder="Add a bio to tell others about yourself"
                        className="text-gray-600 mb-6"
                      />
                    ) : (
                      <p className="text-gray-600 mb-6">{profile.bio}</p>
                    )}

                    {/* Support button */}
                    <button
                      onClick={handleSupportClick}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2 font-medium"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Support{" "}
                      {profile.supportCount > 0 && `(${profile.supportCount})`}
                    </button>
                  </div>
                </div>

                {/* NFT Card or Mint NFT button - conditional rendering based on profileNftTokenId */}
                {profile.profileNftTokenId ? (
                  <div className="bg-white rounded-xl border border-indigo-100 shadow-sm p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-indigo-600 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-semibold text-indigo-700">
                        Verified Profile NFT
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 bg-indigo-50 rounded-lg py-1 px-2 inline-block">
                      Token ID: {profile.profileNftTokenId}
                    </div>
                    <a
                      href={`https://sepolia.basescan.org/nft/0x1011b31fcb82e77c5eab85b8090c63c3e8670c52/${profile.profileNftTokenId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:text-indigo-800 mt-3 inline-flex items-center gap-1 font-medium"
                    >
                      <span>View on Etherscan</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                ) : isOwnProfile ? (
                  <div className="bg-white rounded-xl border border-indigo-100 shadow-sm p-4">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-indigo-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        <span className="font-semibold text-gray-800">
                          Mint Your Profile NFT
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 text-center mb-2">
                        Create a verified NFT for your profile to showcase your
                        ownership on-chain.
                      </p>

                      {mintError && (
                        <div className="bg-red-50 text-red-700 p-2 rounded-lg text-sm mb-2">
                          {mintError}
                        </div>
                      )}

                      {step === "success" ? (
                        <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-2 flex flex-col items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 mb-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <p>NFT minted successfully!</p>
                          {txHash && (
                            <a
                              href={`https://sepolia.basescan.org/tx/${txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline text-xs mt-1"
                            >
                              View transaction
                            </a>
                          )}
                          <button
                            onClick={() => window.location.reload()}
                            className="mt-2 text-xs bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors"
                          >
                            Refresh Page
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={mintProfileNFT}
                          disabled={isSubmitting}
                          className="w-full py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {isSubmitting ? (
                            <>
                              <svg
                                className="animate-spin h-4 w-4 mr-2 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              {step === "confirming"
                                ? "Confirming..."
                                : "Minting..."}
                            </>
                          ) : (
                            "Mint Profile NFT"
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Right Column: Social Links, Projects and Activity */}
            <div className="lg:col-span-2 space-y-8">
              {/* Social Links Section as Cards */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                    Connect
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Twitter Card */}
                  {(profile.twitter || isEditing) && (
                    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-blue-500"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                            </svg>
                          </div>
                          <span className="font-medium text-gray-800">
                            Twitter
                          </span>
                        </div>
                        {isEditing && (
                          <button
                            onClick={() => updateField("twitter", "")}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                      {isEditing ? (
                        <EditableField
                          value={profile.twitter}
                          onChange={(value) => updateField("twitter", value)}
                          isEditable={true}
                          placeholder="Add your Twitter handle"
                          className="text-gray-700"
                        />
                      ) : profile.twitter ? (
                        <a
                          href={`https://twitter.com/${profile.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 font-medium"
                        >
                          {profile.twitter}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">
                          Not provided
                        </span>
                      )}
                    </div>
                  )}

                  {/* GitHub Card */}
                  {(profile.github || isEditing) && (
                    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 p-2 rounded-full">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-800"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                          </div>
                          <span className="font-medium text-gray-800">
                            GitHub
                          </span>
                        </div>
                        {isEditing && (
                          <button
                            onClick={() => updateField("github", "")}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                      {isEditing ? (
                        <EditableField
                          value={profile.github}
                          onChange={(value) => updateField("github", value)}
                          isEditable={true}
                          placeholder="Add your GitHub handle"
                          className="text-gray-700"
                        />
                      ) : profile.github ? (
                        <a
                          href={`https://github.com/${profile.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 font-medium"
                        >
                          {profile.github}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">
                          Not provided
                        </span>
                      )}
                    </div>
                  )}

                  {/* Farcaster Card */}
                  {(profile.farcaster || isEditing) && (
                    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-100 p-2 rounded-full">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 256 256"
                              fill="none"
                            >
                              <rect
                                width="256"
                                height="256"
                                rx="56"
                                fill="#7C65C1"
                              ></rect>
                              <path
                                d="M183.296 71.68H211.968L207.872 94.208H200.704V180.224L201.02 180.232C204.266 180.396 206.848 183.081 206.848 186.368V191.488L207.164 191.496C210.41 191.66 212.992 194.345 212.992 197.632V202.752H155.648V197.632C155.648 194.345 158.229 191.66 161.476 191.496L161.792 191.488V186.368C161.792 183.081 164.373 180.396 167.62 180.232L167.936 180.224V138.24C167.936 116.184 150.056 98.304 128 98.304C105.944 98.304 88.0638 116.184 88.0638 138.24V180.224L88.3798 180.232C91.6262 180.396 94.2078 183.081 94.2078 186.368V191.488L94.5238 191.496C97.7702 191.66 100.352 194.345 100.352 197.632V202.752H43.0078V197.632C43.0078 194.345 45.5894 191.66 48.8358 191.496L49.1518 191.488V186.368C49.1518 183.081 51.7334 180.396 54.9798 180.232L55.2958 180.224V94.208H48.1278L44.0318 71.68H72.7038V54.272H183.296V71.68Z"
                                fill="white"
                              ></path>
                            </svg>
                          </div>
                          <span className="font-medium text-gray-800">
                            Farcaster
                          </span>
                        </div>
                        {isEditing && (
                          <button
                            onClick={() => updateField("farcaster", "")}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          {!isFarcasterAuthenticated ? (
                            <div className="flex-grow bg-purple-50 p-2 rounded-lg">
                              <SignInButton onSignOut={disconnectFarcaster} />
                            </div>
                          ) : (
                            <div className="flex-grow">
                              <div className="flex items-center gap-2">
                                <EditableField
                                  value={profile.farcaster}
                                  onChange={(value) =>
                                    updateField("farcaster", value)
                                  }
                                  isEditable={true}
                                  placeholder="Add your Farcaster handle"
                                  className="text-gray-700 flex-grow"
                                />
                                <button
                                  onClick={disconnectFarcaster}
                                  className="text-sm px-2 py-1 bg-gray-100 rounded-md text-gray-600 hover:bg-gray-200"
                                >
                                  Disconnect
                                </button>
                              </div>
                              <div className="mt-2 p-2 bg-green-50 rounded-lg">
                                <p className="text-xs text-green-600">
                                  Connected as @{farcasterProfileData?.username}
                                  {farcasterProfileData?.fid &&
                                    `(FID: ${farcasterProfileData.fid})`}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : profile.farcaster ? (
                        <a
                          href={`https://farcaster.xyz/${profile.farcaster}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-800 transition-colors flex items-center gap-1 font-medium"
                        >
                          {profile.farcaster}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">
                          Not provided
                        </span>
                      )}
                    </div>
                  )}
                  {/* Lens Card */}
                  {(profile.lens || isEditing) && (
                    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 p-2 rounded-full">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-green-600"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm-5-7h2a3 3 0 006 0h2a5 5 0 01-10 0z" />
                            </svg>
                          </div>
                          <span className="font-medium text-gray-800">
                            Lens
                          </span>
                        </div>
                        {isEditing && (
                          <button
                            onClick={() => updateField("lens", "")}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                      {isEditing ? (
                        <EditableField
                          value={profile.lens}
                          onChange={(value) => updateField("lens", value)}
                          isEditable={true}
                          placeholder="Add your Lens handle"
                          className="text-gray-700"
                        />
                      ) : profile.lens ? (
                        <a
                          href={`https://hey.xyz/u/${profile.lens}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800 transition-colors flex items-center gap-1 font-medium"
                        >
                          {profile.lens}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">
                          Not provided
                        </span>
                      )}
                    </div>
                  )}

                  {/* Blog Card */}
                  {(profile.blog || isEditing) && (
                    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-yellow-100 p-2 rounded-full">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-yellow-600"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M19.903 8.586a.997.997 0 00-.196-.293l-6-6a.997.997 0 00-.293-.196c-.03-.014-.062-.022-.094-.033a.991.991 0 00-.259-.051C13.04 2.011 13.021 2 13 2H6c-1.103 0-2 .897-2 2v16c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2V9c0-.021-.011-.04-.013-.062a.952.952 0 00-.051-.259c-.01-.032-.019-.063-.033-.093zM16.586 8H14V5.414L16.586 8zM6 20V4h6v5a1 1 0 001 1h5l.001 10H6z" />
                            </svg>
                          </div>
                          <span className="font-medium text-gray-800">
                            Blog
                          </span>
                        </div>
                        {isEditing && (
                          <button
                            onClick={() => updateField("blog", "")}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                      {isEditing ? (
                        <EditableField
                          value={profile.blog}
                          onChange={(value) => updateField("blog", value)}
                          isEditable={true}
                          placeholder="Add your blog URL"
                          className="text-gray-700"
                        />
                      ) : profile.blog ? (
                        <a
                          href={
                            profile.blog.startsWith("http")
                              ? profile.blog
                              : `https://${profile.blog}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-yellow-600 hover:text-yellow-800 transition-colors flex items-center gap-1 font-medium"
                        >
                          {profile.blog
                            .replace(/^https?:\/\//, "")
                            .replace(/\/$/, "")}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">
                          Not provided
                        </span>
                      )}
                    </div>
                  )}

                  {/* Add Social Link Button */}
                  {isEditing && (
                    <div className="flex justify-center">
                      <div className="dropdown inline-block relative">
                        <button className="px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1 border border-gray-200 shadow-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          Add Social Link
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Projects Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      Projects
                    </h2>
                    <div className="text-sm text-gray-500">
                      {profile.works.length}{" "}
                      {profile.works.length === 1 ? "project" : "projects"}
                    </div>
                  </div>

                  {profile.works.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-gray-400 mx-auto mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        No projects yet
                      </h3>
                      <p className="text-gray-600 max-w-sm mx-auto">
                        {isOwnProfile
                          ? "Start showcasing your work by adding projects to your profile."
                          : "This developer hasn't added any projects yet."}
                      </p>
                      {isOwnProfile && isEditing && (
                        <button
                          onClick={addProject}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Add Your First Project
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {profile.works.map((work, index) => (
                        <DraggableProject
                          key={work.id}
                          id={work.id}
                          index={index}
                          work={work}
                          moveProject={moveProject}
                          isEditable={isEditing}
                          onEdit={updateProject}
                          onDelete={deleteProject}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Activity Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Recent Activity
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-green-100 p-2 rounded-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-800">
                          Profile was created
                          <span className="text-gray-500 ml-2 text-sm">
                            {/* This would use a proper date formatting in production */}
                            {new Date().toLocaleDateString()}
                          </span>
                        </p>
                      </div>
                    </div>
                    {profile.supportCount > 0 && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-800">
                            Received {profile.supportCount}{" "}
                            {profile.supportCount === 1
                              ? "support"
                              : "supports"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Support Modal */}
        {isSupportModalOpen && (
          <SupportModal
            isOpen={isSupportModalOpen}
            profileName={profile.name}
            profileAddress={profileAddress!}
            contributionWallet={profile.contributionWallet || profileAddress!}
            onClose={() => setSupportModalOpen(false)}
          />
        )}
      </div>
    </DndProvider>
  );
}
