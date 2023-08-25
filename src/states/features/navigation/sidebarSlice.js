import { createSlice } from '@reduxjs/toolkit'

export const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState: {
    isOpen: true
  },
  reducers: {
    toggleSidebar: (state, { payload }) => {
      state.isOpen = payload
    }
  }
})

export default sidebarSlice.reducer

export const { toggleSidebar } = sidebarSlice.actions
