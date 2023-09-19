import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from './api/apiSlice'
import authSlice from './features/auth/authSlice'
import navbarSlice from './features/navigation/navbarSlice'
import sidebarSlice from './features/navigation/sidebarSlice'
import paginationSlice from './features/pagination/paginationSlice'
import userProfileSlice from './features/userProfileSlice'
import dashboardCardSlice from './features/dashboard/dashboardCardSlice'
import modalSlice from './features/modals/modalSlice'
import householdSlice from './features/modals/householdSlice'
import departmentSlice from './features/departments/departmentSlice'
import transactionSlice from './features/transactions/transactionSlice'

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authSlice,
    navbar: navbarSlice,
    sidebar: sidebarSlice,
    pagination: paginationSlice,
    userProfile: userProfileSlice,
    dashboardCard: dashboardCardSlice,
    modals: modalSlice,
    household: householdSlice,
    departments: departmentSlice,
    transactions: transactionSlice,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(apiSlice.middleware)
  }
})

export { store }
