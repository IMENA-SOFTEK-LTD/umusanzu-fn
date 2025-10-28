import PropTypes from 'prop-types'
import { Controller, useForm } from 'react-hook-form'
import Button from '../../components/Button'
import { useState } from 'react'
import {
  useLazyGetCellVillagesQuery,
  useLazyGetCountryDistrictsQuery,
  useLazyGetDistrictSectorsQuery,
  useLazyGetSectorCellsQuery,
} from '../../states/api/apiSlice'
import {
  setCells,
  setDistricts,
  setSearchTerm,
  setSectors,
  setSelectedCell,
  setSelectedDistrict,
  setSelectedProvince,
  setSelectedSector,
  setSelectedActivationStatus,
  setSelectedVillage,
  setVillages,
  setSelectedPaymentStatus,
  setSelectedPaymentMethod,
  setSelectedLevel,
  setDateFrom,
  setDateTo,
  setMonthPaid,
} from '../../states/features/modals/householdSlice'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  setSectorId,
  setDistrictId,
  setProvinceId,
  setCellId,
  setVillageId,
} from '../../states/features/departments/departmentSlice'
import { setUserOrSelectedDepartmentNames } from '../../states/features/departments/departmentSlice'
import queryString from 'query-string'
import moment from 'moment'
import { BiChevronDown, BiSearch } from 'react-icons/bi'
import { faUpload, faTrash, faChevronDown as faChevronDownIcon } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const levels = [
  { id: 1, name: 'Country' },
  { id: 2, name: 'Province' },
  { id: 3, name: 'District' },
  { id: 4, name: 'Sector' },
  { id: 5, name: 'Cell' },
  { id: 6, name: 'Village' },
]

const selectedPaymentMethods = [
  { id: 'All', name: 'All' },
  { id: 'Cash', name: 'Cash' },
  { id: 'CashLess', name: 'CashLess' },
  { id: 'Mobile_Money', name: 'Only Mobile Money' },
  { id: 'Credit_Card', name: 'Only Credit Card' },
]

const selectedPaymentStatuses = [
  { id: 'All', name: 'All' },
  { id: 'PAID', name: 'Paid' },
  { id: 'PARTIAL', name: 'Partial' },
  { id: 'PENDING', name: 'Pending' },
  { id: 'PAID_PARTIAL', name: 'Paid and Partial' },
]

const provinces = [
  { id: 31, name: 'Kigali City' },
  { id: 1540, name: 'Western Province' },
  { id: 1678, name: 'Northern Province' },
  { id: 1836, name: 'Eastern Province' },
  { id: 1986, name: 'Southern Province' },
]

