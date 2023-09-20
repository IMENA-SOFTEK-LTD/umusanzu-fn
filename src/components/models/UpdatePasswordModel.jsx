import { useState } from 'react'
import Button from '../Button'
import { FaPenNib } from 'react-icons/fa'
import { useUpdatePasswordMutation } from '../../states/api/apiSlice'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { Controller, useForm } from 'react-hook-form'
import PropTypes from 'prop-types'
import Loading from '../Loading'

function UpdatePasswordModel({ user }) {
  const { user: stateUser } = useSelector((state) => state.auth)
  const [isLoading, setIsLoading] = useState(false)
  const [updatePassword] = useUpdatePasswordMutation()

  const [showModal, setShowModal] = useState(false)

  const {
    handleSubmit,
    watch,
    register,
    control,
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
      await updatePassword({
        id: user?.id || stateUser?.id,
        departmentId: user?.department_id || stateUser?.department_id,
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        retypePassword: data.retypePassword
      })
        .unwrap()
        .then(() => {
          toast.success('Password updated successfully')
        })

        .catch((error) => {
          console.error(error)
          if (error.data && error.data.message) {
            toast.error(error.data.message)
          } else {
            toast.error('Error updating password')
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
    <div>
      <button
        onClick={openModal}
        className="flex mb-3 items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-amber-600 rounded-lg shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300 ml-4 "
        type="button"
      >
        <FaPenNib className="mr-2 text-lg" />
        Update Password
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
                Update Your Passord
              </h3>
            </div>
            <div className="px-8 py-6 lg:px-8 flex flex-col gap-4">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-6 w-full min-w-[300px]"
              >
                <div>
                  <label
                    htmlFor="OldPassword"
                    className="block mb-2 text-sm font-medium text-black"
                  >
                    Old Password
                  </label>
                  <input
                    type="password"
                    placeholder="Old password"
                    {...register('oldPassword', { required: true })}
                    className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                  />
                  {errors.oldPassword && (
                    <span className="text-red-500">
                      {errors.oldPassword.message}
                    </span>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="NewPassword"
                    className="block mb-2 text-sm font-medium text-black"
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="New Password"
                    {...register('newPassword', { required: true })}
                    className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                  />
                  {errors.newPassword && (
                    <span className="text-red-500">
                      {errors.newPassword.message}
                    </span>
                  )}
                </div>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label
                      htmlFor="RetypePassword"
                      className="block mb-2 text-sm font-medium text-black"
                    >
                      Confirm Password
                    </label>
                    <Controller
                      name="retypePassword"
                      control={control}
                      rules={{
                        required: 'Repeat entered password',
                        validate: (value) =>
                          value === watch('newPassword') ||
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
                    {errors.retypePassword && (
                      <span className="text-red-500">
                        {errors.retypePassword.message}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  submit
                  name="Submit"
                  value={isLoading ? <Loading /> : 'Update Password'}
                />
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

UpdatePasswordModel.propTypes = {
  user: PropTypes.shape({
    password: PropTypes.string,
    id: PropTypes.number,
    department_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  })
}

export default UpdatePasswordModel
