import { createSlice } from '@reduxjs/toolkit'

export const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState: {
    isOpen: true,
    pathRoute: localStorage.getItem('pathRoute') || '/'
  },
  reducers: {
    toggleSidebar: (state, { payload }) => {
      state.isOpen = payload
    },
    setPathRoute: (state, { payload }) => {
      state.pathRoute = payload
    }
  }
})

export default sidebarSlice.reducer

export const { toggleSidebar, setPathRoute } = sidebarSlice.actions
