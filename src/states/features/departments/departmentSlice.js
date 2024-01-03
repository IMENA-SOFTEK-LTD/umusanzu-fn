import { createSlice } from '@reduxjs/toolkit'

const departmentSlice = createSlice({
  name: 'departments',
  initialState: {
    villageId: null,
    cellId: null,
    sectorId: null,
    districtId: null,
    provinceId: null,
    countryId: null,
    departmentsList: [],
  },
  reducers: {
    setSectorId: (state, { payload }) => {
      state.sectorId = payload
    },
    setVillageId: (state, { payload }) => {
      state.villageId = payload
    },
    setCellId: (state, { payload }) => {
      state.cellId = payload
    },
    setDistrictId: (state, { payload }) => {
      state.districtId = payload
    },
    setProvinceId: (state, { payload }) => {
      state.provinceId = payload
    },
    setCountryId: (state, { payload }) => {
      state.countryId = payload
    },
    setDepartmentsList: (state, { payload }) => {
      state.departmentsList = payload
    },
  },
})

export default departmentSlice.reducer

export const {
  setSectorId,
  setVillageId,
  setCellId,
  setDistrictId,
  setProvinceId,
  setCountryId,
  setDepartmentsList,
} = departmentSlice.actions
