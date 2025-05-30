"use client";

import Link from "next/link";
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
import Image from "next/image";
import logo from "../app/assests/ChainBentoLogo.png";

export default function LandingPage() {
  const { ready, authenticated } = usePrivy();
  const { login } = useLogin();
  const router = useRouter();

  const handleGetStarted = () => {
    if (!ready) return; // Wait until Privy is ready

    if (authenticated) {
      // User is authenticated, navigate to create page
      router.push("/explore");
    } else {
      // User not authenticated, show wallet connection prompt
      alert("Please connect your wallet first to get started.");
      // Optional: Trigger wallet connection
      login();
    }
  }; // This semicolon was likely the issue

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl fixed top-0 w-full z-50 shadow-sm">
        <div className="flex items-center justify-between h-20 px-6 md:px-8 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-3">
            <span className="font-bold">
              <Image
                src={logo}
                alt="ChainBento Logo"
                width={60}
                height={15}
                priority
              />
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-blue-600 after:transition-all after:duration-200 hover:after:w-full"
            >
              Features
            </Link>
            <Link
              href="#why"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-blue-600 after:transition-all after:duration-200 hover:after:w-full"
            >
              Why Web3
            </Link>
            <Link
              href="#profiles"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-blue-600 after:transition-all after:duration-200 hover:after:w-full"
            >
              Explore
            </Link>
            <Link
              href="#how"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-blue-600 after:transition-all after:duration-200 hover:after:w-full"
            >
              How It Works
            </Link>
          </nav>
          {/* Using our new reusable WalletConnection component */}
          <WalletConnection />
        </div>
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 md:py-36 border-b border-slate-200/60">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30"></div>
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent)] bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent)]" />
          </div>
          <div className="relative px-6 md:px-8 max-w-7xl mx-auto">
            <div className="grid gap-16 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-8">
                <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 hover:from-blue-200 hover:to-purple-200 border-0 px-4 py-2 font-medium shadow-sm">
                  ✨ Now in Beta
                </Badge>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                    Your Web3
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Developer Identity
                  </span>
                  <br />
                  <span className="text-slate-700">Onchain.</span>
                </h1>
                <p className="text-xl text-slate-600 max-w-[600px] leading-relaxed font-medium">
                  Create a beautiful, verifiable, and contribution-ready profile
                  powered by the blockchain. Showcase your work. Get recognized.
                  Get supported.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={handleGetStarted}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-slate-300 hover:bg-slate-50 hover:border-blue-300 bg-slate-100 text-slate-700 px-8 py-6 text-lg font-semibold transition-all duration-300"
                  >
                    Explore Developers
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-20"></div>
                <div className="relative bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl">
                  <div className="p-6 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <div className="ml-4 text-sm text-slate-500 font-medium">
                      profile.chainbento.eth
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-5 mb-8">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                        K
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900">
                          Kaushik.eth
                        </h3>
                        <p className="text-slate-600 flex items-center gap-2 font-medium">
                          <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                          Verified Developer
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 text-center border border-blue-200">
                        <div className="text-3xl font-bold text-blue-600">
                          12
                        </div>
                        <div className="text-sm text-blue-700 font-medium">
                          Projects
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 text-center border border-purple-200">
                        <div className="text-3xl font-bold text-purple-600">
                          256
                        </div>
                        <div className="text-sm text-purple-700 font-medium">
                          Contributions
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-4 text-center border border-indigo-200">
                        <div className="text-3xl font-bold text-indigo-600">
                          0.8 ETH
                        </div>
                        <div className="text-sm text-indigo-700 font-medium">
                          Tips Received
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-4 text-center border border-teal-200">
                        <div className="text-3xl font-bold text-teal-600">
                          3
                        </div>
                        <div className="text-sm text-teal-700 font-medium">
                          NFT Badges
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mb-8">
                      <Badge className="bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1 font-medium">
                        React
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1 font-medium">
                        Solidity
                      </Badge>
                      <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1 font-medium">
                        TypeScript
                      </Badge>
                      <Badge className="bg-teal-100 text-teal-700 border border-teal-200 px-3 py-1 font-medium">
                        EVM
                      </Badge>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-300 hover:bg-slate-50 bg-slate-100 text-slate-700 font-medium"
                      >
                        <Github className="w-4 h-4 mr-2" />
                        GitHub
                      </Button>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium"
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
        <section
          id="features"
          className="py-24 border-b border-slate-200/60 bg-gradient-to-b from-white to-slate-50"
        >
          <div className="px-6 md:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-0 px-4 py-2 font-medium">
                ✨ Features
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                One Profile to Showcase Everything You&apos;ve Built.
              </h2>
              <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
                ChainBento brings together your entire developer journey in one
                beautiful, verifiable profile.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl group">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Wallet className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900">
                    Wallet-Based Identity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 leading-relaxed">
                    Connect your wallet to create a unique, verifiable identity
                    that you fully own and control.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-slate-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl group">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Github className="w-8 h-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900">
                    GitHub Integration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 leading-relaxed">
                    Showcase your repositories, contributions, and code directly
                    from your GitHub profile.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-slate-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-xl group">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <FileCode className="w-8 h-8 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900">
                    Project Showcase
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 leading-relaxed">
                    Highlight your best work with rich media, descriptions, and
                    direct links to live projects.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-slate-200 hover:border-pink-300 transition-all duration-300 hover:shadow-xl group">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Heart className="w-8 h-8 text-pink-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900">
                    Receive Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 leading-relaxed">
                    Get direct support from fans and users who appreciate your
                    contributions to the ecosystem.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Why Web3 Identity Section */}
        <section id="why" className="py-24 border-b border-slate-200/60">
          <div className="px-6 md:px-8 max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-0 px-4 py-2 font-medium">
                  🔗 Web3 Advantage
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Trustless Reputation, Built Onchain.
                </h2>
                <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                  Traditional profiles can be faked or manipulated. With
                  ChainBento, your reputation is verifiable, immutable, and
                  truly yours.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 mb-2">
                        Fully decentralized profile storage
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        Your profile data lives on IPFS and Ethereum, not on our
                        servers.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 mb-2">
                        Verifiable social and code links
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        Cryptographically prove ownership of your GitHub,
                        Twitter, and other accounts.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 mb-2">
                        Powered by ENS, IPFS, and Ethereum
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        Built on battle-tested Web3 infrastructure that&apos;s
                        here to stay.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 mb-2">
                        Public support and endorsement NFTs
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        Receive verifiable endorsements as NFTs from peers and
                        organizations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-20"></div>
                <div className="relative bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl p-8">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-6">
                      <Shield className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">
                      Verified & Secure
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      Your identity is cryptographically secured and
                      independently verifiable by anyone on the blockchain.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Profiles Section */}
        <section
          id="profiles"
          className="py-24 border-b border-slate-200/60 bg-gradient-to-b from-slate-50 to-white"
        >
          <div className="px-6 md:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-0 px-4 py-2 font-medium">
                👥 Community
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                See Who&apos;s Building in Public
              </h2>
              <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
                Join a growing community of developers showcasing their work and
                building their reputation onchain.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((profile) => (
                <Card
                  key={profile}
                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl group"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                        {profile === 1 ? "A" : profile === 2 ? "B" : "C"}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-slate-900">
                          {profile === 1
                            ? "alex.eth"
                            : profile === 2
                            ? "beth.lens"
                            : "carlos.cb"}
                        </CardTitle>
                        <CardDescription className="text-slate-600 font-medium">
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
                    <div className="flex gap-2 mb-6 flex-wrap">
                      <Badge className="bg-blue-100 text-blue-700 border border-blue-200 font-medium">
                        {profile === 1
                          ? "React"
                          : profile === 2
                          ? "Solidity"
                          : "Vue"}
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-700 border border-purple-200 font-medium">
                        {profile === 1
                          ? "Node.js"
                          : profile === 2
                          ? "Rust"
                          : "TypeScript"}
                      </Badge>
                      <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200 font-medium">
                        {profile === 1
                          ? "GraphQL"
                          : profile === 2
                          ? "EVM"
                          : "Web3"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center border border-blue-200">
                        <div className="text-lg font-bold text-blue-600">
                          {profile * 4 + 2}
                        </div>
                        <div className="text-xs text-blue-700 font-medium">
                          Projects
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 text-center border border-purple-200">
                        <div className="text-lg font-bold text-purple-600">
                          {profile * 0.3 + 0.2}Ξ
                        </div>
                        <div className="text-xs text-purple-700 font-medium">
                          Tips
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-3 text-center border border-indigo-200">
                        <div className="text-lg font-bold text-indigo-600">
                          {profile * 42 + 18}
                        </div>
                        <div className="text-xs text-indigo-700 font-medium">
                          Followers
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full border-slate-300 hover:bg-slate-50 text-slate-700 font-medium"
                    >
                      View Profile
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="mt-16 text-center">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                Claim Your Onchain Profile{" "}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how"
          className="py-24 border-b border-slate-200/60 bg-gradient-to-b from-white to-slate-50"
        >
          <div className="px-6 md:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-0 px-4 py-2 font-medium">
                🚀 Get Started
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                How It Works
              </h2>
              <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
                Creating your Web3 developer profile is simple and takes just
                minutes.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-xl opacity-20"></div>
                <Card className="relative bg-white border-slate-200 h-full group hover:shadow-xl hover:border-blue-300 transition-all duration-300">
                  <CardHeader className="text-center pb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 text-xl font-bold text-blue-600">
                      1
                    </div>
                    <CardTitle className="text-slate-900">
                      Connect Wallet
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">
                      Connect your Ethereum wallet to get started. We support
                      MetaMask, WalletConnect, Rainbow, and more.
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Wallet className="w-12 h-12 text-blue-500 opacity-50" />
                  </CardFooter>
                </Card>
              </div>

              <div className="relative mt-8 md:mt-12 lg:mt-16">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-xl opacity-20"></div>
                <Card className="relative bg-white border-slate-200 h-full group hover:shadow-xl hover:border-purple-300 transition-all duration-300">
                  <CardHeader className="text-center pb-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4 text-xl font-bold text-purple-600">
                      2
                    </div>
                    <CardTitle className="text-slate-900">
                      Mint Your Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">
                      Create your profile by adding your details, connecting
                      GitHub, and customizing your showcase.
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Code className="w-12 h-12 text-purple-500 opacity-50" />
                  </CardFooter>
                </Card>
              </div>

              <div className="relative mt-8 md:mt-24">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-xl opacity-20"></div>
                <Card className="relative bg-white border-slate-200 h-full group hover:shadow-xl hover:border-indigo-300 transition-all duration-300">
                  <CardHeader className="text-center pb-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4 text-xl font-bold text-indigo-600">
                      3
                    </div>
                    <CardTitle className="text-slate-900">
                      Start Getting Recognized
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">
                      Share your profile, receive tips, collect endorsements,
                      and build your onchain reputation.
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Award className="w-12 h-12 text-indigo-500 opacity-50" />
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack / Partners Section */}
        <section className="py-20 border-b border-slate-200/60 bg-white">
          <div className="px-6 md:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-0 px-4 py-2 font-medium">
                Powered By
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Built on Web3 Standards
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
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
                  <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shadow-sm">
                    {index === 0 && (
                      <div className="text-2xl text-blue-600">Ξ</div>
                    )}
                    {index === 1 && (
                      <Database className="w-8 h-8 text-blue-600" />
                    )}
                    {index === 2 && (
                      <div className="text-xl font-bold text-blue-600">ENS</div>
                    )}
                    {index === 3 && <div className="text-xl">🌈</div>}
                    {index === 4 && (
                      <Shield className="w-8 h-8 text-purple-600" />
                    )}
                    {index === 5 && (
                      <Github className="w-8 h-8 text-slate-700" />
                    )}
                  </div>
                  <span className="text-sm text-slate-600 font-medium">
                    {tech}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
          <div className="px-6 md:px-8 max-w-7xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
              <div className="absolute inset-0 bg-[url('/placeholder.svg?height=200&width=1200')] opacity-5 bg-center"></div>
              <div className="relative p-8 md:p-12 lg:p-16">
                <div className="max-w-3xl mx-auto text-center">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Ready to Own Your Developer Identity?
                  </h2>
                  <p className="text-xl text-slate-600 mb-8">
                    Join the growing community of developers building their
                    reputation onchain.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      Connect Wallet
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-slate-300 hover:bg-slate-50 bg-slate-100 hover:border-blue-300 text-slate-700 px-8 py-6 text-lg font-semibold transition-all duration-300"
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
      <footer className="border-t border-slate-200 bg-white">
        <div className="px-6 md:px-8 max-w-7xl mx-auto py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="col-span-2 lg:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-4">
                <span className="font-bold">
                  <Image
                    src={logo}
                    alt="ChainBento Logo"
                    width={60}
                    height={15}
                    priority
                  />
                </span>
              </Link>
              <p className="text-slate-600 mb-4">
                Your Web3 Developer Identity, Onchain.
              </p>
              <div className="flex gap-4">
                <Link href="#" className="text-slate-500 hover:text-blue-600">
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
                <Link href="#" className="text-slate-500 hover:text-blue-600">
                  <Github className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-slate-500 hover:text-blue-600">
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
              <h3 className="font-medium mb-4 text-slate-900">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-slate-600 hover:text-blue-600 text-sm"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-slate-600 hover:text-blue-600 text-sm"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-slate-600 hover:text-blue-600 text-sm"
                  >
                    Roadmap
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-slate-600 hover:text-blue-600 text-sm"
                  >
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4 text-slate-900">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-slate-600 hover:text-blue-600 text-sm"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-slate-600 hover:text-blue-600 text-sm"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-slate-600 hover:text-blue-600 text-sm"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-slate-600 hover:text-blue-600 text-sm"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4 text-slate-900">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-slate-600 hover:text-blue-600 text-sm"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-slate-600 hover:text-blue-600 text-sm"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-slate-600 hover:text-blue-600 text-sm"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-500 text-sm">
              &copy; {new Date().getFullYear()} ChainBento. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <form className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Subscribe to our newsletter"
                  className="bg-white border-slate-300 text-sm w-64"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
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
