import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BsFillHouseAddFill } from 'react-icons/bs'
import { useForm, Controller } from 'react-hook-form'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Button from '../Button'
import { useCreateDepartmentMutation } from '../../states/api/apiSlice'
import Loading from '../Loading'
import {
  setCells,
  setDistricts,
  setSectors,
  setSelectedCell,
  setSelectedDistrict,
  setSelectedSector,
} from '../../states/features/modals/householdSlice'
import {
  useLazyGetCountryDistrictsQuery,
  useLazyGetDistrictSectorsQuery,
  useLazyGetSectorCellsQuery,
} from '../../states/api/apiSlice'
const CreateVillageModel = ({ user }) => {
  const [showModal, setShowModal] = useState(false)
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const dispatch = useDispatch()
  const [selectedProvince, setSelectedProvince] = useState(null)
  const {
    districts,
    sectors,
    selectedDistrict,
    selectedSector,
    cells,
    selectedCell,
  } = useSelector((state) => state.household)

  let department = ''
  switch (user?.departments?.level_id) {
    case 1:
      department = 'province'
      break
    case 2:
      department = 'district'
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
  const openModal = () => {
    setShowModal(true)
  }
  const closeModal = () => {
    setShowModal(false)
  }

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
  }, [selectedProvince])

  useEffect(() => {
    if (countryDistrictsData) {
      dispatch(setDistricts(countryDistrictsData?.data?.rows))
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
    createDepartment,
    {
      isLoading: departmentLoading,
      isSuccess: departmentSuccess,
      isError: departmentError,
      data: departmentData,
    },
  ] = useCreateDepartmentMutation()

  const { user: stateUser } = useSelector((state) => state.auth)

  const onSubmit = (data) => {
    createDepartment({
      name: data.departmentName,
      department_id:
        data?.cell || user?.department_id || stateUser.department_id,
      level_id: 6,
      phone1: data.phone1,
      phone2: data.phone2,
      email: data.email,
      department: 'village',
    })
  }

  useEffect(() => {
    if (departmentSuccess) {
      setTimeout(() => {
        toast.success('Village created successfully', {
          onClose: () => {
            window.location.reload()
          },
        })
      }, 1200)
    }
    if (departmentError) {
      toast.error('An error occurred while creating the village')
    }
  }, [departmentData, departmentSuccess, departmentError])

  return (
    <div className="relative">
      <ToastContainer />
      <button
        onClick={openModal}
        className="flex items-center absolute right-6 top-4 justify-center px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg shadow-md ease-in-out duration-300 hover:scale-[]"
        type="button"
      >
        <BsFillHouseAddFill className="mr-2 text-lg" />
        Add Village
      </button>

      {showModal && (
        <div
          tabIndex={-1}
          aria-hidden="true"
          className="fixed top-0 left-0 right-0 z-50 w-full h-screen p-4 flex items-center justify-center bg-gray-800 bg-opacity-60"
        >
          <div className="relative bg-white rounded-lg shadow">
            <div className="bg-primary rounded-t-lg p-3">
              <button
                onClick={closeModal}
                type="button"
                className="absolute top-3 right-2.5 text-white bg-transparent hover:bg-primary hover:text-primary rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-primary dark:hover:text-white"
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
              <h3 className="mb-4 mt-2 text-xl text-center font-medium text-white">
                Village Name
              </h3>
            </div>
            <div className="px-6 py-6 lg:px-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label
                    htmlFor="fname"
                    className="block mb-2 text-sm font-medium text-black"
                  >
                    Village Name
                  </label>
                  <Controller
                    name="departmentName"
                    control={control}
                    rules={{ required: 'Village name is required' }}
                    render={({ field }) => (
                      <input
                        type="text"
                        {...field}
                        placeholder="Village Name"
                        className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                      />
                    )}
                  />
                  {errors.fname && (
                    <span className="text-red-500">{errors.fname.message}</span>
                  )}
                </div>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label
                      htmlFor="phone1"
                      className="block mb-2 text-sm font-medium text-black"
                    >
                      Phone 1 No.
                    </label>
                    <Controller
                      name="phone1"
                      control={control}
                      rules={{ required: 'Phone 1 No. is required' }}
                      render={({ field }) => (
                        <input
                          type="text"
                          {...field}
                          placeholder="Phone Number"
                          className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                        />
                      )}
                    />
                    {errors.phone1 && (
                      <span className="text-red-500">
                        {errors.phone1.message}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="phone2"
                      className="block mb-2 text-sm font-medium text-black"
                    >
                      Phone 2 No.
                    </label>
                    <Controller
                      name="phone2"
                      control={control}
                      rules={{ required: 'Phone 2 No. is required' }}
                      render={({ field }) => (
                        <input
                          type="text"
                          {...field}
                          placeholder="Phone Number"
                          className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                        />
                      )}
                    />
                    {errors.phone2 && (
                      <span className="text-red-500">
                        {errors.phone2.message}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-black"
                  >
                    Email Address
                  </label>
                  <Controller
                    name="email"
                    control={control}
                    rules={{
                      required: 'Email Address is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email address',
                      },
                    }}
                    render={({ field }) => (
                      <input
                        type="email"
                        {...field}
                        placeholder="Email Address"
                        className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                      />
                    )}
                  />
                  {errors.email && (
                    <span className="text-red-500">{errors.email.message}</span>
                  )}
                </div>
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
                                  setSelectedProvince(Number(e.target.value))
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
                                <option value={''}>
                                  Please select a district
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
                                        {countryDistrictsLoading
                                          ? '...'
                                          : district.name}
                                      </option>
                                    )
                                  }
                                  return (
                                    <option
                                      key={district.id}
                                      value={district.id}
                                    >
                                      {countryDistrictsLoading
                                        ? '...'
                                        : district.name}
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
                    {['country', 'province', 'district'].includes(
                      department
                    ) && (
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
                                  dispatch(
                                    setSelectedSector(Number(e.target.value))
                                  )
                                }}
                              >
                                <option value={''}>
                                  Please select a sector
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
                                  dispatch(
                                    setSelectedCell(Number(e.target.value))
                                  )
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
                </section>
                <Controller
                  name="submit"
                  control={control}
                  render={() => {
                    return (
                      <Button
                        submit
                        value={
                          departmentLoading ? <Loading /> : 'Add New Village'
                        }
                      />
                    )
                  }}
                />
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default CreateVillageModel
