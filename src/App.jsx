import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Login from './pages/auth/login.jsx'
import Validate2faPage from './pages/auth/Validate2faPage.jsx'
import Dashboard from './pages/dashboard.jsx'

function App () {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Login />
    },
    {
      path: '/login',
      element: <Login />
    },
    {
      path: '/validate2fa',
      element: <Validate2faPage />
    },
    {
      path: '/dashboard',
      element: <Dashboard />
    }
  ])

  return <RouterProvider router={router} />
}

export default App
