import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import Image from "next/image";
import axios, { AxiosProgressEvent } from "axios";
import { SignInButton, useProfile } from "@farcaster/auth-kit";

// Define types
interface Work {
  title: string;
  description: string;
  url: string;
}

interface ProfileFormData {
  name: string;
  bio: string;
  github: string;
  twitter: string;
  farcaster: string;
  lens: string;
  blog: string;
  profilePicture: File | null;
  profilePictureUrl: string;
  works: Work[];
  contributionWallet: string;
  farcasterFid?: number;
  farcasterCustody?: string;
}

interface ProfileFormProps {
  onSubmit: (data: ProfileFormData) => void; // Changed from any to ProfileFormData
  isSubmitting: boolean;
  initialData?: Partial<ProfileFormData>;
}

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

export default function ProfileForm({
  onSubmit,
  isSubmitting,
  initialData,
}: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: initialData?.name || "",
    bio: initialData?.bio || "",
    github: initialData?.github || "",
    twitter: initialData?.twitter || "",
    farcaster: initialData?.farcaster || "",
    lens: initialData?.lens || "",
    blog: initialData?.blog || "",
    profilePicture: null,
    profilePictureUrl: initialData?.profilePictureUrl || "",
    works: initialData?.works || [{ title: "", description: "", url: "" }], // Initialize with a single empty work
    contributionWallet: initialData?.contributionWallet || "",
    farcasterFid: initialData?.farcasterFid,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Get Farcaster profile data
  const farcasterProfile = useProfile();
  const { isAuthenticated, profile } = farcasterProfile;

  console.log("Farcaster Profile:", profile);

  // Effect to update form with Farcaster data when authenticated
  useEffect(() => {
    if (isAuthenticated && profile) {
      setFormData((prev) => ({
        ...prev,
        farcaster: `https://farcaster.xyz/${profile.username}`,
        farcasterFid: profile.fid,
        farcasterCustody: profile.custody,
      }));
    }
  }, [isAuthenticated, profile]);

  // Handle input changes
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Disconnect Farcaster account
  const disconnectFarcaster = () => {
    setFormData((prev) => ({
      ...prev,
      farcaster: "",
      farcasterFid: undefined,
      farcasterCustody: undefined,
    }));

    // Note: The Auth Kit doesn't provide a direct logout method
    // For a complete solution, you would need to clear the authentication state
    // This might require refreshing the page or using a custom solution
  };

  // Handle profile picture upload
  const handleProfilePictureChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        profilePicture: "Please upload a valid image file (JPEG, PNG, or GIF)",
      }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        profilePicture: "Image size must be less than 5MB",
      }));
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        profilePicture: file,
        profilePictureUrl: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);

    // Clear error
    if (errors.profilePicture) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.profilePicture;
        return newErrors;
      });
    }
  };

  const uploadToIPFS = async (file: File): Promise<string> => {
    try {
      setIsUploading(true);
      setUploadProgress(10);

      // Create form data
      const formData = new FormData();
      formData.append("file", file);

      // Optional metadata
      const metadata = JSON.stringify({
        name: `profile-picture-${Date.now()}`,
      });
      formData.append("pinataMetadata", metadata);

      // Optional pinata options
      const options = JSON.stringify({
        cidVersion: 0,
      });
      formData.append("pinataOptions", options);

      setUploadProgress(30);

      // Upload to Pinata
      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            "Content-Type": `multipart/form-data;`,
            // Use JWT if available, otherwise use API key and secret
            ...(PINATA_JWT
              ? { Authorization: `Bearer ${PINATA_JWT}` }
              : {
                  pinata_api_key: PINATA_API_KEY,
                  pinata_secret_api_key: PINATA_SECRET_API_KEY,
                }),
          },
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 60) /
                (progressEvent.total || progressEvent.loaded)
            );
            setUploadProgress(30 + percentCompleted); // Scale to 30-90%
          },
        }
      );

      setUploadProgress(90);

      // Create IPFS URL using the returned CID
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
      console.log("File uploaded to IPFS via Pinata:", ipfsUrl);

      setUploadProgress(100);
      return ipfsUrl;
    } catch (error) {
      console.error("Error uploading file to Pinata:", error);
      throw new Error("Failed to upload image to IPFS via Pinata");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle project changes
  const handleWorkChange = (
    index: number,
    field: keyof Work,
    value: string
  ) => {
    setFormData((prev) => {
      const updatedWorks = [...prev.works];
      updatedWorks[index] = {
        ...updatedWorks[index],
        [field]: value,
      };
      return { ...prev, works: updatedWorks };
    });
  };

  // Add new work
  const addWork = () => {
    if (formData.works.length >= 5) return; // Maximum 5 works allowed

    setFormData((prev) => ({
      ...prev,
      works: [...prev.works, { title: "", description: "", url: "" }],
    }));
  };

  // Remove work
  const removeWork = (index: number) => {
    setFormData((prev) => {
      const updatedWorks = [...prev.works];
      updatedWorks.splice(index, 1);
      return { ...prev, works: updatedWorks };
    });
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setIsUploading(true);

      // Upload profile picture to IPFS if present
      let profilePictureUrl = formData.profilePictureUrl;

      if (formData.profilePicture) {
        try {
          profilePictureUrl = await uploadToIPFS(formData.profilePicture);
        } catch (error) {
          console.error("Error uploading profile picture to IPFS:", error);
          setErrors((prev) => ({
            ...prev,
            form: "Failed to upload profile picture to IPFS. Please try again.",
          }));
          setIsUploading(false);
          return;
        }
      }

      // Prepare data for submission
      const submissionData = {
        ...formData,
        profilePictureUrl: profilePictureUrl, // Use the IPFS URL
      };

      // Submit the form data
      onSubmit(submissionData);
    } catch (error) {
      console.error("Error during form submission:", error);
      setErrors((prev) => ({
        ...prev,
        form: "An error occurred during submission. Please try again.",
      }));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* General error message */}
      {errors.form && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>{errors.form}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 pb-2 border-b border-gray-200">
          Basic Information
        </h2>

        {/* Profile Picture */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture
          </label>

          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md flex items-center justify-center">
                {formData.profilePictureUrl ? (
                  <Image
                    src={formData.profilePictureUrl}
                    alt="Profile preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <svg
                    className="h-12 w-12 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </div>
            </div>

            <div className="flex-grow">
              <label className="block">
                <span className="sr-only">Choose profile photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100 hover:file:text-blue-800
                    transition cursor-pointer"
                  onChange={handleProfilePictureChange}
                  disabled={isUploading}
                />
              </label>
              <p className="mt-1 text-sm text-gray-500">
                PNG, JPG, or GIF up to 5MB
              </p>
              {errors.profilePicture && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.profilePicture}
                </p>
              )}

              {/* Upload progress indicator */}
              {isUploading && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {uploadProgress < 100
                      ? `Uploading: ${uploadProgress}%`
                      : "Upload complete!"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Your name"
            className={`w-full px-4 py-3 rounded-lg bg-white border text-black ${
              errors.name
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            } shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Short Bio <span className="text-red-500">*</span>
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows={4}
            placeholder="Tell us about yourself and your work"
            className={`w-full px-4 py-3 rounded-lg bg-white border text-black ${
              errors.bio
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            } shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50`}
          />
          <div className="mt-1 flex justify-between items-center">
            <p
              className={`text-sm ${
                formData.bio.length > 500 ? "text-red-600" : "text-gray-500"
              }`}
            >
              {formData.bio.length}/500 characters
            </p>
            {errors.bio && <p className="text-sm text-red-600">{errors.bio}</p>}
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 pb-2 border-b border-gray-200">
            Social Links
          </h2>
          <span className="text-sm text-gray-500">Optional</span>
        </div>

        <p className="text-sm text-gray-600">
          Add your social media and platform links to help others connect with
          you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GitHub */}
          <div>
            <label
              htmlFor="github"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              GitHub URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </div>
              <input
                type="url"
                id="github"
                name="github"
                value={formData.github}
                onChange={handleInputChange}
                placeholder="https://github.com/yourusername"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white shadow-sm text-black ${
                  errors.github
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
              />
            </div>
            {errors.github && (
              <p className="mt-1 text-sm text-red-600">{errors.github}</p>
            )}
          </div>

          {/* Twitter */}
          <div>
            <label
              htmlFor="twitter"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Twitter URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </div>
              <input
                type="url"
                id="twitter"
                name="twitter"
                value={formData.twitter}
                onChange={handleInputChange}
                placeholder="https://twitter.com/yourusername"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white shadow-sm text-black ${
                  errors.twitter
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
              />
            </div>
            {errors.twitter && (
              <p className="mt-1 text-sm text-red-600">{errors.twitter}</p>
            )}
          </div>

          {/* Farcaster */}

          <div>
            <label
              htmlFor="farcaster"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Farcaster
            </label>
            <div className="flex items-center space-x-2">
              {!isAuthenticated && (
                <div className="flex-grow flex items-center">
                  <div className="mr-3">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M11.9998 0C18.6274 0 24.0001 5.37267 24.0001 12.0003C24.0001 18.6279 18.6274 24.0006 11.9998 24.0006C5.37224 24.0006 -0.000244141 18.6279 -0.000244141 12.0003C-0.000244141 5.37267 5.37224 0 11.9998 0ZM14.8254 5.40698C13.0784 4.5033 10.92 4.5033 9.17225 5.40698L7.53867 6.25033C5.7917 7.15401 4.6665 8.90099 4.6665 10.83V13.17C4.6665 15.099 5.7917 16.846 7.53867 17.75L9.17225 18.593C10.92 19.4967 13.0784 19.4967 14.8254 18.593L16.459 17.75C18.2067 16.846 19.3322 15.099 19.3322 13.17V10.83C19.3322 8.90099 18.2067 7.15401 16.459 6.25033L14.8254 5.40698Z" />
                    </svg>
                  </div>
                  <span className="text-gray-500">
                    Connect your Farcaster account
                  </span>
                </div>
              )}

              {/* Hidden input to store the Farcaster URL value */}
              <input
                type="hidden"
                id="farcaster"
                name="farcaster"
                value={formData.farcaster}
              />

              <div className="flex-shrink-0">
                <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors font-medium text-sm flex items-center cursor-pointer">
                  <SignInButton onSignOut={disconnectFarcaster} />
                </div>
              </div>
            </div>

            {errors.farcaster && (
              <p className="mt-1 text-sm text-red-600">{errors.farcaster}</p>
            )}

            {isAuthenticated && profile && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                <p className="text-sm text-green-600 flex items-center">
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Connected as @{profile.displayName} (FID: {profile.fid})
                </p>
              </div>
            )}
          </div>

          {/* Lens */}
          <div>
            <label
              htmlFor="lens"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Lens URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
              </div>
              <input
                type="url"
                id="lens"
                name="lens"
                value={formData.lens}
                onChange={handleInputChange}
                placeholder="https://lens.xyz/yourusername"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white shadow-sm text-black ${
                  errors.lens
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
              />
            </div>
            {errors.lens && (
              <p className="mt-1 text-sm text-red-600">{errors.lens}</p>
            )}
          </div>

          {/* Blog */}
          <div>
            <label
              htmlFor="blog"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Blog URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <input
                type="url"
                id="blog"
                name="blog"
                value={formData.blog}
                onChange={handleInputChange}
                placeholder="https://yourblog.com"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white shadow-sm text-black ${
                  errors.blog
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
              />
            </div>
            {errors.blog && (
              <p className="mt-1 text-sm text-red-600">{errors.blog}</p>
            )}
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 pb-2 border-b border-gray-200">
            Your Works
          </h2>

          {formData.works.length < 5 && (
            <button
              type="button"
              onClick={addWork}
              className="text-sm px-4 py-2 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors border border-blue-200 shadow-sm font-medium flex items-center"
            >
              <svg
                className="h-4 w-4 mr-1"
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
              Add Work
            </button>
          )}
        </div>

        <p className="text-sm text-gray-600">
          Add your blog posts, projects, articles, or any other work you want to
          showcase.
        </p>

        {formData.works.map((work, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-xl p-5 space-y-4 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-800 flex items-center">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
                  {index + 1}
                </span>
                Work Entry
              </h3>

              {formData.works.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeWork(index)}
                  className="text-sm text-red-600 hover:text-red-800 flex items-center"
                >
                  <svg
                    className="h-4 w-4 mr-1"
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
                  Remove
                </button>
              )}
            </div>

            {/* Work Title */}
            <div>
              <label
                htmlFor={`work_${index}_title`}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Title
              </label>
              <input
                type="text"
                id={`work_${index}_title`}
                value={work.title}
                onChange={(e) =>
                  handleWorkChange(index, "title", e.target.value)
                }
                placeholder="Title of your work"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
            </div>

            {/* Work Description */}
            <div>
              <label
                htmlFor={`work_${index}_description`}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id={`work_${index}_description`}
                value={work.description}
                onChange={(e) =>
                  handleWorkChange(index, "description", e.target.value)
                }
                rows={2}
                placeholder="Brief description of your work"
                className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
            </div>

            {/* URL */}
            <div>
              <label
                htmlFor={`work_${index}_url`}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
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
                </div>
                <input
                  type="url"
                  id={`work_${index}_url`}
                  value={work.url}
                  onChange={(e) =>
                    handleWorkChange(index, "url", e.target.value)
                  }
                  placeholder="https://example.com/your-work"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg text-black bg-white shadow-sm ${
                    errors[`work_${index}_url`]
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                />
              </div>
              {errors[`work_${index}_url`] && (
                <p className="mt-1 text-sm text-red-600">
                  {errors[`work_${index}_url`]}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Contribution Wallet */}
      {/* <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 pb-2 border-b border-gray-200">
          Contribution Wallet
        </h2>
        <p className="text-sm text-gray-600">
          Add an optional wallet address for receiving support if different from
          your profile wallet.
        </p>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-100">
          <label
            htmlFor="contributionWallet"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            ETH Wallet Address (Optional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              id="contributionWallet"
              name="contributionWallet"
              value={formData.contributionWallet}
              onChange={handleInputChange}
              placeholder="0x..."
              className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white shadow-sm ${
                errors.contributionWallet
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
            />
          </div>
          {errors.contributionWallet && (
            <p className="mt-1 text-sm text-red-600">
              {errors.contributionWallet}
            </p>
          )}
        </div>
      </div> */}

      {/* Submit Button */}
      <div className="flex justify-end pt-8">
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-medium shadow-md transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting || isUploading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
              Processing...
            </span>
          ) : (
            <span className="flex items-center">
              Create Profile
              <svg
                className="ml-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </span>
          )}
        </button>
      </div>
    </form>
  );
}
