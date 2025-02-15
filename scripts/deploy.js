const { ethers, network, artifacts } = require("hardhat")
const path = require("path")

async function main() {
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    )
  }

  const [deployer] = await ethers.getSigners()
  const deployerAddress = await deployer.address

  console.log("Deploying the contracts with the account:", deployerAddress)

  // Get the balance using provider
  const balance = await ethers.provider.getBalance(deployerAddress)
  console.log("Account balance:", balance.toString())

  const EthTransfer = await ethers.getContractFactory("EthTransfer")
  const ethTransfer = await EthTransfer.deploy()

  // Wait for the deployment transaction to be mined
  await ethTransfer.waitForDeployment()

  // Get the deployed contract address
  const contractAddress = await ethTransfer.getAddress()
  console.log("EthTransfer address:", contractAddress)

  // Save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(contractAddress)
}

function saveFrontendFiles(contractAddress) {
  const fs = require("fs")
  const contractsDir = path.join(__dirname, "..", "client", "src", "contracts")

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true })
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ EthTransfer: contractAddress }, undefined, 2)
  )

  const EthTransferArtifact = artifacts.readArtifactSync("EthTransfer")
  fs.writeFileSync(
    path.join(contractsDir, "EthTransfer.json"),
    JSON.stringify(EthTransferArtifact, null, 2)
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
