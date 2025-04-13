import { useEffect, useState } from 'react' // Import React and necessary hooks
import Card from '../../components/Card'
import { useLazyGetStaffQuery } from '../../states/api/apiSlice'
import { useParams, useNavigate } from 'react-router-dom'
import Loading from '../../components/Loading'
import CreateAdmin from '../staff/CreateAdmin'
import Button from '../../components/Button'
import CustomDialog from '../../components/models/CustomDialog'
import { Alert } from '@material-tailwind/react'
import { useSelector } from 'react-redux'

const Admins = ({ selectDepartment, type }) => {
  const user = JSON.parse(localStorage.getItem('user'))
  const params = useParams()
  const id = params?.id || selectDepartment?.id
  const navigate = useNavigate()
  const [openAddAdmin, setOpenAddAdmin] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const { user: stateUser } = useSelector((state) => state.auth)
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
      department = 'country'
      break
    default:
      department = 'agent'
  }
  const [data, setData] = useState(staffData?.data?.rows || [])
  useEffect(() => {
    if (staffIsSuccess) {
      setData(staffData?.data?.rows || [])
      document.title = `Admins | Umusanzu Digital`
    }
  }, [staffIsSuccess, staffData])

  useEffect(() => {
    getStaff({ department, departmentId: id })
  }, [department, getStaff])

  if (staffIsLoading) {
    return (
      <main className="h-screen w-full flex items-center justify-center">
        <Loading />
      </main>
    )
  }

  return (
    <div className="w-[98%] mx-auto relative">
      <div className="grid grid-cols-3 w-full">
        <Alert
          className="w-full"
          color="green"
          open={successMessage}
          onClose={() => setSuccessMessage('')}
        >
          {successMessage}
        </Alert>
        <div>
          {stateUser?.staff_role === 1 && (
            <Button
              value={'Create ' + type}
              className="absolute top-0 right-2 !rounded-lg "
              onClick={(e) => {
                e.preventDefault()
                setOpenAddAdmin(true)
              }}
            />
          )}
        </div>
        <CustomDialog
          size="sm"
          title={'Create ' + type}
          open={openAddAdmin}
          onClose={() => {
            setOpenAddAdmin(false)
          }}
          children={
            <>
              <CreateAdmin
                type={type}
                departmentId={id}
                onCreateAdmin={(record) => {
                  if (record?.isSuccess) {
                    const tmpData = [...data]
                    tmpData.unshift(record?.data)
                    setData([...tmpData])
                    setSuccessMessage(record?.message)
                    setOpenAddAdmin(false)
                  }
                }}
              />
            </>
          }
        />
      </div>
      <div
        className="flex pt-8 mt-4"
       
      >
        {data?.length === 0 ? (
          <div className="w-full h-screen min-h-[70vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
              <h1 className="text-2xl font-medium text-center">
                There is no staff
              </h1>
              {/* <Button value="Go to dashboard" route="/dashboard" /> */}
            </div>
          </div>
        ) : (
          <div className="flex items-start flex-wrap gap-6 mt-5"  style={{ overflow: 'auto', height: '80vh' }}>
            {data?.map((admin, index) => (
              <Card
                key={index}
                id={admin.id}
                name={admin.names}
                phone={admin.phone1}
                nationalId={admin.nid}
                email={admin.email}
                createdAt={admin.createdAt}
                enabledDialog={!!selectDepartment}
                user={stateUser}
                type={type}
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
