import { createSlice } from "@reduxjs/toolkit";

export const paymentSlice = createSlice({
    name: 'payment',
    initialState: {
        payment: null,
    },
    reducers: {
        setPayment: (state, action) => {
            state.payment = action.payload
        },
    }
});

export const { setPayment } = paymentSlice.actions;

export default paymentSlice.reducer;
