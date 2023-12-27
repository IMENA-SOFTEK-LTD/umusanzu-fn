import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    user: JSON.parse(localStorage.getItem('user')),
    loginPageLoaded: false
  },
  reducers: {
    setUser: (state, { payload }) => {
      localStorage.setItem('token', JSON.stringify(payload.token))
      localStorage.setItem('user', JSON.stringify(payload.data))
      state.token = payload.token
      state.user = payload.data
    },
    setLoginPageLoaded: (state, { payload }) => {
      state.loginPageLoaded = payload
    }
  }
})

export const { setUser, setLoginPageLoaded } = authSlice.actions

export default authSlice.reducer
