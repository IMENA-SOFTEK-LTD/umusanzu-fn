import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  BsHousesFill,
  BsFillArrowLeftSquareFill,
  BsFillArrowRightSquareFill,
} from 'react-icons/bs'
import PropTypes from 'prop-types'
import { AiOutlineTransaction } from 'react-icons/ai'
import {
  FaListAlt,
  FaMicrosoft,
  FaBorderAll,
  FaPaypal,
  FaSearch,
} from 'react-icons/fa'
import { MdOutlineSettingsSuggest } from 'react-icons/md'
import { useState, useEffect } from 'react'

import { motion, useAnimation } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import {
  setPathRoute,
  toggleSidebar,
} from '../../states/features/navigation/sidebarSlice'
import { setPathName } from '../../states/features/navigation/navbarSlice'

function Sidebar({ user }) {
  const { user: stateUser } = useSelector((state) => state.auth)
  const { isOpen } = useSelector((state) => state.sidebar)
  const { pathName } = useSelector((state) => state.navbar)

  let department = ''

  switch (user?.departments?.level_id || stateUser?.departments?.level_id) {
    case 1:
      department = 'province'
      break
    case 2:
      department = 'district'
      break
    case 3:
      department = 'sector'
      break
    case 4:
      department = 'cell'
      break
    case 5:
      department = 'country'
      break
    case 6:
      department = 'agent'
      break
    default:
      department = 'agent'
  }

  const data = [
    {
      name: 'Manage',
      items: [
        {
          title: 'Dashboard',
          icon: FaMicrosoft,
          path: '/dashboard',
          route: '/dashboard',
        },
        {
          title: 'Households',
          icon: BsHousesFill,
          path: `${
            department === 'country' ||
            department === 'province' ||
            department === 'district'
              ? '/select-department'
              : '/households'
          }`,
          route: '/households',
        },
        {
          title: 'Departments',
          icon: FaBorderAll,
          path: `${
            department === 'country' || 
            department === 'sector'
              ? '/performances'
              : '/departments'
          }`,
          route: '/departments',
        },
        {
          title: 'Transactions',
          icon: AiOutlineTransaction,
          path: `${
            department === 'country' ||
            department === 'province' ||
            department === 'district'
              ? '/select-department'
              : '/transactions'
          }`,
          route: '/transactions',
        },
        {
          title: 'Household Stats',
          icon: FaListAlt,
          path: '/households/stats',
          route: '/households/stats',
        },
        {
          title: 'Complete Initiated Payments',
          icon: FaPaypal,
          path: '/agent/transactions/initiated',
          route: '/agent/transactions/initiated',
        },
        {
          title: 'Reports',
          icon: FaListAlt,
          path: '/reports',
          route: '/reports',
        },
      ],
    },
    {
      name: 'Search',
      items: [
        {
          title: 'Search Households',
          icon: FaSearch,
          path: '/households/search',
        },
      ],
    },
    {
      name: 'Customization',
      items: [
        {
          title: 'Settings',
          icon: MdOutlineSettingsSuggest,
          path: '/settings',
        },
      ],
    },
  ]

  const [active, setActive] = useState(isOpen)
  const controls = useAnimation()
  const controlText = useAnimation()
  const controlTitleText = useAnimation()

  const { pathname } = useLocation()

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const showMore = () => {
    controls.start({
      width: '20vw',
      transition: { duration: 0.001 },
    })
    controlText.start({
      opacity: 1,
      display: 'block',
      transition: { delay: 0.3 },
    })
    controlTitleText.start({
      opacity: 1,
      transition: { delay: 0.3 },
    })

    dispatch(toggleSidebar(true))
  }

  const showLess = () => {
    controls.start({
      width: '4vw',
      transition: { duration: 0.001 },
    })

    controlText.start({
      opacity: 0,
      display: 'none',
    })

    controlTitleText.start({
      opacity: 0,
    })

    dispatch(toggleSidebar(false))
  }

  useEffect(() => {
    showMore()
  }, [])

  const pathsToHideSidebar = ['/login', '/two-fa-authentication']

  if (pathsToHideSidebar.includes(pathname)) {
    dispatch(toggleSidebar(false))
    return <div>{''}</div>
  }

  return (
    <aside
      className={`h-screen fixed bg-cyan-800 left-0 top-0 bottom-0 w-fit z-[999] max-[800px]:min-w-[30%] max-[800px]:!w-fit ${
        isOpen ? 'max-sm:small-sidebar' : 'max-sm:hidden'
      }`}
    >
      <motion.div
        animate={controls}
        className={`z-[999] w-full ${
          isOpen
            ? 'max-[800px]:!w-[100%] !w-[20vw] max-sm:small-sidebar'
            : 'max-sm:!min-w-[4vw]'
        } animate absolute top-0 duration-300 bg-cyan-800 border-r border-gray-700 flex flex-col py-10 min-h-screen`}
      >
        {isOpen && (
          <BsFillArrowLeftSquareFill
            onClick={() => {
              showLess()
              dispatch(toggleSidebar(false))
            }}
            className={`absolute ease-in-out text-white duration-200 hover:scale-[1.02] text-3xl cursor-pointer right-2 top-[55px] rounded-none`}
          />
        )}
        {!isOpen && (
          <BsFillArrowRightSquareFill
            onClick={() => {
              showMore()
              dispatch(toggleSidebar(true))
            }}
            className="absolute ease-in-out duration-200 hover:scale-[1.02] text-3xl cursor-pointer right-2 top-10 text-white rounded-none"
          />
        )}

        <div
          className={`grow ${isOpen ? 'max-sm:!min-w-[70%]' : 'max-sm:hidden'}`}
        >
          {data.map((group, index) => (
            <div key={index} className="pt-16 flex flex-col">
              <motion.p
                key={index}
                animate={controlTitleText}
                className={`mb-2 ml-4 text-md uppercase font-bold !text-black ${
                  isOpen ? '!flex !opacity-100' : 'hidden'
                }'`}
              >
                {group.name}
              </motion.p>

              {group.items.map((item, index2) => {
                if (
                  (item.title === 'Departments' && department === 'agent') ||
                  (item.title === 'Complete Initiated Payments' &&
                    department !== 'agent') ||
                    (item.title === 'Reports' &&
                    department !== 'country')
                ) {
                  return null
                }
                return (
                  <Link
                    key={index2}
                    to={item.path}
                    onClick={(e) => {
                      e.preventDefault()
                      dispatch(setPathName(item.title))
                      localStorage.setItem('pathName', item.title)
                      dispatch(setPathRoute(item.route))
                      localStorage.setItem('pathRoute', item.route)
                      navigate(item.path)
                    }}
                  >
                    <figure
                      key={index2}
                      className={`${
                        isOpen ? 'px-4' : 'px-0 pl-2 mx-auto justify-center'
                      } flex py-1 ${
                        pathName === item.title ? 'bg-slate-800' : null
                      } cursor-pointer pt-3 pb-3 hover:bg-slate-500`}
                    >
                      <item.icon className="text-lg min-h-8 min-w-8 transition-colors duration-300 transform rounded-lg text-amber-600" />
                      <motion.p
                        key={index2}
                        to={item.path}
                        animate={controlText}
                        className={`ml-4 text-sm font-bold text-white ${
                          isOpen ? '!opacity-100 !flex' : 'hidden'
                        }`}
                      >
                        {item.title}
                      </motion.p>
                    </figure>
                  </Link>
                )
              })}
            </div>
          ))}
        </div>
      </motion.div>
    </aside>
  )
}

Sidebar.propTypes = {
  user: PropTypes.shape({}),
}

export default Sidebar
