import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBars,
  faXmark,
  faCaretDown,
  faCaretUp,
  faArrowLeft,
  faArrowRight,
  faUserTimes,
  faUsers,
  faUser,
} from '@fortawesome/free-solid-svg-icons'
import { FaMicrosoft } from 'react-icons/fa'
import {
  setPathName,
  toggleNavDropdown,
  toggleNavResponsive,
} from '../../states/features/navigation/navbarSlice'
import { toggleSidebar } from '../../states/features/navigation/sidebarSlice'
import { logOut } from '../../utils/User'
import PropTypes from 'prop-types'
import CoatOFArms from '../../../public/CoatOFArms.png'
import Button from '../../components/Button'
import { useEffect, useState } from 'react'

function Navbar({ user }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { navDropdown, navResponsive, pathName } = useSelector(
    (state) => state.navbar
  )
  const { isOpen } = useSelector((state) => state.sidebar)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 640)
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])
  if (pathname === '/login' || pathname === '/two-fa-authentication')
    return null

  return (
    <nav
      className={`fixed top-0 h-16 bg-white border-b border-gray-200 shadow-sm z-50 transition-all duration-300
        ${
          isMobile
            ? 'w-full left-[0vw]'
            : isOpen
            ? 'w-[80vw] left-[20vw]'
            : 'w-[96vw] left-[4vw]'
        }`}
    >
      <div className="flex justify-between items-center h-full px-4 sm:px-6 lg:px-8">
        {/* Logo + page name */}
        <section className="hidden max-sm:flex">
          <Button
            className="px-0 py-0 p-0 bg-transparent"
            onClick={(e) => {
              e.preventDefault()
              dispatch(toggleSidebar(!isOpen))
            }}
            value={
              <span className="flex items-center justify-center">
                <FontAwesomeIcon
                  className="py-[10px] px-[11px] h-4 !rounded-[50%] bg-primary text-white shadow-sm"
                  icon={isOpen ? faArrowLeft : faBars}
                />
              </span>
            }
          />
        </section>
        <Link
          to="#"
          className="flex items-center gap-2 text-primary font-semibold hover:opacity-90"
        >
          {/* <FaMicrosoft className="w-5 h-5" /> */}
          <span className="text-gray-700">{pathName}</span>
        </Link>

        {/* Desktop User Info */}
        <div className="hidden sm:flex items-center gap-4 relative">
          <div
            className="cursor-pointer flex items-center gap-2"
            onClick={() => dispatch(toggleNavDropdown(!navDropdown))}
          >
            <div className="text-right">
              <p className="font-medium text-gray-800">{user?.names}</p>
              <p className="text-xs text-gray-500 uppercase">
                {user?.departments?.name || user?.department}
              </p>
            </div>
            <FontAwesomeIcon
              icon={navDropdown ? faCaretUp : faCaretDown}
              className="text-gray-600"
            />
            <img
              src={CoatOFArms}
              alt="avatar"
              className="h-10 w-10 rounded-full ring-2 ring-gray-200"
            />
          </div>

          {/* Dropdown */}
          {navDropdown && (
            <div className="absolute top-14 right-0 bg-white border rounded-lg shadow-lg w-48">
              <Link
                to="/settings"
                className="block px-4 py-3 text-gray-700 hover:bg-primary hover:text-white"
                onClick={(e) => {
                  e.preventDefault()
                  dispatch(setPathName('Settings'))
                  localStorage.setItem('pathName', 'Settings')
                }}
              >
                Settings
              </Link>
              <button
                onClick={() => {
                  logOut()
                  dispatch(toggleNavDropdown(false))
                  navigate('/login')
                }}
                className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-primary hover:text-white"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => dispatch(toggleNavResponsive(!navResponsive))}
          className="sm:hidden text-primary"
        >
          <FontAwesomeIcon icon={navResponsive ? faXmark : faUser} size="lg" />
        </button>
      </div>

      {/* Mobile Dropdown */}
      {navResponsive && (
        <div className="sm:hidden bg-white border-t shadow-md px-4 py-3">
          <div className="flex flex-col gap-3">
            <p className="font-medium text-gray-800">{user?.names}</p>
            <p className="text-xs text-gray-500 uppercase">
              {user?.departments?.name || user?.department}
            </p>
            <Link
              to="/settings"
              className="px-3 py-2 rounded-md hover:bg-primary hover:text-white"
              onClick={(e) => {
                e.preventDefault()
                dispatch(toggleNavResponsive(false))
                dispatch(setPathName('Settings'))
                localStorage.setItem('pathName', 'Settings')
              }}
            >
              Settings
            </Link>
            <button
              onClick={() => {
                logOut()
                dispatch(toggleNavResponsive(false))
                navigate('/login')
              }}
              className="text-left px-3 py-2 rounded-md hover:bg-primary hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

Navbar.propTypes = {
  user: PropTypes.shape({
    names: PropTypes.string,
    departments: PropTypes.shape({
      name: PropTypes.string,
    }),
    department: PropTypes.string,
  }),
}

export default Navbar
