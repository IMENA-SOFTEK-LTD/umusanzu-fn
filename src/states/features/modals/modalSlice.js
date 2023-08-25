import { createSlice } from '@reduxjs/toolkit'

const modalSlice = createSlice({
  name: 'modals',
  initialState: {
    updateStaff: false,
  },
  reducers: {
    toggleUpdateStaff: (state, { payload }) => {
      console.log(payload)
      state.updateStaff = payload
    },
  },
})

export default modalSlice.reducer

export const { toggleUpdateStaff } = modalSlice.actions
