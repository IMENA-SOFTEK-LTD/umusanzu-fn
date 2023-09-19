import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useLazyGetSingleStaffDetailsQuery, useLazyLogActivitiesQuery } from '../../states/api/apiSlice'
import UpdateStaff from '../../components/models/UpdateStaff'
import { useDispatch, useSelector } from 'react-redux'
import { toggleUpdateStaff } from '../../states/features/modals/modalSlice'
import UpdateAdminStatusModel from '../../components/models/UpdateAdminStatusModel'
import moment from 'moment'

const UserProfilePage = () => {
  const localStorageUser = JSON.parse(localStorage.getItem('user'))
  const [isEditing, setIsEditing] = useState(false)
  const dispatch = useDispatch()
  const { updateStaff } = useSelector((state) => state.modals)
  const { id } = useParams()

  const [
    getSingleStaffDetails,
    {
      data: staffDetailsData,
      isLoading: staffDetailsLoading,
      isSuccess: staffDetailsSuccess,
      isError: staffDetailsError,
      error: staffError
    }
  ] = useLazyGetSingleStaffDetailsQuery()
  // log activities
  const [
    logActivities,
    {
      data: logActivitiesData,
      isLoading: logActivitiesLoading,
      isSuccess: logActivitiesSuccess,
      isError: logActivitiesError,
      error: logActivitiesErrorr
    }
  ] = useLazyLogActivitiesQuery()
  const [data, setData] = useState(staffDetailsData?.data || [])
  const [activities, setActivities] = useState(logActivitiesData?.data || [])

  useEffect(() => {
    if (staffDetailsSuccess) {
      setData(staffDetailsData?.data || [])
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
    logActivities({ staffId: id})
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
    recentActivities: [
      { id: 1, activity: 'Logged in', date: '2023-08-18' },

    ]
  })

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
  }

  const handleStatusChange = () => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active'
    setUser((prevUser) => ({ ...prevUser, status: newStatus }))
  }

  const handleDelete = () => {
    // Handle delete user functionality here
  }


  return (
    <div className="flex items-start gap-4 mx-auto">
      <UpdateStaff toggleButton={false} />
      <div className="w-full max-w-[60%] bg-white  p-6 space-y-4">
        <div className="flex justify-between items-center p-4 border rounded-lg shadow-md">
          <h1 className="text-[18px] font-semibold">{data?.names}</h1>
          <div className="flex gap-4">
            <button
              className="p-2 w-fit py-[5px] ease-in-out duration-300 text-[14px] rounded-md text-white bg-primary hover:scale-[0.98]"
              onClick={() => {
                dispatch(toggleUpdateStaff(!updateStaff))
              }}
            >
              Edit
            </button>
            <UpdateAdminStatusModel user={localStorageUser} />

          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h6 className="mb-4 text-xl font-semibold text-gray-800">
            Admin Information
          </h6>
          <table className="w-full">
            <tbody>
              <tr className="border-t">
                <td className="py-2 pr-4 text-gray-800 font-semibold">
                  Username:
                </td>
                <td className="py-2 pl-4">{data?.username}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-4 text-gray-800 font-semibold">
                  Phone 1:
                </td>
                <td className="py-2 pl-4">{data?.phone1}</td>
              </tr>
              {data?.phone2 && (
                <tr className="border-t">
                  <td className="py-2 pr-4 text-gray-800 font-semibold">
                    Phone 2:
                  </td>
                  <td className="py-2 pl-4">{data?.phone2}</td>
                </tr>
              )}
              {data?.nationalId && (
                <tr className="border-t">
                  <td className="py-2 pr-4 text-gray-800 font-semibold">
                    National ID:
                  </td>
                  <td className="py-2 pl-4">{data?.nid}</td>
                </tr>
              )}
              {data?.email && (
                <tr className="border-t">
                  <td className="py-2 pr-4 text-gray-800 font-semibold">
                    Email:
                  </td>
                  <td className="py-2 pl-4">{data?.email}</td>
                </tr>
              )}
              <tr className="border-t">
                <td className="py-2 pr-4 text-gray-800 font-semibold">
                  Status:
                </td>
                <td className="py-2 pl-4">{data?.status}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-4 text-gray-800 font-semibold">
                  Village:
                </td>
                <td className="py-2 pl-4">{data?.village}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-4 text-gray-800 font-semibold">Cell:</td>
                <td className="py-2 pl-4">{data?.departments?.parent?.name}</td>
              </tr>
              <tr className="border-t">
                <td
                  colSpan="2"
                  className="py-4 text-xl font-semibold text-gray-900"
                >
                  Location
                </td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-4 text-gray-800 font-semibold">
                  Sector:
                </td>
                <td className="py-2 pl-4">{data?.departments?.parent?.parent?.name}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-4 text-gray-800 font-semibold">
                  District:
                </td>
                <td className="py-2 pl-4">{data?.departments?.parent?.parent?.parent?.name}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-4 text-gray-800 font-semibold">
                  Province:
                </td>
                <td className="py-2 pl-4">{data?.departments?.parent?.parent?.parent?.parent?.name}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="w-full max-w-[35%] bg-white shadow-md rounded-lg p-6 space-y-4 mt-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Recent Activities
        </h2>
        <ul className="space-y-2">
          {logActivitiesData?.data.length > 0 ? (
            logActivitiesData.data.map((activity) => (
              <li
                key={activity.id}
                className="flex justify-between items-center border-b border-gray-200 py-2"
              >
                <div className="text-gray-800">{activity.activity}</div>
                <div className="text-gray-500">
                  {moment(activity.createdAt).fromNow()}
                </div>
              </li>
            ))
          ) : (
              <li className="text-gray-800">No activities found for {data.names}</li>
          )}
        </ul>

      </div>
    </div>
  )
}

export default UserProfilePage
