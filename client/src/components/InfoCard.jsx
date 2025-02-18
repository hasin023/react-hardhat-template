export const InfoCard = ({ label, value }) => (
  <div className='bg-gray-50 rounded-lg p-4'>
    <div className='text-sm text-gray-500 mb-1 font-semibold'>{label}</div>
    <div className='font-mono text-sm break-all'>{value}</div>
  </div>
)
