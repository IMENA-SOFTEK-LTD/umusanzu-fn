import {
  createBrowserRouter,
  // eslint-disable-next-line no-unused-vars
  RouterProvider
} from 'react-router-dom'

// eslint-disable-next-line no-unused-vars
import Login from './pages/auth/login.jsx'

function App () {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Login />

    },
    {
      path: '/login',
      element: <Login />
    }
  ])

  return (
    <>
      <RouterProvider router={router}/>

    </>
  )
}

export default App
