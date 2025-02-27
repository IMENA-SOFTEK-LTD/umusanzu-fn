import { createSlice } from '@reduxjs/toolkit'

export const dashboardCardSlice = createSlice({
  name: 'dashboardCard',
  initialState: {
    monthlyTarget: 0,
    lastMonthlyTarget:0
  },
  reducers: {
    setMonthlyTarget: (state, action) => {
      state.monthlyTarget = action.payload
    },
    setLastMonthlyTarget: (state, action) => {
      state.lastMonthlyTarget = action.payload
    }
  }
})

export default dashboardCardSlice.reducer

export const { setMonthlyTarget, setLastMonthlyTarget } = dashboardCardSlice.actions
