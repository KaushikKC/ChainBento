"use client";

import { Button } from "@/components/ui/button";
import { useLogin, useLogout, usePrivy } from "@privy-io/react-auth";
import { useAccount, useBalance } from "wagmi";

export default function WalletConnection() {
  const { ready, authenticated } = usePrivy();
  const { login } = useLogin();
  const { logout } = useLogout();
  const { address } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });

  const handleWalletAction = () => {
    if (!ready) return; // Wait until Privy is ready

    if (authenticated) {
      logout();
    } else {
      login();
    }
  };

  // Function to shorten wallet address (show first 4 and last 4 characters)
  const shortenAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 4)}...${address.substring(
      address.length - 4
    )}`;
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        onClick={handleWalletAction}
        className="bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white"
      >
        {!ready
          ? "Loading..."
          : authenticated && address
          ? shortenAddress(address)
          : "Connect Wallet"}
      </Button>
      {authenticated && balance && (
        <span className="text-xs px-2 py-1 text-white bg-pink-600 rounded-md">
          {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
        </span>
      )}
    </div>
  );
}
