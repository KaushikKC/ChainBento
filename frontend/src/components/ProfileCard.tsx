import Image from "next/image";
import Link from "next/link";

interface Project {
  name: string;
  description: string;
  githubUrl: string;
  demoUrl: string;
}

interface ProfileData {
  name: string;
  bio: string;
  profilePicture: string;
  github?: string;
  twitter?: string;
  farcaster?: string;
  lens?: string;
  blog?: string;
  projects?: Project[];
  contributionWallet?: string;
  supportCount: number;
  visitCount: number;
}

interface ProfileCardProps {
  profile: ProfileData;
  address: string;
  onSupportClick: () => void;
  compact?: boolean;
}

export default function ProfileCard({
  profile,
  address,
  onSupportClick,
  compact = false,
}: ProfileCardProps) {
  // Format address for display (0x1234...5678)
  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Social media icons and links
  const socialLinks = [
    {
      name: "github",
      url: profile.github,
      icon: (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
      ),
    },
    {
      name: "twitter",
      url: profile.twitter,
      icon: (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
    },
    {
      name: "farcaster",
      url: profile.farcaster,
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M11.8 23.6c-6.5 0-11.8-5.3-11.8-11.8 0-6.5 5.3-11.8 11.8-11.8 6.5 0 11.8 5.3 11.8 11.8 0 6.5-5.3 11.8-11.8 11.8zM8.7 12.5h6.8c0.4 0 0.7-0.3 0.7-0.7 0-0.4-0.3-0.7-0.7-0.7h-6.8c-0.4 0-0.7 0.3-0.7 0.7 0 0.4 0.3 0.7 0.7 0.7zM8.7 9.3h6.8c0.4 0 0.7-0.3 0.7-0.7 0-0.4-0.3-0.7-0.7-0.7h-6.8c-0.4 0-0.7 0.3-0.7 0.7 0 0.4 0.3 0.7 0.7 0.7zM8.7 15.7h6.8c0.4 0 0.7-0.3 0.7-0.7 0-0.4-0.3-0.7-0.7-0.7h-6.8c-0.4 0-0.7 0.3-0.7 0.7 0 0.4 0.3 0.7 0.7 0.7z" />
        </svg>
      ),
    },
    {
      name: "lens",
      url: profile.lens,
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
          <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
        </svg>
      ),
    },
    {
      name: "blog",
      url: profile.blog,
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      {/* Profile Header */}
      <div className="relative">
        {/* Profile Cover - stylish gradient background */}
        <div className="h-32 bg-gradient-to-r from-blue-400 to-indigo-500"></div>

        {/* Profile Picture */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
          <div className="rounded-full border-4 border-white shadow-md overflow-hidden">
            <Image
              src={profile.profilePicture}
              alt={`${profile.name}'s profile picture`}
              width={128}
              height={128}
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="pt-20 pb-6 px-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>

        <div className="mt-2 flex items-center justify-center text-sm text-gray-500">
          <div className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
            <span className="mr-1 text-blue-500 font-medium">
              {formatAddress(address)}
            </span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {!compact && (
          <p className="mt-4 text-gray-600 line-clamp-3 bg-gray-50 p-4 rounded-lg">
            {profile.bio}
          </p>
        )}

        {/* Social Links */}
        <div className="mt-6 flex justify-center space-x-3">
          {socialLinks.map(
            (social, index) =>
              social.url && (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-600 transition-colors p-2 bg-gray-50 rounded-full hover:bg-blue-50"
                  aria-label={`Visit ${social.name}`}
                >
                  {social.icon}
                </a>
              )
          )}
        </div>

        {/* Stats */}
        {!compact && (
          <div className="mt-6 grid grid-cols-2 gap-2">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 flex flex-col items-center">
              <span className="font-semibold text-xl text-gray-800">
                {profile.supportCount}
              </span>
              <span className="text-sm text-gray-600">Supporters</span>
            </div>
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-3 flex flex-col items-center">
              <span className="font-semibold text-xl text-gray-800">
                {profile.visitCount}
              </span>
              <span className="text-sm text-gray-600">Profile Views</span>
            </div>
          </div>
        )}

        {/* Support Button */}
        <div className="mt-6">
          <button
            onClick={onSupportClick}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-medium shadow-sm transition-all hover:shadow-md w-full flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Support Developer
          </button>
        </div>

        {/* Contribution Wallet - if different from profile address */}
        {profile.contributionWallet &&
          profile.contributionWallet !== address && (
            <div className="mt-4 text-xs bg-blue-50 rounded-lg p-2 text-gray-600">
              <span className="font-medium">Contribution Wallet:</span>{" "}
              {formatAddress(profile.contributionWallet)}
            </div>
          )}
      </div>
    </div>
  );
}
