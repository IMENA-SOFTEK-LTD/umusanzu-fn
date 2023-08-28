import { createSlice } from '@reduxjs/toolkit'

const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState: {
    userProfile: null
  },
  reducers: {
    setUserProfile: (state, action) => {
      state.userProfile = action.payload
    },
    clearUserProfile: (state) => {
      state.userProfile = null
    }
  }
})

export const { setUserProfile, clearUserProfile } = userProfileSlice.actions

export default userProfileSlice.reducer
