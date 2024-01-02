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
import { useEffect, useState } from 'react'
import {
  setCells,
  setDistricts,
  setExistingHousehold,
  setHouseholdConflict,
  setSectors,
  setSelectedCell,
  setSelectedDistrict,
  setSelectedSector,
  setSelectedVillage,
  setVillages,
} from '../../states/features/modals/householdSlice'
import Loading from '../../components/Loading'
import { useNavigate } from 'react-router-dom'
import {
  setCellId,
  setDistrictId,
  setProvinceId,
  setSectorId,
  setVillageId,
} from '../../states/features/departments/departmentSlice'
import ExistingHouseholds from '../../containers/households/ExistingHouseholds'
import Select from '../../components/Select'

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
  } = useSelector((state) => state.household)

  const [existingHouseholdData, setExistingHouseholdData] = useState([])

  const { villageId, cellId, sectorId, districtId, provinceId } = useSelector(
    (state) => state.departments
  )

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
      dispatch(
        setProvinceId(user?.departments?.parent?.parent?.parent?.parent?.id)
      )
      break
    default:
      department = 'agent'
      dispatch(setVillageId(user?.departments?.id))
      dispatch(setCellId(user?.departments?.parent?.id))
      dispatch(setSectorId(user?.departments?.parent?.parent?.id))
      dispatch(setDistrictId(user?.departments?.parent?.parent?.parent?.id))
      dispatch(
        setProvinceId(user?.departments?.parent?.parent?.parent?.parent?.id)
      )
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
    getCountryDistricts({ id: 0 })
  }, [])

  useEffect(() => {
    if (countryDistrictsData) {
      dispatch(setDistricts(countryDistrictsData?.data?.rows))
      if (districtId) {
        dispatch(
          setSelectedDistrict(
            countryDistrictsData?.data?.rows?.filter(
              (district) => district.id === districtId
            )
          )
        )
      } else {
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
    } else {
      getDistrictSectors({ id: selectedDistrict })
    }
  }, [selectedDistrict, districtId])

  useEffect(() => {
    if (districtSectorsData) {
      dispatch(setSectors(districtSectorsData?.data?.rows))
      if (sectorId) {
        dispatch(
          setSelectedSector(
            districtSectorsData?.data?.rows?.filter(
              (sector) => sector.id === sectorId
            )
          )
        )
      } else {
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
    } else {
      getSectorCells({ id: selectedSector })
    }
  }, [selectedSector, sectorId])

  useEffect(() => {
    if (sectorCellsData) {
      dispatch(setCells(sectorCellsData?.data?.rows))
      if (cellId) {
        dispatch(
          setSelectedCell(
            sectorCellsData?.data?.rows?.filter((cell) => cell.id === cellId)
          )
        )
      } else {
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
    } else {
      getCellVillages({ id: selectedCell })
    }
  }, [selectedCell, cellId])

  useEffect(() => {
    if (cellVillagesData) {
      if (villageId) {
        dispatch(
          setVillages(
            cellVillagesData?.data?.rows?.filter(
              (village) => village.id === villageId
            )
          )
        )
      } else {
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
      province: Number(data.province),
      district: Number(data.district),
      sector: Number(data.sector),
      cell: Number(data.cell),
      phone1: data.phone1,
      phone2: data.phone2,
      ubudehe: data.ubudehe,
      type: data.type,
      village: Number(data.village),
    })
  }

  useEffect(() => {
    if (createHouseholdSuccess) {
      if (createHouseholdData?.conflict === true) {
        dispatch(setExistingHousehold(createHouseholdData?.data?.rows[0]))
        setExistingHouseholdData(createHouseholdData?.data?.rows)
        dispatch(setHouseholdConflict(true))
      } else {
        dispatch(setHouseholdConflict(false))
        setTimeout(() => {
          navigate(`/households/${createHouseholdData?.data?.id}`)
        }, 1000)
      }
    }
  }, [createHouseholdSuccess, createHouseholdData])

  return (
    <main className="flex flex-col gap-6 my-4 w-[90%] relative mx-auto">
      <h1 className="text-[25px] font-bold text-primary text-center uppercase">
        Add new household
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-8 items-center w-[75%] mx-auto"
      >
        {/* PERSONAL INFO */}
        <section className="flex flex-col items-center gap-3 w-full">
          <span className="flex items-start gap-4 w-full">
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
                  return (
                    <Input {...field} placeholder="eg. 1 1989 8 0133256 7 89" />
                  )
                }}
              />
            </label>
          </span>
          <span className="flex items-start gap-4 w-full">
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
          </span>
          <span className="flex items-start gap-4 w-full">
            <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col gap-2">
              <p>
                Amount <span className="text-red-500">*</span>
              </p>
              <Controller
                control={control}
                name="ubudehe"
                rules={{ required: 'Ubudehe amount is required' }}
                render={({ field }) => {
                  return <Input {...field} placeholder="5000" />
                }}
              />
              {errors.ubudehe && (
                <span className="text-red-500 text-[12px]">
                  {errors.ubudehe.message}
                </span>
              )}
            </label>
            <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
              Household type
              <Controller
                control={control}
                name="type"
                defaultValue={'residence'}
                render={({ field }) => {
                  return (
                    <Select
                      defaultValue={'residence'}
                      defaultLabel="Type"
                      options={[
                        { text: 'Residence', value: 'residence' },
                        { text: 'Business', value: 'business' },
                      ]}
                      {...field}
                    />
                  )
                }}
              />
            </label>
          </span>
        </section>
        {/* LOCATION */}
        <section className="flex flex-col items-start gap-4 w-full">
          <span className="flex items-start gap-4 w-full">
            <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
              <p>
                Province <span className="text-red-500">*</span>
              </p>
              <Controller
                control={control}
                name="province"
                rules={{ required: 'Please select a province' }}
                defaultValue={31}
                render={({ field }) => {
                  return (
                    <label className="flex flex-col gap-2 w-full">
                      <Select
                        defaultLabel="Province"
                        defaultValue={31}
                        options={[{ value: 31, text: 'Kigali' }]}
                        {...field}
                      />
                      {errors.province && (
                        <span className="text-red-500 text-[12px]">
                          {errors.province.message}
                        </span>
                      )}
                    </label>
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
                rules={{ required: 'Please select a district' }}
                defaultValue={districtId || selectedDistrict}
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      defaultLabel="District"
                      defaultValue={districtId || selectedDistrict}
                      onChange={(e) => {
                        field.onChange(e)
                        dispatch(setSelectedDistrict(Number(e.target.value)))
                      }}
                      options={districts?.map((district) => {
                        return {
                          text: district.name,
                          value: district.id,
                          disabled: districtId
                            ? district.id !== districtId
                            : false,
                        }
                      })}
                    />
                  )
                }}
              />
              {errors.district && (
                <span className="text-red-500 text-[12px]">
                  {errors.district.message}
                </span>
              )}
            </label>
          </span>
          <span className="flex items-start gap-4 w-full">
            <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
              <p>
                Sector <span className="text-red-500">*</span>
              </p>
              <Controller
                control={control}
                name="sector"
                rules={{ required: 'Please select a sector' }}
                defaultValue={sectorId || selectedSector}
                render={({ field }) => {
                  return (
                    <Select
                      defaultLabel="Sector"
                      {...field}
                      defaultValue={sectorId || selectedSector}
                      onChange={(e) => {
                        field.onChange(e)
                        dispatch(setSelectedSector(Number(e.target.value)))
                      }}
                      options={sectors?.map((sector) => {
                        return {
                          text: sector.name,
                          value: sector.id,
                          disabled: sectorId ? sector.id !== sectorId : false,
                        }
                      })}
                    />
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
                rules={{ required: 'Please select a cell' }}
                defaultValue={cellId || selectedCell}
                render={({ field }) => {
                  return (
                    <Select
                      defaultLabel="Cell"
                      defaultValue={cellId || selectedCell}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        dispatch(setSelectedCell(Number(e.target.value)))
                      }}
                      options={cells?.map((cell) => {
                        return {
                          text: cell.name,
                          value: cell.id,
                          disabled: cellId ? cell.id !== cellId : false,
                        }
                      })}
                    />
                  )
                }}
              />
              {errors.cell && (
                <span className="text-red-500 text-[12px]">
                  {errors.cell.message}
                </span>
              )}
            </label>
          </span>
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
                  <Select
                    defaultLabel="Village"
                    defaultValue={villageId || selectedVillage}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      dispatch(setSelectedVillage(Number(e.target.value)))
                    }}
                    options={villages?.map((village) => {
                      return {
                        text: village.name,
                        value: village.id,
                        disabled: villageId ? village.id !== villageId : false,
                      }
                    })}
                  />
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
        <Button
          submit
          value={createHouseholdLoading ? <Loading /> : 'Create Household'}
          className={`${
            !householdConflict ? 'flex' : 'hidden'
          } w-fit max-w-[50%] px-6 mx-auto`}
        />
      </form>
      <section
        className={`${
          householdConflict ? 'flex flex-col items-center gap-4' : 'hidden'
        } w-full mx-auto`}
      >
        <ExistingHouseholds
          conflict={householdConflict}
          households={existingHouseholdData}
        />
      </section>
    </main>
  )
}

export default CreateHousehold
