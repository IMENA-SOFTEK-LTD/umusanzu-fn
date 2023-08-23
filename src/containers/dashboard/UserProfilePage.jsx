import { useState } from 'react'

const UserProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [user, setUser] = useState({
    name: 'Umuhire Ange Diane',
    username: 'Diane',
    phone1: '0781416668',
    phone2: '',
    nationalId: '',
    email: '',
    cell: 'GACURIRO',
    sector: 'KINYINYA',
    district: 'GASABO',
    province: 'KIGALI CITY',
    status: 'Active',
    recentActivities: [
      { id: 1, activity: 'Logged in', date: '2023-08-18' },
      { id: 2, activity: 'Updated profile information', date: '2023-08-17' },
      { id: 2, activity: 'Updated profile information', date: '2023-08-17' },
      { id: 2, activity: 'Updated profile information', date: '2023-08-17' },
      { id: 2, activity: 'Updated profile information', date: '2023-08-17' },
      { id: 2, activity: 'Updated profile information', date: '2023-08-17' },
      { id: 2, activity: 'Updated profile information', date: '2023-08-17' },
      { id: 2, activity: 'Updated profile information', date: '2023-08-17' },
    ],
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
      <div className="w-full max-w-[60%] bg-white  p-6 space-y-4">
        <div className="flex justify-between items-center p-4 border rounded-lg shadow-md">
          <h1 className="text-[18px] font-semibold">{user.name}</h1>
          <div className="flex gap-4">
            <button
              className="p-2 w-fit py-[5px] ease-in-out duration-300 text-[14px] rounded-md text-white bg-primary hover:scale-[0.98]"
              onClick={handleEditToggle}
            >
              Edit
            </button>
            <button
              className="p-2 w-fit py-[5px] ease-in-out duration-300 text-[14px] rounded-md text-white bg-yellow-600 hover:scale-[0.98] max-w-xs overflow-hidden"
              onClick={handleStatusChange}
            >
              Change Status
            </button>
            <button
              className="p-2 w-fit py-[5px] ease-in-out duration-300 text-[14px] rounded-md text-white bg-red-600 hover:scale-[0.98]"
              onClick={handleDelete}
            >
              Delete
            </button>
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
                <td className="py-2 pl-4">{user.username}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-4 text-gray-800 font-semibold">
                  Phone 1:
                </td>
                <td className="py-2 pl-4">{user.phone1}</td>
              </tr>
              {user.phone2 && (
                <tr className="border-t">
                  <td className="py-2 pr-4 text-gray-800 font-semibold">
                    Phone 2:
                  </td>
                  <td className="py-2 pl-4">{user.phone2}</td>
                </tr>
              )}
              {user.nationalId && (
                <tr className="border-t">
                  <td className="py-2 pr-4 text-gray-800 font-semibold">
                    National ID:
                  </td>
                  <td className="py-2 pl-4">{user.nationalId}</td>
                </tr>
              )}
              {user.email && (
                <tr className="border-t">
                  <td className="py-2 pr-4 text-gray-800 font-semibold">
                    Email:
                  </td>
                  <td className="py-2 pl-4">{user.email}</td>
                </tr>
              )}
              <tr className="border-t">
                <td className="py-2 pr-4 text-gray-800 font-semibold">Cell:</td>
                <td className="py-2 pl-4">{user.cell}</td>
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
                <td className="py-2 pl-4">{user.sector}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-4 text-gray-800 font-semibold">
                  District:
                </td>
                <td className="py-2 pl-4">{user.district}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-4 text-gray-800 font-semibold">
                  Province:
                </td>
                <td className="py-2 pl-4">{user.province}</td>
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
          {user.recentActivities.map((activity) => (
            <li
              key={activity.id}
              className="flex justify-between items-center border-b border-gray-200 py-2"
            >
              <div className="text-gray-800">{activity.activity}</div>
              <div className="text-gray-500">{activity.date}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default UserProfilePage
