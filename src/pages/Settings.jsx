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
import API_URL from '../constants/upload_url'

function Settings({ user }) {
  const { user: stateUser } = useSelector((state) => state.auth)
  const [userProfile, setUserProfile] = useState([])
  const [departmentProfile, setDepartmentProfile] = useState(null)
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

  const [
    getDepartmentProfile,
    { data, isLoading: isDepartmentLoading, isSuccess: isDepartmentSuccess },
  ] = useLazyGetDepartmentProfileQuery()

  useEffect(() => {
    if (user?.department_id || stateUser?.department_id) {
      getDepartmentProfile({
        id: user?.department_id || stateUser?.department_id,
      })
    }
  }, [user, stateUser, getDepartmentProfile])

  useEffect(() => {
    if (isDepartmentSuccess) {
      setDepartmentProfile(data?.data)
    }
  }, [data, isDepartmentSuccess])

  const userDepartmentsInfo = getUserDepartmentsInfoByLevelId(user, stateUser)

  return (
    <main className="flex flex-col gap-6 sm:gap-10 mt-4 sm:mt-6 px-3 sm:px-4 lg:px-10">
      {/* Profile Section */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Staff Profile Card */}
        <div className="bg-white flex-1 overflow-hidden p-3 sm:p-4 shadow rounded-lg border">
          <div className="pb-3 sm:pb-4 border-b">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
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
              <div key={i} className="py-3 sm:py-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                <dt className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-0">
                  {item.label}
                </dt>
                <dd className="text-sm sm:text-sm text-gray-900 sm:col-span-2">
                  {isLoading ? <Loading /> : item.value || '—'}
                </dd>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-4 sm:mt-6">
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
        <div className="bg-white flex-1 overflow-hidden p-3 sm:p-4 shadow rounded-lg border">
          <div className="pb-3 sm:pb-4 border-b">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              {`${userDepartmentsInfo?.department || 'Department'} Profile`}
            </h3>
          </div>
          <div className="divide-y">
            {[
              { label: 'Name', value: departmentProfile?.name },
              { label: 'Telephone 1', value: departmentProfile?.phone1 },
              { label: 'Telephone 2', value: departmentProfile?.phone2 },
              { label: 'Email', value: departmentProfile?.email },
              {
                label: 'Service',
                value:
                  departmentProfile?.department_infos?.[0]?.service_offer ||
                  'Umutekano',
              },
              {
                label: 'Representative Names',
                value: departmentProfile?.department_infos?.[0]?.leader_name,
              },
              {
                label: 'Representative Position',
                value: departmentProfile?.department_infos?.[0]?.leader_title,
              },
              {
                label: 'Bank Account Number',
                value: departmentProfile?.department_infos?.[0]?.account_bank,
              },
              {
                label: 'Bank Account Name',
                value: departmentProfile?.department_infos?.[0]?.account_name,
              },
              {
                label: 'Stamp',
                value: departmentProfile?.stamp,
              },
            ].map((item, i) => (
              <div key={i} className="py-3 sm:py-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                <dt className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-0">
                  {item.label}
                </dt>
                <dd className="text-sm sm:text-sm text-gray-900 sm:col-span-2">
                  {item.label === 'Stamp' ? (
                    item.value ? (
                      <div className="flex items-center">
                        <img 
                          src={`${API_URL}/${item.value}`} 
                          alt="Stamp" 
                          className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded" 
                          crossOrigin="anonymous"
                          onError={(e) => {
                            console.error('Image failed to load:', e.target.src);
                            e.target.style.display = 'none';
                          }}
                          // onLoad={() => console.log('Image loaded successfully:', `${API_URL}/assets/stamp/${item.value}`)}
                        />
                        {/* <small className="text-xs text-gray-500 block mt-1">
                          URL: {`${API_URL}/assets/stamp/${item.value}`}
                        </small> */}
                      </div>
                    ) : '—'
                  ) : (
                    item.value || '—'
                  )}
                </dd>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-4 sm:mt-6">
            <EditSectorInfoModel
              user={user || stateUser}
              onUpdateSectorInfo={() => {
                if (user || stateUser) {
                  getDepartmentProfile({
                    id: user?.department_id || stateUser?.department_id,
                  })
                }
              }}
            />
            {user?.departments?.level_id === 3 && (
              <UploadSectorStamp
                departmentId={user.department_id || stateUser?.department_id}
                onUpdateStamp={() => {
                  if (user || stateUser) {
                    getDepartmentProfile({
                      id: user?.department_id || stateUser?.department_id,
                    })
                  }
                }}
              />
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
