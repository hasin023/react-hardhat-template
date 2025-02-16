# React-Hardhat Starter

## Overview

This is a starter template for building a decentralized application (dApp) using React for the frontend and Hardhat for smart contract development and deployment. It includes a simple smart contract to trade ETH tokens between accounts and a basic React interface to interact with it.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [MetaMask](https://metamask.io/) browser extension

## Installation & Setup

Follow these steps to set up and run the project:

### 1. Install Dependencies

Run the following command in the root directory to install all required dependencies:

```bash
npm install
```

### 2. Start the Hardhat Node

Hardhat provides a local Ethereum network for development and testing. Start the Hardhat node using:

```bash
npx hardhat node
```

This will create multiple test accounts with pre-funded Ether.

### 3. Compile and Deploy the Smart Contract

Once the Hardhat node is running, compile and deploy the smart contract:

```bash
npx hardhat clean
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
```

This will deploy the contract on the local Hardhat network and output the contract address. Also, the contract Address & ABI will be saved in the `client/src/contracts` directory.

### 4. Setup environment variables

Create a `.env` file in both the `client` and `server` directory according to the `.env.example` files.

### 5. Start the Backend

Navigate to the backend, `server` directory and start the Express server:

```bash
cd server
npm install
npm run server
```

The backend should now be running at [http://localhost:3001](http://localhost:3001).

### 6. Start the Frontend

Navigate to the frontend, `client` directory and start the React application:

```bash
cd client
npm install
npm run dev
```

The frontend should now be running at [http://localhost:5173](http://localhost:5173). Open this link in your browser.

### 5. Connect MetaMask

To interact with the deployed smart contract, configure MetaMask:

1. Open MetaMask and click on the network dropdown.
2. Select **Custom RPC** and enter the following details:
   - **Network Name**: Localhost
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
3. Import an account from the Hardhat node using its private key (displayed when running `npx hardhat node`).

## Troubleshooting

### Nonce Error

If you encounter a **nonce error** when trying to interact with the contract, reset your MetaMask account:

1. Open MetaMask.
2. Go to **Settings → Advanced**.
3. Click **Clear activity and nonce data**.
4. Restart the Hardhat node and redeploy the contract.

This issue occurs when the transaction count gets out of sync after restarting the Hardhat node.

## Technologies Used

- **Vite**: Development server for fast builds.
- **React**: Frontend framework for building the UI.
- **DaisyUI**: Tailwind CSS components for styling.
- **React Router**: Library for routing in React applications.
- **Hardhat**: Ethereum development environment for compiling, deploying, and testing smart contracts.
- **Solidity**: Programming language for writing smart contracts.
- **Ethers.js**: Library for interacting with the Ethereum blockchain.
- **MetaMask**: Wallet and browser extension for managing Ethereum accounts.
