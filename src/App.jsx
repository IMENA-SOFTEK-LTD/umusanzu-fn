import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/auth/Login.jsx'
import Validate2faPage from './pages/auth/Validate2faPage.jsx'
import Sidebar from './components/sidebar.jsx'
import Navbar from './components/Navbar.jsx'
import Dashboard from './pages/dashboard/Dashboard.jsx'

function App () {
  return (
    <Router>
      <div className="App relative flex items-start">
      <Navbar />
          <Sidebar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/validate2faPage" element={<Validate2faPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
