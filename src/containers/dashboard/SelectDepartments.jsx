import PropTypes from 'prop-types'
import { Controller, useForm } from 'react-hook-form'
import Button from '../../components/Button'
import {
  useLazyGetCountryDistrictsQuery,
  useLazyGetDistrictSectorsQuery,
} from '../../states/api/apiSlice'
import {
  setDistricts,
  setSectors,
  setSelectedDistrict,
  setSelectedProvince,
  setSelectedSector,
} from '../../states/features/modals/householdSlice'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setSectorId } from '../../states/features/departments/departmentSlice'

const SelectDepartments = ({ user }) => {
  const { handleSubmit, control } = useForm()

  const {
    districts,
    sectors,
    selectedDistrict,
    selectedProvince,
    selectedSector,
    cells,
    selectedCell,
    villages,
    selectedVillage,
    householdConflict,
    existingHousehold,
    moveHouseholdModal,
  } = useSelector((state) => state.household)

  const { pathName } = useSelector((state) => state.navbar)

  const { pathRoute } = useSelector((state) => state.sidebar)

  const dispatch = useDispatch()

  const navigate = useNavigate()

  let department = ''

  switch (user?.departments?.level_id) {
    case 1:
      department = 'province'
      dispatch(setSelectedProvince(user?.departments?.id))
      break
    case 2:
      department = 'district'
      dispatch(setSelectedDistrict(user?.departments?.id))
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
      dispatch(setSelectedDistrict(countryDistrictsData?.data?.rows[0]?.id))
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
    getDistrictSectors({ id: selectedDistrict })
  }, [selectedDistrict])

  useEffect(() => {
    if (districtSectorsData) {
      dispatch(setSectors(districtSectorsData?.data?.rows))
      dispatch(setSelectedSector(districtSectorsData?.data?.rows[0]?.id))
    }
  }, [districtSectorsData])

  const onSubmit = (data) => {
    dispatch(setSectorId(data?.sector))
    navigate(pathRoute)
  }

  return (
    <main className="h-[80vh] flex flex-col items-center justify-center gap-6">
      <h1 className="text-center text-[25px]">
        Please select a sector before proceeding
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-8 items-center w-[70%] h-fit py-8 mx-auto"
      >
        <article className="flex w-full items-center gap-6">
          <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
            Province
            <Controller
              control={control}
              name="province"
              defaultValue={selectedProvince || 31}
              render={({ field }) => {
                return (
                  <select
                    className="p-2 outline-none border-[1px] rounded-md w-[90%] border-primary focus:border-[1.5px] ease-in-out duration-150"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                    }}
                  >
                    <option disabled value={1}>
                      Select Province
                    </option>
                    <option value={31}>Kigali City</option>
                  </select>
                )
              }}
            />
          </label>
          <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
            District
            <Controller
              control={control}
              name="district"
              defaultValue={selectedDistrict || 0}
              render={({ field }) => {
                return (
                  <select
                    className="p-2 outline-none border-[1px] rounded-md w-[90%] border-primary focus:border-[1.5px] ease-in-out duration-150"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      dispatch(setSelectedDistrict(e.target.value))
                    }}
                  >
                    <option disabled value={0}>
                      Select district
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
                )
              }}
            />
          </label>
          <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
            Sector
            <Controller
              control={control}
              name="sector"
              defaultValue={0}
              render={({ field }) => {
                return (
                  <select
                    className="p-2 outline-none border-[1px] rounded-md w-[90%] border-primary focus:border-[1.5px] ease-in-out duration-150"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                    }}
                  >
                    <option disabled value={0}>
                      Select sector
                    </option>
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
        </article>
        <section>
          <Controller
            name="submit"
            control={control}
            render={({ field }) => {
              return (
                <Button
                  submit
                  {...field}
                  value={`Continue to ${pathName}`}
                  route={pathRoute}
                />
              )
            }}
          />
        </section>
      </form>
    </main>
  )
}

SelectDepartments.propTypes = {
  user: PropTypes.object.isRequired,
}

export default SelectDepartments
