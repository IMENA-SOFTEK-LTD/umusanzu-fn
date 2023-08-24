import { useEffect, useState } from 'react' // Import React and necessary hooks
import Card from '../../components/Card'
import CreateAdminModel from '../../components/models/createAdminModel'
import { useLazyGetStaffQuery } from '../../states/api/apiSlice'
import { useParams } from 'react-router-dom'

const Admins = () => {
  const user = JSON.parse(localStorage.getItem('user'))
  const { id } = useParams()
  const [
    getStaff,
    {
      data: staffData,
      isLoading: staffIsLoading,
      isSuccess: staffIsSuccess,
      isError: staffIsError,
      error: staffError,
    },
  ] = useLazyGetStaffQuery()

  let department = ''
  switch (user?.departments?.level_id) {
    case 1:
      department = 'province'
      break
    case 2:
      department = 'district'
      break
    case 3:
      department = 'sector'
      break
    case 4:
      department = 'cell'
      break
    case 5:
      department = 'country'
      break
    case 6:
      department = 'agent'
      break
    default:
      department = 'agent'
  }

  const [data, setData] = useState(staffData?.data || [])
  useEffect(() => {
    if (staffIsSuccess) {
      setData(staffData?.data || [])
    }
  }, [staffIsSuccess, staffData])

  useEffect(() => {
    getStaff({ department, departmentId: id })
  }, [department, getStaff]) // Add getStaff as a dependency

  return (
    <div className="w-[98%] mx-auto relative">
      <div>
        <CreateAdminModel className="relative top-4" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 absolute top-16">
        {data?.rows?.map((admin, index) => (
          <Card
            key={index}
            name={admin.names}
            phone={admin.phone1}
            nationalId={admin.nid}
            email={admin.email}
          />
        ))}
      </div>
    </div>
  )
}

export default Admins
