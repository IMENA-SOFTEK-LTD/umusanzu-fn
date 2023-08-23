import { useState } from 'react'
import { BsPersonAdd } from 'react-icons/bs'
import { useForm, Controller } from 'react-hook-form'
import Button from '../Button'

function CreateAdminModel() {
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

  const onSubmit = (data) => {
    closeModal()
  }

  return (
    <div className="relative">
      <button
        onClick={openModal}
        className="flex items-center absolute right-6 top-4 justify-center px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg shadow-md ease-in-out duration-300 hover:scale-[]"
        type="button"
      >
        <BsPersonAdd className="mr-2 text-lg" />
        Create Admin
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
                Add New Admin
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label
                      htmlFor="adminName"
                      className="block mb-2 text-sm font-medium text-black"
                    >
                      admin Name
                    </label>
                    <Controller
                      name="adminName"
                      control={control}
                      rules={{ required: 'admin Name is required' }}
                      render={({ field }) => (
                        <input
                          type="text"
                          {...field}
                          placeholder="admin Name"
                          className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                        />
                      )}
                    />
                    {errors.adminName && (
                      <span className="text-red-500">
                        {errors.adminName.message}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="adminUsername"
                      className="block mb-2 text-sm font-medium text-black"
                    >
                      Admin Username
                    </label>
                    <Controller
                      name="adminUsername"
                      control={control}
                      rules={{ required: 'Admin Username is required' }}
                      render={({ field }) => (
                        <input
                          type="text"
                          {...field}
                          placeholder="Admin Username"
                          className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                        />
                      )}
                    />
                    {errors.adminUsername && (
                      <span className="text-red-500">
                        {errors.adminUsername.message}
                      </span>
                    )}
                  </div>
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
                        placeholder="National ID(NID)"
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
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label
                      htmlFor="password"
                      className="block mb-2 text-sm font-medium text-black"
                    >
                      Password
                    </label>
                    <Controller
                      name="password"
                      control={control}
                      rules={{ required: 'Password is required' }}
                      render={({ field }) => (
                        <input
                          type="password"
                          {...field}
                          placeholder="Password"
                          className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                        />
                      )}
                    />
                    {errors.password && (
                      <span className="text-red-500">
                        {errors.password.message}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="confirmPassword"
                      className="block mb-2 text-sm font-medium text-black"
                    >
                      Confirm Password
                    </label>
                    <Controller
                      name="confirmPassword"
                      control={control}
                      rules={{
                        required: 'Confirm Password is required',
                        validate: (value) =>
                          value === watch('password') ||
                          'Passwords do not match',
                      }}
                      render={({ field }) => (
                        <input
                          type="password"
                          {...field}
                          placeholder="Confirm Password"
                          className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                        />
                      )}
                    />
                    {errors.confirmPassword && (
                      <span className="text-red-500">
                        {errors.confirmPassword.message}
                      </span>
                    )}
                  </div>
                </div>
                <Controller
                  name="submit"
                  control={control}
                  render={({ field }) => {
                    return <Button submit value="Add New Admin" />
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

export default CreateAdminModel
