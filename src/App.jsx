import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Login from './pages/auth/Login.jsx'
import Validate2faPage from './pages/auth/Validate2faPage.jsx'
import Sidebar from './containers/navigation/Sidebar.jsx'
import Navbar from './containers/navigation/Navbar.jsx'
import Dashboard from './containers/dashboard/Dashboard.jsx'
import HouseDetails from './containers/dashboard/HouseDetails.jsx'
import TransactionTable from './containers/dashboard/TransactionTable.jsx'
import IsLoggedIn from './outlets/IsLoggedIn.jsx'
import { useSelector } from 'react-redux'
import CreateVillageModel from './components/models/CreateVillageModel'
import Settings from './pages/Settings.jsx'
import HouseholdTable from './containers/dashboard/HouseholdTable.jsx'
import HouseholdDetail from './containers/dashboard/HouseholdDetail.jsx'
import UserProfilePage from './containers/dashboard/UserProfilePage.jsx'
import Report from './containers/dashboard/Report.jsx'
import Admins from './containers/dashboard/Admins.jsx'
import Department from './pages/dashboard/Department.jsx'
import CreateHousehold from './pages/households/CreateHousehold.jsx'
import NotFound from './pages/notFound/NotFound.jsx'
import SelectDepartments from './containers/dashboard/SelectDepartments.jsx'

const App = () => {
  const { user: stateUser } = useSelector((state) => state.auth)

  const { loginPageLoaded } = useSelector((state) => state.auth)

  const { isOpen } = useSelector((state) => state.sidebar)

  // eslint-disable-next-line no-undef
  const user = JSON.parse(localStorage.getItem('user'))

  return (
    <Router>
      <main
        className={`relative h-full`}>
        <section className="absolute">
          <Sidebar user={user} />
        </section>
        <section
          className={`w-full absolute ${
            isOpen
              ? 'w-[80vw] left-[20vw]'
              : loginPageLoaded
              ? 'grid grid-cols-[0vw, 100vw]'
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
                path="/dashboard/report"
                element={<Report user={user || stateUser} />}
              />
              <Route path="/createVillage" element={<CreateVillageModel />} />
              <Route path="/households/:id" element={<HouseholdDetail />} />
              <Route
                path="/households/create"
                element={<CreateHousehold user={user} />}
              />
              <Route
                path="/settings"
                element={<Settings user={user || stateUser} />}
              />
              <Route
                path="/transactions"
                element={<TransactionTable user={user || stateUser} />}
              />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route
              path="/two-fa-authentication"
              element={<Validate2faPage />}
            />
            <Route path="/households/stats" element={<HouseDetails />} />
            <Route
              path="/profile/:id"
              element={<UserProfilePage user={user || stateUser} />}
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </section>
        <ToastContainer />
      </main>
    </Router>
  )
}

export default App
