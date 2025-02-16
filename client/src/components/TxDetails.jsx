import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { ethers } from "ethers"
import { CheckCircle2, Copy, ExternalLink, Clock, Info } from "lucide-react"

const TxDetails = () => {
  const { txHash } = useParams()
  const [txReceipt, setTxReceipt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [provider, setProvider] = useState(null)

  useEffect(() => {
    const initializeProvider = async () => {
      if (window.ethereum) {
        const web3Provider = new ethers.BrowserProvider(window.ethereum)
        setProvider(web3Provider)
      } else {
        setError("No Ethereum provider detected")
        setLoading(false)
      }
    }
    initializeProvider()
  }, [])

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!provider) return
      try {
        const receipt = await provider.getTransactionReceipt(txHash)
        setTxReceipt(receipt)
      } catch (err) {
        setError("Failed to fetch transaction details")
      }
      setLoading(false)
    }

    if (txHash && provider) {
      fetchTransaction()
    }
  }, [txHash, provider])

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[400px]'>
        <span className='loading loading-spinner loading-md'></span>
      </div>
    )
  }

  if (error || !txReceipt) {
    return (
      <div className='alert alert-error max-w-3xl mx-auto mt-8'>
        <Info className='w-5 h-5' />
        <span>{error || "Transaction not found"}</span>
      </div>
    )
  }

  return (
    <div className='min-h-screen py-8'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='card'>
          <div className='card-body'>
            <div className='mb-6'>
              <h1 className='text-2xl font-semibold mb-2'>
                Transaction Details
              </h1>
            </div>

            <div className='bg-white rounded-lg shadow-sm border'>
              <div className='divide-y'>
                <InfoRow label='Transaction Hash' value={txHash} copyable />
                <InfoRow
                  label='Status'
                  value={
                    <span className='flex items-center gap-2'>
                      <span
                        className={`badge gap-1 ${
                          txReceipt.status === 1
                            ? "badge-success"
                            : "badge-error"
                        }`}
                      >
                        <CheckCircle2 className='w-3 h-3' />
                        {txReceipt.status === 1 ? "Success" : "Failed"}
                      </span>
                    </span>
                  }
                />
                <InfoRow
                  label='Block'
                  value={
                    <div className='flex items-center gap-2'>
                      <span>{txReceipt.blockNumber}</span>
                      <span className='text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded'>
                        2 Block Confirmations
                      </span>
                    </div>
                  }
                />
                <InfoRow label='From' value={txReceipt.from} copyable />
                <InfoRow
                  label='To'
                  value={txReceipt.to || "Contract Creation"}
                  copyable
                />
                <InfoRow
                  label='Gas Price'
                  value={
                    <div>
                      {ethers.formatUnits(txReceipt.gasPrice, "gwei")} Gwei
                      <span className='text-gray-500 ml-2'>
                        ({ethers.formatEther(txReceipt.gasPrice)} ETH)
                      </span>
                    </div>
                  }
                />
                <InfoRow
                  label='Gas Used'
                  value={
                    <div>
                      {ethers.formatUnits(txReceipt.gasUsed, "gwei")} Gwei
                      <span className='text-gray-500 ml-2'>
                        ({ethers.formatEther(txReceipt.gasUsed)} ETH)
                      </span>
                    </div>
                  }
                />
                <InfoRow
                  label='Transaction Fee'
                  value={
                    <div>
                      {ethers.formatEther(
                        txReceipt.gasUsed * txReceipt.gasPrice
                      )}{" "}
                      ETH
                      <span className='text-gray-500 ml-2'>($0.06)</span>
                    </div>
                  }
                />
              </div>
            </div>

            <div className='mt-8 text-sm text-gray-500 flex items-start gap-2'>
              <Info className='w-4 h-4 mt-0.5' />
              <p>
                A transaction is a cryptographically signed instruction that
                changes the blockchain state. Block explorers track the details
                of all transactions in the network.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const InfoRow = ({ label, value, copyable }) => (
  <div className='grid grid-cols-1 md:grid-cols-[240px_1fr] p-4 gap-4'>
    <div className='text-gray-500'>{label}:</div>
    <div className='font-mono break-all flex items-center gap-2'>
      {value}
      {copyable && (
        <div className='flex gap-1'>
          <button
            onClick={() => navigator.clipboard.writeText(value)}
            className='btn btn-xs btn-ghost'
          >
            <Copy className='w-4 h-4' />
          </button>
          <a
            href={`https://etherscan.io/tx/${value}`}
            target='_blank'
            rel='noopener noreferrer'
            className='btn btn-xs btn-ghost'
          >
            <ExternalLink className='w-4 h-4' />
          </a>
        </div>
      )}
    </div>
  </div>
)

export default TxDetails
