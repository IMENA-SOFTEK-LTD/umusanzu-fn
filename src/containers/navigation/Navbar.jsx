import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import CoatOFArms from '/CoatOFArms.png'
import PropTypes from 'prop-types'
import Button from '../../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons'
import { toggleNavDropdown } from '../../states/features/navigation/navbarSlice'
import { logOut } from '../../utils/user'
import { FaMicrosoft } from 'react-icons/fa'
import { IoIosArrowForward } from 'react-icons/io'
function Navbar({ user }) {
  const { pathname } = useLocation()

  const { user: stateUser } = useSelector((state) => state.auth)

  const { navDropdown } = useSelector((state) => state.navbar)

  const dispatch = useDispatch()

  const navigate = useNavigate()

  if (pathname === '/login') return null

  return (
    <nav className={`w-full bg-white drop-shadow-md z-20 py-4 my-2 px-8 border-l-none border-b border-gray-200 flex items-center justify-between`}>
      <Link
        to="/dashboard"
        className="flex items-center py-1 px-3  text-gray-600 transition-colors duration-300 transform rounded-lg dark:text-amber-600 hover:bg-gray-100 dark:hover:bg-gray-100 dark:hover:text-amber-800 hover:text-gray-700"
      >
        <FaMicrosoft className="w-5 h-5" />
        <IoIosArrowForward className="w-7 h-4 pl-2 text-gray-400 " />

        <span className="mx-2 text-sm font-medium text-gray-800 py-2">
          Dashboard
        </span>
      </Link>
      <div className="flex relative items-center gap-2 content-start w-fit px-8 divide-x-2 divide-gray-200">
        <Button
          value={
            <span className="flex items-center gap-4">
              <p>{stateUser?.names || user?.names}</p>
              <FontAwesomeIcon
                icon={navDropdown ? faCaretUp : faCaretDown}
                className="hover:scale-[1.02] ease-in-out duration-500"
              />
            </span>
          }
          className="bg-transparent hover:scale-[1.01] ease-in-out duration-300"
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
        <article
          className={`${
            !navDropdown ? 'translate-y-[-200%]' : 'translate-y-0'
          } ease-in-out duration-500 absolute top-14 right-20 rounded-md shadow-lg flex flex-col items-center gap-2 bg-white min-w-[15rem]`}
        >
          <Link
            to="/settings"
            className="bg-white text-[15px] w-full py-4 px-8 flex items-center z-[999] justify-center hover:scale-[1.01] hover:bg-cyan-800 hover:text-white"
          >
            Settings
          </Link>
          <Button
            className="bg-white text-[15px] w-full py-4 px-8 flex items-center z-[999] justify-center hover:scale-[1.01] hover:bg-cyan-800 hover:text-white"
            value="Logout"
            onClick={(e) => {
              e.preventDefault()
              logOut()
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
