export function Loading() {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-opacity-50'>
      <div className='text-center'>
        <div className='loading bg-black loading-spinner loading-lg'></div>
        <p className='mt-4 text-xl font-semibold'>Loading...</p>
      </div>
    </div>
  )
}
