import { useState, useEffect } from 'react'
import { AiFillPlusCircle } from 'react-icons/ai'
import PropTypes from 'prop-types'
import { useForm, Controller } from 'react-hook-form'
import Button from '../Button'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { toggleUpdateStaff } from '../../states/features/modals/modalSlice'
import { useParams } from 'react-router-dom'
import {
  useLazyGetSingleStaffDetailsQuery,
  useUpdateStaffDetailsMutation,
} from '../../states/api/apiSlice'
import Loading from '../Loading'
import Select from '../Select'

function UpdateStaff({ admin, setData, toggleButton = true }) {
  const [showModal, setShowModal] = useState(false)
  const params = useParams()
  const id = params?.id || admin?.id
  const [
    updateStaffDetails,
    {
      data: updateStaffDetailsData,
      isLoading: updateStaffDetailsLoading,
      isSuccess: updateStaffDetailsSuccess,
      isError: updateStaffDetailsIsError,
    },
  ] = useUpdateStaffDetailsMutation()
  const [
    getSingleStaffDetails,
    {
      data: staffDetailsData,
      isLoading: staffDetailsLoading,
      isSuccess: staffDetailsSuccess,
      isError: staffDetailsError,
      error: staffError,
    },
  ] = useLazyGetSingleStaffDetailsQuery()
  const [staffData, setStaffData] = useState(null)

  useEffect(() => {
    if (staffDetailsSuccess && staffDetailsData?.data) {
      setStaffData(staffDetailsData.data)
      setData && setData(staffDetailsData.data)
    }
  }, [staffDetailsSuccess, staffDetailsData, setData])

  useEffect(() => {
    if (id) {
      getSingleStaffDetails({ id })
    }
  }, [getSingleStaffDetails, id])

  useEffect(() => {
    if (updateStaffDetailsSuccess && id) {
      getSingleStaffDetails({ id })
    }
  }, [updateStaffDetailsSuccess, getSingleStaffDetails, id])

  const { updateStaff } = useSelector((state) => state.modals)
  const dispatch = useDispatch()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      names: '',
      username: '',
      email: '',
      phone1: '',
      phone2: '',
      staff_role: 1,
    }
  })
// console.log(staffData)
  // Reset form when staff data loads
  useEffect(() => {
    if (staffData && reset) {
      // console.log(staffData)
      reset({
        names: staffData.names || '',
        username: staffData.username || '',
        email: staffData.email || '',
        phone1: staffData.phone1 || '',
        phone2: staffData.phone2 || '',
        staff_role: staffData.staff_role===0?0:1,
      })
    }
  }, [staffData, reset])

  const openModal = () => {
    setShowModal(true)
    dispatch(toggleUpdateStaff(!updateStaff))
  }

  const closeModal = () => {
    setShowModal(false)
    dispatch(toggleUpdateStaff(false))
  }
  useEffect(() => {
    if (updateStaffDetailsSuccess) {
      toast.success('Update successful!')
    }
  }, [updateStaffDetailsSuccess])
  useEffect(() => {
    if (updateStaffDetailsIsError) {
      toast.error('An error occurred during update.')
    }
  }, [updateStaffDetailsIsError])
  useEffect(() => {
    if (staffDetailsError) {
      toast.error('Error fetching staff details.')
    }
  }, [staffDetailsError])

  const onSubmit = (formData) => {
    updateStaffDetails({
      names: formData.names,
      username: formData.username,
      email: formData.email,
      phone1: formData.phone1,
      phone2: formData.phone2,
      id,
      staff_role: formData?.staff_role,
    })
  }

  useEffect(() => {
    dispatch(toggleUpdateStaff(false))
  }, [updateStaffDetailsSuccess, updateStaffDetailsData])
