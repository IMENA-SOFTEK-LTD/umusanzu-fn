import PropTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'
import Loading from '../components/Loading'
import UserProfileUpdateForm from '../components/UserProfileUpdateForm'
import UpdatePasswordModel from '../components/models/UpdatePasswordModel'
import {
  useLazyGetUserProfileQuery,
  useLazyGetDepartmentProfileQuery,
} from '../states/api/apiSlice'
import EditSectorInfoModel from '../components/models/EditSectorInfoModel'
import UploadSectorStamp from '../components/models/UploadSectorStamp'
import { getUserDepartmentsInfoByLevelId } from '../utils/userByLevelId'
import { setPathRoute } from '../states/features/navigation/sidebarSlice'

function Settings({ user }) {
  const { user: stateUser } = useSelector((state) => state.auth)
  const [userProfile, setUserProfile] = useState([])
  const dispatch = useDispatch()

  const [getUserProfile, { data: userProfileData, isLoading, isSuccess }] =
    useLazyGetUserProfileQuery()

  useEffect(() => {
    if (user || stateUser) {
      getUserProfile({
        id: user?.id || stateUser?.id,
        departmentId: user?.department_id || stateUser?.department_id,
      })
    }
  }, [user, stateUser, getUserProfile])

  useEffect(() => {
    if (isSuccess) {
      setUserProfile(userProfileData?.data)
    }
  }, [userProfileData, isSuccess])

  const [getDepartmentProfile, { data }] = useLazyGetDepartmentProfileQuery()

  useEffect(() => {
    if (user?.department_id || stateUser?.department_id) {
      getDepartmentProfile({
        id: user?.department_id || stateUser?.department_id,
      })
    }
  }, [user, stateUser, getDepartmentProfile])

  const userDepartmentsInfo = getUserDepartmentsInfoByLevelId(user, stateUser)

  return (
    <main className="flex flex-col gap-10 mt-6 px-4 sm:px-6 lg:px-10">
      {/* Profile Section */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Staff Profile Card */}
        <div className="bg-white flex-1 overflow-hidden p-4 shadow rounded-lg border">
          <div className="pb-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Staff Profile
            </h3>
          </div>
          <div className="divide-y">
            {[
              { label: 'Full name', value: userProfileData?.data?.names },
              { label: 'Username', value: userProfileData?.data?.username },
              { label: 'Email address', value: userProfileData?.data?.email },
              { label: 'Phone number 1', value: userProfileData?.data?.phone1 },
              { label: 'Phone number 2', value: userProfileData?.data?.phone2 },
              { label: 'National ID', value: userProfileData?.data?.nid },
              { label: 'Sector', value: userDepartmentsInfo?.sector },
              { label: 'District', value: userDepartmentsInfo?.district },
              { label: 'Province', value: userDepartmentsInfo?.province },
              { label: 'Status', value: userProfileData?.data?.status },
              {
                label: '2 FACT AUTH',
                value: userProfileData?.data?.two_fa ? 'Enabled' : 'Disabled',
              },
            ].map((item, i) => (
              <div key={i} className="py-3 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">
                  {item.label}
                </dt>
                <dd className="col-span-2 text-sm text-gray-900">
                  {isLoading ? <Loading /> : item.value || '—'}
                </dd>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-6">
            <UserProfileUpdateForm
              user={user || stateUser}
              userProfile={userProfile}
              onUpdateProfile={() => {
                if (user || stateUser) {
                  getUserProfile({
                    id: user?.id || stateUser?.id,
                    departmentId:
                      user?.department_id || stateUser?.department_id,
                  })
                }
              }}
            />
            <UpdatePasswordModel user={user || stateUser} />
          </div>
        </div>

        {/* Department Profile Card */}
        <div className="bg-white flex-1 overflow-hidden p-4 shadow rounded-lg border">
          <div className="pb-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              {`${userDepartmentsInfo?.department || 'Department'} Profile`}
            </h3>
          </div>
          <div className="divide-y">
            {[
              { label: 'Name', value: data?.data?.name },
              { label: 'Telephone 1', value: data?.data?.phone1 },
              { label: 'Telephone 2', value: data?.data?.phone2 },
              { label: 'Email', value: data?.data?.email },
              {
                label: 'Service',
                value:
                  data?.data?.department_infos?.[0]?.service_offer ||
                  'Umutekano',
              },
              {
                label: 'Representative Names',
                value: data?.data?.department_infos?.[0]?.leader_name,
              },
              {
                label: 'Representative Position',
                value: data?.data?.department_infos?.[0]?.leader_title,
              },
              {
                label: 'Bank Account Number',
                value: data?.data?.department_infos?.[0]?.account_bank,
              },
              {
                label: 'Bank Account Name',
                value: data?.data?.department_infos?.[0]?.account_name,
              },
            ].map((item, i) => (
              <div key={i} className="py-3 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">
                  {item.label}
                </dt>
                <dd className="col-span-2 text-sm text-gray-900">
                  {item.value || '—'}
                </dd>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-6">
            <EditSectorInfoModel user={user || stateUser} />
            {user?.departments?.level_id === 3 && (
              <UploadSectorStamp department={data?.data} />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

Settings.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    names: PropTypes.string,
    phone1: PropTypes.string,
    phone2: PropTypes.string,
    email: PropTypes.string,
    password: PropTypes.string,
    department_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    username: PropTypes.string,
    two_fa: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
    departments: PropTypes.shape({
      level_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  }),
}

export default Settings
