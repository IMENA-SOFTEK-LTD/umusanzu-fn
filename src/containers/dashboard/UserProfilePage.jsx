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
      <div className="w-full max-w-[60%] bg-white shadow-md rounded-lg p-6 space-y-4">
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
        <div class="user-details bg-gray-100 border-gray-200 p-4">
          <div class="user-section">
            <div class="text-gray-900 font-bold">User Information</div>
            <div class="text-gray-800">Username: {user.username}</div>
            <div class="text-gray-800">Phone 1: {user.phone1}</div>
            {user.phone2 && (
              <div class="text-gray-800">Phone 2: {user.phone2}</div>
            )}
            {user.nationalId && (
              <div class="text-gray-800">National ID: {user.nationalId}</div>
            )}
            {user.email && <div class="text-gray-800">Email: {user.email}</div>}
            <div class="text-gray-800">Cell: {user.cell}</div>
          </div>
          <div class="user-section location-section">
            <div class="text-gray-900 font-bold">Location</div>
            <div class="flex flex-col">
              <div class=" text-gray-800">Sector:</div> {user.sector}
              <div class="text-gray-800">District:</div> {user.district}
              <div class="text-gray-800">Province:</div> {user.province}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full max-w-[35%] bg-white shadow-md rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Recent Activities</h2>
        <ul className="space-y-2">
          {user.recentActivities.map((activity) => (
            <li key={activity.id} className="flex justify-between">
              <div>{activity.activity}</div>
              <div className="text-gray-500">{activity.date}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default UserProfilePage
