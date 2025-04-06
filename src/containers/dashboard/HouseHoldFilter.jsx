import PropTypes from 'prop-types'
import { Controller, useForm } from 'react-hook-form'
import Button from '../../components/Button'
import {
  useLazyGetCellVillagesQuery,
  useLazyGetCountryDistrictsQuery,
  useLazyGetDistrictSectorsQuery,
  useLazyGetSectorCellsQuery,
} from '../../states/api/apiSlice'
import {
  setCells,
  setDistricts,
  setSelectedLevel,
  setSearchTerm,
  setSectors,
  setSelectedCell,
  setSelectedDistrict,
  setSelectedProvince,
  setSelectedSector,
  setSelectedStatus,
  setSelectedVillage,
  setVillages,
} from '../../states/features/modals/householdSlice'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  setSectorId,
  setDistrictId,
  setProvinceId,
  setCellId,
  setVillageId,
} from '../../states/features/departments/departmentSlice'
import { setUserOrSelectedDepartmentNames } from '../../states/features/departments/departmentSlice'
import queryString from 'query-string'
import Input from '../../components/Input'

const levels = [
  { id: 1, name: 'Country' },
  { id: 2, name: 'Province' },
  { id: 3, name: 'District' },
  { id: 4, name: 'Sector' },
  { id: 5, name: 'Cell' },
  { id: 6, name: 'Village' },
]

const provinces = [
  { id: 31, name: 'Kigali City' },
  { id: 1540, name: 'Western Province' },
  { id: 1678, name: 'Northern Province' },
  { id: 1836, name: 'Eastern Province' },
  { id: 1986, name: 'Southern Province' },
]

