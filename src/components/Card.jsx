import { motion } from 'framer-motion'
import moment from 'moment'
import { useEffect, useState } from 'react'
import UserProfilePage from '../containers/dashboard/UserProfilePage'
import UDialog from './models/UDialog'

const AwesomeCard = ({
  id,
  name,
  phone,
  nationalId,
  email,
  onViewProfileClick,
  createdAt,
  enabledDialog,
  user
}) => {
  useEffect(() => {
    document.title = `${name} | Umusanzu Digital`
  }, [])
  const [openProfile, setOpenProfile] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="border border-gray-200 rounded-lg shadow-xl p-6 text-gray-800"
    >
      <UDialog
        size="xl"
        title={
          <>
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-2">
                <li>
                  <a
                    href="#"
                    className="inline-flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {name}
                    <svg
                      className="w-5 h-5 text-gray-400 mx-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </a>
                </li>

                <li>
                  <div className="flex items-center">
                    <span className="ml-1 text-gray-700 md:ml-2">Profile</span>
                  </div>
                </li>
              </ol>
            </nav>
          </>
        }
        open={openProfile}
        onClose={() => {
          setOpenProfile(false)
        }}
        children={
          <>
            <UserProfilePage selectProfile={{ id }} user={user} />
          </>
        }
      />

      <h2 className="text-xl font-extrabold mb-4">{name}</h2>
      <div className="flex mb-2">
        <span className="text-gray-600 font-semibold w-24">Phone:</span>
        <p className="text-gray-600">{phone}</p>
      </div>
      <div className="flex mb-2">
        <span className="text-gray-600 font-semibold w-24">National ID:</span>
        <p className="text-gray-600">{nationalId}</p>
      </div>
      {/* <div className="flex mb-2">
        <span className="text-gray-600 font-semibold w-24">Email:</span>
        <p className="text-gray-600">{email}</p>
      </div> */}
      <div className="flex mb-6">
        <span className="text-gray-600 font-semibold w-24">Date Added:</span>
        <p className="text-gray-600">
          {moment(createdAt).format('YYYY-MM-DD HH:mm')}
        </p>
      </div>
      <div className="flex items-center justify-start">
        <button
          onClick={() => {
            if (enabledDialog) {
              setOpenProfile(true)
            } else {
              onViewProfileClick()
            }
          }}
          className="shadow-md px-4 py-[5px] rounded-sm bg-primary text-white transition-colors hover:scale-[.98] duration-300"
        >
          View Profile
        </button>
      </div>
    </motion.div>
  )
}

export default AwesomeCard