const GlobalFilter = ({
  user,
  fieldEnabled,
  onChange,
  onSearch,
  placeholder,
  showImport = false,
  showDelete = false,
  onImport,
  onDeleteAllHouseholds,
  onDeleteTransactions,
}) => {
  const { handleSubmit, control } = useForm()
  const [showDeleteMenu, setShowDeleteMenu] = useState(false)

  const {
    districts,
    sectors,
    cells,
    selectedDistrict,
    selectedProvince,
    selectedSector,
    selectedCell,
    villages,
    selectedVillage,
    selectedActivationStatus,
    searchTerm,
    selectedLevel,
    selectedPaymentStatus,
    selectedPaymentMethod,
    selectDateFrom,
    selectDateTo,
    selectMonthPaid,
  } = useSelector((state) => state.household)

  const queryRoute = queryString.parse(location.search)

  const dispatch = useDispatch()

  let department = ''
  // console.log(user);
  switch (user?.departments?.level_id) {
    case 1:
      department = 'province'
      dispatch(
        setSelectedProvince(queryRoute?.province || user?.departments?.id)
      )
      break
    case 2:
      department = 'district'
      dispatch(
        setSelectedDistrict(queryRoute?.district || user?.departments?.id)
      )
      break
    case 3:
      department = 'sector'
      dispatch(setSelectedSector(queryRoute?.sector || user?.departments?.id))
      break
    case 4:
      department = 'cell'
      dispatch(setSelectedCell(queryRoute?.cell || user?.departments?.id))
      break
    case 5:
      department = 'country'
      break
    case 6:
      department = 'agent'
      break
    default:
      department = 'agent'
  }

  /**
   *
   * FETCHING DEPARTMENTS CHILDREN
   */
  useEffect(() => {
    dispatch(setSectorId(+queryRoute?.sector || ''))
    dispatch(setDistrictId(+queryRoute?.district || ''))
    dispatch(setProvinceId(+queryRoute?.province || ''))
    dispatch(setCellId(+queryRoute?.cell || ''))
    dispatch(setVillageId(+queryRoute?.village || ''))

    dispatch(
      setSelectedActivationStatus(queryRoute?.status?.toUpperCase() || 'ACTIVE')
    )
    dispatch(setSelectedVillage(+queryRoute?.village || ''))
    dispatch(setSelectedProvince(+queryRoute?.province || ''))
    dispatch(setSelectedDistrict(+queryRoute?.district || ''))
    dispatch(setSelectedSector(+queryRoute?.sector || ''))
    dispatch(setSelectedCell(+queryRoute?.cell || ''))
    dispatch(
      setSelectedLevel(
        +queryRoute?.level || (['country'].includes(department) ? 1 : '')
      )
    )
  }, [
    queryRoute?.level,
    queryRoute?.province,
    queryRoute?.district,
    queryRoute?.sector,
    queryRoute?.cell,
    queryRoute?.status,
  ])
  // GET DISTRICTS
  const [
    getCountryDistricts,
    {
      data: countryDistrictsData,
      isLoading: countryDistrictsLoading,
      isSuccess: countryDistrictsSuccess,
    },
  ] = useLazyGetCountryDistrictsQuery()

  useEffect(() => {
    if (fieldEnabled?.district && selectedProvince)
      getCountryDistricts({ id: selectedProvince })
  }, [fieldEnabled?.district, selectedProvince])

  useEffect(() => {
    if (countryDistrictsData) {
      dispatch(setDistricts(countryDistrictsData?.data?.rows))
      // dispatch(setSelectedDistrict(countryDistrictsData?.data?.rows[0]?.id))
    }
  }, [countryDistrictsData])

  // GET SECTORS
  const [
    getDistrictSectors,
    {
      data: districtSectorsData,
      isLoading: districtSectorsLoading,
      isSuccess: districtSectorsSuccess,
    },
  ] = useLazyGetDistrictSectorsQuery()

  useEffect(() => {
    if (fieldEnabled?.sector && selectedDistrict)
      getDistrictSectors({ id: selectedDistrict })
  }, [fieldEnabled?.sector, selectedDistrict])

  useEffect(() => {
    if (districtSectorsData) {
      dispatch(setSectors(districtSectorsData?.data?.rows))
      // dispatch(setSelectedSector(districtSectorsData?.data?.rows[0]?.id))
    }
  }, [districtSectorsData])

  // GET CELLS
  const [
    getSectorCells,
    {
      data: sectorCellsData,
      isLoading: sectorCellsLoading,
      isSuccess: sectorCellsSuccess,
    },
  ] = useLazyGetSectorCellsQuery()
  useEffect(() => {
    if (fieldEnabled?.cell && selectedSector)
      getSectorCells({ id: selectedSector })
  }, [fieldEnabled?.cell, selectedSector])

  useEffect(() => {
    if (sectorCellsData) {
      dispatch(setCells(sectorCellsData?.data?.rows))
      // dispatch(setSelectedCell(sectorCellsData?.data?.rows[0]?.id))
    }
  }, [sectorCellsData])

  // GET CELLS
  const [
    getCellVillages,
    {
      data: cellVillagesData,
      isLoading: cellVillagesDataLoading,
      isSuccess: cellVillagesDataSuccess,
    },
  ] = useLazyGetCellVillagesQuery()
  useEffect(() => {
    if (fieldEnabled?.village && selectedCell)
      getCellVillages({ id: selectedCell })
  }, [fieldEnabled?.village, selectedCell])

  useEffect(() => {
    if (cellVillagesData) {
      dispatch(setVillages(cellVillagesData?.data?.rows))
      // dispatch(setSelectedVillage(cellVillagesData?.data?.rows[0]?.id))
    }
  }, [cellVillagesData])

  useEffect(() => {
    dispatch(
      setUserOrSelectedDepartmentNames({
        ['province']: null,
        ['district']: null,
        ['sector']: null,
        ['cell']: null,
        ['village']: null,
      })
    )
    if (selectedProvince) {
      const name = getNameById(provinces, selectedProvince)
      if (name) dispatch(setUserOrSelectedDepartmentNames({ province: name }))
    }

    if (selectedDistrict) {
      const name = getNameById(districts, selectedDistrict)
      if (name) dispatch(setUserOrSelectedDepartmentNames({ district: name }))
    }

    if (selectedSector) {
      const name = getNameById(sectors, selectedSector)
      if (name) dispatch(setUserOrSelectedDepartmentNames({ sector: name }))
    }

    if (selectedCell) {
      const name = getNameById(cells, selectedCell)
      if (name) dispatch(setUserOrSelectedDepartmentNames({ cell: name }))
    }

    if (selectedVillage) {
      const name = getNameById(villages, selectedVillage)
      if (name) dispatch(setUserOrSelectedDepartmentNames({ village: name }))
    }

    onChange({
      sector: selectedSector || '',
      district: selectedDistrict || '',
      province: selectedProvince || '',
      cell: selectedCell || '',
      village: selectedVillage || '',
      activationStatus: selectedActivationStatus || '',
      searchTerm: searchTerm || '',
      level: selectedLevel || '',
      monthPaid: selectMonthPaid || '',
      dateFrom: selectDateFrom || '',
      dateTo: selectDateTo || '',
      paymentStatus: selectedPaymentStatus || '',
      paymentMethod: selectedPaymentMethod || '',
    })
  }, [
    selectedSector,
    selectedDistrict,
    selectedProvince,
    selectedCell,
    selectedVillage,
    selectedActivationStatus,
    searchTerm,
    selectedLevel,
    selectMonthPaid,
    selectDateFrom,
    selectDateTo,
    selectedPaymentStatus,
    selectedPaymentMethod,
  ])

  const getNameById = (list, id) => {
    const item = list.find((i) => String(i.id) === String(id))
    return item ? item.name : null
  }

  useEffect(() => {
    let updates = {}
    // console.log("queryRoute",queryRoute);
    if (queryRoute.province) {
      const province = provinces.find(
        ({ id }) => id === parseInt(queryRoute.province)
      )
      if (province) updates['province'] = province.name
    }

    if (queryRoute.district) {
      const district = districts.find(
        ({ id }) => id === parseInt(queryRoute.district)
      )
      if (district) updates['district'] = district.name
    }
    if (queryRoute.sector) {
      const sector = sectors.find(
        ({ id }) => id === parseInt(queryRoute.sector)
      )
      if (sector) updates['sector'] = sector.name
    }
    if (queryRoute.cell) {
      const cell = cells.find(({ id }) => id === parseInt(queryRoute.cell))
      if (cell) updates['cell'] = cell.name
    }
    // Prevent unnecessary dispatches
    if (Object.keys(updates).length > 0) {
      dispatch(setUserOrSelectedDepartmentNames(updates))
    }
  }, [provinces, districts, cells, sectors]) // Ensure dependencies are correctly listed

  const onSubmit = (data) => {
    dispatch(setSectorId(data?.sector))
    dispatch(setDistrictId(data?.district))
    dispatch(setProvinceId(data?.province))
    dispatch(setCellId(data?.cell))
    dispatch(setVillageId(data?.village))
    dispatch(setSelectedLevel(data?.selectedLevel))

    localStorage.setItem('sectorId', data?.sector)

    onSearch({
      sector: data?.sector || selectedSector || '',
      district: data?.district || selectedDistrict || '',
      province: data?.province || selectedProvince || '',
      cell: data?.cell || selectedCell || '',
      village: data?.village || selectedVillage || '',
      activationStatus:
        data?.activationStatus || selectedActivationStatus || '',
      searchTerm: data?.searchTerm || '',
      level: data?.level || selectedLevel,
      paymentMethod: data?.paymentMethod || selectedPaymentMethod,
      paymentStatus: data?.paymentStatus || selectedPaymentStatus,
      dateFrom: data?.dateFrom || selectDateFrom,
      dateTo: data?.dateTo || selectDateTo,
      monthPaid: data?.monthPaid || selectMonthPaid,
    })
    // navigate(pathRoute)
  }

  // Reusable select field component
  const SelectField = ({
    value,
    onChange,
    options = [],
    loading = false,
    placeholder = 'Select...',
    disabled = false,
  }) => (
    <div className="relative">
      <select
        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-muted-foreground appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed z-10"
        value={value}
        onChange={onChange}
        disabled={disabled}
      >
        <option value="">{loading ? 'Loading...' : placeholder}</option>
        {options?.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      <BiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
  )

  // Reusable date input component
  const DateInput = ({
    label,
    value,
    onChange,
    disabled = false,
    min,
    max,
  }) => (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-foreground whitespace-nowrap min-w-fit">
        {label}:
      </span>
      <input
        type="date"
        className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        value={value}
        onChange={onChange}
        disabled={disabled}
        min={min}
        max={max}
      />
    </div>
  )

  return (
    <div className="w-full bg-background border border-border rounded-lg shadow-sm p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Main grid - responsive layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {/* Level */}
          {fieldEnabled?.level && (
            <Controller
              control={control}
              name="level"
              defaultValue={selectedLevel}
              render={({ field }) => (
                <SelectField
                  value={selectedLevel}
                  onChange={(e) => {
                    field.onChange(e)
                    dispatch(setSelectedLevel(e.target.value))
                  }}
                  options={levels}
                  placeholder="Select Level"
                />
              )}
            />
          )}

          {/* Activation Status */}
          {fieldEnabled?.activationStatus && (
            <Controller
              control={control}
              name="activationStatus"
              defaultValue={selectedActivationStatus}
              render={({ field }) => (
                <SelectField
                  value={selectedActivationStatus}
                  onChange={(e) => {
                    field.onChange(e)
                    dispatch(setSelectedActivationStatus(e.target.value))
                  }}
                  options={[
                    { id: 'ACTIVE', name: 'Active' },
                    { id: 'INACTIVE', name: 'Inactive' },
                    { id: 'MOVED', name: 'Moved' },
                    { id: 'REQUESTED', name: 'Requested' },
                    // { id: 'DELETED', name: 'Deleted' },
                  ]}
                  placeholder="Select Activation Status"
                />
              )}
            />
          )}

          {/* Payment Status */}
          {fieldEnabled?.paymentStatus && (
            <Controller
              control={control}
              name="paymentStatus"
              defaultValue={selectedPaymentStatus}
              render={({ field }) => (
                <SelectField
                  value={selectedPaymentStatus}
                  onChange={(e) => {
                    field.onChange(e)
                    dispatch(setSelectedPaymentStatus(e.target.value))
                  }}
                  options={selectedPaymentStatuses}
                  placeholder="Select Payment Status"
                />
              )}
            />
          )}

          {/* Payment Method */}
          {fieldEnabled?.paymentMethod && (
            <Controller
              control={control}
              name="paymentMethod"
              defaultValue={selectedPaymentMethod}
              render={({ field }) => (
                <SelectField
                  value={selectedPaymentMethod}
                  onChange={(e) => {
                    field.onChange(e)
                    dispatch(setSelectedPaymentMethod(e.target.value))
                  }}
                  options={selectedPaymentMethods}
                  placeholder="Select Payment Method"
                />
              )}
            />
          )}

          {/* Province */}
          {fieldEnabled?.province && (
            <Controller
              control={control}
              name="province"
              defaultValue={selectedProvince}
              render={({ field }) => (
                <SelectField
                  value={selectedProvince}
                  onChange={(e) => {
                    field.onChange(e)
                    dispatch(setSelectedProvince(e.target.value))
                  }}
                  options={provinces}
                  placeholder="Select Province"
                />
              )}
            />
          )}

          {/* District */}
          {fieldEnabled?.district && (
            <Controller
              control={control}
              name="district"
              defaultValue={selectedDistrict}
              render={({ field }) => (
                <SelectField
                  value={selectedDistrict}
                  onChange={(e) => {
                    field.onChange(e)
                    dispatch(setSelectedDistrict(e.target.value))
                  }}
                  options={districts}
                  loading={countryDistrictsLoading}
                  placeholder="Select District"
                  disabled={!selectedProvince && department !== 'country'}
                />
              )}
            />
          )}

          {/* Sector */}
          {fieldEnabled?.sector && (
            <Controller
              control={control}
              name="sector"
              defaultValue={selectedSector}
              render={({ field }) => (
                <SelectField
                  value={selectedSector}
                  onChange={(e) => {
                    field.onChange(e)
                    dispatch(setSelectedSector(e.target.value))
                  }}
                  options={sectors}
                  loading={districtSectorsLoading}
                  placeholder="Select Sector"
                />
              )}
            />
          )}

          {/* Cell */}
          {fieldEnabled?.cell && (
            <Controller
              control={control}
              name="cell"
              defaultValue={selectedCell}
              render={({ field }) => (
                <SelectField
                  value={selectedCell}
                  onChange={(e) => {
                    field.onChange(e)
                    dispatch(setSelectedCell(e.target.value))
                  }}
                  options={cells}
                  loading={sectorCellsLoading}
                  placeholder="Select Cell"
                />
              )}
            />
          )}

          {/* Village */}
          {fieldEnabled?.village && (
            <Controller
              control={control}
              name="village"
              defaultValue={selectedVillage}
              render={({ field }) => (
                <SelectField
                  value={selectedVillage}
                  onChange={(e) => {
                    field.onChange(e)
                    dispatch(setSelectedVillage(e.target.value))
                  }}
                  options={villages}
                  loading={cellVillagesDataLoading}
                  placeholder="Select Village"
                />
              )}
            />
          )}

          {/* Month Paid */}
          {fieldEnabled?.monthPaid && (
            <Controller
              control={control}
              name="monthPaid"
              defaultValue={selectMonthPaid}
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-foreground whitespace-nowrap min-w-fit">
                    Month:
                  </span>
                  <input
                    type="month"
                    className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-muted-foreground"
                    value={selectMonthPaid}
                    onChange={(e) => {
                      field.onChange(e)
                      const newDate = e.target.value
                      const firstDay = moment(newDate + '-01')
                      const lastDay = firstDay
                        .clone()
                        .endOf('month')
                        .format('YYYY-MM-DD')
                      const dateFrom = firstDay.format('YYYY-MM-DD')
                      dispatch(setMonthPaid(newDate))
                      dispatch(setDateFrom(dateFrom))
                      dispatch(setDateTo(lastDay))
                    }}
                  />
                </div>
              )}
            />
          )}

          {/* Date From */}
          {fieldEnabled?.dateFrom && (
            <Controller
              control={control}
              name="dateFrom"
              defaultValue={selectDateFrom}
              render={({ field }) => (
                <DateInput
                  label="From"
                  value={selectDateFrom}
                  onChange={(e) => {
                    field.onChange(e)
                    dispatch(setDateFrom(e.target.value))
                  }}
                  disabled={fieldEnabled?.monthPaid}
                />
              )}
            />
          )}

          {/* Date To */}
          {fieldEnabled?.dateTo && (
            <Controller
              control={control}
              name="dateTo"
              defaultValue={selectDateTo}
              render={({ field }) => (
                <DateInput
                  label="To"
                  value={selectDateTo}
                  onChange={(e) => {
                    field.onChange(e)
                    dispatch(setDateTo(e.target.value))
                  }}
                  disabled={fieldEnabled?.monthPaid}
                  min={
                    selectDateFrom
                      ? moment(selectDateFrom).format('YYYY-MM-DD')
                      : undefined
                  }
                />
              )}
            />
          )}
        </div>

        {/* Search and Submit Row */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
          {/* Search Input */}
          {fieldEnabled?.searchTerm && (
            <div className="flex-1">
              <Controller
                control={control}
                name="searchTerm"
                defaultValue={searchTerm}
                render={({ field }) => (
                  <div className="relative">
                    <input
                      className="w-full bg-background border border-border rounded-md px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-muted-foreground"
                      placeholder={placeholder}
                      value={searchTerm}
                      onChange={(e) => {
                        field.onChange(e)
                        dispatch(setSearchTerm(e.target.value))
                      }}
                    />
                    <BiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="flex items-center rounded-md w-[100px] bg-slate-800 p-1.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
                clipRule="evenodd"
              />
            </svg>
            <span className="pl-2">Search</span>
          </button>

          {/* Import Button */}
          {showImport && (
            <button
              type="button"
              onClick={onImport}
              className="flex items-center justify-center rounded-md bg-green-600 p-1.5 px-4 text-sm text-white transition-all shadow-sm hover:shadow-lg hover:bg-green-700 focus:bg-green-700 focus:shadow-none active:bg-green-700 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            >
              <FontAwesomeIcon icon={faUpload} className="mr-2" />
              <span>Import</span>
            </button>
          )}

          {/* Delete Button with Dropdown */}
          {showDelete && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDeleteMenu(!showDeleteMenu)}
                className="flex items-center justify-center rounded-md bg-red-600 p-1.5 px-4 text-sm text-white transition-all shadow-sm hover:shadow-lg hover:bg-red-700 focus:bg-red-700 focus:shadow-none active:bg-red-700 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
              >
                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                <span>Delete</span>
                <FontAwesomeIcon icon={faChevronDownIcon} className="ml-2 text-xs" />
              </button>
              
              {showDeleteMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1" role="menu">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteMenu(false)
                        if (onDeleteAllHouseholds) onDeleteAllHouseholds()
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Delete All Households
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteMenu(false)
                        if (onDeleteTransactions) onDeleteTransactions()
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Delete Transactions
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Click outside to close delete menu */}
        {showDeleteMenu && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDeleteMenu(false)}
          ></div>
        )}
      </form>
    </div>
  )
}

GlobalFilter.propTypes = {
  user: PropTypes.object,
  fieldEnabled: PropTypes.object,
  onChange: PropTypes.func,
  onSearch: PropTypes.func,
  placeholder: PropTypes.string,
  showImport: PropTypes.bool,
  showDelete: PropTypes.bool,
  onImport: PropTypes.func,
  onDeleteAllHouseholds: PropTypes.func,
  onDeleteTransactions: PropTypes.func,
}

export default GlobalFilter
