import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import CoatOFArms from '../../../public/CoatOFArms.png'
import PropTypes from 'prop-types'
import Button from '../../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faArrowRight,
  faBars,
  faCaretDown,
  faCaretUp,
  faX,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import {
  toggleNavDropdown,
  toggleNavResponsive,
} from '../../states/features/navigation/navbarSlice'
import { logOut } from '../../utils/User'
import { FaMicrosoft } from 'react-icons/fa'
import { IoIosArrowForward } from 'react-icons/io'
import { toggleSidebar } from '../../states/features/navigation/sidebarSlice'

function Navbar({ user }) {
  const { pathname } = useLocation()

  const { navDropdown, pathName, navResponsive } = useSelector(
    (state) => state.navbar
  )

  const { isOpen } = useSelector((state) => state.sidebar)

  const dispatch = useDispatch()

  const navigate = useNavigate()

  if (pathname === '/login') return null

  return (
    <nav
      className={'w-full bg-white drop-shadow-md z-20 py-2 my-2 px-8 border-l-none border-b border-gray-200 flex items-center justify-between'}
    >
      <section className='hidden max-sm:flex'>
      <Button
        className="px-0 py-0 p-0 bg-transparent"
        onClick={(e) => {
          e.preventDefault()
          dispatch(toggleSidebar(!isOpen))
        }}
        value={
          <span className='flex items-center justify-center'>
            <FontAwesomeIcon
              className="py-[10px] px-[9px] h-4 !rounded-[50%] bg-primary text-white shadow-sm"
              icon={isOpen ? faArrowLeft : faArrowRight}
            />
          </span>
        }
      />
      </section>

      <Link
        to="/dashboard"
        className="flex items-center py-1 px-3 transition-colors ease-in-out duration-300 transform rounded-md text-amber-600 hover:scale-[.98]"
      >
        <FaMicrosoft className="w-5 h-5" />
        <IoIosArrowForward className="w-7 h-4 pl-2 text-gray-400 " />

        <span className="mx-2 text-sm font-medium text-gray-800 py-2">
          {pathName}
        </span>
      </Link>
      <section
        className={`${
          navResponsive
            ? 'max-sm:translate-y-[-200%]'
            : 'max-sm:translate-y-[100%] max-sm:py-2'
        } ease-in-out duration-500 flex items-center gap-2 bg-white content-start w-fit px-8 divide-x-2 divide-gray-200 max-sm:small-navbar`}
      >
        <span className="flex flex-col items-center">
          <Button
            value={
              <span className="flex items-center gap-4">
                <p className="text-black text-[18px]">{user?.names}</p>
                <FontAwesomeIcon
                  icon={navDropdown ? faCaretUp : faCaretDown}
                  className="hover:scale-[1.02] ease-in-out duration-500 text-black"
                />
              </span>
            }
            className="bg-transparent hover:scale-[1.01] ease-in-out duration-300 text-black"
            onClick={(e) => {
              e.preventDefault()
              dispatch(toggleNavDropdown(!navDropdown))
            }}
          />
          <p className="text-gray-400 uppercase">
            {user?.departments?.name || user?.department}
          </p>
        </span>
        <figure className="ml-2 w-fit">
          <img
            className="inline-block h-10 w-10 rounded-full ring-2 ring-white ml-2"
            src={CoatOFArms}
            alt="avatar"
          />
        </figure>
        <article
          className={`${
            !navDropdown ? 'translate-y-[-300%]' : 'translate-y-0'
          } ease-in-out duration-500 absolute top-20 right-20 mx-auto z-[1000000] rounded-md shadow-lg flex flex-col items-center gap-2 bg-white min-w-[16rem] max-sm:small-dropdown`}
        >
          <Link
            to="/settings"
            className="bg-white text-[15px] w-full py-4 px-8 flex items-center z-[999] justify-center hover:scale-[1.01] hover:bg-cyan-800 hover:text-white"
          >
            Settings
          </Link>
          <Link
            className="bg-white text-[15px] w-full py-4 px-8 flex items-center z-[999] justify-center hover:scale-[1.01] hover:bg-cyan-800 hover:text-white"
            onClick={(e) => {
              e.preventDefault()
              logOut()
              dispatch(toggleNavDropdown(!navDropdown))
              navigate('/login')
            }}
          >
            Logout
          </Link>
        </article>
      </section>
      <section className="hidden max-sm:flex">
        <Button
          onClick={(e) => {
            e.preventDefault()
            dispatch(toggleNavResponsive(!navResponsive))
          }}
          className="!py-0 !px-0 !bg-transparent"
          value={
            <FontAwesomeIcon
              className="!text-white bg-primary !p-2 !px-[10px] rounded-[50%] text-[5px] h-6"
              icon={!navResponsive ? faXmark : faBars}
            />
          }
        />
      </section>
    </nav>
  )
}

Navbar.propTypes = {
  user: PropTypes.shape({
    names: PropTypes.string,
  }),
}

export default Navbar
