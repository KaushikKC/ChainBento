"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import Image from "next/image";

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
  profilePicturePreview: string;
  works: Work[]; // Changed from projects to works
  contributionWallet: string;
}

interface ProfileFormProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  initialData?: Partial<ProfileFormData>;
}

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
    profilePicturePreview: initialData?.profilePicturePreview || "",
    works: initialData?.works || [{ title: "", description: "", url: "" }], // Initialize with a single empty work
    contributionWallet: initialData?.contributionWallet || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

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
        profilePicturePreview: reader.result as string,
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

  // Validate form data
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.bio.trim()) {
      newErrors.bio = "Bio is required";
    } else if (formData.bio.length > 500) {
      newErrors.bio = "Bio must be less than 500 characters";
    }

    // URL validations
    const urlRegex =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

    if (formData.github && !urlRegex.test(formData.github)) {
      newErrors.github = "Please enter a valid URL";
    }

    if (formData.twitter && !urlRegex.test(formData.twitter)) {
      newErrors.twitter = "Please enter a valid URL";
    }

    if (formData.farcaster && !urlRegex.test(formData.farcaster)) {
      newErrors.farcaster = "Please enter a valid URL";
    }

    if (formData.lens && !urlRegex.test(formData.lens)) {
      newErrors.lens = "Please enter a valid URL";
    }

    if (formData.blog && !urlRegex.test(formData.blog)) {
      newErrors.blog = "Please enter a valid URL";
    }

    // Wallet address validation
    if (formData.contributionWallet) {
      const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!ethAddressRegex.test(formData.contributionWallet)) {
        newErrors.contributionWallet = "Please enter a valid Ethereum address";
      }
    }

    // Project validations
    const workErrors: Record<string, string> = {};
    formData.works.forEach((work, index) => {
      if (work.title.trim() && !work.url.trim()) {
        workErrors[`work_${index}_url`] = "URL is required for each work";
      }

      if (work.url) {
        const urlRegex =
          /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        if (!urlRegex.test(work.url)) {
          workErrors[`work_${index}_url`] = "Please enter a valid URL";
        }
      }
    });

    setErrors({ ...newErrors, ...workErrors });
    return (
      Object.keys(newErrors).length === 0 &&
      Object.keys(workErrors).length === 0
    );
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsUploading(true);

      // In a real implementation, you would upload the profile picture to IPFS here
      // and get back the IPFS hash to store in the blockchain

      // Mock upload delay
      if (formData.profilePicture) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Prepare data for submission
      // In a real implementation, you would include the IPFS hash for the profile picture
      const submissionData = {
        ...formData,
        profilePictureUrl: formData.profilePicturePreview, // In a real app, this would be the IPFS URL
      };

      // Submit the form data
      onSubmit(submissionData);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      setErrors((prev) => ({
        ...prev,
        form: "Failed to upload profile picture. Please try again.",
      }));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* General error message */}
      {errors.form && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{errors.form}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Basic Information</h2>

        {/* Profile Picture */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Profile Picture
          </label>

          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                {formData.profilePicturePreview ? (
                  <Image
                    src={formData.profilePicturePreview}
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
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-medium
                    file:bg-blue-50 file:text-blue-700
                    dark:file:bg-blue-900 dark:file:text-blue-200
                    hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
                  onChange={handleProfilePictureChange}
                />
              </label>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                PNG, JPG, or GIF up to 5MB
              </p>
              {errors.profilePicture && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.profilePicture}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Your name"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.name
                ? "border-red-300 focus:ring-red-500 dark:border-red-600"
                : "border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.name}
            </p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Short Bio *
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows={4}
            placeholder="Tell us about yourself and your work"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.bio
                ? "border-red-300 focus:ring-red-500 dark:border-red-600"
                : "border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            }`}
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {formData.bio.length}/500 characters
          </p>
          {errors.bio && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.bio}
            </p>
          )}
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Social Links</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Add your social media and platform links to help others connect with
          you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GitHub */}
          <div>
            <label
              htmlFor="github"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              GitHub URL
            </label>
            <input
              type="url"
              id="github"
              name="github"
              value={formData.github}
              onChange={handleInputChange}
              placeholder="https://github.com/yourusername"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.github
                  ? "border-red-300 focus:ring-red-500 dark:border-red-600"
                  : "border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              }`}
            />
            {errors.github && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.github}
              </p>
            )}
          </div>

          {/* Twitter */}
          <div>
            <label
              htmlFor="twitter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Twitter URL
            </label>
            <input
              type="url"
              id="twitter"
              name="twitter"
              value={formData.twitter}
              onChange={handleInputChange}
              placeholder="https://twitter.com/yourusername"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.twitter
                  ? "border-red-300 focus:ring-red-500 dark:border-red-600"
                  : "border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              }`}
            />
            {errors.twitter && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.twitter}
              </p>
            )}
          </div>

          {/* Farcaster */}
          <div>
            <label
              htmlFor="farcaster"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Farcaster URL
            </label>
            <input
              type="url"
              id="farcaster"
              name="farcaster"
              value={formData.farcaster}
              onChange={handleInputChange}
              placeholder="https://farcaster.xyz/u/yourusername"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.farcaster
                  ? "border-red-300 focus:ring-red-500 dark:border-red-600"
                  : "border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              }`}
            />
            {errors.farcaster && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.farcaster}
              </p>
            )}
          </div>

          {/* Lens */}
          <div>
            <label
              htmlFor="lens"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Lens URL
            </label>
            <input
              type="url"
              id="lens"
              name="lens"
              value={formData.lens}
              onChange={handleInputChange}
              placeholder="https://lens.xyz/yourusername"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.lens
                  ? "border-red-300 focus:ring-red-500 dark:border-red-600"
                  : "border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              }`}
            />
            {errors.lens && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.lens}
              </p>
            )}
          </div>

          {/* Blog */}
          <div>
            <label
              htmlFor="blog"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Blog URL
            </label>
            <input
              type="url"
              id="blog"
              name="blog"
              value={formData.blog}
              onChange={handleInputChange}
              placeholder="https://yourblog.com"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.blog
                  ? "border-red-300 focus:ring-red-500 dark:border-red-600"
                  : "border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              }`}
            />
            {errors.blog && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.blog}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Your Works</h2>

          {formData.works.length < 5 && (
            <button
              type="button"
              onClick={addWork}
              className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition"
            >
              + Add Work
            </button>
          )}
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Add your blog posts, projects, articles, or any other work you want to
          showcase.
        </p>

        {formData.works.map((work, index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Work {index + 1}</h3>

              {formData.works.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeWork(index)}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Work Title */}
            <div>
              <label
                htmlFor={`work_${index}_title`}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Work Description */}
            <div>
              <label
                htmlFor={`work_${index}_description`}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* URL */}
            <div>
              <label
                htmlFor={`work_${index}_url`}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                URL
              </label>
              <input
                type="url"
                id={`work_${index}_url`}
                value={work.url}
                onChange={(e) => handleWorkChange(index, "url", e.target.value)}
                placeholder="https://example.com/your-work"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors[`work_${index}_url`]
                    ? "border-red-300 focus:ring-red-500 dark:border-red-600"
                    : "border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                }`}
              />
              {errors[`work_${index}_url`] && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors[`work_${index}_url`]}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Contribution Wallet */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Contribution Wallet</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Add an optional wallet address for receiving support if different from
          your profile wallet.
        </p>

        <div>
          <label
            htmlFor="contributionWallet"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            ETH Wallet Address (Optional)
          </label>
          <input
            type="text"
            id="contributionWallet"
            name="contributionWallet"
            value={formData.contributionWallet}
            onChange={handleInputChange}
            placeholder="0x..."
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.contributionWallet
                ? "border-red-300 focus:ring-red-500 dark:border-red-600"
                : "border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            }`}
          />
          {errors.contributionWallet && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.contributionWallet}
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6">
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting || isUploading ? (
            <span className="flex items-center">
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
              Processing...
            </span>
          ) : (
            "Create Profile"
          )}
        </button>
      </div>
    </form>
  );
}
