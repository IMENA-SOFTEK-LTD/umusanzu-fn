import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/auth/Login.jsx'
import Validate2faPage from './pages/auth/Validate2faPage.jsx'
import Sidebar from './containers/navigation/Sidebar.jsx'
import Navbar from './containers/navigation/Navbar.jsx'
import Dashboard from './containers/dashboard/Dashboard.jsx'
import HouseDetails from './containers/dashboard/HouseDetails.jsx'
import TransactionTable from './components/TransactionTable.jsx'
import IsLoggedIn from './outlets/IsLoggedIn.jsx'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import CreateVillageModel from './components/models/createVillageModel.jsx'
import Settings from './pages/Settings.jsx'

function App() {
  const [navUser, setNavUser] = useState({})

  const { user: stateUser } = useSelector((state) => state.auth)

  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    setNavUser(user || stateUser)
  }, [stateUser])

  return (
    <Router>
      <div className="App flex items-start">
        <Sidebar />
        <main className="w-full mx-auto">
          <Navbar user={user} />
          <Routes>
            <Route element={<IsLoggedIn />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/validate2faPage" element={<Validate2faPage />} />
            <Route path="/houseDetails" element={<HouseDetails />} />
            <Route path="/transactionTable" element={<TransactionTable />} />
            <Route path="/createVillage" element={<CreateVillageModel />} />
            <Route path="/settings" element={<Settings user={user} />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
