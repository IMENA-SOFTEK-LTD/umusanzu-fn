import { createSlice } from '@reduxjs/toolkit'

const transactionSlice = createSlice({
  name: 'transactions',
  initialState: {
    transactions: [],
    deleteTransactionModal: false,
    deleteTransactionId: null,
  },
  reducers: {
    setDeleteTransactionModal: (state, action) => {
      state.deleteTransactionModal = action.payload
    },
    setDeleteTransactionId: (state, action) => {
      state.deleteTransactionId = action.payload
    },
  },
})

export default transactionSlice.reducer

export const { setDeleteTransactionModal, setDeleteTransactionId } =
  transactionSlice.actions
