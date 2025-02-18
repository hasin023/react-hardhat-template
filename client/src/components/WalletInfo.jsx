import { ethers } from "ethers"
import { InfoCard } from "./InfoCard"

export const WalletInfo = ({ address, balance }) => (
  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
    <InfoCard label='Wallet Address' value={address} />
    <InfoCard
      label='Balance'
      value={balance ? `${ethers.formatEther(balance)} ETH` : "Loading..."}
    />
  </div>
)
