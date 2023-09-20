import { useEffect, useState } from 'react'
import { BsPersonAdd } from 'react-icons/bs'
import { useForm, Controller } from 'react-hook-form'
import Button from '../Button'
import Loading from '../Loading'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import PropTypes from 'prop-types'
import { useCreateAdminMutation } from '../../states/api/apiSlice'

function CreateAdminModel({ user }) {
  const { user: stateUser } = useSelector((state) => state.auth)
  const [isLoading, setIsLoading] = useState(false)
  const [createAdmin] = useCreateAdminMutation()

  let department = ''

  switch (user?.departments?.level_id || stateUser?.departments?.level_id) {
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
    default:
      department = 'sector'
  }

  const [showModal, setShowModal] = useState(false)
  const {
    control,
    watch,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const openModal = () => {
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const onSubmit = async (data) => {
    setIsLoading(true)

    try {
      await createAdmin({
        route: department,
        departmentId: user.department_id,
        levelId: user.departments.level_id,
        names: data.names,
        username: data.username,
        password: data.password,
        phone1: data.phone1,
        email: data.email,
        phone2: data.phone2,
        nid: data.nid,
        staff_role: 1,
        department_id: user.department_id,
        status: 'ACTIVE'
      })
        .unwrap()
        .then(() => {
          toast.success('Admin created successfully')
          closeModal()
        })
        .catch((error) => {
          console.error(error)
          if (error.data && error.data.message) {
            toast.error(error.data.message)
          } else {
            toast.error('Error while creating Admin')
          }
        })

        .finally(() => {
          setIsLoading(false)
        })
    } catch (error) {
      return error
    }
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
                Add New Admin
              </h3>
            </div>
            <div className="px-6 py-6 lg:px-8">
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
                      name="names"
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
                      name="username"
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
                        message: 'Invalid email address'
                      }
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
                          'Passwords do not match'
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
                <Button
                  submit
                  name="submit"
                  value={isLoading ? <Loading /> : 'Create Admin'}
                />
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

CreateAdminModel.propTypes = {
  user: PropTypes.shape({
    names: PropTypes.string,
    phone1: PropTypes.string,
    phone2: PropTypes.string,
    email: PropTypes.string,
    department_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    departmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string,
    password: PropTypes.string,
    nid: PropTypes.string,
    staff_role: PropTypes.number
  })
}

export default CreateAdminModel
