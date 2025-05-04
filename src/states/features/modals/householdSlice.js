import { createSlice } from '@reduxjs/toolkit'
import moment from 'moment'

const householdSlice = createSlice({
  name: 'household',
  initialState: {
    provinces: [],
    selectedProvince: null,
    districts: [],
    selectedDistrict: null,
    sectors: [],
    selectedSector: null,
    cells: [],
    selectedCell: null,
    villages: [],
    selectedVillage: null,
    householdConflict: false,
    existingHousehold: {},
    moveHouseholdModal: false,
    confirmMoveHouseholdModal: false,
    existingHouseholdId: null,
    updateHouseholdModal: false,
    updateHouseholdStatusModal: false,
    deleteTransactionModal: true,
    searchTerm: '',
    household: null,
    completePaymentModal: false,
    duplicateHousehold: null,
    selectedActivationStatus: 'ACTIVE',
    selectedPaymentStatus: 'All',
    selectedPaymentMethod: 'All',
    selectedLevel: '',
    selectDateFrom: moment().startOf('month').format('YYYY-MM-DD'),
    selectDateTo: moment().endOf('month').format('YYYY-MM-DD'),
    selectMonthPaid:moment(new Date()).format('YYYY-MM')
  },
  reducers: {
    setSelectedActivationStatus: (state, action) => {
      state.selectedActivationStatus = action.payload
    },
    setSelectedPaymentStatus: (state, action) => {
      state.selectedPaymentStatus = action.payload
    },
    setSelectedPaymentMethod: (state, action) => {
      state.selectedPaymentMethod = action.payload
    },
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
    setUpdateHouseholdModal: (state, action) => {
      state.updateHouseholdModal = action.payload
    },
    setUpdateHouseholdStatusModal: (state, action) => {
      state.updateHouseholdStatusModal = action.payload
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload
    },
    setHousehold: (state, action) => {
      state.household = action.payload
    },
    setCompletePaymentModal: (state, action) => {
      state.completePaymentModal = action.payload
    },
    setDuplicateHousehold: (state, action) => {
      state.duplicateHousehold = action.payload
    },
    setSelectedLevel: (state, action) => {
      state.selectedLevel = action.payload
    },
    setDateFrom: (state, action) => {
      state.selectDateFrom = action.payload
    },
    setDateTo: (state, action) => {
      state.selectDateTo = action.payload
    },
    setMonthPaid: (state, action) => {
      state.selectMonthPaid = action.payload
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
  setUpdateHouseholdModal,
  setUpdateHouseholdStatusModal,
  setSearchTerm,
  setHousehold,
  setCompletePaymentModal,
  setDuplicateHousehold,
  setSelectedLevel,
  setSelectedActivationStatus,
  setSelectedPaymentStatus,
  setSelectedPaymentMethod,
  setDateFrom,
  setDateTo,
  setMonthPaid
} = householdSlice.actions
