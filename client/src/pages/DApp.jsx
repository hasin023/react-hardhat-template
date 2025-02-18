import { useEthereum } from "../hooks/useEthereum"
import { transferEth } from "../services/transactionService"
import { NoWalletDetected } from "../components/NoWalletDetected"
import { ConnectWallet } from "../components/ConnectWallet"
import { Loading } from "../components/Loading"
import { DashboardHeader } from "../components/DashboardHeader"
import { WalletInfo } from "../components/WalletInfo"
import Transfer from "../components/Transfer"
import { TransactionTable } from "../components/TransactionTable"

const DApp = () => {
  const {
    selectedAddress,
    balance,
    provider,
    contract,
    connectWallet,
    disconnectWallet,
    updateBalance,
  } = useEthereum()

  const handleTransfer = async (to, amount) => {
    await transferEth(contract, amount, to, updateBalance)
  }

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
            <DashboardHeader disconnectWallet={disconnectWallet} />
            <WalletInfo address={selectedAddress} balance={balance} />

            <div className='mb-4'>
              <Transfer
                transferTokens={handleTransfer}
                tokenSymbol='ETH'
                minAmount='0.001'
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
