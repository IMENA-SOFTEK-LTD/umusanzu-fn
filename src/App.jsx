import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
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

import { Department } from './pages/dashboard/Department.jsx'
function App() {
  const { user: stateUser } = useSelector((state) => state.auth)

  const { isOpen } = useSelector((state) => state.sidebar)

  const user = JSON.parse(localStorage.getItem('user'))

  return (
    <Router>
      <main
        className={`relative ${
          isOpen ? 'grid grid-cols-[20vw,80vw]' : 'grid grid-cols-[4vw,96vw]'
        }`}
      >
        <Sidebar />
        <section
          className={`w-full ${
            isOpen ? 'left-[280px]' : 'left-[55px]'
          } mx-auto`}
        >
          <Navbar user={user} />
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
              element={<TransactionTable user={user} />}
            />
            <Route path="/createVillage" element={<CreateVillageModel />} />
            <Route path="/settings" element={<Settings user={user} />} />
            <Route path="/departments" element={<Department />} />
          </Routes>
        </section>
        <ToastContainer />
      </main>
    </Router>
  )
}

export default App
