import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { useLoginMutation } from '../../states/api/apiSlice'
import Button from '../../components/Button'
import Loading from '../../components/Loading'
import Input from '../../components/Input'
import ErrorBoundary from '../../components/ErrorBoundary'
import { useResponsive } from '../../hooks/useResponsive'
import Logo from '../../../public/logo.png'
import { FaMoneyBillWave, FaWallet, FaMobileAlt, FaShieldAlt } from 'react-icons/fa'
import ParticleDots from '../../components/ParticleDots'
import {
  setLoginPageLoaded,
  setUser,
} from '../../states/features/auth/authSlice'
import { getDepartment } from '../../utils/User'
import { setPathName } from '../../states/features/navigation/navbarSlice'

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { isMobile, isTablet } = useResponsive()
  
  const { user } = useSelector((state) => state.auth)
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [
    login,
    {
      data: loginData,
      isLoading: loginLoading,
      isSuccess: loginSuccess,
      isError: loginError,
      error: loginErrorMessage,
    },
  ] = useLoginMutation()

  const { 
    control, 
    handleSubmit, 
    formState: { errors },
    setError,
    clearErrors,
    reset
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      username: '',
      password: ''
    }
  })

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    }
  }, [user, navigate, location])

  // Memoized form validation rules
  const validationRules = useMemo(() => ({
    username: {
      required: 'Username is required',
      minLength: {
        value: 3,
        message: 'Username must be at least 3 characters'
      },
      pattern: {
        value: /^[a-zA-Z0-9._-]+$/,
        message: 'Username can only contain letters, numbers, dots, underscores, and hyphens'
      }
    },
    password: {
      required: 'Password is required',
      minLength: {
        value: 6,
        message: 'Password must be at least 6 characters'
      }
    }
  }), [])

  // Enhanced form submission with better error handling
  const onSubmit = useCallback(async (data) => {
    try {
      setIsSubmitting(true)
      clearErrors()
      setFormErrors({})

      const { username, password } = data

      // Client-side validation
      if (!username?.trim() || !password?.trim()) {
        toast.error('Please fill in all required fields')
        return
      }

      const response = await login({ 
        username: username.trim(), 
        password: password.trim() 
      })

      if (response.error) {
        const errorMessage = response.error?.data?.message || 'Login failed. Please check your credentials.'
        
        // Handle specific error cases
        if (response.error.status === 401) {
          setError('password', { 
            type: 'manual', 
            message: 'Invalid username or password' 
          })
        } else if (response.error.status === 429) {
          toast.error('Too many login attempts. Please try again later.')
        } else if (response.error.status === 500) {
          toast.error('Server error. Please try again later.')
        } else {
          toast.error(errorMessage)
        }
      }
    } catch (error) {
      console.error('Login submission error:', error)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [login, clearErrors, setError])

  // Handle successful login
  useEffect(() => {
    if (loginSuccess && loginData?.data) {
      try {
        const userData = {
          ...loginData.data,
          department: getDepartment(loginData.data?.departments?.level_id)
        }

        if (!loginData.two_fa) {
          // Regular login without 2FA
          localStorage.setItem('user', JSON.stringify(userData))
          dispatch(setUser(loginData))
          dispatch(setPathName('Dashboard'))
          localStorage.setItem('pathName', 'Dashboard')
          
          toast.success('Login successful! Welcome back.', {
            position: 'top-right',
            autoClose: 3000,
          })
          
          const from = location.state?.from?.pathname || '/dashboard'
          navigate(from, { replace: true })
        } else {
          // 2FA required
          localStorage.setItem('user', JSON.stringify(userData))
          dispatch(setUser(loginData))
          
          toast.info('Please complete two-factor authentication.', {
            position: 'top-right',
            autoClose: 3000,
          })
          
          navigate('/two-fa-authentication')
        }
      } catch (error) {
        console.error('Error processing login success:', error)
        toast.error('Login successful but there was an error. Please try refreshing.')
      }
    }
  }, [loginData, loginSuccess, dispatch, navigate, location])

  // Initialize page
  useEffect(() => {
    dispatch(setLoginPageLoaded(true))
    document.title = 'Login | Umusanzu Digital'
  }, [dispatch])

  // Responsive container classes
  const containerClasses = useMemo(() => {
    if (isMobile) {
      return "min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center p-4"
    }
    if (isTablet) {
      return "min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center p-6"
    }
    return "min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center p-8"
  }, [isMobile, isTablet])

  const formClasses = useMemo(() => {
    if (isMobile) {
      return "w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-6"
    }
    if (isTablet) {
      return "w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6"
    }
    return "w-full max-w-lg bg-white rounded-2xl shadow-2xl p-10 space-y-8"
  }, [isMobile, isTablet])

  return (
    <ErrorBoundary>
      <main className={`${containerClasses} relative overflow-hidden`}>
        <div className={`relative z-10 ${formClasses}`}>
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-lg font-bold text-primary uppercase tracking-wide">
                Imena Softek
              </h1>
              <div className="flex justify-center">
                <img 
                  className={`${isMobile ? 'w-20 h-20' : 'w-24 h-24'} object-contain`} 
                  src={Logo} 
                  alt="Umusanzu Digital Logo" 
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
              <h2 className="text-xl font-bold text-primary uppercase">
                Umusanzu Digital
              </h2>
            </div>
            <p className="text-gray-600 text-sm">
              Sign in to your account to continue
            </p>
            {/* Money collection highlight strip */}
            <div className="mt-3 flex items-center justify-center gap-4">
              <span className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold">
                <FaMoneyBillWave className="text-primary" /> Fast collections
              </span>
              <span className="hidden sm:inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold">
                <FaShieldAlt className="text-primary" /> Secure payments
              </span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <div className="space-y-4">
              <Controller
                name="username"
                control={control}
                rules={validationRules.username}
                render={({ field }) => (
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 w-9 h-9 flex items-center justify-center rounded-md bg-primary/10 text-primary">
                      <FaWallet />
                    </div>
                    <div className="grow">
                      <Input
                        {...field}
                        label="Username"
                        placeholder="Enter your username"
                        type="text"
                        required
                        autoComplete="username"
                        error={errors.username?.message}
                        disabled={isSubmitting || loginLoading}
                        aria-describedby="username-error"
                      />
                    </div>
                  </div>
                )}
              />

              <Controller
                name="password"
                control={control}
                rules={validationRules.password}
                render={({ field }) => (
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 w-9 h-9 flex items-center justify-center rounded-md bg-primary/10 text-primary">
                      <FaMobileAlt />
                    </div>
                    <div className="grow">
                      <Input
                        {...field}
                        label="Password"
                        placeholder="Enter your password"
                        type="password"
                        required
                        autoComplete="current-password"
                        error={errors.password?.message}
                        disabled={isSubmitting || loginLoading}
                        aria-describedby="password-error"
                      />
                    </div>
                  </div>
                )}
              />
            </div>

            {/* Submit Button */}
            <Button
              submit
              disabled={isSubmitting || loginLoading}
              loading={isSubmitting || loginLoading}
              className="w-full py-3 text-base font-medium"
              value="Sign In"
              aria-label="Sign in to your account"
            />
          </form>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 space-y-2">
            <p>© 2024 Imena Softek. All rights reserved.</p>
            <p>Secure login protected by industry-standard encryption</p>
          </div>
        </div>

        {/* Particle background */}
        <div className="absolute inset-0 z-0">
          <ParticleDots colors={["#ffffff", "#000000", "#B45309"]} cycleMs={3500} density={0.0016} maxConnDist={120} />
        </div>
      </main>
    </ErrorBoundary>
  )
}

export default Login
