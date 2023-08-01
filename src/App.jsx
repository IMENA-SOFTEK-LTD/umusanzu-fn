import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/auth/Login.jsx'
import Validate2faPage from './pages/auth/Validate2faPage.jsx'
import Sidebar from './components/sidebar.jsx'
import Navbar from './components/Navbar.jsx'
import Dashboard from './containers/dashboard/Dashboard.jsx'
import UserTable from './components/userTable.jsx'
import HouseDetails from './containers/dashboard/HouseDetails.jsx'
import IsLoggedIn from './outlets/IsLoggedIn.jsx'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

function App() {

  const [navUser, setNavUser] = useState({});

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
            <Route path="/login" element={<Login />}   />
            <Route path="/validate2faPage" element={<Validate2faPage />} />
            <Route path="/table" element={<UserTable />} />
            <Route path="/houseDetails" element={<HouseDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
