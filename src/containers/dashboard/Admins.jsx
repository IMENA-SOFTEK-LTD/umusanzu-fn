import { useEffect, useState } from 'react' // Import React and necessary hooks
import Card from '../../components/Card'
import CreateAdminModel from '../../components/models/CreateAdminModel'
import { useLazyGetStaffQuery } from '../../states/api/apiSlice'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import Loading from '../../components/Loading'
const Admins = () => {
  const user = JSON.parse(localStorage.getItem('user'))
  const { id } = useParams()
  const navigate = useNavigate()
  const [
    getStaff,
    {
      data: staffData,
      isLoading: staffIsLoading,
      isSuccess: staffIsSuccess,
      isError: staffIsError,
      error: staffError
    }
  ] = useLazyGetStaffQuery()

  let department = ''
  switch (user?.departments?.level_id + 1) {
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
  }, [department, getStaff])

  if (staffIsLoading) {
    return (
      <main className='h-screen w-full flex items-center justify-center'>
        <Loading />
      </main>
    )
  }

  return (
    <div className="w-[98%] mx-auto relative">
      <div>
        <CreateAdminModel user={user} className="relative top-4" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 absolute top-16">
        {data?.rows?.length === 0
          ? (
          <div className="w-full h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
              <h1 className="text-2xl font-medium text-center">
                There is no staff
              </h1>
              <Button value="Go to dashboard" route="/dashboard" />
            </div>
          </div>
            )
          : (
          <div className="grid gap-5 ">
            {data?.rows?.map((admin, index) => (
              <Card
                key={index}
                name={admin.names}
                phone={admin.phone1}
                nationalId={admin.nid}
                email={admin.email}
                onViewProfileClick={() => {
                  navigate(`/profile/${admin.id}`)
                }}
              />
            ))}
          </div>
            )}
      </div>
    </div>
  )
}

export default Admins
