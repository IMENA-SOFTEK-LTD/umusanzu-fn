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
import { useEffect } from 'react'
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

const HouseHoldFilter = ({ user, fieldEnabled, onChange }) => {
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
      break
    case 4:
      department = 'cell'
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

    dispatch(setSelectedStatus(+queryRoute?.status || ''))
    dispatch(setSelectedVillage(+queryRoute?.village || ''))
    dispatch(setSelectedProvince(+queryRoute?.province || ''))
    dispatch(setSelectedDistrict(+queryRoute?.district || ''))
    dispatch(setSelectedSector(+queryRoute?.sector || ''))
    dispatch(setSelectedCell(+queryRoute?.cell || ''))
  }, [])
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

  const onSubmit = (data) => {
    dispatch(setSectorId(data?.sector))
    dispatch(setDistrictId(data?.district))
    dispatch(setProvinceId(data?.province))
    dispatch(setCellId(data?.cell))
    dispatch(setVillageId(data?.village))

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
    onChange({
      sector: data?.sector || '',
      district: data?.district || '',
      province: data?.province || '',
      cell: data?.cell || '',
      village: data?.village || '',
      status: data?.status || '',
      searchTerm: data?.searchTerm || '',
    })
    // navigate(pathRoute)
  }
 
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center w-100 h-fit py-8 mx-auto"
    >
      <article className="flex w-full items-center gap-2">
        {fieldEnabled?.status && (
          <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
            Status
            <Controller
              control={control}
              name="status"
              defaultValue={selectedStatus || 'ACTIVE'}
              render={({ field }) => {
                return (
                  <select
                    className="p-2 outline-none border-[1px] rounded-md w-[90%] border-primary focus:border-[1.5px] ease-in-out duration-150"
                    {...field}
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
                )
              }}
            />
          </label>
        )}

        {fieldEnabled?.province && (
          <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
            Province
            <Controller
              control={control}
              name="province"
              defaultValue={selectedProvince}
              render={({ field }) => {
                return (
                  <select
                    className="p-2 outline-none border-[1px] rounded-md w-[90%] border-primary focus:border-[1.5px] ease-in-out duration-150"
                    {...field}
                    value={selectedProvince} // Set the value dynamically
                    onChange={(e) => {
                      field.onChange(e)
                      dispatch(setSelectedProvince(e.target.value))
                    }}
                  >
                    <option value={''}>Select Province</option>
                    <option value={31}>Kigali City</option>
                    <option value={1540}>Western Province</option>
                    <option value={1678}>Northern Province</option>
                    <option value={1836}>Eastern Province</option>
                    <option value={1986}>Southern Province</option>
                  </select>
                )
              }}
            />
          </label>
        )}
        {fieldEnabled?.district && (
          <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
            District {countryDistrictsLoading ? 'loading..' : ''}
            <Controller
              control={control}
              name="district"
              defaultValue={selectedDistrict}
              render={({ field }) => {
                return (
                  <select
                    className="p-2 outline-none border-[1px] rounded-md w-[90%] border-primary focus:border-[1.5px] ease-in-out duration-150"
                    {...field}
                    value={selectedDistrict}
                    onChange={(e) => {
                      field.onChange(e)
                      dispatch(setSelectedDistrict(e.target.value))
                    }}
                  >
                    <option value={''}>Select district</option>
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
                )
              }}
            />
          </label>
        )}
        {fieldEnabled?.sector && (
          <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
            Sector {districtSectorsLoading ? 'loading..' : ''}
            <Controller
              control={control}
              name="sector"
              defaultValue={selectedSector}
              render={({ field }) => {
                return (
                  <select
                    className="p-2 outline-none border-[1px] rounded-md w-[90%] border-primary focus:border-[1.5px] ease-in-out duration-150"
                    {...field}
                    value={selectedSector}
                    onChange={(e) => {
                      field.onChange(e)
                      dispatch(setSelectedSector(e.target.value))
                    }}
                  >
                    <option value={''}>Select sector</option>
                    {sectors?.map((sector) => {
                      return (
                        <option key={sector.id} value={sector.id}>
                          {sector.name}
                        </option>
                      )
                    })}
                  </select>
                )
              }}
            />
          </label>
        )}
        {fieldEnabled?.cell && (
          <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
            Cell {sectorCellsLoading ? 'loading..' : ''}
            <Controller
              control={control}
              name="cell"
              defaultValue={selectedCell}
              value={selectedCell}
              render={({ field }) => {
                return (
                  <select
                    className="p-2 outline-none border-[1px] rounded-md w-[90%] border-primary focus:border-[1.5px] ease-in-out duration-150"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      dispatch(setSelectedCell(e.target.value))
                    }}
                  >
                    <option value={''}>Select cell</option>
                    {cells?.map((cell) => {
                      return (
                        <option key={cell.id} value={cell.id}>
                          {cell.name}
                        </option>
                      )
                    })}
                  </select>
                )
              }}
            />
          </label>
        )}
        {fieldEnabled?.village && (
          <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
            Village {cellVillagesDataLoading ? 'loading..' : ''}
            <Controller
              control={control}
              name="village"
              defaultValue={selectedVillage}
              value={selectedVillage}
              render={({ field }) => {
                return (
                  <select
                    className="p-2 outline-none border-[1px] rounded-md w-[90%] border-primary focus:border-[1.5px] ease-in-out duration-150"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      dispatch(setSelectedVillage(e.target.value))
                    }}
                  >
                    <option value={''}>Select village</option>
                    {villages?.map((village) => {
                      return (
                        <option key={village.id} value={village.id}>
                          {village.name}
                        </option>
                      )
                    })}
                  </select>
                )
              }}
            />
          </label>
        )}
        {fieldEnabled?.searchTerm && (
          <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
            <Controller
              control={control}
              name="searchTerm"
              defaultValue={searchTerm}
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    type="text"
                    className=" mt-5 outline-[2px] w-full max-w-[20rem] border-[1px] border-primary rounded-md outline-primary focus:outline-primary"
                    value={searchTerm || ''}
                    onChange={(e) => {
                      field.onChange(e)
                      dispatch(setSearchTerm(e.target.value))
                    }}
                    placeholder={`Search`}
                  />
                )
              }}
            />
          </label>
        )}
        <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
          <Controller
            name="submit"
            control={control}
            disabled={isLoading}
            render={({ field }) => {
              return (
                <Button
                  className="mt-6"
                  submit
                  {...field}
                  value={isLoading ? `Waiting...` : `Search`}
                />
              )
            }}
          />
        </label>
      </article>
    </form>
  )
}

HouseHoldFilter.propTypes = {
  user: PropTypes.object.isRequired,
  fieldEnabled: PropTypes.object.isRequired,
}

export default HouseHoldFilter
