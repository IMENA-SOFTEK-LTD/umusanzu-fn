import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/auth/Login.jsx'
import Validate2faPage from './pages/auth/Validate2faPage.jsx'
import Sidebar from './components/sidebar.jsx'
import Navbar from './components/Navbar.jsx'
import Dashboard from './pages/dashboard/Dashboard.jsx'

function App() {
  return (
    <Router>
      <div className="App flex items-start">
          <aside className='w-full max-w-[20%]'>
          <Sidebar />
          </aside>
        <main className='w-full max-w-[80%]'>
          <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/validate2faPage" element={<Validate2faPage />} />
        </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
