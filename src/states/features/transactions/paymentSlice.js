import { createSlice } from "@reduxjs/toolkit";

export const paymentSlice = createSlice({
    name: 'payment',
    initialState: {
        payment: null,
        offlinePaymentModal: false,
        multiplePaymentModal: false,
        receiptsModal: false,
    },
    reducers: {
        setPayment: (state, action) => {
            state.payment = action.payload
        },
        setOfflinePaymentModal: (state, action) => {
            console.log(action.payload)
            state.offlinePaymentModal = action.payload
        },
        setMultiplePaymentModal: (state, action) => {
            state.multiplePaymentModal = action.payload
        },
        setReceiptsModal: (state, action) => {
            state.receiptsModal = action.payload
        }
    }
});

export const { setPayment, setOfflinePaymentModal, setMultiplePaymentModal, setReceiptsModal } = paymentSlice.actions;

export default paymentSlice.reducer;
