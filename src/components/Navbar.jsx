import { Link, useLocation } from 'react-router-dom'
// eslint-disable-next-line import/no-absolute-path
import CoatOFArms from '/CoatOFArms.png'

function Navbar () {
  const { pathname } = useLocation()

  if (pathname === '/login') return null

  return (

<nav className="bg-white drop-shadow-md z-20 py-4 px-8 fixed w-full mx-auto max-w-[80%] border-l-none border-b border-gray-200 flex items-center justify-between mb-7">
 <Link to='/dashboard' className='flex items-center py-1 px-3  text-gray-600 transition-colors duration-300 transform rounded-lg dark:text-amber-600 hover:bg-gray-100 dark:hover:bg-gray-100 dark:hover:text-amber-800 hover:text-gray-700'>
 <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605"
                />
              </svg>
              <svg className="w-4 h-4 pl-2 text-gray-400 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 8 14">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 13 5.7-5.326a.909.909 0 0 0 0-1.348L1 1"/>
             </svg>

              <span className="mx-2 text-sm font-medium text-gray-800">
                Dashboard
              </span>
 </Link>
 <div className="grid grid-cols-2 gap-2 content-start divide-x-2 pr-3 divide-gray-200">
  <div className='grid grid-cols-1'>
     <span className='text-gray-600'>username</span>
     <span className='text-gray-400'>title</span>
  </div>
  <div className='ml-2'>
  <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white ml-2" src={CoatOFArms} alt="avatar"/>
  </div>
</div>
</nav>
  )
}

export default Navbar
