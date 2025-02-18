import { DisconnectWallet } from "./DisconnectWallet"

export const DashboardHeader = ({ disconnectWallet }) => (
  <div className='flex justify-between items-center mb-6'>
    <h1 className='text-2xl font-semibold'>ETH Transfer Dapp</h1>
    <DisconnectWallet disconnectWallet={disconnectWallet} />
  </div>
)
