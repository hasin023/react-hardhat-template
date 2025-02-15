# React-Hardhat Starter

## Description

This is a starter project for building a React app with a Hardhat backend. It includes a simple contract and a simple frontend that interacts with the contract.

First, install the dependencies:

```bash
npm install
```

Once the dependencies are installed, start the Hardhat node:

```bash
npx hardhat node
```

In a separate terminal, we need to compile and deploy the contract:

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
```

Finally, start the frontend:

```bash
cd client
npm install
npm run dev
```

The frontend should now be running at [localhost:5173](http://localhost:5173) and you should be able to interact with the contract. You need to have MetaMask installed and connected to the Hardhat node to interact with the contract.
