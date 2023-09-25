import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import Input from '../../components/Input'
import Button from '../../components/Button'
import {
  useCreateHouseHoldMutation,
  useLazyGetCellVillagesQuery,
  useLazyGetCountryDistrictsQuery,
  useLazyGetDistrictSectorsQuery,
  useLazyGetSectorCellsQuery,
} from '../../states/api/apiSlice'
import { useEffect } from 'react'
import {
  setCells,
  setDistricts,
  setExistingHousehold,
  setHouseholdConflict,
  setMoveHouseholdModal,
  setSectors,
  setSelectedCell,
  setSelectedDistrict,
  setSelectedSector,
  setSelectedVillage,
  setVillages,
} from '../../states/features/modals/householdSlice'
import Loading from '../../components/Loading'
import { useNavigate } from 'react-router-dom'
import MoveHousehold from '../../containers/households/MoveHousehold'
import { setCellId, setDistrictId, setProvinceId, setSectorId, setVillageId } from '../../states/features/departments/departmentSlice'

const CreateHousehold = ({ user }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm()

  const dispatch = useDispatch()

  const navigate = useNavigate()

  const {
    districts,
    sectors,
    selectedDistrict,
    selectedSector,
    cells,
    selectedCell,
    villages,
    selectedVillage,
    householdConflict,
    existingHousehold,
    moveHouseholdModal,
  } = useSelector((state) => state.household)

  const { villageId, cellId, sectorId, districtId, provinceId } = useSelector((state) => state.departments)

  let department = ''

  switch (user?.departments?.level_id) {
    case 1:
      department = 'province'
      dispatch(setSectorId(null))
      dispatch(setProvinceId(user?.departments?.id))
      break
    case 2:
      department = 'district'
      dispatch(setSectorId(null))
      dispatch(setDistrictId(user?.departments?.id))
      dispatch(setProvinceId(user?.departments?.parent?.id))
      break
    case 3:
      department = 'sector'
      dispatch(setSectorId(user?.departments?.id))
      dispatch(setDistrictId(user?.departments?.parent?.id))
      dispatch(setProvinceId(user?.departments?.parent?.parent?.id))
      break
    case 4:
      department = 'cell'
      dispatch(setCellId(user?.departments?.id))
      dispatch(setSectorId(user?.departments?.parent?.id))
      dispatch(setDistrictId(user?.departments?.parent?.parent?.id))
      dispatch(setProvinceId(user?.departments?.parent?.parent?.parent?.id))
      break
    case 5:
      department = 'country'
      dispatch(setCellId(user?.departments?.id))
      dispatch(setSectorId(user?.departments?.parent?.id))
      dispatch(setDistrictId(user?.departments?.parent?.parent?.id))
      dispatch(setProvinceId(user?.departments?.parent?.parent?.parent?.id))
      break
    case 6:
      department = 'agent'
      dispatch(setVillageId(user?.departments?.id))
      dispatch(setCellId(user?.departments?.parent?.id))
      dispatch(setSectorId(user?.departments?.parent?.parent?.id))
      dispatch(setDistrictId(user?.departments?.parent?.parent?.parent?.id))
      dispatch(setProvinceId(user?.departments?.parent?.parent?.parent?.parent?.id))
      break
    default:
      department = 'agent'
      dispatch(setVillageId(user?.departments?.id))
      dispatch(setCellId(user?.departments?.parent?.id))
      dispatch(setSectorId(user?.departments?.parent?.parent?.id))
      dispatch(setDistrictId(user?.departments?.parent?.parent?.parent?.id))
      dispatch(setProvinceId(user?.departments?.parent?.parent?.parent?.parent?.id))
  }

  /**
   *
   * FETCHING DEPARTMENTS CHILDREN
   */

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
    getCountryDistricts({ id: 1 })
  }, [])

  useEffect(() => {
    if (countryDistrictsData) {
      dispatch(setDistricts(countryDistrictsData?.data?.rows))
      if (districtId) {
        dispatch(setSelectedDistrict(countryDistrictsData?.data?.rows?.filter((district) => district.id === districtId)))
      }
      else {
        dispatch(setSelectedDistrict(countryDistrictsData?.data?.rows[0]?.id))
      }
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
    if (districtId) {
      getDistrictSectors({ id: districtId })
    }
    else {
      getDistrictSectors({ id: selectedDistrict })
    }
  }, [selectedDistrict, districtId])

  useEffect(() => {
    if (districtSectorsData) {
      dispatch(setSectors(districtSectorsData?.data?.rows))
      if (sectorId) {
        dispatch(setSelectedSector(districtSectorsData?.data?.rows?.filter((sector) => sector.id === sectorId)))
      }
      else {
        dispatch(setSelectedSector(districtSectorsData?.data?.rows[0]?.id))
      }
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
    if (sectorId) {
      getSectorCells({ id: sectorId })
    }
    else {
      getSectorCells({ id: selectedSector })
    }
  }, [selectedSector, sectorId])

  useEffect(() => {
    if (sectorCellsData) {
      dispatch(setCells(sectorCellsData?.data?.rows))
      if (cellId) {
        dispatch(setSelectedCell(sectorCellsData?.data?.rows?.filter((cell) => cell.id === cellId)))
      }
      else {
        dispatch(setSelectedCell(sectorCellsData?.data?.rows[0]?.id))
      }
    }
  }, [sectorCellsData, sectorCellsSuccess])

  // GET VILLAGES
  const [
    getCellVillages,
    {
      data: cellVillagesData,
      isLoading: cellVillagesLoading,
      isSuccess: cellVillagesSuccess,
    },
  ] = useLazyGetCellVillagesQuery()

  useEffect(() => {
    if (cellId) {
      getCellVillages({ id: cellId })
    }
    else {
      getCellVillages({ id: selectedCell })
    }
  }, [selectedCell, cellId])

  useEffect(() => {
    if (cellVillagesData) {
      if (villageId) {
        dispatch(setVillages(cellVillagesData?.data?.rows?.filter((village) => village.id === villageId)))
      }
      else {
        dispatch(setVillages(cellVillagesData?.data?.rows))
      }
    }
  }, [cellVillagesData, cellVillagesSuccess])

  /**
   *
   * CREATE HOUSEHOLD
   */

  const [
    createHousehold,
    {
      data: createHouseholdData,
      isLoading: createHouseholdLoading,
      isSuccess: createHouseholdSuccess,
      isError: createHouseholdError,
      error: createHouseholdErrorData,
    },
  ] = useCreateHouseHoldMutation()

  const onSubmit = (data) => {
    createHousehold({
      name: data.name,
      nid: data.nid,
      province: data.province,
      district: data.district,
      sector: data.sector,
      cell: data.cell,
      phone1: data.phone1,
      phone2: data.phone2,
      ubudehe: data.ubudehe,
      type: data.type,
      village: data.village,
    })
  }

  useEffect(() => {
    if (createHouseholdSuccess) {
      if (createHouseholdData?.conflict === true) {
        dispatch(setExistingHousehold(createHouseholdData?.data?.rows[0]))
        dispatch(setHouseholdConflict(true))
      } else {
        dispatch(setHouseholdConflict(false))
        setTimeout(() => {
          navigate('/households')
        }, 1500)
      }
    }
  }, [createHouseholdSuccess, createHouseholdData])

  return (
    <main className="flex flex-col gap-6 my-4 w-[90%] mx-auto relative">
      <MoveHousehold
        householdData={existingHousehold}
        isOpen={moveHouseholdModal}
      />
      <h1 className="text-[25px] font-bold text-primary text-center uppercase">
        Add new household
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-8 items-center w-[70%] mx-auto"
      >
        <section className="flex items-center gap-4 w-full flex-wrap">
          <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col gap-2">
            <p>
              Full Name <span className="text-red-500">*</span>
            </p>
            <Controller
              control={control}
              rules={{ required: "Please add the head's full names" }}
              name="name"
              render={({ field }) => {
                return <Input {...field} placeholder="Full Name" />
              }}
            />
            {errors.name && (
              <span className="text-red-500 text-[12px]">
                {errors.name.message}
              </span>
            )}
          </label>
          <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col gap-2">
            National ID
            <Controller
              control={control}
              name="nid"
              render={({ field }) => {
                return <Input {...field} placeholder="1 1989 8 0133256 7 89" />
              }}
            />
          </label>
          <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col gap-2">
            <p>
              Primary Phone <span className="text-red-500">*</span>
            </p>
            <Controller
              control={control}
              name="phone1"
              rules={{ required: 'Please add the primary phone number' }}
              render={({ field }) => {
                return <Input {...field} placeholder="0788 000 000" />
              }}
            />
            {errors.phone1 && (
              <span className="text-red-500 text-[12px]">
                {errors.phone1.message}
              </span>
            )}
          </label>
          <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col gap-2">
            Secondary phone
            <Controller
              control={control}
              name="phone2"
              render={({ field }) => {
                return <Input {...field} placeholder="0788 111 111" />
              }}
            />
          </label>
          <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col gap-2">
            <p>
              Amount <span className="text-red-500">*</span>
            </p>
            <Controller
              control={control}
              name="ubudehe"
              rules={{ required: 'Please add the ubudehe amount' }}
              render={({ field }) => {
                return <Input {...field} placeholder="5000" />
              }}
            />
            {errors.amount && (
              <span className="text-red-500 text-[12px]">
                {errors.amount.message}
              </span>
            )}
          </label>
          <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
            Household type
            <Controller
              control={control}
              name="type"
              defaultValue={1}
              render={({ field }) => {
                return (
                  <select
                    {...field}
                    className="p-2 outline-none border-[1px] rounded-md w-[90%] border-primary focus:border-[1.5px] ease-in-out duration-150"
                  >
                    <option disabled value="">
                      Select household type
                    </option>
                    <option value={1}>Residence</option>
                    <option value={2}>Business</option>
                  </select>
                )
              }}
            />
          </label>
        </section>
        <section className="flex items-center gap-4 w-full flex-wrap">
          <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
            <p>
              Province <span className="text-red-500">*</span>
            </p>
            <Controller
              control={control}
              name="province"
              defaultValue={31}
              render={({ field }) => {
                return (
                  <select
                    {...field}
                    className="p-2 outline-none border-[1px] rounded-md border-primary w-[90%] focus:border-[1.5px] ease-in-out duration-150"
                  >
                    <option disabled value="">
                      Select province
                    </option>
                    <option value={31}>Kigali</option>
                  </select>
                )
              }}
            />
            {errors.province && (
              <span className="text-red-500 text-[12px]">
                {errors.province.message}
              </span>
            )}
          </label>
          <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
            <p>
              District <span className="text-red-500">*</span>
            </p>
            <Controller
              control={control}
              name="district"
              defaultValue={districtId || selectedDistrict}
              render={({ field }) => {
                return (
                  <select
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      dispatch(setSelectedDistrict(e.target.value))
                    }}
                    className="p-2 outline-none border-[1px] rounded-md border-primary w-[90%] focus:border-[1.5px] ease-in-out duration-150"
                  >
                    <option disabled value="">
                      Select a district
                    </option>
                    {districts?.map((district) => {
                        if (districtId) {
                          return (
                            <option disabled={district.id !== districtId} key={district.id} value={district.id}>
                              {district.name}
                            </option>
                          )
                        }
                        return (
                          <option key={district.id} value={district.id}>
                            {district.name}
                          </option>
                        )
                    })}
                  </select>
                )
              }}
            />
            {errors.district && (
              <span className="text-red-500 text-[12px]">
                {errors.district.message}
              </span>
            )}
          </label>
          <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
            <p>
              Sector <span className="text-red-500">*</span>
            </p>
            <Controller
              control={control}
              name="sector"
              defaultValue={sectorId || selectedSector}
              render={({ field }) => {
                return (
                  <select
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      dispatch(setSelectedSector(e.target.value))
                    }}
                    className="p-2 outline-none border-[1px] rounded-md border-primary w-[90%] focus:border-[1.5px] ease-in-out duration-150"
                  >
                    <option disabled value="">
                      Select a sector
                    </option>
                    {sectors?.map((sector) => {
                      if (sectorId) {
                        return (
                          <option disabled = {sector.id !== sectorId} key={sector.id} value={sector.id}>
                            {sector.name || 'Sector'}
                          </option>
                        )
                      }
                      return (
                        <option key={sector.id} value={sector.id}>
                          {sector.name || 'Sector'}
                        </option>
                      )
                    })}
                  </select>
                )
              }}
            />
            {errors.sector && (
              <span className="text-red-500 text-[12px]">
                {errors.sector.message}
              </span>
            )}
          </label>
          <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
            <p>
              Cell <span className="text-red-500">*</span>
            </p>
            <Controller
              control={control}
              name="cell"
              defaultValue={cellId || selectedCell}
              defa
              render={({ field }) => {
                return (
                  <select
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      dispatch(setSelectedCell(e.target.value))
                    }}
                    className="p-2 outline-none border-[1px] rounded-md border-primary w-[90%] focus:border-[1.5px] ease-in-out duration-150"
                  >
                    <option disabled value="">
                      Select a cell
                    </option>
                    {cells?.map((cell) => {
                      if (cellId) {
                        return (
                          <option disabled={cell.id !== cellId} key={cell.id} value={cell.id}>
                            {cell.name}
                          </option>
                        )
                      }
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
            {errors.cell && (
              <span className="text-red-500 text-[12px]">
                {errors.cell.message}
              </span>
            )}
          </label>
          <label className="text-[15px] w-full flex-1 basis-[40%] max-w-[48%] flex flex-col items-start gap-2">
            <p>
              Village <span className="text-red-500">*</span>
            </p>
            <Controller
              control={control}
              name="village"
              defaultValue={villageId || selectedVillage}
              render={({ field }) => {
                return (
                  <select
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      dispatch(setSelectedVillage(e.target.value))
                    }}
                    className="p-2 outline-none border-[1px] rounded-md border-primary w-[90%] focus:border-[1.5px] ease-in-out duration-150"
                  >
                    <option disabled value="">
                      Select a village
                    </option>
                    {villages?.map((village) => {
                      if (villageId) {
                        return (
                          <option disabled={village.id !== villageId} key={village.id} value={village.id}>
                            {village.name}
                          </option>
                        )
                      }
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
            {errors.village && (
              <span className="text-red-500 text-[12px]">
                {errors.village.message}
              </span>
            )}
          </label>
        </section>
        <section className={`${createHouseholdSuccess ? 'flex' : 'hidden'}`}>
          <p className={`${householdConflict ? 'text-red-500' : 'hidden'}`}>
            The current household already exists
          </p>
          <p className={`${!householdConflict ? 'text-green-500' : 'hidden'}`}>
            Household created successfully
          </p>
        </section>
        <Controller
          name="submit"
          control={control}
          render={({ field }) => {
            return (
              <Button
                submit
                {...field}
                value={
                  createHouseholdLoading ? <Loading /> : 'Create Household'
                }
                className={`${!householdConflict ? 'flex' : 'hidden'} w-fit max-w-[50%] px-6 mx-auto`}
              />
            )
          }}
        />
        <Button value='Move household' className={`${householdConflict ? 'flex' : 'hidden'}`} onClick={(e) => {
          e.preventDefault()
          dispatch(setMoveHouseholdModal(true))
        }} />
      </form>
    </main>
  )
}

export default CreateHousehold
