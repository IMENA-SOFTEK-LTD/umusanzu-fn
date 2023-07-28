import { Outlet, Navigate } from 'react-router-dom'

const IsLoggedIn = () => {
  const tokenAvailable = localStorage.getItem('token') !== null
  const userAuth = JSON.parse(localStorage.getItem('user')) !== null

  return tokenAvailable && userAuth ? <Outlet /> : <Navigate to="/login" />
}

export default IsLoggedIn;
