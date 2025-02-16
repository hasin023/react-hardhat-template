import { useState, useEffect } from "react"
import { ethers } from "ethers"

const truncateAddress = (address) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function TransactionTable({ provider }) {
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!provider) return

      try {
        const blockNumber = await provider.getBlockNumber()
        const block = await provider.getBlock(blockNumber)

        if (block && block.transactions) {
          const txPromises = block.transactions
            .slice(0, 10)
            .map(async (txHash) => {
              const tx = await provider.getTransaction(txHash)

              return {
                hash: tx.hash,
                from: tx.from,
                to: tx.to || "Contract Creation",
                value: ethers.formatEther(tx.value),
              }
            })

          const txs = await Promise.all(txPromises)
          setTransactions(txs)
        }
      } catch (error) {
        console.error("Error fetching transactions:", error)
      }
    }

    fetchTransactions()
    const interval = setInterval(fetchTransactions, 10000)

    return () => clearInterval(interval)
  }, [provider])

  return (
    <div className='overflow-x-auto'>
      <table className='table w-full'>
        <thead>
          <tr>
            <th>Transaction Hash</th>
            <th>From</th>
            <th>To</th>
            <th>Value (ETH)</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.hash}>
              <td>{truncateAddress(tx.hash)}</td>
              <td>{truncateAddress(tx.from)}</td>
              <td>{truncateAddress(tx.to)}</td>
              <td>{tx.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
