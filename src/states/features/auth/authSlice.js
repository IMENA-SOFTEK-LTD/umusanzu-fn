import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    user:
    localStorage.getItem('user') && localStorage.getItem('user') !== "undefined"
    && localStorage.getItem('user') !== undefined
    ? JSON.parse(localStorage.getItem('user'))
    : null,
    loginPageLoaded: false,
  },
  reducers: {
    setUser: (state, { payload }) => {
      // console.log(payload)
      if (payload?.token) {
        localStorage.setItem('token', payload.token)
      }
      if (payload?.data) {
        localStorage.setItem('user', JSON.stringify(payload.data))
      }

      state.token = payload?.token || null
      state.user = payload?.data || null
    },
    setLoginPageLoaded: (state, { payload }) => {
      state.loginPageLoaded = payload
    },
  },
})

export const { setUser, setLoginPageLoaded } = authSlice.actions

export default authSlice.reducer
