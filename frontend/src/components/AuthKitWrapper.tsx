"use client";

import { ReactNode } from "react";
import { AuthKitProvider } from "@farcaster/auth-kit";

interface AuthKitWrapperProps {
  children: ReactNode;
}

const config = {
  relay: "https://relay.farcaster.xyz",
  rpcUrl: "https://mainnet.optimism.io",
  domain: "chainbento.com",
  siweUri: "https://example.com/login",
};

export default function AuthKitWrapper({ children }: AuthKitWrapperProps) {
  return <AuthKitProvider config={config}>{children}</AuthKitProvider>;
}
