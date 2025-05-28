# ChainBento

## Overview

ChainBento is a modern web3 application that integrates blockchain technology with a user-friendly interface. The project combines a Next.js frontend, a Node.js backend, and smart contracts to create a seamless blockchain experience.

## Table of Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
  - [Smart Contract Setup](#smart-contract-setup)
- [Usage](#usage)
- [Features](#features)
- [Technologies](#technologies)
- [Contributing](#contributing)
- [License](#license)

## Architecture

ChainBento follows a three-tier architecture:

1. **Frontend**: A Next.js application with React, providing a responsive and interactive user interface.
2. **Backend**: A Node.js server built with Express, handling API requests and business logic.
3. **Smart Contracts**: Blockchain contracts for on-chain operations.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git
- Ethereum wallet (such as MetaMask) for blockchain interactions

## Installation

### Clone the Repository

```bash
git clone https://github.com/yourusername/chainbento.git
cd chainbento
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in the frontend directory with necessary environment variables:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
# Add other required environment variables
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```
PORT=3001
MONGODB_URI=your_mongodb_connection_string
# Add other required environment variables
```

### Smart Contract Setup

To be determined based on project requirements.

## Usage

### Running the Frontend

```bash
cd frontend
npm run dev
```

The frontend application will be available at http://localhost:3000.

### Running the Backend

```bash
cd backend
npm start
```

The backend API will be available at http://localhost:3001.

## Features

- Authentication using Privy and RainbowKit
- Blockchain integration with ethers.js and wagmi
- Responsive UI with Tailwind CSS
- Drag and drop functionality with react-dnd
- IPFS integration for decentralized storage

## Technologies

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Radix UI Components
- Rainbow Kit
- Privy Authentication
- Ethers.js
- IPFS HTTP Client

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- ethers.js
- Security packages (cors, helmet, rate limiting)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

---

Built with ❤️ by the ChainBento team.