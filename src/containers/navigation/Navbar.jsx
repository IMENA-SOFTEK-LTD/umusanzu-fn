import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import CoatOFArms from '/CoatOFArms.png'
import PropTypes from 'prop-types'
import Button from '../../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons'
import { toggleNavDropdown } from '../../states/features/navigation/navbarSlice'
import { logOut } from '../../utils/user'

function Navbar({ user }) {
  const { pathname } = useLocation()

  const { user: stateUser } = useSelector((state) => state.auth)

  const { navDropdown } = useSelector((state) => state.navbar)

  const dispatch = useDispatch()

  const navigate = useNavigate()

  if (pathname === '/login') return null

  return (
    <nav className="bg-white drop-shadow-md z-20 py-4 my-2 px-8 sticky w-full mx-auto max-w-[100%] border-l-none border-b border-gray-200 flex items-center justify-between">
      <Link
        to="/dashboard"
        className="flex items-center py-1 px-3  text-gray-600 transition-colors duration-300 transform rounded-lg dark:text-amber-600 hover:bg-gray-100 dark:hover:bg-gray-100 dark:hover:text-amber-800 hover:text-gray-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605"
          />
        </svg>
        <svg
          className="w-4 h-4 pl-2 text-gray-400 "
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 8 14"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 13 5.7-5.326a.909.909 0 0 0 0-1.348L1 1"
          />
        </svg>

        <span className="mx-2 text-sm font-medium text-gray-800">
          Dashboard
        </span>
      </Link>
      <div className="flex relative items-center gap-2 content-start w-fit px-8 divide-x-2 divide-gray-200">
        <Button
        value={<span className='flex items-center gap-4'>
          <p>{stateUser?.names || user.names}</p>
          <FontAwesomeIcon icon={navDropdown ? faCaretUp : faCaretDown} className='hover:scale-[1.02] ease-in-out duration-500' />
        </span>}
        className='bg-transparent hover:scale-[1.01] ease-in-out duration-300'
        onClick={(e) => {
          e.preventDefault()
          dispatch(toggleNavDropdown(!navDropdown))
        }}
        />
        <figure className="ml-2 w-fit">
          <img
            className="inline-block h-10 w-10 rounded-full ring-2 ring-white ml-2"
            src={CoatOFArms}
            alt="avatar"
          />
        </figure>
        <article className={`${!navDropdown ? 'translate-y-[-200%]' : 'translate-y-0'} ease-in-out duration-500 absolute top-14 right-20 rounded-md shadow-lg flex flex-col items-center gap-2 bg-white min-w-[12rem]`}>
        <Button
        className='bg-white text-[15px] w-full py-4 px-8 flex items-center justify-center hover:scale-[1.01]'
        value='Settings'
        />
        <Button
        className='bg-white text-[15px] w-full py-4 px-8 flex items-center justify-center hover:scale-[1.01]'
        value='Logout'
        onClick={(e) => {
          e.preventDefault()
          logOut();
          dispatch(toggleNavDropdown(!navDropdown))
          navigate('/login')
        }}
        />
      </article>
      </div>
    </nav>
  )
}

Navbar.propTypes = {
  user: PropTypes.shape({
    names: PropTypes.string,
  }),
}

export default Navbar