const HouseHoldFilter = ({
  user,
  fieldEnabled,
  onChange,
  onSearch,
  exportButton,
  placeholder,
}) => {
  const { handleSubmit, control } = useForm()

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
    selectedStatus,
    searchTerm,
    isLoading,
    selectedLevel,
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

    dispatch(setSelectedStatus(+queryRoute?.status || 'ACTIVE'))
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
    onChange({
      sector: selectedSector || '',
      district: selectedDistrict || '',
      province: selectedProvince || '',
      cell: selectedCell || '',
      village: selectedVillage || '',
      status: selectedStatus || '',
      searchTerm: searchTerm || '',
      level: selectedLevel || '',
    })
  }, [
    selectedSector,
    selectedDistrict,
    selectedProvince,
    selectedCell,
    selectedVillage,
    selectedStatus,
    searchTerm,
    selectedLevel,
  ])

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
    dispatch(setUserOrSelectedDepartmentNames({ ['province']: 'KIGALI CITY' }))
    for (let i = 0; i < districts.length; i++) {
      if (String(districts[i].id) === String(data?.district)) {
        dispatch(
          setUserOrSelectedDepartmentNames({ ['district']: districts[i].name })
        )
      }
    }
    for (let i = 0; i < sectors.length; i++) {
      if (String(sectors[i].id) === String(data?.sector)) {
        dispatch(
          setUserOrSelectedDepartmentNames({ ['sector']: sectors[i].name })
        )
      }
    }
    for (let i = 0; i < cells.length; i++) {
      if (String(cells[i].id) === String(data?.cell)) {
        dispatch(setUserOrSelectedDepartmentNames({ ['cell']: cells[i].name }))
      }
    }
    for (let i = 0; i < villages.length; i++) {
      if (String(villages[i].id) === String(data?.village)) {
        dispatch(
          setUserOrSelectedDepartmentNames({ ['village']: villages[i].name })
        )
      }
    }
    onSearch({
      sector: data?.sector || selectedSector || '',
      district: data?.district || selectedDistrict || '',
      province: data?.province || selectedProvince || '',
      cell: data?.cell || selectedCell || '',
      village: data?.village || selectedVillage || '',
      status: data?.status || selectedStatus || '',
      searchTerm: data?.searchTerm || '',
      level: data?.level || '',
    })
    // navigate(pathRoute)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-100 h-fit py-0 mx-auto"
    >
      <article className="grid grid-cols-5 gap-4 relative inline-block">
        {fieldEnabled?.level && (
          // <label className="text-[15px]  col-auto items-start gap-2">
          //   Level
          <Controller
            control={control}
            name="level"
            defaultValue={selectedLevel}
            render={({ field }) => {
              return (
                <>
                  <div className="relative">
                    <select
                      className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer"
                      {...field}
                      value={selectedLevel}
                      onChange={(e) => {
                        field.onChange(e)
                        dispatch(setSelectedLevel(e.target.value))
                      }}
                    >
                      <option value={''}>Select Level</option>
                      {levels?.map((level) => {
                        return (
                          <option key={level.id} value={level.id}>
                            {level.name}
                          </option>
                        )
                      })}
                    </select>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.2"
                      stroke="currentColor"
                      className="h-5 w-5 ml-1 absolute top-2.5 right-2.5 text-slate-700"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                      />
                    </svg>
                  </div>
                </>
              )
            }}
          />
          // </label>
        )}
        {fieldEnabled?.status && (
          <Controller
            control={control}
            name="status"
            defaultValue={selectedStatus}
            render={({ field }) => {
              return (
                <>
                  <div className="relative">
                    <select
                      className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer"
                      {...field}
                      value={selectedStatus}
                      onChange={(e) => {
                        field.onChange(e)
                        dispatch(selectedStatus(e.target.value))
                      }}
                    >
                      <option value={''}>Select Status</option>
                      <option value={'ACTIVE'}>Active</option>
                      <option value={'INACTIVE'}>Inactive</option>
                      <option value={'MOVED'}>Moved</option>
                      <option value={'REQUESTED'}>Requested</option>
                    </select>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.2"
                      stroke="currentColor"
                      className="h-5 w-5 ml-1 absolute top-2.5 right-2.5 text-slate-700"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                      />
                    </svg>
                  </div>
                </>
              )
            }}
          />
        )}

        {fieldEnabled?.province && (
          <Controller
            control={control}
            name="province"
            defaultValue={selectedProvince}
            render={({ field }) => {
              return (
                <>
                  <div className="relative">
                    <select
                      className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer"
                      {...field}
                      value={selectedProvince} // Set the value dynamically
                      onChange={(e) => {
                        field.onChange(e)
                        dispatch(setSelectedProvince(e.target.value))
                      }}
                    >
                      <option value={''}>Select Province</option>
                      {provinces?.map((p) => {
                        return (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        )
                      })}
                    </select>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.2"
                      stroke="currentColor"
                      className="h-5 w-5 ml-1 absolute top-2.5 right-2.5 text-slate-700"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                      />
                    </svg>
                  </div>
                </>
              )
            }}
          />
        )}
        {fieldEnabled?.district && (
          // <label className="text-[15px]  col-3 items-start gap-2">
          //   District {countryDistrictsLoading ? 'loading..' : ''}
          <Controller
            control={control}
            name="district"
            defaultValue={selectedDistrict}
            render={({ field }) => {
              return (
                <>
                  <div className="relative">
                    <select
                      className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer"
                      {...field}
                      value={selectedDistrict}
                      onChange={(e) => {
                        field.onChange(e)
                        dispatch(setSelectedDistrict(e.target.value))
                      }}
                    >
                      <option value={''}>
                        {' '}
                        {countryDistrictsLoading
                          ? 'loading..'
                          : 'Select district'}{' '}
                      </option>
                      {districts?.map((district) => {
                        if (!selectedProvince) {
                          return (
                            <option
                              disabled={
                                department !== 'country' &&
                                district.id !== selectedDistrict
                              }
                              key={district.id}
                              value={district.id}
                            >
                              {countryDistrictsLoading ? '...' : district.name}
                            </option>
                          )
                        }
                        return (
                          <option key={district.id} value={district.id}>
                            {countryDistrictsLoading ? '...' : district.name}
                          </option>
                        )
                      })}
                    </select>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.2"
                      stroke="currentColor"
                      className="h-5 w-5 ml-1 absolute top-2.5 right-2.5 text-slate-700"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                      />
                    </svg>
                  </div>
                </>
              )
            }}
          />
          // </label>
        )}
        {fieldEnabled?.sector && (
          // <label className="text-[15px]  col-3 items-start gap-2">
          //   Sector {districtSectorsLoading ? 'loading..' : ''}
          <Controller
            control={control}
            name="sector"
            defaultValue={selectedSector}
            render={({ field }) => {
              return (
                <>
                  <div className="relative">
                    <select
                      className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer"
                      {...field}
                      value={selectedSector}
                      onChange={(e) => {
                        field.onChange(e)
                        dispatch(setSelectedSector(e.target.value))
                      }}
                    >
                      <option value={''}>
                        {districtSectorsLoading ? 'loading..' : 'Select sector'}
                      </option>
                      {sectors?.map((sector) => {
                        return (
                          <option key={sector.id} value={sector.id}>
                            {sector.name}
                          </option>
                        )
                      })}
                    </select>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.2"
                      stroke="currentColor"
                      className="h-5 w-5 ml-1 absolute top-2.5 right-2.5 text-slate-700"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                      />
                    </svg>
                  </div>
                </>
              )
            }}
          />
          // </label>
        )}
        {fieldEnabled?.cell && (
          <Controller
            control={control}
            name="cell"
            defaultValue={selectedCell}
            value={selectedCell}
            render={({ field }) => {
              return (
                <>
                  <div className="relative">
                    <select
                      className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer"
                      {...field}
                      value={selectedCell}
                      onChange={(e) => {
                        field.onChange(e)
                        dispatch(setSelectedCell(e.target.value))
                      }}
                    >
                      <option value={''}>
                        {sectorCellsLoading ? 'loading..' : 'Select cell'}
                      </option>
                      {cells?.map((cell) => {
                        return (
                          <option key={cell.id} value={cell.id}>
                            {cell.name}
                          </option>
                        )
                      })}
                    </select>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.2"
                      stroke="currentColor"
                      className="h-5 w-5 ml-1 absolute top-2.5 right-2.5 text-slate-700"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                      />
                    </svg>
                  </div>
                </>
              )
            }}
          />
        )}
        {fieldEnabled?.village && (
          <Controller
            control={control}
            name="village"
            defaultValue={selectedVillage}
            value={selectedVillage}
            render={({ field }) => {
              return (
                <>
                  <div className="relative">
                    <select
                      className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        dispatch(setSelectedVillage(e.target.value))
                      }}
                    >
                      <option value={''}>
                        {' '}
                        {cellVillagesDataLoading
                          ? 'loading..'
                          : 'Select village'}
                      </option>
                      {villages?.map((village) => {
                        return (
                          <option key={village.id} value={village.id}>
                            {village.name}
                          </option>
                        )
                      })}
                    </select>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.2"
                      stroke="currentColor"
                      className="h-5 w-5 ml-1 absolute top-2.5 right-2.5 text-slate-700"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                      />
                    </svg>
                  </div>
                </>
              )
            }}
          />
          //  </label>
        )}
        <div className="relative flex items-center">
          {fieldEnabled?.searchTerm && (
            <Controller
              control={control}
              name="searchTerm"
              defaultValue={searchTerm}
              value={searchTerm}
              render={({ field }) => {
                return (
                  <>
                    <input
                      className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pr-3 pl-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                      placeholder={placeholder}
                      onChange={(e) => {
                        field.onChange(e)
                        dispatch(setSearchTerm(e.target.value))
                      }}
                    />
                  </>
                )
              }}
            />
          )}

          <button
            className="rounded-md ml-2 bg-slate-800 p-2.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            type="submit"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fill-rule="evenodd"
                d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
         
        </div>

        {/* {exportButton && <>{exportButton}</>} */}
      </article>
    </form>
  )
}

HouseHoldFilter.propTypes = {
  user: PropTypes.object.isRequired,
  fieldEnabled: PropTypes.object.isRequired,
  exportButton: PropTypes.any.isRequired,
}

export default HouseHoldFilter
