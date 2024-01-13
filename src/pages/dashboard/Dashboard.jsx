import { useEffect } from 'react'
import DashboardCard from '../../components/DashboardCard'
import ChartDashboard from '../../containers/dashboard/DashboardChart'
import { useDispatch } from 'react-redux'
import { setSectorId, setDistrictId, setProvinceId, setCellId, setVillageId } from '../../states/features/departments/departmentSlice'
import { setUserOrSelectedDepartmentNames } from '../../states/features/departments/departmentSlice'
import axios from 'axios'

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'))
  const dispatch = useDispatch()

  const token = localStorage.getItem('token')
    
  const getDepartmentName = (department, id) => {
    axios.get(`https://v2.api.umusanzu.rw/api/v2/department/${department}/${String(id)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).then((response) => {
      dispatch(setUserOrSelectedDepartmentNames({ [`${department}`]: response.data.data.name}))
    }).catch((error) => console.log(error))
  }  
  useEffect(() => {

    if (user !== null) {
      console.log(user);
      switch (user?.departments?.level_id) {
        case 1:
          getDepartmentName('province', user?.departments?.id)
          break;
        case 2:
          getDepartmentName('province', user?.departments?.parent?.id)
          getDepartmentName('district', user?.departments?.id)
          dispatch(setProvinceId(String(user?.departments?.parent?.id)))
          break;
        case 3:
          getDepartmentName('province', user?.departments?.parent?.parent?.id)
          getDepartmentName('district', user?.departments?.parent?.id)
          getDepartmentName('sector', user?.departments?.id)
          break;
        case 4:
          getDepartmentName('province', user?.departments?.parent?.parent?.parent?.id)
          getDepartmentName('district', user?.departments?.parent?.parent?.id)
          getDepartmentName('sector', user?.departments?.parent?.id)
          getDepartmentName('cell', user?.departments?.id)
          break;
        case 6:
          getDepartmentName('province', user?.departments?.parent?.parent?.parent?.parent?.id)
          getDepartmentName('district', user?.departments?.parent?.parent?.parent?.id)
          getDepartmentName('sector', user?.departments?.parent?.parent?.id)
          getDepartmentName('cell', user?.departments?.parent?.id)
          getDepartmentName('village', user?.departments?.id)
          break;
        default:
          break;
      }
    }
  }, [user])
  useEffect(() => {
    document.title = 'Dashboard | Umusanzu Digital'
  }, [])

  return (
    <main className="flex flex-col items-center gap-12 w-[95%] mx-auto">
      <section className="w-full p-4 mx-auto flex items-center flex-wrap gap-4 justify-center">
        {Array.from({ length: 12 }, (_, i) => {
          const props = {
            index: i + 1,
            progress: Math.floor(Math.random() * 100),
            amount: '897,399',
            increaseValue: (Math.random() * 10).toFixed(2),
            user
          }
          return <DashboardCard key={i} props={props} />
        })}
      </section>
      <section className="w-full mx-auto">
        <ChartDashboard />
      </section>
    </main>
  )
}

export default Dashboard
