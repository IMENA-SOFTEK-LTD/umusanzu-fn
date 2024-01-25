import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Login from './pages/auth/Login.jsx'
import Validate2faPage from './pages/auth/Validate2faPage.jsx'
import Sector_commission from './containers/dashboard/Sector_commission.jsx'
import Sidebar from './containers/navigation/Sidebar.jsx'
import Navbar from './containers/navigation/Navbar.jsx'
import Dashboard from './pages/dashboard/Dashboard.jsx'
import HouseDetails from './containers/dashboard/HouseDetails.jsx'
import TransactionTable from './containers/dashboard/TransactionTable.jsx'
import IsLoggedIn from './outlets/IsLoggedIn.jsx'
import { useSelector } from 'react-redux'
import CreateVillageModel from './components/models/CreateVillageModel'
import Settings from './pages/Settings.jsx'
import HouseholdTable from './containers/dashboard/HouseholdTable.jsx'
import UserProfilePage from './containers/dashboard/UserProfilePage.jsx'
import VillagesReport from './containers/reports/VillagesReport.jsx'
import Admins from './containers/dashboard/Admins.jsx'
import Department from './pages/dashboard/Department.jsx'
import CreateHousehold from './pages/households/CreateHousehold.jsx'
import NotFound from './pages/notFound/NotFound.jsx'
import SelectDepartments from './containers/dashboard/SelectDepartments.jsx'
import { CompleteInitiatedPaymentsForm } from './components/models/CompleteInitiatedPaymentsForm.jsx'
import PaymentReceipt from './components/PaymentReceipt.jsx'
import SearchHousehold from './containers/households/SearchHousehold.jsx'
import Performances from './pages/dashboard/Performances.jsx'
import Reports from './containers/reports/Reports.jsx'
import SectorsReports from './containers/reports/SectorsReports.jsx'
import HouseholdDetails from './pages/households/HouseholdDetails.jsx'
import HouseholdExists from './pages/households/HouseholdExists.jsx'
import { useEffect } from 'react'
import { logOut } from './utils/User.js'
import { useDispatch } from 'react-redux'
import { setUserOrSelectedDepartmentNames } from './states/features/departments/departmentSlice.js'
import axios from 'axios'
import AppLayout from './pages/mainPage.jsx'

const App = () => {
  

  const { loginPageLoaded } = useSelector((state) => state.auth)

  const { isOpen } = useSelector((state) => state.sidebar)
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const checkForInactivity = () => {
    const expireTime = localStorage.getItem('expireTime')
    const token = localStorage.getItem('token')
    
    if (token !== null && expireTime < Date.now()) {
      toast.info('It seems you were away, you need to log in again', {
        position: toast.POSITION.TOP_RIGHT,
        onClose: () => {
          logOut();
          navigate('/login')
        }
      })
    }
  }

  const updateExpireTime = () => {
    const expireTime = Date.now() + 5000;
    localStorage.setItem('expireTime', expireTime)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      checkForInactivity();
    }, 300005);

    return () => clearInterval(interval);
  }, [])

  useEffect(() => {
    updateExpireTime();

    window.addEventListener('click', updateExpireTime);
    window.addEventListener('keypress', updateExpireTime);
    window.addEventListener('scroll', updateExpireTime);
    window.addEventListener('mousemove', updateExpireTime);

    return () => {
      window.removeEventListener('click', updateExpireTime);
      window.removeEventListener('keypress', updateExpireTime);
      window.removeEventListener('scroll', updateExpireTime);
      window.removeEventListener('mousemove', updateExpireTime);
    }
 
  }, [])

  // eslint-disable-next-line no-undef
  const user = JSON.parse(localStorage.getItem('user'))
  const { user: stateUser } = useSelector((state) => state.auth)

  const token = localStorage.getItem('token')
    
  const getDepartmentName = (department, id) => {
    axios.get(`https://v2.api.umusanzu.rw/api/v2/department/${department}/${String(id)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).then((response) => {
      dispatch(setUserOrSelectedDepartmentNames({ [`${department}`]: response.data.data.name}))
    }).catch((error) => console.log(error))
  }  
  useEffect(() => {

    if (stateUser !== null) {

      switch (stateUser?.departments?.level_id) {
        case 1:
          getDepartmentName('province', stateUser?.departments?.id)
          break;
        case 2:
          getDepartmentName('province', stateUser?.departments?.parent?.id)
          getDepartmentName('district', stateUser?.departments?.id)
          break;
        case 3:
          getDepartmentName('province', stateUser?.departments?.parent?.parent?.id)
          getDepartmentName('district', stateUser?.departments?.parent?.id)
          getDepartmentName('sector', stateUser?.departments?.id)
          break;
        case 4:
          getDepartmentName('province', stateUser?.departments?.parent?.parent?.parent?.id)
          getDepartmentName('district', stateUser?.departments?.parent?.parent?.id)
          getDepartmentName('sector', stateUser?.departments?.parent?.id)
          getDepartmentName('cell', stateUser?.departments?.id)
          break;
        case 6:
          getDepartmentName('province', stateUser?.departments?.parent?.parent?.parent?.parent?.id)
          getDepartmentName('district', stateUser?.departments?.parent?.parent?.parent?.id)
          getDepartmentName('sector', stateUser?.departments?.parent?.parent?.id)
          getDepartmentName('cell', stateUser?.departments?.parent?.id)
          getDepartmentName('village', stateUser?.departments?.id)
          break;
        default:
          break;
      }
    }
  }, [stateUser])
  return (

        <Routes>
          <Route element={<AppLayout 
            user={user || stateUser} 
            isOpen={isOpen} />} >
            <Route element={<IsLoggedIn />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                path="/households"
                element={<HouseholdTable user={user || stateUser} />}
              />
              <Route
                path="/reports/villages"
                element={<VillagesReport user={user || stateUser} />}
              />
              <Route
                path="/reports/sectors"
                element={<SectorsReports user={user || stateUser} />}
              />
              <Route
                path="/reports"
                element={<Reports user={user || stateUser} />}
              />
              <Route path="/createVillage" element={<CreateVillageModel />} />
              <Route path="/households/:id" element={<HouseholdDetails />} />
              <Route
                path="/households/create"
                element={<CreateHousehold user={user} />}
              />
              <Route path='/households/create/conflict' element={<HouseholdExists  />} />
              <Route
                path="/households/search"
                element={<SearchHousehold user={user} />}
              />

              <Route
                path="/settings"
                element={<Settings user={user || stateUser} />}
              />
              <Route
                path="/agent/transactions/initiated"
                element={<CompleteInitiatedPaymentsForm user={user} />}
              />

              <Route
                path="/transactions"
                element={<TransactionTable user={user || stateUser} />}
              />
              <Route path="/households/stats" element={<HouseDetails />} />
              <Route
                path="/profile/:id"
                element={<UserProfilePage user={user || stateUser} />}
              />
              <Route
                path="/performances"
                element={<Performances user={user} />}
              />
              <Route
                path="/admins/:id"
                element={<Admins user={user || stateUser} />}
              />

              <Route
                path="/departments"
                element={<Department user={user || stateUser} />}
              />
              <Route
                path="/select-department"
                element={<SelectDepartments user={user} />}
              />
              <Route
                path="/report/sectors"
                element={<Sector_commission user={user || stateUser} />}
              />

              <Route path="/receipt/:id" element={<PaymentReceipt />} />
            </Route>
          </Route>         
          <Route path="/login" index element={<Login />} />
          <Route path="/two-fa-authentication" element={<Validate2faPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
  )
}

export default App
