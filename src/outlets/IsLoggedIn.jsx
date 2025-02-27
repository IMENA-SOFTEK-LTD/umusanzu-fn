import { Outlet, Navigate } from 'react-router-dom'

const IsLoggedIn = () => {
  
  const token = localStorage.getItem('token')
  const tokenAvailable = token !== null && token !== 'undefined'

  const userStr = localStorage.getItem('user')
  const userAuth =
    userStr && userStr !== 'undefined' ? JSON.parse(userStr) : null
  if (!tokenAvailable || !userAuth) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('expireTime')
    localStorage.removeItem('pathName')
    localStorage.removeItem('pathRoute')
  }

  return tokenAvailable && userAuth ? <Outlet /> : <Navigate to="/login" />
}

export default IsLoggedIn
