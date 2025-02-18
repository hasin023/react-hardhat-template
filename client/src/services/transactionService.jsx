import { ethers } from "ethers"
import toast from "react-hot-toast"
import { truncateAddress } from "../utils/formatting"

const ERROR_CODE_TX_REJECTED_BY_USER = 4001

export const transferEth = async (contract, amount, to, onSuccess) => {
  const preparingToastId = toast.loading(
    <div className='flex flex-col'>
      <span>Preparing Transaction</span>
      <span className='text-xs mt-1'>Please confirm in your wallet...</span>
    </div>,
    { duration: Infinity }
  )

  try {
    const amountInWei = ethers.parseEther(amount)
    const tx = await contract.transfer(to, { value: amountInWei })

    toast.dismiss(preparingToastId)

    const sendingToastId = toast.loading(
      <div className='flex flex-col'>
        <span>Transaction Sent</span>
        <span className='text-xs mt-1'>Hash: {truncateAddress(tx.hash)}</span>
      </div>,
      { duration: Infinity }
    )

    const receipt = await tx.wait()
    toast.dismiss(sendingToastId)

    if (receipt.status === 0) throw new Error("Transaction failed")

    await storeTransactionHash(tx.hash)

    toast.success(
      <div className='flex flex-col'>
        <span>Transaction Successful!</span>
        <span className='text-xs mt-1'>Block: {receipt.blockNumber}</span>
      </div>
    )

    onSuccess?.()
    return receipt
  } catch (error) {
    toast.dismiss(preparingToastId)
    handleTransactionError(error)
    throw error
  }
}

const storeTransactionHash = async (hash) => {
  try {
    const response = await fetch("http://localhost:3001/api/txhashes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionHash: hash }),
    })

    if (!response.ok) {
      console.error("Failed to store transaction hash in database")
    }
  } catch (error) {
    console.error("Error storing transaction hash:", error)
  }
}

const handleTransactionError = (error) => {
  if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
    toast.error("Transaction rejected by user")
  } else {
    toast.error(
      <div className='flex flex-col'>
        <span>Transaction Failed</span>
        <span className='text-xs mt-1'>{error.message}</span>
      </div>
    )
  }
}
