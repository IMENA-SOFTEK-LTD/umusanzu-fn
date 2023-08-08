import { useState, useEffect } from 'react'
import { BsFillHouseAddFill } from 'react-icons/bs'
import { useForm, Controller } from 'react-hook-form'
import { useCreateCellMutation } from '../../states/api/apiSlice'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Loading from '../../components/Loading'

import { useSelector } from 'react-redux'
const CreateCellModel = () => {
  const [showModal, setShowModal] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const openModal = () => {
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const [
    createCell,
    {
      isLoading: celLoading,
      isSuccess: celSuccess,
      isError: celError,
      data: celData,
      error: celErrorMessage,
    },
  ] = useCreateCellMutation()
  const { user: stateUser } = useSelector((state) => state.auth)
  const user = JSON.parse(localStorage.getItem('user'))

  const onSubmit = (data) => {
    console.log(data, user?.department_id || stateUser.department_id)
    createCell({
      name: data.name,
      department_id: user?.department_id || stateUser.department_id,
      level_id: 4,
      phone1: data.phone1,
      phone2: data.phone2,
      email: data.email,
      department: 'cell',
    })
  }

  useEffect(() => {
    if (celSuccess) {
      closeModal()
      toast.success('Cell created successfully')
    }
    if (celError) {
      toast.error('An error occurred while creating the cell')
    }
  }, [celData, celSuccess, celError])

  return (
    <div>
      <button
        onClick={openModal}
        className="flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-700 to-blue-800 rounded-lg shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300"
        type="button"
      >
        <BsFillHouseAddFill className="mr-2 text-lg" />
        Add New Cell
      </button>

      {showModal && (
        <div
          tabIndex={-1}
          aria-hidden="true"
          className="fixed top-0 left-0 right-0 z-50 w-full h-screen p-4 flex items-center justify-center bg-gray-800 bg-opacity-60"
        >
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <button
              onClick={closeModal}
              type="button"
              className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
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
              <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">
                Add New Cell
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label
                    htmlFor="fname"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Cell Name
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
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
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
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
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
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
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
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
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
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
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
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
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
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                      />
                    )}
                  />
                  {errors.email && (
                    <span className="text-red-500">{errors.email.message}</span>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  {' '}
                  {celLoading ? <Loading /> : 'Add New Cell'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateCellModel
