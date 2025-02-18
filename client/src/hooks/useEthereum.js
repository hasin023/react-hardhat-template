import { useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"
import toast from "react-hot-toast"
import EthTransferArtifact from "../contracts/EthTransfer.json"
import contractAddress from "../contracts/contract-address.json"

const HARDHAT_NETWORK_ID = "31337"
const WALLET_KEY = "connected_wallet"

export const useEthereum = () => {
  const [selectedAddress, setSelectedAddress] = useState()
  const [balance, setBalance] = useState()
  const [provider, setProvider] = useState()
  const [contract, setContract] = useState()

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
        toast.error("Please switch to the correct network")
      }
    }
  }, [])

  const initializeEthers = useCallback(async (userAddress) => {
    try {
      setSelectedAddress(userAddress)
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
      toast.error("Failed to connect wallet")
    }
  }, [checkNetwork, initializeEthers])

  const disconnectWallet = useCallback(() => {
    setSelectedAddress(undefined)
    setBalance(undefined)
    setProvider(undefined)
    setContract(undefined)
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

  useEffect(() => {
    const restoreConnection = async () => {
      const savedAddress = localStorage.getItem(WALLET_KEY)
      if (savedAddress && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          })
          if (accounts.includes(savedAddress)) {
            await checkNetwork()
            await initializeEthers(savedAddress)
          } else {
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

  return {
    selectedAddress,
    balance,
    provider,
    contract,
    connectWallet,
    disconnectWallet,
    updateBalance,
  }
}
