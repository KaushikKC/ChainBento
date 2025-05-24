"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Image from "next/image";

interface Token {
  symbol: string;
  name: string;
  icon: string;
  address: string | null; // null for native ETH
}

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileName: string;
  profileAddress: string;
}

export default function SupportModal({
  isOpen,
  onClose,
  profileName,
  profileAddress,
}: SupportModalProps) {
  const [step, setStep] = useState<
    "amount" | "message" | "confirming" | "success"
  >("amount");
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [mintNFT, setMintNFT] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
    }
  }, [isOpen]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedToken || !amount || parseFloat(amount) <= 0) {
      setError("Please select a token and enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Here you would handle the blockchain transaction
      // This is just a mock implementation for demonstration

      // Step 1: Move to message step
      if (step === "amount") {
        setStep("message");
        setIsSubmitting(false);
        return;
      }

      // Step 2: Move to confirming step
      if (step === "message") {
        setStep("confirming");

        // Simulate transaction processing
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // In a real implementation, this would:
        // 1. Connect to wallet (MetaMask, WalletConnect, etc.)
        // 2. Send the transaction to transfer tokens
        // 3. If mintNFT is true, mint a Proof-of-Support NFT
        // 4. Store the message on IPFS

        // Simulate successful transaction
        setStep("success");
      }
    } catch (err: any) {
      console.error("Error processing support transaction:", err);
      setError(
        err.message || "Failed to process transaction. Please try again."
      );
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 text-center mb-4"
                >
                  {step === "amount" && `Support ${profileName}`}
                  {step === "message" && "Add a Message"}
                  {step === "confirming" && "Processing Transaction"}
                  {step === "success" && "Support Successful!"}
                </Dialog.Title>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Step 1: Select Token & Amount */}
                {step === "amount" && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      Choose a token and amount to support {profileName}'s work
                    </p>

                    {/* Token Selection */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Token
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {availableTokens.map((token) => (
                          <button
                            key={token.symbol}
                            type="button"
                            onClick={() => setSelectedToken(token)}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                              selectedToken?.symbol === token.symbol
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400"
                                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                            }`}
                          >
                            <Image
                              src={token.icon}
                              alt={token.symbol}
                              width={32}
                              height={32}
                              className="mb-2"
                            />
                            <span className="text-sm font-medium">
                              {token.symbol}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                      <label
                        htmlFor="amount"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Amount
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="number"
                          name="amount"
                          id="amount"
                          className="block w-full pr-12 pl-4 py-3 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          min="0"
                          step="0.01"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-gray-500 dark:text-gray-400 sm:text-sm">
                            {selectedToken?.symbol || "ETH"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* NFT Minting Option */}
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
                        className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        Mint Proof-of-Support NFT
                      </label>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                      Minting an NFT will require additional gas fees.
                    </p>
                  </div>
                )}

                {/* Step 2: Add Message */}
                {step === "message" && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      Add an optional message to {profileName} (stored on IPFS)
                    </p>

                    <div className="mt-4">
                      <textarea
                        rows={4}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Write a message of support or feedback (optional)"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>

                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="font-medium text-sm mb-2">
                        Transaction Summary
                      </h4>
                      <div className="flex justify-between text-sm">
                        <span>Amount:</span>
                        <span>
                          {amount} {selectedToken?.symbol}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span>Recipient:</span>
                        <span>{formatAddress(profileAddress)}</span>
                      </div>
                      {mintNFT && (
                        <div className="flex justify-between text-sm mt-1">
                          <span>Proof-of-Support NFT:</span>
                          <span>Yes</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Processing Transaction */}
                {step === "confirming" && (
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="w-16 h-16 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-700 dark:text-gray-300">
                      Processing your transaction...
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Please confirm the transaction in your wallet
                    </p>
                  </div>
                )}

                {/* Step 4: Success */}
                {step === "success" && (
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-green-500"
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
                    <p className="text-gray-700 dark:text-gray-300 font-medium text-lg">
                      Thank you for your support!
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                      {mintNFT
                        ? "Your Proof-of-Support NFT has been minted and will appear in your wallet shortly."
                        : "Your contribution has been sent successfully."}
                    </p>
                    {message && (
                      <div className="mt-4 w-full bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                          "{message}"
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                  {(step === "amount" || step === "message") && (
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={onClose}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                  )}

                  {step === "amount" && (
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={handleSubmit}
                      disabled={
                        !selectedToken ||
                        !amount ||
                        parseFloat(amount) <= 0 ||
                        isSubmitting
                      }
                    >
                      Continue
                    </button>
                  )}

                  {step === "message" && (
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      Send Support
                    </button>
                  )}

                  {step === "success" && (
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
