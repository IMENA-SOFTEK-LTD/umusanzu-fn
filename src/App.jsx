import { useEffect, useMemo, Suspense, lazy } from 'react'
import {
  Routes,
  Route
} from 'react-router-dom'
import Login from './pages/auth/Login.jsx'
import Validate2faPage from './pages/auth/Validate2faPage.jsx'
import Sector_commission from './containers/dashboard/Sector_commission.jsx'
import HouseDetails from './containers/dashboard/HouseDetails.jsx'
import IsLoggedIn from './outlets/IsLoggedIn.jsx'
import { useSelector } from 'react-redux'
import UserProfilePage from './containers/dashboard/UserProfilePage.jsx'
import VillagesReport from './containers/reports/VillagesReport.jsx'
import Admins from './containers/dashboard/Admins.jsx'
import Department from './pages/dashboard/Department.jsx'
import NotFound from './pages/notFound/NotFound.jsx'
import SelectDepartments from './containers/dashboard/SelectDepartments.jsx'
import { CompleteInitiatedPaymentsForm } from './components/models/CompleteInitiatedPaymentsForm.jsx'
import PaymentReceipt from './components/PaymentReceipt.jsx'
import SearchHousehold from './containers/households/SearchHousehold.jsx'
import Performances from './pages/dashboard/Performances.jsx'
import Reports from './containers/reports/Reports.jsx'
import SectorsReports from './containers/reports/SectorsReports.jsx'
import HouseholdExists from './pages/households/HouseholdExists.jsx'
import { useDispatch } from 'react-redux'
import { setUserOrSelectedDepartmentNames } from './states/features/departments/departmentSlice.js'
import axios from 'axios'
import AppLayout from './pages/mainPage.jsx'
import API_URL from './constants/index.js'
import Approvers from './pages/Approvers.jsx'
import Loading from './components/Loading.jsx'

// Lazy load components for better performance
const LazyDashboard = lazy(() => import('./pages/dashboard/Dashboard.jsx'))
const LazyHouseholdTable = lazy(() => import('./containers/dashboard/HouseholdTable.jsx'))
const LazyTransactionTable = lazy(() => import('./containers/dashboard/TransactionTable.jsx'))
const LazySettings = lazy(() => import('./pages/Settings.jsx'))
const LazyCreateHousehold = lazy(() => import('./pages/households/CreateHousehold.jsx'))
const LazyHouseholdDetails = lazy(() => import('./pages/households/HouseholdDetails.jsx'))
const LazyPendingPayments = lazy(() => import('./containers/payments/PendingPayments.jsx'))

