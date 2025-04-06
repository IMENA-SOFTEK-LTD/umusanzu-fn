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
  setDuplicateHousehold,
  setExistingHousehold,
  setHouseholdConflict,
  setSectors,
  setSelectedCell,
  setSelectedDistrict,
  setSelectedProvince,
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
import { toast } from 'react-toastify'

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
    selectedProvince,
    cells,
    selectedCell,
    villages,
    selectedVillage,
    householdConflict,
  } = useSelector((state) => state.household)

  const [existingHouseholdData, setExistingHouseholdData] = useState([])

  let department = ''
  // console.log(user?.departments)
  switch (user?.departments?.level_id) {
    case 1:
      department = 'province'
      dispatch(setSelectedSector(null))
      dispatch(setSelectedProvince(Number(user?.departments?.id)))
      break
    case 2:
      department = 'district'
      dispatch(setSelectedSector(null))
      dispatch(setSelectedDistrict(user?.departments?.id))
      dispatch(setSelectedProvince(user?.departments?.parent?.id))
      break
    case 3:
      department = 'sector'
      dispatch(setSelectedSector(user?.departments?.id))
      dispatch(setSelectedDistrict(user?.departments?.parent?.id))
      dispatch(setSelectedProvince(user?.departments?.parent?.parent?.id))
      break
    case 4:
      department = 'cell'
      dispatch(setSelectedCell(user?.departments?.id))
      dispatch(setSelectedSector(user?.departments?.parent?.id))
      dispatch(setSelectedDistrict(user?.departments?.parent?.parent?.id))
      dispatch(
        setSelectedProvince(user?.departments?.parent?.parent?.parent?.id)
      )
      break
    case 5:
      department = 'country'
      dispatch(setSelectedSector(user?.departments?.parent?.id))
      dispatch(setSelectedDistrict(user?.departments?.parent?.parent?.id))
      dispatch(
        setSelectedProvince(user?.departments?.parent?.parent?.parent?.id)
      )
      break
    case 6:
      department = 'agent'
      dispatch(setSelectedVillage(user?.departments?.id))
      dispatch(setSelectedCell(user?.departments?.parent?.id))
      dispatch(setSelectedSector(user?.departments?.parent?.parent?.id))
      dispatch(
        setSelectedDistrict(user?.departments?.parent?.parent?.parent?.id)
      )
      dispatch(
        setSelectedProvince(
          user?.departments?.parent?.parent?.parent?.parent?.id
        )
      )
      break
    default:
      department = 'agent'
      dispatch(setSelectedVillage(user?.departments?.id))
      dispatch(setSelectedCell(user?.departments?.parent?.id))
      dispatch(setSelectedSector(user?.departments?.parent?.parent?.id))
      dispatch(
        setSelectedDistrict(user?.departments?.parent?.parent?.parent?.id)
      )
      dispatch(
        setSelectedProvince(
          user?.departments?.parent?.parent?.parent?.parent?.id
        )
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
    if (selectedProvince) getCountryDistricts({ id: selectedProvince })
  }, [department, selectedProvince])

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
    if (selectedDistrict) getDistrictSectors({ id: selectedDistrict })
  }, [selectedDistrict])

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
    if (selectedSector) getSectorCells({ id: selectedSector })
  }, [selectedSector])

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
    if (selectedCell) getCellVillages({ id: selectedCell })
  }, [selectedCell])

  useEffect(() => {
    if (cellVillagesData) {
      dispatch(setVillages(cellVillagesData?.data?.rows))
      // dispatch(setSelectedVillage(cellVillagesData?.data?.rows[0]?.id))
    }
  }, [cellVillagesData])

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
    localStorage.removeItem('conflictReqPayload')
    const payload = {
      name: data.name,
      nid: data.nid,
      province: Number(data.province || selectedProvince),
      district: Number(data.district || selectedDistrict),
      sector: Number(data.sector || selectedSector),
      cell: Number(data.cell || selectedCell),
      phone1: data.phone1,
      phone2: data.phone2,
      ubudehe: data.ubudehe,
      type: data.type,
      village: Number(data.village || selectedVillage),
      email: data.email,
    }
    createHousehold(payload)
    dispatch(setDuplicateHousehold(payload))
  }

  useEffect(() => {
    if (createHouseholdSuccess) {
      if (createHouseholdData?.conflict === true) {
        toast.info(createHouseholdData?.message)
        localStorage.setItem(
          'conflictReqPayload',
          JSON.stringify({
            ...createHouseholdData?.requestParams,
          })
        )
        dispatch(setExistingHousehold(createHouseholdData?.data?.rows[0]))
        setExistingHouseholdData(createHouseholdData?.data?.rows)
        navigate(
          `/households/create/conflict/?phone1=${createHouseholdData?.data?.rows[0]?.phone1}`
        )
      } else {
        dispatch(setHouseholdConflict(false))
        dispatch(setDuplicateHousehold(null))
        setTimeout(() => {
          navigate(`/households/${createHouseholdData?.data?.id}`)
        }, 1000)
      }
    } else if (createHouseholdError) {
      dispatch(setDuplicateHousehold(null))
      toast.error(createHouseholdErrorData?.message)
    }
  }, [createHouseholdSuccess, createHouseholdData])

  return (
    <main className="flex flex-col gap-6 my-4 w-[90%] relative mx-auto">
      <Button value={'Go to back'} route={`/households`} />
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
                Email <span className="text-red-500">*</span>
              </p>
              <Controller
                control={control}
                name="email"
                rules={{ required: 'Please add the email' }}
                render={({ field }) => {
                  return <Input {...field} placeholder="info@example.com" />
                }}
              />
              {errors.email && (
                <span className="text-red-500 text-[12px]">
                  {errors.email.message}
                </span>
              )}
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
            {['country'].includes(department) && (
              <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
                <p>
                  Province <span className="text-red-500">*</span>
                </p>
                <Controller
                  control={control}
                  name="province"
                  defaultValue={selectedProvince}
                  rules={{ required: 'Please select a province' }}
                  render={({ field }) => {
                    return (
                      <select
                        className="p-2 outline-none border-[1px] rounded-md w-[90%] border-primary focus:border-[1.5px] ease-in-out duration-150"
                        {...field}
                        value={selectedProvince} // Set the value dynamically
                        onChange={(e) => {
                          field.onChange(e)
                          dispatch(setSelectedSector(null))
                          dispatch(setSelectedCell(null))
                          dispatch(setSelectedVillage(null))
                          dispatch(setSelectedProvince(Number(e.target.value)))
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
                {errors.province && (
                  <span className="text-red-500 text-[12px]">
                    {errors.province.message}
                  </span>
                )}
              </label>
            )}

            {['country', 'province'].includes(department) && (
              <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
                <p>
                  District <span className="text-red-500">*</span>
                  {countryDistrictsLoading && 'Loading....'}
                </p>
                <Controller
                  control={control}
                  name="district"
                  defaultValue={selectedDistrict}
                  rules={{ required: 'Please select a district' }}
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
                        <option value={''}>Please select a district</option>
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
                                {countryDistrictsLoading
                                  ? '...'
                                  : district.name}
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

                {errors.district && (
                  <span className="text-red-500 text-[12px]">
                    {errors.district.message}
                  </span>
                )}
              </label>
            )}
          </span>
          <span className="flex items-start gap-4 w-full">
            {['country', 'province', 'district'].includes(department) && (
              <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
                <p>
                  Sector <span className="text-red-500">*</span>{' '}
                  {districtSectorsLoading && 'Loading...'}
                </p>
                <Controller
                  control={control}
                  name="sector"
                  defaultValue={selectedSector}
                  rules={{ required: 'Please select a sector' }}
                  render={({ field }) => {
                    return (
                      <select
                        className="p-2 outline-none border-[1px] rounded-md w-[90%] border-primary focus:border-[1.5px] ease-in-out duration-150"
                        {...field}
                        value={selectedSector}
                        onChange={(e) => {
                          field.onChange(e)
                          dispatch(setSelectedCell(null))
                          dispatch(setSelectedVillage(null))
                          dispatch(setSelectedSector(Number(e.target.value)))
                        }}
                      >
                        <option value={''}>Please select a sector</option>
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

                {errors.sector && (
                  <span className="text-red-500 text-[12px]">
                    {errors.sector.message}
                  </span>
                )}
              </label>
            )}
            {['country', 'province', 'district', 'sector'].includes(
              department
            ) && (
              <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
                <p>
                  Cell <span className="text-red-500">*</span>
                  {sectorCellsLoading && 'Loading...'}
                </p>
                <Controller
                  control={control}
                  name="cell"
                  rules={{ required: 'Please select a cell' }}
                  defaultValue={selectedCell}
                  render={({ field }) => {
                    return (
                      <select
                        className="p-2 outline-none border-[1px] rounded-md w-[90%] border-primary focus:border-[1.5px] ease-in-out duration-150"
                        {...field}
                        value={selectedCell}
                        onChange={(e) => {
                          field.onChange(e)
                          dispatch(setSelectedVillage(null))
                          dispatch(setSelectedCell(Number(e.target.value)))
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
                {errors.cell && (
                  <span className="text-red-500 text-[12px]">
                    {errors.cell.message}
                  </span>
                )}
              </label>
            )}
          </span>
          {['country', 'province', 'district', 'sector', 'cell'].includes(
            department
          ) && (
            <label className="text-[15px] w-full flex-1 basis-[40%] max-w-[48%] flex flex-col items-start gap-2">
              <p>
                Village <span className="text-red-500">*</span>
                {cellVillagesDataLoading && 'Loading...'}
              </p>
              <Controller
                control={control}
                name="village"
                defaultValue={selectedVillage}
                rules={{ required: 'Please select a village' }}
                render={({ field }) => {
                  return (
                    <select
                      className="p-2 outline-none border-[1px] rounded-md w-[90%] border-primary focus:border-[1.5px] ease-in-out duration-150"
                      {...field}
                      value={selectedVillage}
                      onChange={(e) => {
                        field.onChange(e)
                        dispatch(setSelectedVillage(Number(e.target.value)))
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
              {errors.village && (
                <span className="text-red-500 text-[12px]">
                  {errors.village.message}
                </span>
              )}
            </label>
          )}
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
