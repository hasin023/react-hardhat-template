const { ethers, network, artifacts } = require("hardhat")
const path = require("path")
const fs = require("fs")

async function main() {
  // Check network
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    )
  }

  // Get deployer account
  const [deployer] = await ethers.getSigners()
  const deployerAddress = await deployer.getAddress()
  console.log("Deploying the contracts with the account:", deployerAddress)

  // Get initial balance
  const balance = await ethers.provider.getBalance(deployerAddress)
  console.log("Account balance:", ethers.formatEther(balance), "ETH")

  // Deploy contract
  console.log("Deploying EthTransfer contract...")
  const EthTransfer = await ethers.getContractFactory("EthTransfer")
  const ethTransfer = await EthTransfer.deploy()

  // Wait for deployment
  await ethTransfer.waitForDeployment()
  const contractAddress = await ethTransfer.getAddress()

  // Verify contract was deployed successfully
  const code = await ethers.provider.getCode(contractAddress)
  if (code === "0x") {
    throw new Error("Contract deployment failed - no code at address")
  }

  console.log("EthTransfer deployed to:", contractAddress)

  // Verify initial contract state
  console.log("\nVerifying contract deployment...")

  // Try to call a view function to verify contract is working
  try {
    const balance = await ethTransfer.getBalance(deployerAddress)
    console.log(
      "Contract function call successful - getBalance:",
      ethers.formatEther(balance),
      "ETH"
    )
  } catch (error) {
    console.error("Failed to call contract function:", error)
    throw error
  }

  // Save frontend files
  await saveFrontendFiles(contractAddress)
  console.log("\nFrontend files updated successfully")
}

async function saveFrontendFiles(contractAddress) {
  const contractsDir = path.join(__dirname, "..", "client", "src", "contracts")

  // Ensure directory exists
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true })
  }

  // Save contract address
  const addressFile = path.join(contractsDir, "contract-address.json")
  fs.writeFileSync(
    addressFile,
    JSON.stringify({ EthTransfer: contractAddress }, undefined, 2)
  )
  console.log("📄 Contract address saved to:", addressFile)

  // Save contract artifact
  const EthTransferArtifact = artifacts.readArtifactSync("EthTransfer")

  // Verify artifact has expected content
  if (!EthTransferArtifact.abi || EthTransferArtifact.abi.length === 0) {
    throw new Error("Contract artifact missing ABI")
  }

  const artifactFile = path.join(contractsDir, "EthTransfer.json")
  fs.writeFileSync(artifactFile, JSON.stringify(EthTransferArtifact, null, 2))
  console.log("📄 Contract artifact saved to:", artifactFile)

  // Log ABI for verification
  console.log("\nContract ABI:")
  console.log(JSON.stringify(EthTransferArtifact.abi, null, 2))
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:")
    console.error(error)
    process.exit(1)
  })
