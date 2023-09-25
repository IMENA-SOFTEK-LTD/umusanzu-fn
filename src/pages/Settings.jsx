import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import Loading from '../components/Loading'
import UserProfileUpdateForm from '../components/UserProfileUpdateForm'
import UpdatePasswordModel from '../components/models/UpdatePasswordModel'
import { useLazyGetUserProfileQuery, useLazyGetDepartmentProfileQuery } from '../states/api/apiSlice'
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

  const [
    getDepartmentProfile,
    { data, isLoadingData, isErrors, isSuccessful },
  ] = useLazyGetDepartmentProfileQuery();
  
  useEffect(() => {             
    getDepartmentProfile({
      id: user.department_id || stateUser?.department_id,
    });       
  
  }, []);

  
  return (
    <div className="flex gap-5 mt-10 max-[900px]:p900-settings max-[100px]:p100-settings max-[150px]:p150-settings max-[200px]:p200-settings max-[250px]:p250-settings max-[300px]:p300-settings max-[350px]:p350-settings max-[400px]:p400-settings max-[450px]:p450-settings max-[500px]:p500-settings max-[600px]:p600-settings max-[700px]:p700-settings max-[800px]:p800-settings max-[1000px]:p1000-settings max-[1100px]:p1100-settings max-[1200px]:p1200-settings max-[1300px]:p1300-settings max-[2000px]:p2000-settings">
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
                {data?.data?.name}
              </dd>
            </div>
            <div className="py-3 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Telephone 1
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {data?.data?.phone1}
              </dd>
            </div>
            <div className="py-3 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Telephone 2
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {data?.data?.phone2}
              </dd>
            </div>
            <div className="py-3 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Email
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {data?.data?.email}
              </dd>
            </div>
            <div className="py-3 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Service
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {data?.data?.department_infos[0]?.service_offer}
              </dd>
            </div>
            <div className="py-3 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Representative Names
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {data?.data?.department_infos[0]?.leader_name}
              </dd>
            </div>
            <div className="py-3 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Representative Position
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {data?.data?.department_infos[0]?.leader_title}
              </dd>
            </div>
            <div className="py-3 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Bank Account Number
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {data?.data?.department_infos[0]?.account_bank}
              </dd>
            </div>
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Bank Account Name
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
               {data?.data?.department_infos[0]?.account_name}
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