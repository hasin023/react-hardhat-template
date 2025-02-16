export function Transfer({ transferTokens, tokenSymbol }) {
  return (
    <div className='card w-96 bg-base-100 shadow'>
      <div className='card-body'>
        <h2 className='card-title'>Transfer</h2>
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
        >
          <div className='form-control w-full max-w-xs'>
            <label className='label'>
              <span className='label-text'>Amount of {tokenSymbol}</span>
            </label>
            <input
              type='number'
              step='1'
              name='amount'
              placeholder='1'
              required
              className='input input-bordered w-full max-w-xs'
            />
          </div>
          <div className='form-control w-full max-w-xs mt-4'>
            <label className='label'>
              <span className='label-text'>Recipient address</span>
            </label>
            <input
              type='text'
              name='to'
              required
              className='input input-bordered w-full max-w-xs'
            />
          </div>
          <div className='card-actions justify-end mt-6'>
            <button className='btn btn-accent' type='submit'>
              Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
