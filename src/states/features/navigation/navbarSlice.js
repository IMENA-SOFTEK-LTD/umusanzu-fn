import { createSlice } from '@reduxjs/toolkit'

const navbarSlice = createSlice({
  name: 'navbar',
  initialState: {
    navDropdown: false,
    pathName: localStorage.getItem('pathName') || 'Dashboard',
    navResponsive: false
  },
  reducers: {
    toggleNavDropdown: (state, { payload }) => {
      state.navDropdown = payload
    },
    setPathName: (state, { payload }) => {
      state.pathName = payload
    },
    toggleNavResponsive: (state, { payload }) => {
      state.navResponsive = payload
    }
  }
})

export default navbarSlice.reducer

export const { toggleNavDropdown, setPathName, toggleNavResponsive } = navbarSlice.actions
