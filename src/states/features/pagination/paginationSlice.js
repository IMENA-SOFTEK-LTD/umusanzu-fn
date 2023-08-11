import { createSlice } from '@reduxjs/toolkit'

export const paginationSlice = createSlice({
  name: 'pagination',
  initialState: {
    page: 0,
    size: 20,
    totalPages: 0,
  },
  reducers: {
    setSize: (state, { payload }) => {
      state.size = payload
    },
    setPage: (state, { payload }) => {
      state.page = payload
    },
    setTotalPages: (state, { payload }) => {
      state.totalPages = payload
    },
  },
})

export default paginationSlice.reducer

export const { setSize, setPage, setTotalPages } = paginationSlice.actions
