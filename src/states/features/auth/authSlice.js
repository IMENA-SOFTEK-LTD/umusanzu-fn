import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    user: {}
  },
  reducers: {
    setUser: (state, { payload }) => {
      localStorage.setItem('token', JSON.stringify(payload.token))
      localStorage.setItem('user', JSON.stringify(payload.data))
      state.token = payload.token
      state.user = payload.data
    }
  }
})

export const { setUser } = authSlice.actions

export default authSlice.reducer
