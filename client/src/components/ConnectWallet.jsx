export function ConnectWallet({ connectWallet }) {
  return (
    <div className='hero min-h-screen bg-base-200'>
      <div className='hero-content text-center'>
        <div className='max-w-xl mx-auto'>
          <h1 className='text-5xl font-bold'>Welcome to ETHTrade!</h1>
          <p className='py-6'>Please connect your wallet to continue.</p>
          <button className='btn btn-outline' onClick={connectWallet}>
            Connect Wallet
          </button>
        </div>
      </div>
    </div>
  )
}
