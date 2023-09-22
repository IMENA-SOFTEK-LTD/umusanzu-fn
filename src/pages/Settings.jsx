import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import Loading from '../components/Loading'
import UserProfileUpdateForm from '../components/UserProfileUpdateForm'
import UpdatePasswordModel from '../components/models/UpdatePasswordModel'
import { useLazyGetUserProfileQuery } from '../states/api/apiSlice'
import EditSectorInfoModel from '../components/models/EditSectorInfoModel'
import UploadSectorStamp from '../components/models/UploadSectorStamp'

function Settings({ user }) {
  const { user: stateUser } = useSelector((state) => state.auth)

  const [userProfile, setUserProfile] = useState([])

  const [
    getUserProfile,
    { data: userProfileData, isLoading, isError, isSuccess }
  ] = useLazyGetUserProfileQuery()

  useEffect(() => {
    if (user || stateUser) {
      getUserProfile({
        id: user?.id || stateUser?.id,
        departmentId: user?.department_id || stateUser?.department_id
      })
    }
  }, [user, stateUser, getUserProfile])

  useEffect(() => {
    if (isSuccess) {
      setUserProfile(userProfileData?.data)
    }
  }, [userProfileData, isSuccess])

  return (
    <div className="flex gap-5 mt-10">
      <div className="bg-white overflow-hidden  shadow rounded-lg border">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Staff Profile
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-3 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isLoading ? <Loading /> : userProfileData?.data?.names}{' '}
              </dd>
            </div>
            <div className="py-3 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Username</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                Kinyinyasec
              </dd>
            </div>
            <div className="py-3 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Email address
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isLoading ? <Loading /> : userProfileData?.data?.email}
              </dd>
            </div>
            <div className="py-3 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Phone number 1
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isLoading ? <Loading /> : userProfileData?.data?.phone1}
              </dd>
            </div>
            <div className="py-3 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Phone number 2
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isLoading ? <Loading /> : userProfileData?.data?.phone2}
              </dd>
            </div>
            <div className="py-3 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                National ID
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              </dd>
            </div>
            <div className="py-3 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Sector
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isLoading ? <Loading /> : userProfileData?.data?.departments?.name}
              </dd>
            </div>
            <div className="py-3 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                District
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {isLoading ? <Loading /> : userProfileData?.data?.departments?.parent?.name}
              </dd>
            </div>
            <div className="py-3 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Province
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {isLoading ? <Loading /> : userProfileData?.data?.departments?.parent?.parent?.name}
              </dd>
            </div>
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Status
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {isLoading ? <Loading /> : userProfileData?.data?.status}
              </dd>
            </div>
          </dl>
        </div>
        <div className="flex items-center justify-center">
          {' '}
          {/* Center horizontally and vertically */}
          <UserProfileUpdateForm
            user={user || stateUser}
            userProfile={userProfile}
          />
          <UpdatePasswordModel user={user || stateUser} />
        </div>
      </div>
      <div className="bg-white overflow-hidden  shadow rounded-lg border">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            KINYINYA Sector Profile
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-3 sm:py-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Name	KINYINYA</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                KINYINYA
              </dd>
            </div>
            <div className="py-3 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Telephone 1
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                0788623772
              </dd>
            </div>
            <div className="py-3 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Telephone 2
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                078829939
              </dd>
            </div>
            <div className="py-3 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Email
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                kinyinyasector@gmail.com
              </dd>
            </div>
            <div className="py-3 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Service
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                Umutekano
              </dd>
            </div>
            <div className="py-3 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Representative Names
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                HAVUGUZIGA Charles
              </dd>
            </div>
            <div className="py-3 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Representative Position
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                Executive Secretary
              </dd>
            </div>
            <div className="py-3 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Bank Account Number
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                PAY CASHLESS DIAL: *775*3#
              </dd>
            </div>
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Bank Account Name
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                Umusanzu w'Irondo
              </dd>
            </div>
          </dl>
        </div>
        <div className="flex items-center justify-center
          bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse
          gap-5

        ">
          <EditSectorInfoModel 
           user={user || stateUser}         
           />
          <UploadSectorStamp />
        </div>
      </div>
    </div>
  )
}

Settings.propTypes = {
  user: PropTypes.shape({
    names: PropTypes.string,
    phone1: PropTypes.string,
    phone2: PropTypes.string,
    email: PropTypes.string,
    password: PropTypes.string,
    department_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    username: PropTypes.string
  })
}

export default Settings
