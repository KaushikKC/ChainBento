"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Github,
  Wallet,
  Code,
  FileCode,
  Heart,
  CheckCircle2,
  ArrowRight,
  Database,
  Shield,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import WalletConnection from "@/components/WalletConnection";

export default function LandingPage() {
  const { ready, authenticated } = usePrivy();
  const { login } = useLogin();
  const router = useRouter();

  const handleGetStarted = () => {
    if (!ready) return; // Wait until Privy is ready

    if (authenticated) {
      // User is authenticated, navigate to create page
      router.push("/create");
    } else {
      // User not authenticated, show wallet connection prompt
      alert("Please connect your wallet first to get started.");
      // Optional: Trigger wallet connection
      login();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center">
              <span className="font-bold text-white">CB</span>
            </div>
            <span className="font-bold text-xl">ChainBento</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm text-gray-400 hover:text-teal-400 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#why"
              className="text-sm text-gray-400 hover:text-teal-400 transition-colors"
            >
              Why Web3
            </Link>
            <Link
              href="#profiles"
              className="text-sm text-gray-400 hover:text-teal-400 transition-colors"
            >
              Explore
            </Link>
            <Link
              href="#how"
              className="text-sm text-gray-400 hover:text-teal-400 transition-colors"
            >
              How It Works
            </Link>
          </nav>
          {/* Using our new reusable WalletConnection component */}
          <WalletConnection />
        </div>
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32 border-b border-gray-800">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-gray-900/5 to-black"></div>
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-grid-white/[0.02]" />
          </div>
          <div className=" relative px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
              <div className="space-y-6">
                <Badge className="bg-indigo-500/10 text-teal-400 hover:bg-indigo-500/20 border-0">
                  Now in Beta
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-teal-200 to-indigo-300">
                  Your Web3 Developer Identity, Onchain.
                </h1>
                <p className="text-xl text-gray-400 max-w-[600px]">
                  Create a beautiful, verifiable, and contribution-ready profile
                  powered by the blockchain. Showcase your work. Get recognized.
                  Get supported.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={handleGetStarted}
                    size="lg"
                    className="bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white"
                  >
                    Get Started
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-gray-700 hover:bg-gray-800 hover:text-teal-400"
                  >
                    Explore Developers
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-indigo-600 rounded-xl blur-xl opacity-50"></div>
                <div className="relative bg-black rounded-xl border border-gray-800 overflow-hidden">
                  <div className="p-4 bg-gray-900/50 border-b border-gray-800 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div className="ml-2 text-sm text-gray-400">
                      profile.chainbento.eth
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-2xl font-bold">
                        K
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Kaushik.eth</h3>
                        <p className="text-gray-400 text-sm flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                          Verified Developer
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-teal-400">
                          12
                        </div>
                        <div className="text-xs text-gray-400">Projects</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-indigo-400">
                          256
                        </div>
                        <div className="text-xs text-gray-400">
                          Contributions
                        </div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-teal-400">
                          0.8 ETH
                        </div>
                        <div className="text-xs text-gray-400">
                          Tips Received
                        </div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-indigo-400">
                          3
                        </div>
                        <div className="text-xs text-gray-400">NFT Badges</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <Badge
                        variant="outline"
                        className="border-teal-500/30 text-teal-400"
                      >
                        React
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-indigo-500/30 text-indigo-400"
                      >
                        Solidity
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-teal-500/30 text-teal-400"
                      >
                        TypeScript
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-indigo-500/30 text-indigo-400"
                      >
                        EVM
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-700 hover:bg-gray-800 hover:text-teal-400"
                      >
                        <Github className="w-4 h-4 mr-2" />
                        GitHub
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-700 hover:bg-gray-800 hover:text-teal-400"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Tip
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What is ChainBento Section */}
        <section id="features" className="py-20 border-b border-gray-800">
          <div className=" px-4 md:px-6">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-indigo-500/10 text-teal-400 hover:bg-indigo-500/20 border-0">
                Features
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                One Profile to Showcase Everything You've Built.
              </h2>
              <p className="text-gray-400 max-w-3xl mx-auto">
                ChainBento brings together your entire developer journey in one
                beautiful, verifiable profile.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gray-900/50 border-gray-800 hover:border-teal-500/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-teal-500/10 flex items-center justify-center mb-4">
                    <Wallet className="w-6 h-6 text-teal-400" />
                  </div>
                  <CardTitle>Wallet-Based Identity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Connect your wallet to create a unique, verifiable identity
                    that you fully own and control.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800 hover:border-indigo-500/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4">
                    <Github className="w-6 h-6 text-indigo-400" />
                  </div>
                  <CardTitle>GitHub Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Showcase your repositories, contributions, and code directly
                    from your GitHub profile.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800 hover:border-teal-500/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-teal-500/10 flex items-center justify-center mb-4">
                    <FileCode className="w-6 h-6 text-teal-400" />
                  </div>
                  <CardTitle>Project Showcase</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Highlight your best work with rich media, descriptions, and
                    direct links to live projects.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800 hover:border-indigo-500/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4">
                    <Heart className="w-6 h-6 text-indigo-400" />
                  </div>
                  <CardTitle>Receive Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Get direct support from fans and users who appreciate your
                    contributions to the ecosystem.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Why Web3 Identity Section */}
        <section id="why" className="py-20 border-b border-gray-800">
          <div className=" px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-indigo-500/10 text-teal-400 hover:bg-indigo-500/20 border-0">
                  Web3 Advantage
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Trustless Reputation, Built Onchain.
                </h2>
                <p className="text-gray-400 mb-8">
                  Traditional profiles can be faked or manipulated. With
                  ChainBento, your reputation is verifiable, immutable, and
                  truly yours.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-teal-400 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">
                        Fully decentralized profile storage
                      </h3>
                      <p className="text-sm text-gray-400">
                        Your profile data lives on IPFS and Ethereum, not on our
                        servers.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-teal-400 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">
                        Verifiable social and code links
                      </h3>
                      <p className="text-sm text-gray-400">
                        Cryptographically prove ownership of your GitHub,
                        Twitter, and other accounts.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-teal-400 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">
                        Powered by ENS, IPFS, and Ethereum
                      </h3>
                      <p className="text-sm text-gray-400">
                        Built on battle-tested Web3 infrastructure that's here
                        to stay.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-teal-400 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">
                        Public support and endorsement NFTs
                      </h3>
                      <p className="text-sm text-gray-400">
                        Receive verifiable endorsements as NFTs from peers and
                        organizations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-indigo-600 rounded-xl blur-xl opacity-30"></div>
                <div className="relative bg-black rounded-xl border border-gray-800 overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=600&width=600"
                    width={600}
                    height={600}
                    alt="Web3 Identity Visualization"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Profiles Section */}
        <section id="profiles" className="py-20 border-b border-gray-800">
          <div className=" px-4 md:px-6">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-indigo-500/10 text-teal-400 hover:bg-indigo-500/20 border-0">
                Community
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                See Who's Building in Public
              </h2>
              <p className="text-gray-400 max-w-3xl mx-auto">
                Join a growing community of developers showcasing their work and
                building their reputation onchain.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((profile) => (
                <Card
                  key={profile}
                  className="bg-gray-900/50 border-gray-800 hover:border-teal-500/50 transition-colors"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-lg font-bold">
                        {profile === 1 ? "A" : profile === 2 ? "B" : "C"}
                      </div>
                      <div>
                        <CardTitle>
                          {profile === 1
                            ? "alex.eth"
                            : profile === 2
                            ? "beth.lens"
                            : "carlos.cb"}
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          {profile === 1
                            ? "Full Stack Developer"
                            : profile === 2
                            ? "Smart Contract Engineer"
                            : "Frontend Specialist"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="py-4">
                    <div className="flex gap-2 mb-4">
                      <Badge
                        variant="outline"
                        className="border-teal-500/30 text-teal-400"
                      >
                        {profile === 1
                          ? "React"
                          : profile === 2
                          ? "Solidity"
                          : "Vue"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-indigo-500/30 text-indigo-400"
                      >
                        {profile === 1
                          ? "Node.js"
                          : profile === 2
                          ? "Rust"
                          : "TypeScript"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-teal-500/30 text-teal-400"
                      >
                        {profile === 1
                          ? "GraphQL"
                          : profile === 2
                          ? "EVM"
                          : "Web3"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-teal-400">
                          {profile * 4 + 2}
                        </div>
                        <div className="text-xs text-gray-400">Projects</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-indigo-400">
                          {profile * 0.3 + 0.2}Ξ
                        </div>
                        <div className="text-xs text-gray-400">Tips</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-teal-400">
                          {profile * 42 + 18}
                        </div>
                        <div className="text-xs text-gray-400">Followers</div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full border-gray-700 hover:bg-gray-800 hover:text-teal-400"
                    >
                      View Profile
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button className="bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white">
                Claim Your Onchain Profile{" "}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how" className="py-20 border-b border-gray-800">
          <div className=" px-4 md:px-6">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-indigo-500/10 text-teal-400 hover:bg-indigo-500/20 border-0">
                Get Started
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-gray-400 max-w-3xl mx-auto">
                Creating your Web3 developer profile is simple and takes just
                minutes.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-indigo-600 rounded-xl blur-xl opacity-20"></div>
                <Card className="relative bg-gray-900/50 border-gray-800 h-full">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center mb-4 text-xl font-bold text-teal-400">
                      1
                    </div>
                    <CardTitle>Connect Wallet</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">
                      Connect your Ethereum wallet to get started. We support
                      MetaMask, WalletConnect, Rainbow, and more.
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Wallet className="w-12 h-12 text-teal-400 opacity-50" />
                  </CardFooter>
                </Card>
              </div>

              <div className="relative mt-8 md:mt-12 lg:mt-16">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-indigo-600 rounded-xl blur-xl opacity-20"></div>
                <Card className="relative bg-gray-900/50 border-gray-800 h-full">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 text-xl font-bold text-indigo-400">
                      2
                    </div>
                    <CardTitle>Mint Your Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">
                      Create your profile by adding your details, connecting
                      GitHub, and customizing your showcase.
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Code className="w-12 h-12 text-indigo-400 opacity-50" />
                  </CardFooter>
                </Card>
              </div>

              <div className="relative mt-8 md:mt-24">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-indigo-600 rounded-xl blur-xl opacity-20"></div>
                <Card className="relative bg-gray-900/50 border-gray-800 h-full">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center mb-4 text-xl font-bold text-teal-400">
                      3
                    </div>
                    <CardTitle>Start Getting Recognized</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">
                      Share your profile, receive tips, collect endorsements,
                      and build your onchain reputation.
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Award className="w-12 h-12 text-teal-400 opacity-50" />
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack / Partners Section */}
        <section className="py-20 border-b border-gray-800">
          <div className=" px-4 md:px-6">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-indigo-500/10 text-teal-400 hover:bg-indigo-500/20 border-0">
                Powered By
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Built on Web3 Standards
              </h2>
              <p className="text-gray-400 max-w-3xl mx-auto">
                ChainBento leverages the best of Web3 technology to create a
                secure, decentralized developer identity platform.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
              {[
                "Ethereum",
                "IPFS",
                "ENS",
                "RainbowKit",
                "The Graph",
                "GitHub",
              ].map((tech, index) => (
                <div key={tech} className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                    {index === 0 && <div className="text-2xl">Ξ</div>}
                    {index === 1 && (
                      <Database className="w-8 h-8 text-teal-400" />
                    )}
                    {index === 2 && (
                      <div className="text-xl font-bold">ENS</div>
                    )}
                    {index === 3 && <div className="text-xl">🌈</div>}
                    {index === 4 && (
                      <Shield className="w-8 h-8 text-indigo-400" />
                    )}
                    {index === 5 && <Github className="w-8 h-8" />}
                  </div>
                  <span className="text-sm text-gray-400">{tech}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className=" px-4 md:px-6">
            <div className="relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-indigo-600/20"></div>
              <div className="absolute inset-0 bg-[url('/placeholder.svg?height=200&width=1200')] opacity-10 bg-center"></div>
              <div className="relative p-8 md:p-12 lg:p-16">
                <div className="max-w-3xl mx-auto text-center">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Ready to Own Your Developer Identity?
                  </h2>
                  <p className="text-xl text-gray-300 mb-8">
                    Join the growing community of developers building their
                    reputation onchain.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white"
                    >
                      Connect Wallet
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-gray-700 hover:bg-gray-800 hover:text-teal-400"
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black">
        <div className=" px-4 md:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="col-span-2 lg:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center">
                  <span className="font-bold text-white">CB</span>
                </div>
                <span className="font-bold text-xl">ChainBento</span>
              </Link>
              <p className="text-gray-400 mb-4">
                Your Web3 Developer Identity, Onchain.
              </p>
              <div className="flex gap-4">
                <Link href="#" className="text-gray-400 hover:text-teal-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-teal-400">
                  <Github className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-teal-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                  </svg>
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-teal-400 text-sm"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-teal-400 text-sm"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-teal-400 text-sm"
                  >
                    Roadmap
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-teal-400 text-sm"
                  >
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-teal-400 text-sm"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-teal-400 text-sm"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-teal-400 text-sm"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-teal-400 text-sm"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-teal-400 text-sm"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-teal-400 text-sm"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-teal-400 text-sm"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} ChainBento. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <form className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Subscribe to our newsletter"
                  className="bg-gray-900 border-gray-700 text-sm w-64"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-teal-500 hover:bg-teal-600 text-white"
                >
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
