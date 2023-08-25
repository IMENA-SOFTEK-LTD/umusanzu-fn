import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from './api/apiSlice'
import authSlice from './features/auth/authSlice'
import navbarSlice from './features/navigation/navbarSlice'
import sidebarSlice from './features/navigation/sidebarSlice'
import paginationSlice from './features/pagination/paginationSlice'
import userProfileSlice from './features/userProfileSlice'
import dashboardCardSlice from './features/dashboard/dashboardCardSlice'
import modalSlice from './features/modals/modalSlice'

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
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(apiSlice.middleware)
  },
})

export { store }
