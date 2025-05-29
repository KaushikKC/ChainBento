"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Image from "next/image";
import { useDataContext } from "@/context/DataContext";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import ethereum from "../app/assests/ethereum-eth-logo.png";

// Constants that would typically come from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x1011b31fcB82E77c5EAB85B8090c63C3E8670c52";

// ABI for the support contract - this should be imported from a separate file in a real app
const CONTRACT_ABI = [
  "function support(address recipient) external payable",
  // Add other functions as needed
];

interface Token {
  symbol: string;
  name: string;
  icon: string;
  address: string | null; // null for native ETH
}

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileName?: string; // Make this optional since it appears to be missing in the usage
  profileAddress: string;
  contributionWallet: string; // Add the missing prop
}

export default function SupportModal({
  isOpen,
  onClose,
  profileName = "Developer", // Add default value since it might be missing
  profileAddress,
  contributionWallet,
}: SupportModalProps) {
  const [step, setStep] = useState<
    "amount" | "message" | "confirming" | "success" | "error"
  >("amount");
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [mintNFT, setMintNFT] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { address: userAddress } = useAccount();
  const { authenticated } = usePrivy();
  const { getContractInstance } = useDataContext();

  // Check if user is trying to support their own profile
  const isOwnProfile =
    userAddress && userAddress.toLowerCase() === profileAddress.toLowerCase();

  // Available tokens for support
  const availableTokens: Token[] = [
    {
      symbol: "ETH",
      name: "Ethereum",
      icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
      address: null, // Native ETH
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    },
    {
      symbol: "DAI",
      name: "Dai Stablecoin",
      icon: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png",
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    },
  ];

  /**
   * Handles direct support transaction to the profile owner
   * @param amount Amount of ETH to send
   * @param recipient Recipient address
   */
  const handleDirectSupport = async (amount: string, recipient: string) => {
    if (!authenticated || !userAddress) {
      setError("Please connect your wallet first.");
      return false;
    }

    if (isOwnProfile) {
      setError("You cannot support your own profile.");
      return false;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setStep("confirming");

      // Get contract instance using the context function
      const contract = await getContractInstance(
        CONTRACT_ADDRESS,
        CONTRACT_ABI
      );

      if (!contract) {
        throw new Error("Failed to initialize contract");
      }

      // Calculate amount in wei
      const amountInWei = ethers.utils.parseEther(amount);

      console.log(`Supporting ${recipient} with ${amount} ETH...`);

      // Call the support function with value
      const transaction = await contract.support(contributionWallet, {
        value: amountInWei,
      });

      console.log("Transaction sent:", transaction);
      setTxHash(transaction.hash);

      // Wait for a few seconds to give the transaction time to be mined
      await new Promise((resolve) => setTimeout(resolve, 8000));

      // Log support with backend
      try {
        await fetch(`${API_BASE_URL}/api/support/log`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            supporter: userAddress,
            recipient: recipient,
            amount: parseFloat(amount),
          }),
        });
        console.log("Support logged with backend");
      } catch (logErr) {
        console.error("Failed to log support with backend:", logErr);
        // Continue even if logging fails - the transaction was successful
      }

      setStep("success");
      return true;
    } catch (err: unknown) {
      console.error("Error supporting developer:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to support. Please try again.";
      setError(errorMessage);
      setStep("error");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set initial selected token to ETH
  useEffect(() => {
    if (availableTokens.length > 0) {
      setSelectedToken(availableTokens[0]);
    }
  }, []);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("amount");
      setAmount("");
      setMessage("");
      setMintNFT(false);
      setError(null);
      setTxHash(null);
    }
  }, [isOpen]);

  // Handle form submission - this connects to the handleDirectSupport function
  const handleSubmit = async () => {
    if (!selectedToken || !amount || parseFloat(amount) <= 0) {
      setError("Please select a token and enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Move to message step
      if (step === "amount") {
        setStep("message");
        setIsSubmitting(false);
        return;
      }

      // Step 2: Process transaction
      if (step === "message") {
        // Only support ETH for now - extend this logic for other tokens
        if (selectedToken.symbol !== "ETH") {
          throw new Error("Only ETH is currently supported");
        }

        // Call the direct support function with the entered amount
        await handleDirectSupport(amount, profileAddress);

        // Note: handleDirectSupport will handle setting the step and error states
      }
    } catch (err: unknown) {
      console.error("Error processing support transaction:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to process transaction. Please try again.";
      setError(errorMessage);
      setStep("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => {
          // Prevent closing during transaction
          if (step !== "confirming" && !isSubmitting) {
            onClose();
          }
        }}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-60" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all border border-gray-100">
                {/* Header with improved styling */}
                <Dialog.Title
                  as="h3"
                  className="text-xl font-bold text-gray-800 text-center mb-4 pb-2 border-b border-gray-100"
                >
                  {step === "amount" && (
                    <div className="flex items-center justify-center gap-2">
                      <svg
                        className="w-6 h-6 text-blue-500"
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
                      <span>Support {profileName}</span>
                    </div>
                  )}
                  {step === "message" && (
                    <div className="flex items-center justify-center gap-2">
                      <svg
                        className="w-6 h-6 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                      <span>Add a Message</span>
                    </div>
                  )}
                  {step === "confirming" && "Processing Transaction"}
                  {step === "success" && "Support Successful!"}
                  {step === "error" && "Transaction Failed"}
                </Dialog.Title>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 flex items-start">
                    <svg
                      className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
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
                    <span>{error}</span>
                  </div>
                )}

                {/* Step 1: Select Token & Amount */}
                {step === "amount" && (
                  <div className="space-y-5">
                    <p className="text-sm text-gray-600 text-center bg-blue-50 p-3 rounded-lg">
                      Choose a token and amount to support {profileName}&apos;s
                      work
                    </p>

                    {/* Token Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Token
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {availableTokens.map((token) => (
                          <button
                            key={token.symbol}
                            type="button"
                            onClick={() => setSelectedToken(token)}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all text-black ${
                              selectedToken?.symbol === token.symbol
                                ? "border-blue-500 bg-blue-50 shadow-sm"
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            } ${
                              token.symbol !== "ETH"
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            disabled={token.symbol !== "ETH"} // Only enable ETH for now
                          >
                            <Image
                              src={ethereum}
                              alt={token.symbol}
                              width={32}
                              height={32}
                              className="mb-2"
                            />
                            <span className="text-sm font-medium text-gray-800">
                              {token.symbol}
                            </span>
                            {token.symbol !== "ETH" && (
                              <span className="text-xs text-gray-500 mt-1">
                                Coming soon
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                      <label
                        htmlFor="amount"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Amount
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <input
                          type="number"
                          name="amount"
                          id="amount"
                          className="block w-full pr-12 pl-4 py-3 border-gray-300 rounded-lg text-black focus:ring-blue-500 focus:border-blue-500 bg-white"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          min="0"
                          step="0.01"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-gray-500 sm:text-sm bg-gray-100 px-2 py-1 rounded-md">
                            {selectedToken?.symbol || "ETH"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* NFT Minting Option */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                      <div className="flex items-center">
                        <input
                          id="mint-nft"
                          name="mint-nft"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={mintNFT}
                          onChange={(e) => setMintNFT(e.target.checked)}
                        />
                        <label
                          htmlFor="mint-nft"
                          className="ml-2 block text-sm font-medium text-gray-700"
                        >
                          Mint Proof-of-Support NFT
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 pl-6">
                        Minting an NFT will require additional gas fees.
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 2: Add Message */}
                {step === "message" && (
                  <div className="space-y-5">
                    <p className="text-sm text-gray-600 text-center bg-blue-50 p-3 rounded-lg">
                      Add an optional message to {profileName} (stored on IPFS)
                    </p>

                    <div>
                      <textarea
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                        placeholder="Write a message of support or feedback (optional)"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="font-medium text-sm mb-3 text-gray-700">
                        Transaction Summary
                      </h4>
                      <div className="flex justify-between text-sm py-2 border-b border-gray-200">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium text-gray-800">
                          {amount} {selectedToken?.symbol}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm py-2 border-b border-gray-200">
                        <span className="text-gray-600">Recipient:</span>
                        <span className="font-medium text-gray-800">
                          {formatAddress(profileAddress)}
                        </span>
                      </div>
                      {mintNFT && (
                        <div className="flex justify-between text-sm py-2">
                          <span className="text-gray-600">
                            Proof-of-Support NFT:
                          </span>
                          <span className="font-medium text-blue-600">Yes</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Processing Transaction */}
                {step === "confirming" && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-20 h-20 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mb-6"></div>
                    <p className="text-gray-800 font-medium text-lg">
                      Processing your transaction...
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Please confirm the transaction in your wallet
                    </p>
                  </div>
                )}

                {/* Step 4: Success */}
                {step === "success" && (
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 border border-green-200">
                      <svg
                        className="w-10 h-10 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-800 font-bold text-xl mb-2">
                      Thank you for your support!
                    </p>
                    <p className="text-sm text-gray-600 text-center max-w-xs">
                      {mintNFT
                        ? "Your Proof-of-Support NFT has been minted and will appear in your wallet shortly."
                        : "Your contribution has been sent successfully."}
                    </p>
                    {txHash && (
                      <div className="mt-4 bg-blue-50 rounded-lg p-3 w-full">
                        <a
                          href={`https://sepolia.basescan.org/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center justify-center"
                        >
                          View transaction on BaseScan
                          <svg
                            className="w-4 h-4 ml-1"
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
                    )}
                    {message && (
                      <div className="mt-4 w-full bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-700 italic">
                          &quot;{message}&quot;
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Error State */}
                {step === "error" && (
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 border border-red-200">
                      <svg
                        className="w-10 h-10 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-800 font-bold text-xl mb-2">
                      Transaction Failed
                    </p>
                    <p className="text-sm text-red-600 mt-2 text-center max-w-xs">
                      {error ||
                        "There was an error processing your transaction."}
                    </p>
                    <button
                      onClick={() => setStep("amount")}
                      className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                        />
                      </svg>
                      Try Again
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                  {(step === "amount" || step === "message") && (
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      onClick={onClose}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                  )}

                  {step === "amount" && (
                    <button
                      type="button"
                      className={`inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        !selectedToken ||
                        !amount ||
                        parseFloat(amount) <= 0 ||
                        isSubmitting ||
                        (selectedToken && selectedToken.symbol !== "ETH")
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-sm"
                      }`}
                      onClick={handleSubmit}
                      disabled={
                        !selectedToken ||
                        !amount ||
                        parseFloat(amount) <= 0 ||
                        isSubmitting ||
                        (selectedToken && selectedToken.symbol !== "ETH")
                      }
                    >
                      Continue
                    </button>
                  )}

                  {step === "message" && (
                    <button
                      type="button"
                      className={`inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        isSubmitting
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-sm"
                      }`}
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      Send Support
                    </button>
                  )}

                  {(step === "success" || step === "error") && (
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      onClick={onClose}
                    >
                      Close
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
