import React, { createContext, useContext, useEffect, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { setUser } from '../states/features/auth/authSlice'
import { logOut } from '../utils/User'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUserState] = useState(null)

  const INACTIVITY_LIMIT = 30 * 60 * 1000 // 30 minutes
  const TOKEN_CHECK_INTERVAL = 60 * 1000 // 1 minute

  // Enhanced token validation
  const isTokenValid = useCallback(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (!token || token === 'undefined' || !user || user === 'undefined') {
      return false
    }

    try {
      // Parse token to check expiration if it's a JWT
      const tokenParts = token.split('.')
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]))
        const currentTime = Math.floor(Date.now() / 1000)
        
        if (payload.exp && payload.exp < currentTime) {
          return false
        }
      }
      
      return true
    } catch (error) {
      console.error('Token validation error:', error)
      return false
    }
  }, [])

  // Enhanced logout with cleanup
  const logout = useCallback((showMessage = true) => {
    try {
      logOut()
      localStorage.removeItem('expireTime')
      localStorage.removeItem('pathName')
      localStorage.removeItem('pathRoute')
      
      setIsAuthenticated(false)
      setUserState(null)
      dispatch(setUser({ token: null, data: null }))
      
      if (showMessage) {
        toast.info('You have been logged out', {
          position: 'top-right',
          autoClose: 3000,
        })
      }
      
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout error:', error)
      navigate('/login', { replace: true })
    }
  }, [navigate, dispatch])

  // Token expiry handler with user notification
  const handleTokenExpiry = useCallback(() => {
    toast.error('Your session has expired. Please log in again.', {
      position: 'top-right',
      autoClose: 5000,
      onClose: () => logout(false)
    })
  }, [logout])

  // Inactivity management
  const updateExpireTime = useCallback(() => {
    if (isAuthenticated) {
      const expireTime = Date.now() + INACTIVITY_LIMIT
      localStorage.setItem('expireTime', expireTime.toString())
    }
  }, [isAuthenticated, INACTIVITY_LIMIT])

  const checkForInactivity = useCallback(() => {
    if (!isAuthenticated) return

    const expireTime = localStorage.getItem('expireTime')
    if (expireTime && Date.now() > Number(expireTime)) {
      toast.warning('You have been inactive for too long. Please log in again.', {
        position: 'top-right',
        autoClose: 5000,
        onClose: () => logout(false)
      })
    }
  }, [isAuthenticated, logout])

  // Comprehensive authentication check
  const checkAuthentication = useCallback(async () => {
    try {
      setIsLoading(true)
      
      if (!isTokenValid()) {
        if (isAuthenticated) {
          handleTokenExpiry()
        }
        return false
      }

      const userStr = localStorage.getItem('user')
      const userData = JSON.parse(userStr)
      
      setUserState(userData)
      setIsAuthenticated(true)
      updateExpireTime()
      
      return true
    } catch (error) {
      console.error('Authentication check failed:', error)
      logout(false)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isTokenValid, isAuthenticated, handleTokenExpiry, updateExpireTime, logout])

  // Initialize authentication state
  useEffect(() => {
    checkAuthentication()
  }, [])

  // Set up periodic token validation
  useEffect(() => {
    if (!isAuthenticated) return

    const tokenCheckInterval = setInterval(() => {
      if (!isTokenValid()) {
        handleTokenExpiry()
      }
    }, TOKEN_CHECK_INTERVAL)

    return () => clearInterval(tokenCheckInterval)
  }, [isAuthenticated, isTokenValid, handleTokenExpiry])

  // Set up inactivity monitoring
  useEffect(() => {
    if (!isAuthenticated) return

    const inactivityInterval = setInterval(checkForInactivity, TOKEN_CHECK_INTERVAL)
    return () => clearInterval(inactivityInterval)
  }, [isAuthenticated, checkForInactivity])

  // Set up activity listeners
  useEffect(() => {
    if (!isAuthenticated) return

    const events = ['click', 'keypress', 'scroll', 'mousemove', 'touchstart']
    events.forEach(event => window.addEventListener(event, updateExpireTime))

    return () => {
      events.forEach(event => window.removeEventListener(event, updateExpireTime))
    }
  }, [isAuthenticated, updateExpireTime])

  const value = {
    isAuthenticated,
    isLoading,
    user,
    logout,
    checkAuthentication,
    updateExpireTime
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext

