import { useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"

import toast from "react-hot-toast"

import EthTransferArtifact from "./contracts/EthTransfer.json"
import contractAddress from "./contracts/contract-address.json"

import { NoWalletDetected } from "./components/NoWalletDetected"
import { ConnectWallet } from "./components/ConnectWallet"
import { DisconnectWallet } from "./components/DisconnectWallet"
import { Loading } from "./components/Loading"
import { Transfer } from "./components/Transfer"

const HARDHAT_NETWORK_ID = "31337"
const ERROR_CODE_TX_REJECTED_BY_USER = 4001

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const disconnectWallet = useCallback(() => {
    setSelectedAddress(undefined)
    setBalance(undefined)
    setProvider(undefined)
    setContract(undefined)
    toast.success("Wallet disconnected successfully!")
  }, [])

  const checkNetwork = useCallback(async () => {
    if (window.ethereum.networkVersion !== HARDHAT_NETWORK_ID) {
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

  const updateBalance = useCallback(async () => {
    if (!provider || !selectedAddress) return
    try {
      const balance = await provider.getBalance(selectedAddress)
      setBalance(balance)
    } catch (error) {
      console.error("Failed to fetch balance:", error)
    }
  }, [provider, selectedAddress])

  const transferEth = async (to, amount) => {
    if (!contract) return

    // Show initial preparation toast
    const preparingToastId = toast.loading(
      <div className='flex flex-col'>
        <span>Preparing Transaction</span>
        <span className='text-xs mt-1'>Please confirm in your wallet...</span>
      </div>,
      {
        duration: Infinity, // Keep the toast until we dismiss it
      }
    )

    try {
      // This will trigger the MetaMask popup
      const tx = await contract.transfer(to, { value: amount })

      // Dismiss the preparing toast
      toast.dismiss(preparingToastId)

      // Show the transaction sent toast
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

      // Dismiss the sending toast
      toast.dismiss(sendingToastId)

      if (receipt.status === 0) {
        throw new Error("Transaction failed")
      }

      // Show success toast
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
      // Dismiss any pending toasts
      toast.dismiss(preparingToastId)

      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        toast.error("Transaction rejected by user", {
          duration: 5000,
        })
      } else {
        console.error("Transfer failed:", error)
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
    <div className='min-h-screen bg-base-200 py-8'>
      <div className='max-w-4xl mx-auto px-4'>
        <div className='card bg-base-100 shadow-xl'>
          <div className='card-body'>
            <div className='flex justify-between items-center mb-6'>
              <h1 className='card-title text-3xl font-bold'>
                ETH Transfer Dapp
              </h1>
              <DisconnectWallet disconnectWallet={disconnectWallet} />
            </div>
            <div className='stats shadow mb-8'>
              <div className='stat'>
                <div className='stat-title'>Your Address</div>
                <div className='stat-value text-gray-800 text-sm sm:text-base md:text-lg truncate'>
                  {selectedAddress}
                </div>
              </div>
              <div className='stat'>
                <div className='stat-title'>Your Balance</div>
                <div className='stat-value text-gray-800 text-sm sm:text-base md:text-lg'>
                  {balance
                    ? `${ethers.formatEther(balance)} ETH`
                    : "Loading..."}
                </div>
              </div>
            </div>

            <div className='divider'></div>

            <div className='mt-8'>
              <Transfer transferTokens={transferEth} tokenSymbol='ETH' />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DApp
