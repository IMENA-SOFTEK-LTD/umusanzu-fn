import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from './api/apiSlice'
import authSlice from './features/auth/authSlice'
import navbarSlice from './features/navigation/navbarSlice'
import sidebarSlice from './features/navigation/sidebarSlice'
import paginationSlice from './features/pagination/paginationSlice'
import userProfileSlice from './features/userProfileSlice'

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authSlice,
    navbar: navbarSlice,
    sidebar: sidebarSlice,
    pagination: paginationSlice,
    userProfile: userProfileSlice,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(apiSlice.middleware)
  },
})

export { store }
