import { useState, useEffect } from 'react'
import Button from '../Button'
import { BsFillHouseAddFill } from 'react-icons/bs'
import { useForm, Controller } from 'react-hook-form'
import {
  useCreateHouseHoldMutation,
  useLazyGetSectorVillagesQuery
} from '../../states/api/apiSlice'
import { useSelector } from 'react-redux'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css' // Import the CSS for styling

import Loading from '../../components/Loading'

const CreateHouseHoldModel = () => {
  const [showModal, setShowModal] = useState(false)
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const openModal = () => {
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const { user: stateUser } = useSelector((state) => state.auth)
  const user = JSON.parse(localStorage.getItem('user'))

  const [
    createHouseHold,
    {
      isLoading: houseHoldLoading,
      isSuccess: houseHoldSuccess,
      isError: houseHoldError,
      data: houseHoldData,
      error: houseHoldErrorMessage
    }
  ] = useCreateHouseHoldMutation()

  const onSubmit = (data) => {
    createHouseHold({
      name: data.name,
      ubudehe: data.amount,
      nid: data.nid,
      phone1: data.phone1,
      phone2: data.phone2,
      departmentId: user?.department_id || stateUser?.department_id
    })
  }

  useEffect(() => {
    if (houseHoldSuccess) {
      closeModal()
      toast.success('Household created successfully')
    }
    if (houseHoldError) {
      toast.error(houseHoldErrorMessage)
    }
  }, [houseHoldData, houseHoldSuccess, houseHoldError, houseHoldErrorMessage])

  return (
    <div className="relative">
      <ToastContainer />
      <button
        onClick={openModal}
        className="flex items-center absolute right-6 top-4 justify-center px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg shadow-md ease-in-out duration-300 hover:scale-[]"
        type="button"
      >
        <BsFillHouseAddFill className="mr-2 text-lg" />
        Add New Household
      </button>

      {showModal && (
        <div
          tabIndex={-1}
          aria-hidden="true"
          className="fixed top-0 left-0 right-0 z-50 w-full h-screen p-4 flex items-center justify-center bg-gray-800 bg-opacity-60"
        >
          <div className="relative bg-white rounded-lg shadow">
            <button
              onClick={closeModal}
              type="button"
              className="absolute top-3 right-2.5 text-primary bg-transparent hover:bg-primary hover:text-primary rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-primary dark:hover:text-white"
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
            <div className="px-6 py-6 lg:px-8">
              <h3 className="mb-4 text-xl text-center font-medium text-black">
                Add New Household
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block mb-2 text-sm font-medium text-black"
                  >
                    Full Name
                  </label>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: 'Full name is required' }}
                    render={({ field }) => (
                      <input
                        type="text"
                        {...field}
                        defaultValue=""
                        placeholder="Full Name"
                        className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                      />
                    )}
                  />
                  {errors.name && (
                    <span className="text-red-500">{errors.name.message}</span>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="nid"
                    className="block mb-2 text-sm font-medium text-black"
                  >
                    National ID(NID)
                  </label>
                  <Controller
                    name="nid"
                    control={control}
                    rules={{ required: 'National ID(NID) is required' }}
                    render={({ field }) => (
                      <input
                        type="text"
                        {...field}
                        defaultValue=""
                        placeholder="National Identification"
                        className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                      />
                    )}
                  />
                  {errors.nid && (
                    <span className="text-red-500">{errors.nid.message}</span>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="amount"
                    className="block mb-2 text-sm font-medium text-black"
                  >
                    Choose Amount
                  </label>
                  <Controller
                    name="amount"
                    control={control}
                    rules={{ required: 'Amount is required' }}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                      >
                        <option value="" disabled>
                          Select an amount
                        </option>
                        <option value="100">$100</option>
                        <option value="200">$200</option>
                        <option value="500">$500</option>
                        {/* Add more options as needed */}
                      </select>
                    )}
                  />
                  {errors.amount && (
                    <span className="text-red-500">
                      {errors.amount.message}
                    </span>
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
                <Controller
                  name="submit"
                  control={control}
                  render={() => {
                    return (
                      <Button
                        submit
                        value={
                          houseHoldLoading ? <Loading /> : ' Add New Household'
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

export default CreateHouseHoldModel
