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
import DepartmentsTable from './containers/dashboard/DepartmentsTable.jsx'
import HouseholdTable from './containers/dashboard/HouseholdTable.jsx'
import HouseholdDetail from './containers/dashboard/HouseHoldDetail.jsx'
import UserProfilePage from './containers/dashboard/UserProfilePage.jsx'
import Department from './pages/dashboard/Department.jsx'
import Admins from './containers/dashboard/Admins.jsx'

const App = () => {
  const { user: stateUser } = useSelector((state) => state.auth)

  const { isOpen } = useSelector((state) => state.sidebar)

  const user = JSON.parse(localStorage.getItem('user'))

  return (
    <Router>
      <main
        className={`relative h-full ${
          isOpen ? 'grid grid-cols-[20vw,80vw]' : 'grid grid-cols-[4vw,96vw]'
        }`}
      >
        <Sidebar />
        <section
          className={`w-full ${
            isOpen ? 'left-[280px]' : 'left-[55px]'
          } mx-auto`}
        >
          <Navbar user={user || stateUser} />
          <Routes>
            <Route element={<IsLoggedIn />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/validate2faPage" element={<Validate2faPage />} />
            <Route path="/houseDetails" element={<HouseDetails />} />
            <Route
              path="/transactions"
              element={<TransactionTable user={user || stateUser} />}
            />
            <Route
              path="/households"
              element={<HouseholdTable user={user || stateUser} />}
            />
            <Route path="/createVillage" element={<CreateVillageModel />} />
            <Route path="/householdDetail" element={<HouseholdDetail />} />
            <Route
              path="/settings"
              element={<Settings user={user || stateUser} />}
            />
            <Route
              path="/profile"
              element={<UserProfilePage user={user || stateUser} />}
            />
            <Route
              path="/admins"
              element={<Admins user={user || stateUser} />}
            />

            <Route
              path="/departments"
              element={<DepartmentsTable user={user || stateUser} />}
            />
          </Routes>
        </section>
        <ToastContainer />
      </main>
    </Router>
  )
}

export default App
