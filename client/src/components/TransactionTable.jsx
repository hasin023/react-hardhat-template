import { useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react"

import { NavLink } from "react-router"

const TRANSACTIONS_PER_PAGE = 10

const truncateAddress = (address) => {
  if (!address) return "N/A"
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function TransactionTable({ provider }) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState(null)

  const fetchTransactions = useCallback(
    async (page = currentPage) => {
      if (!provider) return
      try {
        setLoading(true)
        setError(null)

        // Fetch transaction hashes from API with pagination
        const response = await fetch(
          `http://localhost:3001/api/txhashes?page=${page}&limit=${TRANSACTIONS_PER_PAGE}`
        )

        if (!response.ok) {
          throw new Error("Failed to fetch transaction hashes from API")
        }

        const { data: txHashesData, pagination } = await response.json()

        // Update pagination state
        setTotalPages(pagination.totalPages)
        setTotalTransactions(pagination.totalItems)

        // Fetch transaction details from blockchain
        const transactions = await Promise.all(
          txHashesData.map(async ({ transactionHash, timestamp }) => {
            try {
              const tx = await provider.getTransaction(transactionHash)
              if (!tx) return null

              return {
                hash: tx.hash,
                blockNumber: tx.blockNumber || "Pending",
                from: tx.from,
                to: tx.to || "Contract Creation",
                value: ethers.formatEther(tx.value || 0),
                timestamp: new Date(timestamp),
              }
            } catch (error) {
              console.error(
                `Error fetching transaction ${transactionHash}:`,
                error
              )
              return null
            }
          })
        )

        const validTransactions = transactions.filter((tx) => tx !== null)
        setTransactions(validTransactions)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching transactions:", error)
        setError("Failed to fetch transactions. Please try again later.")
        setLoading(false)
      }
    },
    [provider, currentPage]
  )

  useEffect(() => {
    fetchTransactions(currentPage)
    const interval = setInterval(() => fetchTransactions(currentPage), 60000)
    return () => clearInterval(interval)
  }, [fetchTransactions, currentPage])

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  if (error) {
    return (
      <div className='p-4 text-red-500 bg-red-50 rounded-lg'>
        <p>{error}</p>
      </div>
    )
  }

  const startIndex = (currentPage - 1) * TRANSACTIONS_PER_PAGE
  const endIndex = Math.min(
    startIndex + TRANSACTIONS_PER_PAGE,
    totalTransactions
  )

  return (
    <div className='space-y-4'>
      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Tx Hash
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Block No
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  From
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Contract Address
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Value (ETH)
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {loading ? (
                <tr>
                  <td colSpan={8} className='px-6 py-4 text-center'>
                    <div className='flex items-center justify-center'>
                      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className='px-6 py-4 text-center text-gray-500'
                  >
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr
                    key={tx.hash}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-6 py-4 whitespace-nowrap text-sm'>
                      <div className='flex items-center space-x-2'>
                        <span className='text-blue-600'>
                          {truncateAddress(tx.hash)}
                        </span>
                        <NavLink
                          to={`/tx/${tx.hash}`}
                          className='text-gray-400 hover:text-gray-600'
                          end
                        >
                          <ExternalLink size={14} />
                        </NavLink>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {tx.blockNumber}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {truncateAddress(tx.from)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {truncateAddress(tx.to)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {parseFloat(tx.value).toFixed(6)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {tx.timestamp.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between px-4 py-3 bg-white rounded-lg shadow-md'>
          <div className='flex-1 flex justify-between sm:hidden'>
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Previous
            </button>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className='ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Next
            </button>
          </div>
          <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
            <div>
              <p className='text-sm text-gray-700'>
                Showing <span className='font-medium'>{startIndex + 1}</span> to{" "}
                <span className='font-medium'>{endIndex}</span> of{" "}
                <span className='font-medium'>{totalTransactions}</span> results
              </p>
            </div>
            <div>
              <nav className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'>
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <ArrowLeft className='h-5 w-5' />
                </button>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <ArrowRight className='h-5 w-5' />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