const App = () => {
  const { isOpen } = useSelector((state) => state.sidebar)
  const { user: stateUser } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  // Memoize user data to prevent unnecessary re-renders
  const user = useMemo(() => {
    if (stateUser) return stateUser
    
    try {
      const userStr = localStorage.getItem('user')
      return userStr && userStr !== 'undefined' ? JSON.parse(userStr) : null
    } catch (error) {
      console.error('Error parsing user data:', error)
      return null
    }
  }, [stateUser])

  // Memoize token to prevent unnecessary re-renders
  const token = useMemo(() => {
    const storedToken = localStorage.getItem('token')
    return storedToken && storedToken !== 'undefined' ? storedToken : null
  }, [])
  // Enhanced department name fetching with error handling and caching
  const getDepartmentName = async (department, id) => {
    if (!id || !token) return

    try {
      const response = await axios.get(
        `${API_URL}/department/${department}/${String(id)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000, // 10 second timeout
        }
      )
      
      if (response.data?.data?.name) {
        dispatch(
          setUserOrSelectedDepartmentNames({
            [`${department}`]: response.data.data.name,
          })
        )
      }
    } catch (error) {
      console.error(`Error fetching ${department} name:`, error)
      // Don't show error toast for department names as it's not critical
    }
  }

  // Optimized department hierarchy fetching
  useEffect(() => {
    if (!user?.departments?.level_id || !token) return

    const fetchDepartmentHierarchy = async () => {
      const { departments } = user
      const levelId = departments.level_id

      try {
        // Fetch department names based on hierarchy level
        const fetchPromises = []

        switch (levelId) {
          case 1: // Province level
            if (departments.id) {
              fetchPromises.push(getDepartmentName('province', departments.id))
            }
            break
          case 2: // District level
            if (departments.parent?.id) {
              fetchPromises.push(getDepartmentName('province', departments.parent.id))
            }
            if (departments.id) {
              fetchPromises.push(getDepartmentName('district', departments.id))
            }
            break
          case 3: // Sector level
            if (departments.parent?.parent?.id) {
              fetchPromises.push(getDepartmentName('province', departments.parent.parent.id))
            }
            if (departments.parent?.id) {
              fetchPromises.push(getDepartmentName('district', departments.parent.id))
            }
            if (departments.id) {
              fetchPromises.push(getDepartmentName('sector', departments.id))
            }
            break
          case 4: // Cell level
            if (departments.parent?.parent?.parent?.id) {
              fetchPromises.push(getDepartmentName('province', departments.parent.parent.parent.id))
            }
            if (departments.parent?.parent?.id) {
              fetchPromises.push(getDepartmentName('district', departments.parent.parent.id))
            }
            if (departments.parent?.id) {
              fetchPromises.push(getDepartmentName('sector', departments.parent.id))
            }
            if (departments.id) {
              fetchPromises.push(getDepartmentName('cell', departments.id))
            }
            break
          case 6: // Village level
            if (departments.parent?.parent?.parent?.parent?.id) {
              fetchPromises.push(getDepartmentName('province', departments.parent.parent.parent.parent.id))
            }
            if (departments.parent?.parent?.parent?.id) {
              fetchPromises.push(getDepartmentName('district', departments.parent.parent.parent.id))
            }
            if (departments.parent?.parent?.id) {
              fetchPromises.push(getDepartmentName('sector', departments.parent.parent.id))
            }
            if (departments.parent?.id) {
              fetchPromises.push(getDepartmentName('cell', departments.parent.id))
            }
            if (departments.id) {
              fetchPromises.push(getDepartmentName('village', departments.id))
            }
            break
          default:
            break
        }

        // Execute all department name fetches concurrently
        if (fetchPromises.length > 0) {
          await Promise.allSettled(fetchPromises)
        }
      } catch (error) {
        console.error('Error fetching department hierarchy:', error)
      }
    }

    fetchDepartmentHierarchy()
  }, [user, token, dispatch])
  // Loading fallback component
  const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-screen">
      <Loading size={8} />
    </div>
  )

  return (
    <Routes>
      <Route element={<IsLoggedIn />}>
        <Route element={<AppLayout user={user} isOpen={isOpen} />}>
          <Route 
            path="/" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyDashboard />
              </Suspense>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyDashboard />
              </Suspense>
            } 
          />
          <Route
            path="/households"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyHouseholdTable user={user} />
              </Suspense>
            }
          />
          <Route
            path="/reports/villages"
            element={<VillagesReport user={user} />}
          />
          <Route
            path="/reports/sectors"
            element={<SectorsReports user={user} />}
          />
          <Route
            path="/reports"
            element={<Reports user={user} />}
          />
          <Route 
            path="/households/:id" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyHouseholdDetails />
              </Suspense>
            } 
          />
          <Route
            path="/households/create"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyCreateHousehold user={user} />
              </Suspense>
            }
          />
          <Route
            path="/households/create/conflict"
            element={<HouseholdExists />}
          />
          <Route
            path="/households/search"
            element={<SearchHousehold user={user} />}
          />

          <Route
            path="/settings"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LazySettings user={user} />
              </Suspense>
            }
          />
          <Route
            path="/approvers"
            element={<Approvers user={user} />}
          />

          <Route
            path="/agent/transactions/initiated"
            element={<CompleteInitiatedPaymentsForm user={user} />}
          />

          <Route
            path="/pending-payments"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyPendingPayments user={user} />
              </Suspense>
            }
          />

          <Route
            path="/transactions"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyTransactionTable user={user} />
              </Suspense>
            }
          />
          <Route path="/households/stats" element={<HouseDetails />} />
          <Route
            path="/profile/:id"
            element={<UserProfilePage user={user} />}
          />
          <Route path="/performances" element={<Performances user={user} />} />
          <Route
            path="/admins/:id"
            element={<Admins user={user} />}
          />

          <Route
            path="/departments"
            element={<Department user={user} />}
          />
          <Route
            path="/select-department"
            element={<SelectDepartments user={user} />}
          />
          <Route
            path="/report/sectors"
            element={<Sector_commission user={user} />}
          />

          <Route path="/receipt/:id" element={<PaymentReceipt />} />
        </Route>
      </Route>
      <Route path="/login" index element={<Login />} />
      <Route path="/two-fa-authentication" element={<Validate2faPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
