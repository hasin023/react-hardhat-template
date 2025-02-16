const Transfer = ({ transferTokens, tokenSymbol, minAmount }) => {
  return (
    <div className='bg-gray-50 rounded-lg p-6'>
      <h2 className='text-lg font-semibold mb-4'>Transfer {tokenSymbol}</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const formData = new FormData(event.target)
          const to = formData.get("to")
          const amount = formData.get("amount")
          if (to && amount) {
            transferTokens(to, amount)
          }
        }}
        className='space-y-4'
      >
        <div>
          <label
            htmlFor='amount'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Amount of {tokenSymbol}
          </label>
          <input
            type='number'
            step='0.000001'
            min={minAmount}
            name='amount'
            id='amount'
            placeholder={minAmount}
            required
            className='input input-bordered w-full'
          />
        </div>
        <div>
          <label
            htmlFor='to'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Recipient address
          </label>
          <input
            type='text'
            name='to'
            id='to'
            required
            className='input input-bordered w-full'
            placeholder='0x...'
          />
        </div>
        <div className='pt-2'>
          <button className='btn btn-success w-full' type='submit'>
            Transfer
          </button>
        </div>
      </form>
    </div>
  )
}

export default Transfer
