import { useEffect, useState } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { setUser } from '../states/features/auth/authSlice'
import { logOut } from '../utils/User'
import Loading from '../components/Loading'

const IsLoggedIn = () => {
  const location = useLocation()
  const dispatch = useDispatch()
  const { user: stateUser } = useSelector((state) => state.auth)
  const [isValidating, setIsValidating] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const validateToken = () => {
    try {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')

      // Check if token and user exist
      if (!token || token === 'undefined' || !userStr || userStr === 'undefined') {
        return false
      }

      // Validate token format (if JWT)
      if (token.includes('.')) {
        const tokenParts = token.split('.')
        if (tokenParts.length === 3) {
          try {
            const payload = JSON.parse(atob(tokenParts[1]))
            const currentTime = Math.floor(Date.now() / 1000)
            
            if (payload.exp && payload.exp < currentTime) {
              toast.error('Your session has expired. Please log in again.')
              return false
            }
          } catch (error) {
            console.error('Token parsing error:', error)
            return false
          }
        }
      }

      // Validate user data
      try {
        const userData = JSON.parse(userStr)
        if (!userData || !userData.id) {
          return false
        }
      } catch (error) {
        console.error('User data parsing error:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Token validation error:', error)
      return false
    }
  }

  const clearAuthData = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('expireTime')
    localStorage.removeItem('pathName')
    localStorage.removeItem('pathRoute')
    dispatch(setUser({ token: null, data: null }))
  }

  useEffect(() => {
    const checkAuthentication = async () => {
      setIsValidating(true)
      
      try {
        const isValid = validateToken()
        
        if (!isValid) {
          clearAuthData()
          setIsAuthenticated(false)
        } else {
          // Sync Redux state with localStorage if needed
          if (!stateUser) {
            const userStr = localStorage.getItem('user')
            const token = localStorage.getItem('token')
            if (userStr && token) {
              const userData = JSON.parse(userStr)
              dispatch(setUser({ token, data: userData }))
            }
          }
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Authentication check failed:', error)
        clearAuthData()
        setIsAuthenticated(false)
      } finally {
        setIsValidating(false)
      }
    }

    checkAuthentication()
  }, [location.pathname, dispatch, stateUser])

  // Show loading while validating
  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loading size={8} />
          <p className="mt-4 text-gray-600">Validating session...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

export default IsLoggedIn
