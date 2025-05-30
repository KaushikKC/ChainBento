"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WalletConnection from "@/components/WalletConnection";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import logo from "./../assests/ChainBentoLogo.png";

// API base URL from environment variable or default to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Profile {
  address: string;
  name: string;
  bio: string;
  profilePicture: string;
  supportCount: number;
  visitCount: number;
  github?: string;
  twitter?: string;
  wallet?: string;
  profilePictureUrl?: string;
  works?: {
    title: string;
    description: string;
    url: string;
  }[];
  farcaster?: string;
  lens?: string;
  blog?: string;
  supporters?: string[];
  lastUpdated?: string;
}

interface ProfileApiResponse {
  wallet: string;
  name?: string;
  bio?: string;
  profilePictureUrl?: string;
  farcaster?: string;
  github?: string;
  twitter?: string;
  lens?: string;
  blog?: string;
  works?: Array<{
    title: string;
    description: string;
    url: string;
  }>;
  supportCount: string;
  supporters: string[];
  lastUpdated: string;
  profileNftTokenId?: number;
  contributionWallet?: string;
}

enum SortBy {
  SUPPORT_COUNT = "supportCount",
  VISIT_COUNT = "visitCount",
  RECENT = "recent",
}

export default function ExplorePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SortBy>(SortBy.SUPPORT_COUNT);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(false);

  const router = useRouter();
  const { address } = useAccount();
  const { authenticated } = usePrivy();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all profiles from the backend
        const response = await fetch(`${API_BASE_URL}/api/profiles/trending`);

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const profileData: ProfileApiResponse[] = await response.json();

        // Transform the data to match our expected format
        const transformedProfiles: Profile[] = profileData.map((profile) => ({
          address: profile.wallet,
          name: profile.name || "Anonymous Developer",
          bio: profile.bio || "No bio provided",
          profilePicture:
            profile.profilePictureUrl ||
            "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80",
          supportCount: parseInt(profile.supportCount) || 0,
          visitCount: 0, // This isn't tracked in the backend yet
          github: profile.github || "",
          twitter: profile.twitter || "",
          farcaster: profile.farcaster || "",
          lens: profile.lens || "",
          blog: profile.blog || "",
          works: profile.works || [],
          wallet: profile.wallet,
          supporters: profile.supporters || [],
          lastUpdated: profile.lastUpdated,
        }));

        setProfiles(transformedProfiles);
        sortAndFilterProfiles(transformedProfiles, activeTab, searchQuery);
      } catch (error) {
        console.error("Error fetching profiles:", error);
        setError("Failed to load profiles. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  // Check if user has a profile when wallet is connected
  useEffect(() => {
    const checkUserProfile = async () => {
      if (authenticated && address) {
        try {
          setCheckingProfile(true);
          const response = await fetch(
            `${API_BASE_URL}/api/profile/${address}`
          );

          // If response is 200, user has a profile
          setHasProfile(response.ok);
        } catch (error) {
          console.error("Error checking profile:", error);
          setHasProfile(false);
        } finally {
          setCheckingProfile(false);
        }
      } else {
        // Reset the state when wallet is disconnected
        setHasProfile(null);
      }
    };

    checkUserProfile();
  }, [authenticated, address]);

  useEffect(() => {
    sortAndFilterProfiles(profiles, activeTab, searchQuery);
  }, [activeTab, searchQuery, profiles]);

  const sortAndFilterProfiles = (
    profilesData: Profile[],
    sortBy: SortBy,
    query: string
  ) => {
    let filtered = [...profilesData];

    // Apply search filter
    if (query) {
      filtered = filtered.filter(
        (profile) =>
          profile.name.toLowerCase().includes(query.toLowerCase()) ||
          profile.bio.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortBy) {
      case SortBy.SUPPORT_COUNT:
        filtered.sort((a, b) => b.supportCount - a.supportCount);
        break;
      case SortBy.VISIT_COUNT:
        filtered.sort((a, b) => b.visitCount - a.visitCount);
        break;
      case SortBy.RECENT:
        // Sort by lastUpdated if available, otherwise keep current order
        filtered.sort((a, b) => {
          if (a.lastUpdated && b.lastUpdated) {
            return (
              new Date(b.lastUpdated).getTime() -
              new Date(a.lastUpdated).getTime()
            );
          }
          return 0;
        });
        break;
    }

    setFilteredProfiles(filtered);
  };

  const handleProfileAction = () => {
    if (!authenticated) {
      // If wallet not connected, show a message to connect first
      alert("Please connect your wallet first to proceed.");
      return;
    }

    if (hasProfile) {
      // Navigate to user's profile page
      router.push(`/profile/${address}`);
    } else {
      // Navigate to create profile page
      router.push("/create");
    }
  };

  return (
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

          <div className="flex items-center gap-4">
            {/* Profile Navigation Button */}
            {authenticated && (
              <button
                onClick={handleProfileAction}
                disabled={checkingProfile}
                className={`px-4 py-2 rounded-lg text-white font-medium shadow-sm ${
                  hasProfile
                    ? "bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
                    : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                } transition-all hover:shadow-md disabled:opacity-70 disabled:cursor-wait flex items-center`}
              >
                {checkingProfile ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    Checking...
                  </>
                ) : hasProfile ? (
                  <>
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
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      ></path>
                    </svg>
                    Go to My Profile
                  </>
                ) : (
                  <>
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
                        strokeWidth="2"
                        d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    Create Profile
                  </>
                )}
              </button>
            )}

            {/* WalletConnection Component */}
            <WalletConnection />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">
            Explore Developers
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover talented developers in the Web3 ecosystem and support their
            work
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-1/2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search developers..."
                  className="w-full px-4 py-3 pl-11 rounded-lg border border-gray-300 text-black bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute left-3 top-3 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <Tabs
              defaultValue={SortBy.SUPPORT_COUNT}
              className="w-full md:w-auto"
            >
              <TabsList className="grid w-full grid-cols-3 md:w-[400px] bg-gray-100 rounded-lg p-1">
                <TabsTrigger
                  value={SortBy.SUPPORT_COUNT}
                  onClick={() => setActiveTab(SortBy.SUPPORT_COUNT)}
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-md"
                >
                  Most Supported
                </TabsTrigger>
                <TabsTrigger
                  value={SortBy.VISIT_COUNT}
                  onClick={() => setActiveTab(SortBy.VISIT_COUNT)}
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-md"
                >
                  Most Visited
                </TabsTrigger>
                <TabsTrigger
                  value={SortBy.RECENT}
                  onClick={() => setActiveTab(SortBy.RECENT)}
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-md"
                >
                  Most Recent
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-10 bg-red-50 rounded-xl shadow-sm border border-red-200 p-8 mb-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-red-500 mx-auto mb-4"
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
            <h3 className="text-xl font-semibold text-red-800 mb-2">
              Error Loading Profiles
            </h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading profiles...</p>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredProfiles.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-2xl font-semibold mb-2 text-gray-800">
              No developers found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* Profiles Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <Link
                href={`/profile/${profile.address}`}
                key={profile.address}
                className="group"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 group-hover:border-blue-200">
                  <div className="flex items-center p-6">
                    <div className="flex-shrink-0">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-sm">
                        <Image
                          src={profile.profilePicture}
                          alt={`${profile.name}'s profile picture`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {profile.name}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {profile.bio}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-4">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-rose-500 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700">
                          {profile.supportCount} supporters
                        </span>
                      </div>
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-blue-500 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700">
                          {profile.supporters?.length || 0} visits
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 pb-6 flex gap-3 pt-1 border-t border-gray-100">
                    {profile.github && (
                      <a
                        href={
                          profile.github.startsWith("http")
                            ? profile.github
                            : `https://github.com/${profile.github}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-500 hover:text-gray-800 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                      </a>
                    )}
                    {profile.twitter && (
                      <a
                        href={
                          profile.twitter.startsWith("http")
                            ? profile.twitter
                            : `https://twitter.com/${profile.twitter}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-500 hover:text-blue-500 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                      </a>
                    )}
                    {profile.farcaster && (
                      <a
                        href={`https://warpcast.com/${profile.farcaster}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-500 hover:text-purple-600 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5"
                          viewBox="0 0 256 256"
                          fill="currentColor"
                        >
                          <path d="M183.296 71.68H211.968L207.872 94.208H200.704V180.224L201.02 180.232C204.266 180.396 206.848 183.081 206.848 186.368V191.488L207.164 191.496C210.41 191.66 212.992 194.345 212.992 197.632V202.752H155.648V197.632C155.648 194.345 158.229 191.66 161.476 191.496L161.792 191.488V186.368C161.792 183.081 164.373 180.396 167.62 180.232L167.936 180.224V138.24C167.936 116.184 150.056 98.304 128 98.304C105.944 98.304 88.0638 116.184 88.0638 138.24V180.224L88.3798 180.232C91.6262 180.396 94.2078 183.081 94.2078 186.368V191.488L94.5238 191.496C97.7702 191.66 100.352 194.345 100.352 197.632V202.752H43.0078V197.632C43.0078 194.345 45.5894 191.66 48.8358 191.496L49.1518 191.488V186.368C49.1518 183.081 51.7334 180.396 54.9798 180.232L55.2958 180.224V94.208H48.1278L44.0318 71.68H72.7038V54.272H183.296V71.68Z" />
                        </svg>
                      </a>
                    )}
                    <span className="ml-auto bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center justify-center">
                      View Profile
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination - can be implemented for larger datasets */}
        {filteredProfiles.length > 0 && (
          <div className="mt-10 flex justify-center">
            <nav className="inline-flex items-center rounded-lg overflow-hidden shadow-sm">
              <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white border border-blue-500">
                1
              </button>
              <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">
                2
              </button>
              <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">
                3
              </button>
              <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
