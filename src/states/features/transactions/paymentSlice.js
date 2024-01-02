import { createSlice } from "@reduxjs/toolkit";

export const paymentSlice = createSlice({
    name: 'payment',
    initialState: {
        payment: null,
        offlinePaymentModal: false,
        multiplePaymentModal: false,
        receiptsModal: false,
        deletePaymentModal: false,
        editPaymentModal: false,
    },
    reducers: {
        setPayment: (state, action) => {
            state.payment = action.payload
        },
        setOfflinePaymentModal: (state, action) => {
            state.offlinePaymentModal = action.payload
        },
        setMultiplePaymentModal: (state, action) => {
            state.multiplePaymentModal = action.payload
        },
        setReceiptsModal: (state, action) => {
            state.receiptsModal = action.payload
        },
        setDeletePaymentModal: (state, action) => {
            state.deletePaymentModal = action.payload
        },
        setEditPaymentModal: (state, action) => {
            state.editPaymentModal = action.payload
        },
    }
});

export const { setPayment, setOfflinePaymentModal, setMultiplePaymentModal, setReceiptsModal, setDeletePaymentModal, setEditPaymentModal } = paymentSlice.actions;

export default paymentSlice.reducer;
