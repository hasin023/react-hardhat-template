import { useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"
import toast from "react-hot-toast"

import EthTransferArtifact from "./contracts/EthTransfer.json"
import contractAddress from "./contracts/contract-address.json"

import { NoWalletDetected } from "./components/NoWalletDetected"
import { ConnectWallet } from "./components/ConnectWallet"
import { DisconnectWallet } from "./components/DisconnectWallet"
import { Loading } from "./components/Loading"
import Transfer from "./components/Transfer"
import { TransactionTable } from "./components/TransactionTable"

const HARDHAT_NETWORK_ID = "31337"
const ERROR_CODE_TX_REJECTED_BY_USER = 4001
const WALLET_KEY = "connected_wallet"

// Helper function to truncate addresses
const truncateAddress = (address) => {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const DApp = () => {
  const [selectedAddress, setSelectedAddress] = useState()
  const [balance, setBalance] = useState()
  const [provider, setProvider] = useState()
  const [contract, setContract] = useState()
  const [minTransferAmount, setMinTransferAmount] = useState("0.001")

  const checkNetwork = useCallback(async () => {
    if (window.ethereum.net_version !== HARDHAT_NETWORK_ID) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [
            {
              chainId: `0x${Number.parseInt(HARDHAT_NETWORK_ID).toString(16)}`,
            },
          ],
        })
      } catch (error) {
        console.error("Failed to switch network:", error)
        toast.error("Please switch to the correct network", {
          duration: 4000,
        })
      }
    }
  }, [])

  const initializeEthers = useCallback(async (userAddress) => {
    try {
      setSelectedAddress(userAddress)
      // Save the address to localStorage
      localStorage.setItem(WALLET_KEY, userAddress)

      const provider = new ethers.BrowserProvider(window.ethereum)
      setProvider(provider)

      const signer = await provider.getSigner()
      const contract = new ethers.Contract(
        contractAddress.EthTransfer,
        EthTransferArtifact.abi,
        signer
      )
      setContract(contract)
    } catch (error) {
      console.error("Failed to initialize ethers:", error)
      toast.error("Failed to initialize wallet connection")
    }
  }, [])

  const connectWallet = useCallback(async () => {
    try {
      const [address] = await window.ethereum.request({
        method: "eth_requestAccounts",
      })
      await checkNetwork()
      await initializeEthers(address)
      toast.success("Wallet connected successfully!")
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      toast.error("Failed to connect wallet", {
        duration: 4000,
        style: {
          maxWidth: "600px",
          padding: "16px",
        },
      })
    }
  }, [checkNetwork, initializeEthers])

  const disconnectWallet = useCallback(() => {
    setSelectedAddress(undefined)
    setBalance(undefined)
    setProvider(undefined)
    setContract(undefined)

    // Clear the stored address from localStorage
    localStorage.removeItem(WALLET_KEY)
    toast.success("Wallet disconnected successfully!")
  }, [])

  const updateBalance = useCallback(async () => {
    if (!provider || !selectedAddress) return
    try {
      const balance = await provider.getBalance(selectedAddress)
      setBalance(balance)
    } catch (error) {
      console.error("Failed to fetch balance:", error)
    }
  }, [provider, selectedAddress])

  const transferEth = async (to, amountInEth) => {
    if (!contract) return

    const preparingToastId = toast.loading(
      <div className='flex flex-col'>
        <span>Preparing Transaction</span>
        <span className='text-xs mt-1'>Please confirm in your wallet...</span>
      </div>,
      {
        duration: Infinity,
      }
    )

    try {
      const amount = ethers.parseEther(amountInEth)

      // Send the transaction
      const tx = await contract.transfer(to, {
        value: amount,
      })

      toast.dismiss(preparingToastId)

      const sendingToastId = toast.loading(
        <div className='flex flex-col'>
          <span>Transaction Sent</span>
          <span className='text-xs mt-1'>Hash: {truncateAddress(tx.hash)}</span>
        </div>,
        {
          duration: Infinity,
        }
      )

      const receipt = await tx.wait()
      toast.dismiss(sendingToastId)

      console.log("Transaction receipt:", receipt)

      if (receipt.status === 0) {
        throw new Error("Transaction failed")
      }

      // Store transaction hash in database
      try {
        const response = await fetch("http://localhost:3001/api/txhashes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transactionHash: tx.hash,
          }),
        })

        if (!response.ok) {
          console.error("Failed to store transaction hash in database")
        }
      } catch (dbError) {
        console.error("Error storing transaction hash:", dbError)
      }

      toast.success(
        <div className='flex flex-col'>
          <span>Transaction Successful!</span>
          <span className='text-xs mt-1'>Block: {receipt.blockNumber}</span>
        </div>,
        {
          duration: 5000,
          style: {
            maxWidth: "600px",
            padding: "16px",
          },
        }
      )

      await updateBalance()
    } catch (error) {
      toast.dismiss(preparingToastId)
      console.error("Detailed error:", {
        message: error.message,
        code: error.code,
        data: error.data,
      })

      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        toast.error("Transaction rejected by user", {
          duration: 5000,
        })
      } else {
        toast.error(
          <div className='flex flex-col'>
            <span>Transaction Failed</span>
            <span className='text-xs mt-1'>{error.message}</span>
          </div>,
          {
            duration: 5000,
            style: {
              maxWidth: "600px",
              padding: "16px",
            },
          }
        )
      }
    }
  }

  // Effect to restore wallet connection on page load
  useEffect(() => {
    const restoreConnection = async () => {
      const savedAddress = localStorage.getItem(WALLET_KEY)
      if (savedAddress && window.ethereum) {
        try {
          // Check if we still have access to the account
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          })
          if (accounts.includes(savedAddress)) {
            await checkNetwork()
            await initializeEthers(savedAddress)
          } else {
            // If we don't have access anymore, clear the stored address
            localStorage.removeItem(WALLET_KEY)
          }
        } catch (error) {
          console.error("Failed to restore wallet connection:", error)
          localStorage.removeItem(WALLET_KEY)
        }
      }
    }

    restoreConnection()
  }, [checkNetwork, initializeEthers])

  useEffect(() => {
    if (selectedAddress) {
      updateBalance()
      const interval = setInterval(updateBalance, 1000)
      return () => clearInterval(interval)
    }
  }, [selectedAddress, updateBalance])

  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0 && accounts[0] !== selectedAddress) {
        initializeEthers(accounts[0])
      } else {
        setSelectedAddress(undefined)
        setBalance(undefined)
      }
    }

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      }
    }
  }, [selectedAddress, initializeEthers])

  if (window.ethereum === undefined) {
    return <NoWalletDetected />
  }

  if (!selectedAddress) {
    return <ConnectWallet connectWallet={connectWallet} />
  }

  if (!provider || !contract) {
    return <Loading />
  }

  return (
    <div className='min-h-screen py-8'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='card'>
          <div className='card-body'>
            <div className='flex justify-between items-center mb-6'>
              <h1 className='text-2xl font-semibold'>ETH Transfer Dapp</h1>
              <DisconnectWallet disconnectWallet={disconnectWallet} />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
              <InfoCard label='Wallet Address' value={selectedAddress} />
              <InfoCard
                label='Balance'
                value={
                  balance ? `${ethers.formatEther(balance)} ETH` : "Loading..."
                }
              />
            </div>

            <div className='mb-4'>
              <Transfer
                transferTokens={transferEth}
                tokenSymbol='ETH'
                minAmount={minTransferAmount}
              />
            </div>
            <div className='mt-4'>
              <h2 className='text-xl font-semibold mb-4'>
                Recent Transactions
              </h2>
              {provider && <TransactionTable provider={provider} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DApp

const InfoCard = ({ label, value }) => (
  <div className='bg-gray-50 rounded-lg p-4'>
    <div className='text-sm text-gray-500 mb-1 font-semibold'>{label}</div>
    <div className='font-mono text-sm break-all'>{value}</div>
  </div>
)
