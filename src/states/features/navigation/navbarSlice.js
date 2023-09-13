import { createSlice } from '@reduxjs/toolkit'

const navbarSlice = createSlice({
  name: 'navbar',
  initialState: {
    navDropdown: false,
    pathName: localStorage.getItem('pathName') || 'Dashboard'
  },
  reducers: {
    toggleNavDropdown: (state, { payload }) => {
      state.navDropdown = payload
    },
    setPathName: (state, { payload }) => {
      state.pathName = payload
    }
  }
})

export default navbarSlice.reducer

export const { toggleNavDropdown, setPathName } = navbarSlice.actions
