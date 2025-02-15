export function DisconnectWallet({ disconnectWallet }) {
  return (
    <button className='btn btn-outline btn-error' onClick={disconnectWallet}>
      Disconnect Wallet
    </button>
  )
}
