// eslint-disable-next-line import/no-absolute-path
import logo from '/logo.png'
import { Link, useLocation } from 'react-router-dom'
import { BsHousesFill } from 'react-icons/bs'
import { AiOutlineTransaction } from 'react-icons/ai'
import { FaListAlt, FaMicrosoft, FaBorderAll } from 'react-icons/fa'
import { MdOutlineSettingsSuggest } from 'react-icons/md'

function Sidebar() {
  const { pathname } = useLocation()

  if (pathname === '/login') return null

  return (
    <aside className="flex flex-col w-full left-0 sticky max-w-[20%] h-screen z-[999] px-12 py-8 drop-shadow-2xl overflow-y-auto bg-white border-r-none rtl:border-r-0 rtl:border-l">
      <div className="flex items-stretch">
        <a href="#">
          <img className="h-16 w-16" src={logo} alt="Logo" />
        </a>
        <p className="ml-2 mt-6">Imena Softek</p>
      </div>

      <div className="flex flex-col justify-between flex-1 mt-6">
        <nav className="-mx-3 space-y-6 ">
          <div className="space-y-3 ">
            <Link
              to="/dashboard"
              className="flex items-center px-3 py-2 text-gray-600 transition-colors duration-300 transform rounded-lg dark:text-amber-600 hover:bg-gray-700 dark:hover:bg-gray-200 dark:hover:text-amber-800 hover:text-gray-700"
              href="#"
            >
              <FaMicrosoft className="w-5 h-5" />

              <span className="mx-2 text-sm font-medium text-gray-800">
                Dashboard
              </span>
            </Link>
          </div>

          <div className="space-y-3 ">
            <label className="px-3 text-xs text-gray-500 uppercase dark:text-gray-500">
              content
            </label>

            <a
              className="flex items-center px-3 py-2 text-gray-600 transition-colors duration-300 transform rounded-lg dark:text-amber-600 hover:bg-gray-700 dark:hover:bg-gray-200 dark:hover:text-amber-800 hover:text-gray-700"
              href="#"
            >
              <BsHousesFill className="w-5 h-5" />

              <span className="mx-2 text-sm font-medium text-gray-800">
                Households
              </span>
            </a>
            <a
              className="flex items-center px-3 py-2 text-gray-600 transition-colors duration-300 transform rounded-lg dark:text-amber-600 hover:bg-gray-700 dark:hover:bg-gray-200 dark:hover:text-amber-800 hover:text-gray-700"
              href="#"
            >
              <FaBorderAll className="w-5 h-5" />

              <span className="mx-2 text-sm font-medium text-gray-800">
                Departments
              </span>
            </a>

            < Link to="/transactionTable"
              className="flex items-center px-3 py-2 text-gray-600 transition-colors duration-300 transform rounded-lg dark:text-amber-600 hover:bg-gray-700 dark:hover:bg-gray-200 dark:hover:text-amber-800 hover:text-gray-700"
              href="#"
            >
              <AiOutlineTransaction className="w-5 h-5" />

              <span className="mx-2 text-sm font-medium text-gray-800">
                Transactions
              </span>
            </Link>

            <Link
              to="/houseDetails"
              className="flex items-center px-3 py-2 text-gray-600 transition-colors duration-300 transform rounded-lg dark:text-amber-600 hover:bg-gray-700 dark:hover:bg-gray-200 dark:hover:text-amber-800 hover:text-gray-700"
              href="#"
            >
              <FaListAlt className="w-5 h-5" />

              <span className="mx-2 text-sm font-medium text-gray-800">
                Household Details
              </span>
            </Link>
          </div>

          <div className="space-y-3 ">
            <label className="px-3 text-xs text-gray-500 uppercase dark:text-gray-500">
              Customization
            </label>

            <a
              className="flex items-center px-3 py-2 text-gray-600 transition-colors duration-300 transform rounded-lg dark:text-amber-600 hover:bg-gray-700 dark:hover:bg-gray-200 dark:hover:text-amber-800 hover:text-gray-700"
              href="#"
            >
              <MdOutlineSettingsSuggest className="w-5 h-5" />
              <span className="mx-2 text-sm font-medium text-gray-800">
                Settings
              </span>
            </a>
          </div>
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar
