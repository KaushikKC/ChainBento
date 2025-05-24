"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import ProfileCard from "@/components/ProfileCard";
import SupportModal from "@/components/SupportModal";

interface Project {
  name: string;
  description: string;
  githubUrl: string;
  demoUrl: string;
}

interface Profile {
  name: string;
  bio: string;
  profilePicture: string;
  github: string;
  twitter: string;
  farcaster: string;
  lens: string;
  blog: string;
  projects: Project[];
  contributionWallet?: string;
  supportCount: number;
  visitCount: number;
}

export default function ProfilePage() {
  const { address } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSupportModalOpen, setSupportModalOpen] = useState(false);

  useEffect(() => {
    // Mock data - replace with actual API call to fetch profile data
    const fetchProfile = async () => {
      try {
        // In a real implementation, you would fetch the profile data from your backend/blockchain
        // Example: const response = await fetch(`/api/profiles/${address}`);

        // Mock data for demonstration
        const mockProfile: Profile = {
          name: "John Developer",
          bio: "Full-stack blockchain developer passionate about Web3",
          profilePicture:
            "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80",
          github: "https://github.com/johndeveloper",
          twitter: "https://twitter.com/johndeveloper",
          farcaster: "https://farcaster.xyz/u/johndeveloper",
          lens: "https://lens.xyz/johndeveloper",
          blog: "https://johndeveloper.com",
          projects: [
            {
              name: "DeFi Dashboard",
              description:
                "A comprehensive dashboard for DeFi portfolio tracking",
              githubUrl: "https://github.com/johndeveloper/defi-dashboard",
              demoUrl: "https://defi-dashboard.example.com",
            },
            {
              name: "NFT Marketplace",
              description: "A marketplace for creating and trading NFTs",
              githubUrl: "https://github.com/johndeveloper/nft-marketplace",
              demoUrl: "https://nft-marketplace.example.com",
            },
            {
              name: "DAO Governance Tool",
              description: "A tool for managing DAO proposals and voting",
              githubUrl: "https://github.com/johndeveloper/dao-governance",
              demoUrl: "https://dao-governance.example.com",
            },
          ],
          contributionWallet: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
          supportCount: 42,
          visitCount: 1337,
        };

        setProfile(mockProfile);

        // Increment visit count (would be handled by the backend in a real implementation)
        // await fetch(`/api/profiles/${address}/visit`, { method: 'POST' });
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [address]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
        <p className="text-gray-600">
          The profile you are looking for does not exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card Section */}
        <div className="lg:col-span-1">
          <ProfileCard
            profile={profile}
            address={address as string}
            onSupportClick={() => setSupportModalOpen(true)}
          />
        </div>

        {/* Profile Details Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">About</h2>
            <p className="text-gray-700 dark:text-gray-300">{profile.bio}</p>
          </div>

          {/* Projects Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Top Projects</h2>
            <div className="space-y-6">
              {profile.projects.map((project, index) => (
                <div
                  key={index}
                  className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0"
                >
                  <h3 className="text-xl font-semibold">{project.name}</h3>
                  <p className="text-gray-700 dark:text-gray-300 mt-2">
                    {project.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                      GitHub
                    </a>
                    <a
                      href={project.demoUrl}
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
                      Live Demo
                    </a>
                  </div>
                </div>
              ))}
            </div>
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
  );
}
