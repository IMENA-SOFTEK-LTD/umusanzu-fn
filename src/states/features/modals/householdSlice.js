import { createSlice } from '@reduxjs/toolkit'

const householdSlice = createSlice({
  name: 'household',
  initialState: {
    provinces: [],
    selectedProvince: '',
    districts: [],
    selectedDistrict: '',
    sectors: [],
    selectedSector: '',
    cells: [],
    selectedCell: '',
    villages: [],
    selectedVillage: '',
    householdConflict: false,
    existingHousehold: {},
    moveHouseholdModal: false,
    confirmMoveHouseholdModal: false,
    existingHouseholdId: null,
  },
  reducers: {
    setProvinces: (state, action) => {
      state.provinces = action.payload
    },
    setDistricts: (state, action) => {
      state.districts = action.payload
    },
    setSectors: (state, action) => {
      state.sectors = action.payload
    },
    setCells: (state, action) => {
      state.cells = action.payload
    },
    setVillages: (state, action) => {
      state.villages = action.payload
    },
    setSelectedProvince: (state, action) => {
        state.selectedProvince = action.payload
    },
    setSelectedDistrict: (state, action) => {
        state.selectedDistrict = action.payload
    },
    setSelectedSector: (state, action) => {
        state.selectedSector = action.payload
    },
    setSelectedCell: (state, action) => {
        state.selectedCell = action.payload
    },
    setSelectedVillage: (state, action) => {
        state.selectedVillage = action.payload
    },
    setHouseholdConflict: (state, action) => {
        state.householdConflict = action.payload
    },
    setExistingHousehold: (state, action) => {
        state.existingHousehold = action.payload
    },
    setMoveHouseholdModal: (state, action) => {
        state.moveHouseholdModal = action.payload
    },
    setConfirmMoveHouseholdModal: (state, action) => {
        state.confirmMoveHouseholdModal = action.payload
    },
    setExistingHouseholdId: (state, action) => {
        state.existingHouseholdId = action.payload
    },
  },
})

export default householdSlice.reducer

export const {
  setCells,
  setProvinces,
  setDistricts,
  setSectors,
  setVillages,
  setSelectedProvince,
  setSelectedDistrict,
  setSelectedSector,
  setSelectedCell,
  setSelectedVillage,
  setHouseholdConflict,
  setExistingHousehold,
  setMoveHouseholdModal,
  setConfirmMoveHouseholdModal,
  setExistingHouseholdId,
} = householdSlice.actions