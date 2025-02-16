import { NavLink } from "react-router"
import { AlertCircle, Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className='min-h-screen py-8'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='card'>
          <div className='card-body'>
            <div className='mb-6'>
              <AlertCircle className='w-16 h-16 text-gray-400' />
            </div>

            <h1 className='text-2xl font-semibold mb-3'>
              Sorry! We are unable to locate the page you&apos;re looking for
            </h1>

            <p className='text-gray-500 mb-8'>
              The page you are looking for might have been removed, had its name
              changed, or is temporarily unavailable.
            </p>

            <div className='w-full max-w-md mb-8'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                <input
                  type='text'
                  placeholder='Search by Address / Txn Hash / Block / Token'
                  className='input input-bordered w-full pl-10 bg-gray-50 focus:bg-white'
                />
              </div>
            </div>

            <div className='flex flex-col sm:flex-row gap-4 text-sm'>
              <NavLink to='/' className='btn btn-info btn-outline gap-2'>
                <Home className='w-4 h-4' />
                Go to Home
              </NavLink>
            </div>

            <div className='mt-8 pt-8 border-t text-sm text-gray-500 flex items-start gap-2'>
              <AlertCircle className='w-4 h-4 mt-0.5' />
              <p>
                If you believe this is an error with our service, please contact
                our support team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
