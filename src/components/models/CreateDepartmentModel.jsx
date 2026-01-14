import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Button from '../Button'
import { useCreateDepartmentMutation } from '../../states/api/apiSlice'
import { Alert } from '@material-tailwind/react'
import { useState } from 'react'

const CreateDepartmentModel = ({
  showModal,
  setShowModal,
  department,
  departmentId,
  levelId,
  title,
  enableReload,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const [isCreatingLoading, setIsCreatingLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const closeModal = () => {
    setShowModal(false)
  }

  const [createDepartment] = useCreateDepartmentMutation()

  const onSubmit = async (data) => {
    setIsCreatingLoading(true)
    setErrorMessage('')
    try {
      await createDepartment({
        name: data.departmentName,
        department_id: departmentId,
        level_id: levelId || 6,
        phone1: data.phone1,
        phone2: data.phone2,
        email: data.email,
        merchant_code: null,// data.merchant_code,

        department: department.toLowerCase() || 'village',
      })
        .unwrap()
        .then((res) => {
          if (enableReload) {
            toast.success(department + ' created successfully')
            setTimeout(() => {
              window.location.reload()
            }, 1200)
          } else {
            setShowModal(false)
            toast.success(department + ' created successfully')
          }
        })
        .catch((error) => {
          // console.error(error)
          if (error.data && error.data.message) {
            setErrorMessage(error.data.message)
            onCreateAdmin({
              isSuccess: false,
              data: null,
              message: error.data.message,
            })
          } else {
            const message =
              'An error occurred while updating the Admin Status. Please try again'
            setErrorMessage(message)
          }
        })
        .finally(() => {
          setIsCreatingLoading(false)
        })
    } catch (error) {
      return error
    }
  }

  return (
    <>
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
                {title} {department}
              </h3>
            </div>
            <div className="px-6 py-6 lg:px-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label
                    htmlFor="departmentName"
                    className="block mb-2 text-sm font-medium text-black"
                  >
                    {department} Name
                  </label>
                  <Controller
                    name="departmentName"
                    control={control}
                    rules={{ required: department + ' name is required' }}
                    render={({ field }) => (
                      <input
                        type="text"
                        {...field}
                        placeholder={department + ' Name'}
                        className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                      />
                    )}
                  />
                  {errors.departmentName && (
                    <span className="text-red-500">
                      {errors.departmentName.message}
                    </span>
                  )}
                </div>

                {/* <div>
                  <label
                    htmlFor="merchant_code"
                    className="block mb-2 text-sm font-medium text-black"
                  >
                    Merchant code
                  </label>
                  <Controller
                    name="merchant_code"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="text"
                        {...field}
                        placeholder="Merchant code"
                        className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                      />
                    )}
                  />
                </div> */}

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
                <Alert
                  color="red"
                  open={errorMessage}
                  onClose={() => setErrorMessage('')}
                >
                  {errorMessage}
                </Alert>
                <Controller
                  name="submit"
                  control={control}
                  render={() => {
                    return (
                      <Button
                        fullWidth
                        submit
                        material
                        loading={isCreatingLoading}
                        value={'Add New ' + department}
                      />
                    )
                  }}
                />
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
export default CreateDepartmentModel
