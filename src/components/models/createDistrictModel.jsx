import { useState, useEffect } from 'react'
import { BsFillHouseAddFill } from 'react-icons/bs'
import { useForm, Controller } from 'react-hook-form'
import Button from '../Button'
import { useCreateDistrictMutation } from '../../states/api/apiSlice'
import Loading from '../../components/Loading'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
const CreateDistrictModel = () => {
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
  const [
    createDistrict,
    {
      isLoading: Districtoading,
      isSuccess: districtSuccess,
      isError: districtError,
      data: districtData,
      error: districtErrorMessage
    }
  ] = useCreateDistrictMutation()

  const { user: stateUser } = useSelector((state) => state.auth)
  const user = JSON.parse(localStorage.getItem('user'))

  const onSubmit = (data) => {
    createDistrict({
      name: data.name,
      department_id: user?.department_id || stateUser.department_id,
      level_id: 2,
      phone1: data.phone1,
      phone2: data.phone2,
      email: data.email,
      department: 'district'
    })
  }
  useEffect(() => {
    if (districtSuccess) {
      closeModal()
      toast.success('District created successfully') // Display success notification
    }
    if (districtError) {
      toast.error(districtErrorMessage) // Display error notification
    }
  }, [districtData, districtSuccess, districtError, districtErrorMessage])
  return (
    <div className="relative">
      <button
        onClick={openModal}
        className="flex items-center absolute right-6 top-4 justify-center px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg shadow-md ease-in-out duration-300 hover:scale-[]"
        type="button"
      >
        <BsFillHouseAddFill className="mr-2 text-lg" />
        Add New District
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
                Add New District
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label
                    htmlFor="fname"
                    className="block mb-2 text-sm font-medium text-black"
                  >
                    District Name
                  </label>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: 'District name is required' }}
                    render={({ field }) => (
                      <input
                        type="text"
                        {...field}
                        placeholder="District Name"
                        className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4 600 placeholder-gray-400 text-black"
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
                          className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4 600 placeholder-gray-400 text-black"
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
                          className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4 600 placeholder-gray-400 text-black"
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
                        message: 'Invalid email address'
                      }
                    }}
                    render={({ field }) => (
                      <input
                        type="email"
                        {...field}
                        placeholder="Email Address"
                        className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4 600 placeholder-gray-400 text-black"
                      />
                    )}
                  />
                  {errors.email && (
                    <span className="text-red-500">{errors.email.message}</span>
                  )}
                </div>
                <Controller
                  name="submit"
                  control={control}
                  render={() => {
                    return (
                      <Button
                        submit
                        value={
                          Districtoading ? <Loading /> : 'Add New District'
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

export default CreateDistrictModel
