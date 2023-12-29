import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
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

const App = () => {
  

  const { loginPageLoaded } = useSelector((state) => state.auth)

  const { isOpen } = useSelector((state) => state.sidebar)
  const location = useLocation()

  // eslint-disable-next-line no-undef
  const user = JSON.parse(localStorage.getItem('user'))
  const { user: stateUser } = useSelector((state) => state.auth)
  return (
    <main className={`relative h-full`}>
      <section className="absolute">
        <Sidebar user={user} />
      </section>
      <section
        className={`absolute ${
          isOpen
            ? 'w-[80vw] left-[20vw]'
            : loginPageLoaded
            ? 'w-full grid grid-cols-[0vw, 100vw]'
            : 'w-[96vw] left-[4vw]'
        }`}
      >
        <Navbar user={user || stateUser} />
        <Routes>
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
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/two-fa-authentication" element={<Validate2faPage />} />
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
          <Route path="*" element={<NotFound />} />
          <Route path="/receipt/:id" element={<PaymentReceipt />} />
        </Routes>
      </section>
      <ToastContainer />
    </main>
  )
}

export default App
