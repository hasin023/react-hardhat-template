export function NoWalletDetected() {
  return (
    <div className='hero min-h-screen bg-base-200'>
      <div className='hero-content text-center'>
        <div className='max-w-md'>
          <h1 className='text-5xl font-bold'>No Wallet Detected</h1>
          <p className='py-6'>
            No Ethereum wallet was detected. Please install{" "}
            <a
              href='https://www.coinbase.com/wallet'
              target='_blank'
              rel='noopener noreferrer'
              className='link link-primary'
            >
              Coinbase Wallet
            </a>{" "}
            or{" "}
            <a
              href='http://metamask.io'
              target='_blank'
              rel='noopener noreferrer'
              className='link link-primary'
            >
              MetaMask
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
