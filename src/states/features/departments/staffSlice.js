import { createSlice } from "@reduxjs/toolkit";

export const staffSlice = createSlice({
    name: "staff",
    initialState: {
        staff: {},
        createAdminModal: false,
    },
    reducers: {
        setStaff: (state, { payload }) => {
            state.staff = payload;
        },
        setCreateAdminModal: (state, { payload }) => {
            state.createAdminModal = payload;
        },
    }
});

export default staffSlice.reducer;

export const {
    setStaff,
    setCreateAdminModal,
} = staffSlice.actions;
