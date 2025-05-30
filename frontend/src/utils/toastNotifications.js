// Import your toast library (example using react-toastify)
import { toast } from "react-toastify";

// Toast notifications for profile operations
export const showProfileToast = (isSuccess, isCreate = true) => {
  if (isSuccess) {
    toast.success(
      isCreate
        ? "Profile created successfully!"
        : "Profile updated successfully!"
    );
  } else {
    toast.error(
      isCreate
        ? "Failed to create profile. Please try again."
        : "Failed to update profile. Please try again."
    );
  }
};

// Toast notifications for NFT minting
export const showNftMintToast = (isSuccess) => {
  if (isSuccess) {
    toast.success(`Profile NFT minted successfully!`);
  } else {
    toast.error("Failed to mint profile NFT. Please try again.");
  }
};
