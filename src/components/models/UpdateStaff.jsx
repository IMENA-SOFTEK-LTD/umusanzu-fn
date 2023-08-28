import { useState, useEffect } from 'react'
import { AiFillPlusCircle } from 'react-icons/ai'
import PropTypes from 'prop-types'
import { useForm, Controller } from 'react-hook-form'
import Button from '../Button'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { toggleUpdateStaff } from '../../states/features/modals/modalSlice'
import { useParams } from 'react-router-dom'
import { useLazyGetSingleStaffDetailsQuery } from '../../states/api/apiSlice'
import { useUpdateStaffDetailsMutation } from '../../states/api/apiSlice'
import Loading from '../Loading'

function UpdateStaff({ toggleButton = true }) {
  const [showModal, setShowModal] = useState(false)
  const { id } = useParams()
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
  const [data, setData] = useState(staffDetailsData?.data || [])

  useEffect(() => {
    if (staffDetailsSuccess) {
      setData(staffDetailsData?.data || [])

    }
  }, [staffDetailsSuccess, staffDetailsData])

  useEffect(() => {
    getSingleStaffDetails({ id })
  }, [getSingleStaffDetails, id])

  useEffect(() => {
    getSingleStaffDetails({ id })
  }, [updateStaffDetailsSuccess])

  const { updateStaff } = useSelector((state) => state.modals)
  const dispatch = useDispatch()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm()

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
      toast.success('Update successful!');
    }
  }, [updateStaffDetailsSuccess]);  
  useEffect(() => {
    if (updateStaffDetailsIsError) {
      toast.error('An error occurred during update.'); 
    }
  }, [updateStaffDetailsIsError]);
  useEffect(() => {
    if (staffDetailsError) {
      toast.error('Error fetching staff details.');
    }
  }, [staffDetailsError]);
    
  const onSubmit = (formData) => {
    updateStaffDetails({
      names: formData.names,
      username: formData.username,
      email: formData.email,
      phone1: formData.phone1,
      phone2: formData.phone2,
      id,
    })
  }

  useEffect(() => {
    dispatch(toggleUpdateStaff(false))
  }, [updateStaffDetailsSuccess, updateStaffDetailsData])

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

      {showModal ||
        (updateStaff && (
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
                <h3 className="mb-4 text-xl text-center font-medium text-white">
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
                      Full Name
                    </label>
                    <Controller
                      name="names"
                      control={control}
                      defaultValue={data?.names}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="pl-11 text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                        />
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
                        defaultValue={data?.username}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="pl-11 text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="Email"
                        className="block mb-2 text-sm font-medium text-black"
                      >
                        Email
                      </label>
                      <Controller
                        name="email"
                        control={control}
                        defaultValue={data?.email}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="email"
                            className="pl-11 text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                          />
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
                        Phone 1
                      </label>
                      <Controller
                        name="phone1"
                        control={control}
                        defaultValue={data?.phone1}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="tel"
                            className="pl-11 text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                          />
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
                        defaultValue={data?.phone2}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="tel"
                            className="pl-11 text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                          />
                        )}
                      />
                    </div>
                  </div>

                  <Controller
                    name="submit"
                    control={control}
                    render={({ field }) => {
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
        ))}
    </div>
  )
}

;(UpdateStaff.propTypes = {
  toggleButton: PropTypes.bool,
}),
  (UpdateStaff.defaultProps = {
    toggleButton: true,
  })

export default UpdateStaff