// console.log(data)
  return (
    <div>
      <button
        onClick={openModal}
        className={`${toggleButton ? 'flex' : 'hidden'}`}
        type="button"
      >
        <AiFillPlusCircle className="mr-2 text-lg" />
        Edit Admin Information
      </button>

      {(showModal || updateStaff) && (
          <div
            tabIndex={-1}
            aria-hidden="true"
            className="fixed top-0 left-0 right-0 z-50 w-full h-screen p-4 flex items-center justify-center bg-gray-800 bg-opacity-60"
          >
            <div className="relative bg-white rounded-lg shadow max-w-[600px]">
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
                  Edit Admin Information
                </h3>
              </div>
              <div className="px-6 py-6 lg:px-8">
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6 max-w-md mx-auto"
                >
                  <div>
                    <label
                      htmlFor="Full Name"
                      className="block mb-2 text-sm font-medium text-black"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="names"
                      control={control}
                      rules={{
                        required: 'Full name is required',
                        minLength: {
                          value: 2,
                          message: 'Full name must be at least 2 characters'
                        }
                      }}
                      render={({ field }) => (
                        <>
                          <input
                            {...field}
                            type="text"
                            className={`pl-3 text-sm border-[1.3px] focus:outline-primary rounded-lg block w-full p-2 ${
                              errors.names ? 'border-red-500' : 'border-primary'
                            }`}
                          />
                          {errors.names && (
                            <span className="text-red-500 text-xs mt-1">
                              {errors.names.message}
                            </span>
                          )}
                        </>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="User Name"
                        className="block mb-2 text-sm font-medium text-black"
                      >
                        User Name
                      </label>
                      <Controller
                        name="username"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="pl-3 text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="Email"
                        className="block mb-2 text-sm font-medium text-black"
                      >
                        Email <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="email"
                        control={control}
                        rules={{
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Please enter a valid email address'
                          }
                        }}
                        render={({ field }) => (
                          <>
                            <input
                              {...field}
                              type="email"
                              className={`pl-3 text-sm border-[1.3px] focus:outline-primary rounded-lg block w-full p-2 ${
                                errors.email ? 'border-red-500' : 'border-primary'
                              }`}
                            />
                            {errors.email && (
                              <span className="text-red-500 text-xs mt-1">
                                {errors.email.message}
                              </span>
                            )}
                          </>
                        )}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="phone1"
                        className="block mb-2 text-sm font-medium text-black"
                      >
                        Phone 1 <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="phone1"
                        control={control}
                        rules={{
                          required: 'Phone 1 is required',
                          pattern: {
                            value: /^[+]?[\d\s\-\(\)]{10,}$/,
                            message: 'Please enter a valid phone number'
                          }
                        }}
                        render={({ field }) => (
                          <>
                            <input
                              {...field}
                              type="tel"
                              className={`pl-3 text-sm border-[1.3px] focus:outline-primary rounded-lg block w-full p-2 ${
                                errors.phone1 ? 'border-red-500' : 'border-primary'
                              }`}
                            />
                            {errors.phone1 && (
                              <span className="text-red-500 text-xs mt-1">
                                {errors.phone1.message}
                              </span>
                            )}
                          </>
                        )}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="phone2"
                        className="block mb-2 text-sm font-medium text-black"
                      >
                        Phone 2
                      </label>
                      <Controller
                        name="phone2"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="tel"
                            className="pl-3 text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2"
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <Controller
                      name="staff_role"
                      control={control}
                      rules={{
                        required: 'Staff role is required',
                        validate: (value) => {
                          if (value === undefined || value === null || value === '') {
                            return 'Please select a staff role'
                          }
                          return true
                        }
                      }}
                      render={({ field }) => {
                        return (
                          <label className="flex flex-col gap-1 items-start w-full">
                            <Select
                              label="Staff Role *"
                              defaultLabel="Select Role"
                              defaultValue={field.value}
                              options={[
                                { value: 1, text: 'Admin' },
                                { value: 0, text: 'Viewer' },
                              ]}
                              {...field}
                              className={errors.staff_role ? 'border-red-500' : ''}
                            />
                            {errors.staff_role && (
                              <span className="text-red-500 text-xs mt-1">
                                {errors.staff_role.message}
                              </span>
                            )}
                          </label>
                        )
                      }}
                    />
                  </div>

                  <Controller
                    name="submit"
                    control={control}
                    render={() => {
                      return (
                        <Button
                          submit
                          value={
                            updateStaffDetailsLoading ? (
                              <Loading />
                            ) : (
                              'Save changes'
                            )
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

UpdateStaff.propTypes = {
  toggleButton: PropTypes.bool,
}

UpdateStaff.defaultProps = {
  toggleButton: true,
}

export default UpdateStaff
