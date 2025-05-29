"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WalletConnection from "@/components/WalletConnection";

interface Profile {
  address: string;
  name: string;
  bio: string;
  profilePicture: string;
  supportCount: number;
  visitCount: number;
  github?: string;
  twitter?: string;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SortBy>(SortBy.SUPPORT_COUNT);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        // In a real implementation, you would fetch profiles from your backend/blockchain
        // Example: const response = await fetch('/api/profiles');

        // Mock data for demonstration
        const mockProfiles: Profile[] = [
          {
            address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
            name: "John Developer",
            bio: "Full-stack blockchain developer passionate about Web3",
            profilePicture:
              "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80",
            supportCount: 42,
            visitCount: 1337,
            github: "https://github.com/johndeveloper",
            twitter: "https://twitter.com/johndeveloper",
          },
          {
            address: "0x8C76384A5ab376c894E65f7B79B65E4934Bd9c6F",
            name: "Alice Blockchain",
            bio: "Smart contract developer and security researcher",
            profilePicture:
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80",
            supportCount: 87,
            visitCount: 965,
            github: "https://github.com/aliceblockchain",
            twitter: "https://twitter.com/aliceblockchain",
          },
          {
            address: "0x2D9C6fcAAD84536E4b78C01D4385Eb617F7e92Cd",
            name: "Bob Builder",
            bio: "Frontend developer specializing in React and Web3",
            profilePicture:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHByb2ZpbGV8ZW58MHx8MHx8fDA%3D&w=1000&q=80",
            supportCount: 35,
            visitCount: 789,
            github: "https://github.com/bobbuilder",
            twitter: "https://twitter.com/bobbuilder",
          },
          {
            address: "0x9E8f77A2b788A84A21F52Db353d84D9DD7E82732",
            name: "Carol Coder",
            bio: "Solidity expert and DeFi protocol developer",
            profilePicture:
              "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHByb2ZpbGV8ZW58MHx8MHx8fDA%3D&w=1000&q=80",
            supportCount: 122,
            visitCount: 1654,
            github: "https://github.com/carolcoder",
            twitter: "https://twitter.com/carolcoder",
          },
          {
            address: "0x6Fb3e0A217407EFFb7cA29c2f178E89951F7ed75",
            name: "Dave Decentralized",
            bio: "Web3 architect and protocol designer",
            profilePicture:
              "https://images.unsplash.com/photo-1618077360395-f3068be8e001?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bWFuJTIwcG9ydHJhaXR8ZW58MHx8MHx8fDA%3D&w=1000&q=80",
            supportCount: 68,
            visitCount: 832,
            github: "https://github.com/davedecentralized",
            twitter: "https://twitter.com/davedecentralized",
          },
        ];

        setProfiles(mockProfiles);
        sortAndFilterProfiles(mockProfiles, activeTab, searchQuery);
      } catch (error) {
        console.error("Error fetching profiles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

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
        // In a real app, you would sort by creation date
        // Here we'll just use a random sort for demonstration
        filtered.sort(() => Math.random() - 0.5);
        break;
    }

    setFilteredProfiles(filtered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header with WalletConnection */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md fixed top-0 w-full z-50 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="font-bold text-white">CB</span>
            </div>
            <span className="font-bold text-xl text-gray-800">ChainBento</span>
          </Link>

          {/* WalletConnection Component */}
          <WalletConnection />
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
                  className="w-full px-4 py-3 pl-11 rounded-lg border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredProfiles.length === 0 && (
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
                        {profile.visitCount} visits
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 flex gap-3 pt-1 border-t border-gray-100">
                  {profile.github && (
                    <a
                      href={profile.github}
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
                      href={profile.twitter}
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
                  <span className="ml-auto bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center justify-center">
                    View Profile
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

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
