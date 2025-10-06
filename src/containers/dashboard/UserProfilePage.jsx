import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  useLazyGetSingleStaffDetailsQuery,
  useLazyLogActivitiesQuery,
} from '../../states/api/apiSlice'
import UpdateStaff from '../../components/models/UpdateStaff'
import { useDispatch, useSelector } from 'react-redux'
import { toggleUpdateStaff } from '../../states/features/modals/modalSlice'
import UpdateAdminStatusModel from '../../components/models/UpdateAdminStatusModel'
import moment from 'moment'
import { getUserDepartmentsInfoByLevelId } from '../../utils/userByLevelId'
import { Typography } from '@material-tailwind/react'

const UserProfilePage = ({ selectProfile, type }) => {
  const localStorageUser = JSON.parse(localStorage.getItem('user'))
  const [isEditing, setIsEditing] = useState(false)
  const dispatch = useDispatch()
  const { updateStaff } = useSelector((state) => state.modals)

  const params = useParams()
  const id = params?.id || selectProfile?.id
  const [
    getSingleStaffDetails,
    {
      data: staffDetailsData,
      isLoading: staffDetailsLoading,
      isSuccess: staffDetailsSuccess,
      isError: staffDetailsError,
      error: staffError,
    },
  ] = useLazyGetSingleStaffDetailsQuery()
  // log activities
  const [
    logActivities,
    {
      data: logActivitiesData,
      isLoading: logActivitiesLoading,
      isSuccess: logActivitiesSuccess,
      isError: logActivitiesError,
      error: logActivitiesErrorr,
    },
  ] = useLazyLogActivitiesQuery()
  const [data, setData] = useState(staffDetailsData?.data || [])
  const [activities, setActivities] = useState(logActivitiesData?.data || [])
  let userDepartmentsInfoByLevelId = {}
  const [departmentNames, setDepartmentNames] = useState({})

  useEffect(() => {
    if (staffDetailsSuccess) {
      setData(staffDetailsData?.data || [])
      setDepartmentNames(() => {
        return getUserDepartmentsInfoByLevelId(staffDetailsData?.data, null)
      })
    }
  }, [staffDetailsSuccess, staffDetailsData])

  useEffect(() => {
    getSingleStaffDetails({ id })
  }, [getSingleStaffDetails])

  useEffect(() => {
    if (logActivitiesSuccess) {
      setActivities(logActivitiesData?.data || [])
    }
  }, [logActivitiesSuccess, logActivitiesData])

  useEffect(() => {
    logActivities({ staffId: id })
  }, [])

  const [user, setUser] = useState({
    name: data?.names,
    username: data?.username,
    phone1: data?.phone1,
    phone2: data?.phone2,
    nationalId: data?.nid,
    email: data?.email,
    cell: data?.departments?.name,
    sector: data?.departments?.parent?.name,
    district: data?.departments?.parent?.parent?.name,
    province: data?.departments?.parent?.parent?.parent?.name,
    status: 'Active',
    recentActivities: [{ id: 1, activity: 'Logged in', date: '2023-08-18' }],
  })
// console.log(staffDetailsData)
  return (
    <div className="flex flex-col lg:flex-row items-start gap-4 mx-auto">
      <UpdateStaff
        toggleButton={false}
        setData={setData}
        type={type}
        admin={data}
      />
      <div className="w-full lg:max-w-[60%] bg-white p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 border rounded-lg shadow-md gap-3 sm:gap-0">
          <h1 className="text-base sm:text-[18px] font-semibold">{data?.names}</h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            {+localStorageUser?.staff_role === 1 && (
              <>
                <button
                  className="p-2 w-full sm:w-fit py-[5px] ease-in-out duration-300 text-sm sm:text-[14px] rounded-md text-white bg-primary hover:scale-[0.98]"
                  onClick={() => {
                    dispatch(toggleUpdateStaff(!updateStaff))
                  }}
                >
                  Edit
                </button>
                <UpdateAdminStatusModel
                  type={type}
                  user={localStorageUser}
                  setData={setData}
                  admin={data}
                />
              </>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h6 className="mb-4 text-lg sm:text-xl font-semibold text-gray-800">
            Admin Information
          </h6>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[300px]">
            <tbody>
              <tr className="border-t">
                <td className="py-2 pr-2 sm:pr-4 text-gray-800 font-semibold text-sm sm:text-base">
                  Username:
                </td>
                <td className="py-2 pl-2 sm:pl-4 text-sm sm:text-base">{data?.username}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-2 sm:pr-4 text-gray-800 font-semibold text-sm sm:text-base">
                  Phone 1:
                </td>
                <td className="py-2 pl-2 sm:pl-4 text-sm sm:text-base">{data?.phone1}</td>
              </tr>
              {data?.phone2 && (
                <tr className="border-t">
                  <td className="py-2 pr-2 sm:pr-4 text-gray-800 font-semibold text-sm sm:text-base">
                    Phone 2:
                  </td>
                  <td className="py-2 pl-2 sm:pl-4 text-sm sm:text-base">{data?.phone2}</td>
                </tr>
              )}
              {data?.nationalId && (
                <tr className="border-t">
                  <td className="py-2 pr-2 sm:pr-4 text-gray-800 font-semibold text-sm sm:text-base">
                    National ID:
                  </td>
                  <td className="py-2 pl-2 sm:pl-4 text-sm sm:text-base">{data?.nid}</td>
                </tr>
              )}
              {data?.email && (
                <tr className="border-t">
                  <td className="py-2 pr-2 sm:pr-4 text-gray-800 font-semibold text-sm sm:text-base">
                    Email:
                  </td>
                  <td className="py-2 pl-2 sm:pl-4 text-sm sm:text-base">{data?.email}</td>
                </tr>
              )}
              <tr className="border-t">
                <td className="py-2 pr-2 sm:pr-4 text-gray-800 font-semibold text-sm sm:text-base">
                  Status:
                </td>
                <td className="py-2 pl-2 sm:pl-4 text-sm sm:text-base">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    data?.status?.toLowerCase() === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {data?.status}
                  </span>
                </td>
              </tr>
              <tr className="border-t">
                <td
                  colSpan="2"
                  className="py-4 text-lg sm:text-xl font-semibold text-gray-900"
                >
                  Location
                </td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-2 sm:pr-4 text-gray-800 font-semibold text-sm sm:text-base">
                  Village:
                </td>
                <td className="py-2 pl-2 sm:pl-4 text-sm sm:text-base">{departmentNames?.village}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-2 sm:pr-4 text-gray-800 font-semibold text-sm sm:text-base">Cell:</td>
                <td className="py-2 pl-2 sm:pl-4 text-sm sm:text-base">{departmentNames?.cell}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-2 sm:pr-4 text-gray-800 font-semibold text-sm sm:text-base">
                  Sector:
                </td>
                <td className="py-2 pl-2 sm:pl-4 text-sm sm:text-base">{departmentNames?.sector}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-2 sm:pr-4 text-gray-800 font-semibold text-sm sm:text-base">
                  District:
                </td>
                <td className="py-2 pl-2 sm:pl-4 text-sm sm:text-base">{departmentNames?.district}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-2 sm:pr-4 text-gray-800 font-semibold text-sm sm:text-base">
                  Province:
                </td>
                <td className="py-2 pl-2 sm:pl-4 text-sm sm:text-base">{departmentNames?.province}</td>
              </tr>

               <tr className="border-t">
                 <td className="py-2 pr-2 sm:pr-4 text-gray-800 font-semibold text-sm sm:text-base">
                   Role:
                 </td>
                 <td className="py-2 pl-2 sm:pl-4 text-sm sm:text-base">
                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                     data?.staff_role 
                       ? 'bg-blue-100 text-blue-800' 
                       : 'bg-gray-100 text-gray-800'
                   }`}>
                     {data?.staff_role ? 'Admin' : 'Viewer'}
                   </span>
                 </td>
               </tr>
            </tbody>
          </table>
          </div>
        </div>
      </div>
      <div className="w-full lg:max-w-[40%] bg-white shadow-md rounded-lg p-4 sm:p-6 space-y-4 mt-4 sm:mt-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          Recent Activities
        </h2>
        <ul className="space-y-0">
          {logActivitiesData?.data.length > 0 ? (
            logActivitiesData.data.map((activity) => (
              <>
                <div
                  key={activity.id}
                  className="mt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-0"
                >
                  <Typography color="blue-gray" className="font-medium text-sm sm:text-base">
                    {activity.action}
                  </Typography>
                  <Typography color="blue-gray" className="font-medium">
                    <div className="text-gray-500 text-xs sm:text-sm">
                      {moment(activity.createdAt).fromNow()}
                    </div>
                  </Typography>
                </div>
                {activity.activity && (
                <Typography
                  variant="small"
                  color="gray"
                  className="font-normal opacity-75 text-xs sm:text-sm"
                >
                  <pre className="whitespace-pre-wrap break-words">{activity.activity}</pre>
                </Typography>
                )}
              </>
            ))
          ) : (
            <li className="text-gray-800 text-sm sm:text-base">
              No activities found for {data.names}
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}

export default UserProfilePage
