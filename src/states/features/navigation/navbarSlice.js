import { createSlice } from '@reduxjs/toolkit'

const navbarSlice = createSlice({
  name: 'navbar',
  initialState: {
    navDropdown: false,
  },
  reducers: {
    toggleNavDropdown: (state, { payload }) => {
      state.navDropdown = payload
    },
    reducers: {
      toggleNavDropdown: (state, { payload }) => {
        state.navDropdown = payload
      },
    },
  },
})

export default navbarSlice.reducer

export const { toggleNavDropdown } = navbarSlice.actions
