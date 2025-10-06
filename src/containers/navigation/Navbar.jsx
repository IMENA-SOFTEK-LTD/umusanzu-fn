import { useEffect, useState, useCallback, memo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBars,
  faXmark,
  faCaretDown,
  faCaretUp,
  faArrowLeft,
  faUser,
  faCog,
  faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons'
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

const Navbar = memo(({ user }) => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { navDropdown, navResponsive, pathName } = useSelector(
    (state) => state.navbar
  )
  const { isOpen } = useSelector((state) => state.sidebar)
  const [isMobile, setIsMobile] = useState(false)

  // Memoized handlers to prevent unnecessary re-renders
  const handleSidebarToggle = useCallback((e) => {
    e.preventDefault()
    dispatch(toggleSidebar(!isOpen))
  }, [dispatch, isOpen])

  const handleNavDropdownToggle = useCallback(() => {
    dispatch(toggleNavDropdown(!navDropdown))
  }, [dispatch, navDropdown])

  const handleNavResponsiveToggle = useCallback(() => {
    dispatch(toggleNavResponsive(!navResponsive))
  }, [dispatch, navResponsive])

  const handleSettingsClick = useCallback((e) => {
    e.preventDefault()
    dispatch(setPathName('Settings'))
    localStorage.setItem('pathName', 'Settings')
    dispatch(toggleNavDropdown(false))
    navigate('/settings')
  }, [dispatch, navigate])

  const handleLogout = useCallback(() => {
    logOut()
    dispatch(toggleNavDropdown(false))
    dispatch(toggleNavResponsive(false))
    navigate('/login')
  }, [dispatch, navigate])

  // Optimized resize handler with debouncing
  useEffect(() => {
    let timeoutId = null
    
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth <= 768)
      }, 100)
    }

    // Set initial state
    setIsMobile(window.innerWidth <= 768)
    
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.navbar-dropdown')) {
        dispatch(toggleNavDropdown(false))
      }
      if (!event.target.closest('.navbar-mobile')) {
        dispatch(toggleNavResponsive(false))
      }
    }

    if (navDropdown || navResponsive) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [navDropdown, navResponsive, dispatch])

  // Don't render on auth pages
  if (pathname === '/login' || pathname === '/two-fa-authentication') {
    return null
  }

  return (
    <nav
      className={`fixed top-0 h-16 bg-white border-b border-gray-200 shadow-sm z-50 transition-all duration-300
        ${
          isMobile
            ? 'w-full left-0'
            : isOpen
            ? 'w-[calc(100%-20vw)] left-[20vw]'
            : 'w-[calc(100%-4rem)] left-16'
        }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex justify-between items-center h-full px-4 sm:px-6 lg:px-8">
        {/* Mobile Sidebar Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSidebarToggle}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
            aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <FontAwesomeIcon
              icon={isOpen ? faArrowLeft : faBars}
              className="h-5 w-5"
            />
          </button>

          {/* Page Title */}
          <h1 className="text-lg font-semibold text-gray-800 truncate">
            {pathName || 'Dashboard'}
          </h1>
        </div>

        {/* Desktop User Menu */}
        <div className="hidden sm:flex items-center relative">
          <div className="navbar-dropdown">
            <button
              onClick={handleNavDropdownToggle}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
              aria-expanded={navDropdown}
              aria-haspopup="true"
            >
              <div className="text-right">
                <p className="font-medium text-gray-800 text-sm truncate max-w-32">
                  {user?.names || 'User'}
                </p>
                <p className="text-xs text-gray-500 uppercase truncate max-w-32">
                  {user?.departments?.name || user?.department || 'Department'}
                </p>
              </div>
              <FontAwesomeIcon
                icon={navDropdown ? faCaretUp : faCaretDown}
                className="text-gray-600 text-sm"
              />
              <img
                src={CoatOFArms}
                alt="User avatar"
                className="h-8 w-8 rounded-full ring-2 ring-gray-200 object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iMTYiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI4IiB5PSI4Ij4KPHBhdGggZD0iTTggOEMxMC4yMDkxIDggMTIgNi4yMDkxNCAxMiA0QzEyIDEuNzkwODYgMTAuMjA5MSAwIDggMEM1Ljc5MDg2IDAgNCA1Ljc5MDg2IDQgNEM0IDYuMjA5MTQgNS43OTA4NiA4IDggOFoiIGZpbGw9IiM5Q0E0QUYiLz4KPHBhdGggZD0iTTggMTBDNS4yMzg1OCAxMCAzIDEyLjIzODYgMyAxNUgxM0MxMyAxMi4yMzg2IDEwLjc2MTQgMTAgOCAxMFoiIGZpbGw9IiM5Q0E0QUYiLz4KPC9zdmc+Cjwvc3ZnPgo='
                }}
              />
            </button>

            {/* Desktop Dropdown Menu */}
            {navDropdown && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                <button
                  onClick={handleSettingsClick}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                >
                  <FontAwesomeIcon icon={faCog} className="mr-3 h-4 w-4" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={handleNavResponsiveToggle}
          className="sm:hidden p-2 rounded-md text-gray-600 hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
          aria-expanded={navResponsive}
          aria-label="Toggle mobile menu"
        >
          <FontAwesomeIcon 
            icon={navResponsive ? faXmark : faUser} 
            className="h-5 w-5" 
          />
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {navResponsive && (
        <div className="navbar-mobile sm:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-3 space-y-3">
            <div className="pb-3 border-b border-gray-200">
              <p className="font-medium text-gray-800 truncate">
                {user?.names || 'User'}
              </p>
              <p className="text-xs text-gray-500 uppercase truncate">
                {user?.departments?.name || user?.department || 'Department'}
              </p>
            </div>
            
            <button
              onClick={handleSettingsClick}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-50 hover:text-primary transition-colors"
            >
              <FontAwesomeIcon icon={faCog} className="mr-3 h-4 w-4" />
              Settings
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
})

Navbar.displayName = 'Navbar'

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
