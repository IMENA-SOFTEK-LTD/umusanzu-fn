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
import HouseholdServicesForm from '../../components/households/HouseholdServicesForm'
import HouseholdConflictModal from '../../components/models/HouseholdConflictModal'

const isValidPhoneNumber = (value) => {
  const digitsOnly = value.replace(/\D/g, '')
  const patternMobileMoney = /^07[89]\d{7}$/
  const patternAirtelMoney = /^07[23]\d{7}$/
  return patternMobileMoney.test(digitsOnly) || patternAirtelMoney.test(digitsOnly)
}

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
  const [householdServices, setHouseholdServices] = useState([])
  const [showConflictModal, setShowConflictModal] = useState(false)
  const [conflictData, setConflictData] = useState(null)

  let department = ''
  // console.log(user?.departments?.level_id)
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
      // dispatch(setSelectedSector(user?.departments?.parent?.id))
      // dispatch(setSelectedDistrict(user?.departments?.parent?.parent?.id))
      // dispatch(
      //   setSelectedProvince(user?.departments?.parent?.parent?.parent?.id)
      // )
      // console.log('xxx')
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
   
    // Validate Household Department Services
    if (!householdServices || householdServices.length === 0) {
      toast.error('Please add at least one household department service')
      return
    }

    // Validate each service has required fields
    const invalidServices = householdServices.filter(
      (service) =>
        !service.department_service_id ||
        !service.ubudehe ||
        String(service.ubudehe).trim() === '' ||
        !service.householdType
    )

    if (invalidServices.length > 0) {
      toast.error(
        'Please ensure all services have a service selected, household type, and amount filled'
      )
      return
    }

    // Format services array with service, householdType, amount, and location data
    const servicesArray = householdServices.map((service) => ({
      service: service.department_service_id,
      householdType: service.householdType,
      amount: service.ubudehe,
      province_id: service.province_id || null,
      district_id: service.district_id || null,
      sector_id: service.sector_id || null,
      cell_id: service.cell_id || null,
      village_id: service.village_id || null,
    }))

    // Find residence service for household location, or use first service if not found
    const residenceService =
      householdServices.find(
        (service) => service.householdType.toLowerCase() === 'residence'
      ) || householdServices[0]

    const payload = {
      name: data.name,
      nid: data.nid ? data.nid.replace(/\s/g, '') : data.nid, // Remove spaces before sending to API
      province: Number(residenceService?.province_id),
      district: Number(residenceService?.district_id),
      sector: Number(residenceService?.sector_id),
      cell: Number(residenceService?.cell_id),
      village: Number(residenceService?.village_id),
      phone1: data.phone1,
      phone2: data.phone2,
      type: residenceService?.householdType.toLowerCase() || 'residence',
      ubudehe: residenceService?.amount || 0,
      email: data.email,
      services: servicesArray,
      confirmHousehold: false,
      confirmServices: false,
      confirmMerge: false,
    }
    console.log(payload)
    createHousehold(payload)
    dispatch(setDuplicateHousehold(payload))
  }

  const handleResubmitWithConflictDisabled = (resubmitPayload) => {
    // Resubmit with disableCheckConflict: true
    createHousehold(resubmitPayload)
    dispatch(setDuplicateHousehold(resubmitPayload))
  }

  useEffect(() => {
    if (createHouseholdSuccess) {
      if (createHouseholdData?.conflict === true) {
        // Show conflict modal with the conflict data
        setConflictData(createHouseholdData)
        setShowConflictModal(true)
        dispatch(setHouseholdConflict(true))
      } else {
        dispatch(setHouseholdConflict(false))
        dispatch(setDuplicateHousehold(null))
        setShowConflictModal(false)
        setConflictData(null)
        toast.success('Household created successfully')
        setTimeout(() => {
          navigate(`/households/${createHouseholdData?.data?.id}`)
        }, 1000)
      }
    } else if (createHouseholdError) {
      dispatch(setDuplicateHousehold(null))
      setShowConflictModal(false)
      setConflictData(null)
      toast.error(createHouseholdErrorData?.message)
    }
  }, [createHouseholdSuccess, createHouseholdData, createHouseholdError, createHouseholdErrorData, dispatch, navigate])
  // console.log(selectedProvince)
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
                rules={{
                  validate: (value) => {
                    if (!value) return true // Optional field
                    const digitsOnly = value.replace(/\s/g, '')
                    // Validate formatted length is 21 characters (which means 16 digits)
                    if (value.length !== 21) {
                      return 'National ID must be exactly 21 characters (including spaces)'
                    }
                    if (digitsOnly.length !== 16) {
                      return 'National ID must contain exactly 16 digits'
                    }
                    if (!/^\d{16}$/.test(digitsOnly)) {
                      return 'National ID must contain only numbers'
                    }
                    return true
                  },
                }}
                render={({ field: { value, onChange, ...fieldProps } }) => {
                  const formatNationalId = (inputValue) => {
                    if (!inputValue) return ''

                    // Remove all non-digit characters
                    const digitsOnly = inputValue.replace(/\D/g, '')

                    // Limit to 16 digits (format: 1 1979 8 0044189 1 35 = 16 digits)
                    const limitedDigits = digitsOnly.slice(0, 16)

                    if (limitedDigits.length === 0) return ''

                    // Apply format: X XXXX X XXXXXXX X XX
                    // Pattern: 1 digit, space, 4 digits, space, 1 digit, space, 7 digits, space, 1 digit, space, 2 digits
                    // Total: 1 + 4 + 1 + 7 + 1 + 2 = 16 digits = 21 characters with spaces
                    let formatted = limitedDigits[0] // First digit (position 1)

                    if (limitedDigits.length > 1) {
                      formatted += ' ' + limitedDigits.slice(1, 5) // Next 4 digits (positions 2-5)
                    }
                    if (limitedDigits.length > 5) {
                      formatted += ' ' + limitedDigits[5] // Next 1 digit (position 6)
                    }
                    if (limitedDigits.length > 6) {
                      formatted += ' ' + limitedDigits.slice(6, 13) // Next 7 digits (positions 7-13)
                    }
                    if (limitedDigits.length > 13) {
                      formatted += ' ' + limitedDigits[13] // Next 1 digit (position 14)
                    }
                    if (limitedDigits.length > 14) {
                      formatted += ' ' + limitedDigits.slice(14, 16) // Last 2 digits (positions 15-16)
                    }

                    return formatted
                  }

                  const handleChange = (e) => {
                    const formattedValue = formatNationalId(e.target.value)
                    onChange(formattedValue)
                  }

                  return (
                    <>
                      <Input
                        {...fieldProps}
                        value={formatNationalId(value || '')}
                        onChange={handleChange}
                        placeholder="eg. 1 1979 8 0044189 1 35"
                        maxLength={21} // 16 digits + 5 spaces = 21 characters
                      />
                      {errors.nid && (
                        <span className="text-red-500 text-[12px]">
                          {errors.nid.message}
                        </span>
                      )}
                    </>
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
                // rules={{ required: 'Please add the email' }}
                render={({ field }) => {
                  return <Input {...field} placeholder="info@example.com" />
                }}
              />
              {/* {errors.email && (
                <span className="text-red-500 text-[12px]">
                  {errors.email.message}
                </span>
              )} */}
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
                rules={{
                  required: 'Please add the primary phone number',
                  validate: (value) =>
                    isValidPhoneNumber(value || '')
                      ? true
                      : 'Phone number must be valid (MTN: 078/079, Airtel: 072/073)',
                }}
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
                rules={{
                  validate: (value) => {
                    if (!value) return true
                    return isValidPhoneNumber(value)
                      ? true
                      : 'Phone number must be valid (MTN: 078/079, Airtel: 072/073)'
                  },
                }}
                render={({ field }) => {
                  return <Input {...field} placeholder="0788 111 111" />
                }}
              />
              {errors.phone2 && (
                <span className="text-red-500 text-[12px]">
                  {errors.phone2.message}
                </span>
              )}
            </label>
          </span>
        </section>

        {/* HOUSEHOLD DEPARTMENT SERVICES */}
        <section className="flex flex-col items-start gap-0 w-full">
          <HouseholdServicesForm onServicesChange={setHouseholdServices} />
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
          className={`flex w-fit max-w-[50%] px-6 mx-auto`}
        />
      </form>
      {/* <section
        className={`${
          householdConflict ? 'flex flex-col items-center gap-4' : 'hidden'
        } w-full mx-auto`}
      >
        <ExistingHouseholds
          conflict={householdConflict}
          households={existingHouseholdData}
        />
      </section> */}

      {/* Conflict Modal */}
      <HouseholdConflictModal
        isOpen={showConflictModal}
        onClose={() => {
          setShowConflictModal(false)
          setConflictData(null)
        }}
        conflictData={conflictData}
        onResubmit={handleResubmitWithConflictDisabled}
        isSubmitting={createHouseholdLoading}
      />
    </main>
  )
}

export default CreateHousehold
