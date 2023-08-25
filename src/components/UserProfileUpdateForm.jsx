import { useState, useEffect } from 'react'
import { FaPenNib } from 'react-icons/fa'
import { useForm } from 'react-hook-form'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import Button from '../components/Button'
import { useUpdateUserProfileMutation } from '../states/api/apiSlice'
import Loading from './Loading'
import { toast } from 'react-toastify'

function UserProfileUpdateForm({ user, userProfile }) {
  const { user: stateUser } = useSelector((state) => state.auth)
  const [isLoading, setIsLoading] = useState(false)
  const [updateUserProfile] = useUpdateUserProfileMutation()

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
    case 6:
      department = 'agent'
      break
    default:
      department = 'agent'
  }

  const [showModal, setShowModal] = useState(false)
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    defaultValues: {
      names: userProfile.names,
      username: userProfile.username,
      phone1: userProfile.phone1,
      phone2: userProfile.phone2,
      email: userProfile.email,
    },
  })

  const openModal = () => {
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const onSubmit = async (values) => {
    setIsLoading(true)

    try {
      await updateUserProfile({
        id: user.id,
        route: department,
        departmentId: user?.department_id || stateUser?.department_id,
        names: values.names,
        email: values.email,
        phone1: values.phone1,
        phone2: values.phone2,
        username: values.username,
      })
        .unwrap()
        .then(() => {
          toast.success('Profile updated successfully!')
          closeModal()
        })
        .catch((error) => {
          console.error(error)
          if (error.data && error.data.message) {
            toast.error(error.data.message)
          } else {
            toast.error(
              'An error occurred while updating the profile. Please try again'
            )
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
        className="flex mb-3 items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300"
        type="button"
      >
        <FaPenNib className="mr-2 text-lg" />
        Edit Profile
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
                Update Your Profile
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label
                    htmlFor="names"
                    className="block mb-2 text-sm font-medium text-black"
                  >
                    Names
                  </label>
                  <input
                    type="text"
                    defaultValue={userProfile?.names}
                    {...register('names', { required: true })}
                    placeholder="Names"
                    className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                  />
                  {errors.names && (
                    <span className="text-red-500">{errors.names.message}</span>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="username"
                    className="block mb-2 text-sm font-medium text-black"
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    defaultValue={userProfile?.username}
                    {...register('username', { required: true })}
                    placeholder="Username"
                    className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                  />

                  {errors.username && (
                    <span className="text-red-500">
                      {errors.username.message}
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
                    <input
                      type="text"
                      defaultValue={userProfile?.phone1}
                      placeholder="Phone Number"
                      {...register('phone1', { required: true })}
                      className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
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
                    <input
                      type="text"
                      defaultValue={userProfile?.phone2}
                      {...register('phone2', { required: true })}
                      placeholder="Phone Number"
                      className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
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
                  <input
                    type="email"
                    defaultValue={userProfile?.email}
                    {...register('email', { required: true })}
                    placeholder="Email Address"
                    className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                  />
                  {errors.email && (
                    <span className="text-red-500">{errors.email.message}</span>
                  )}
                </div>
                <Button
                  submit
                  name="submit"
                  value={isLoading ? <Loading /> : 'Edit profile'}
                />
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
UserProfileUpdateForm.propTypes = {
  user: PropTypes.shape({
    names: PropTypes.string,
    phone1: PropTypes.string,
    phone2: PropTypes.string,
    email: PropTypes.string,
    department_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
}

export default UserProfileUpdateForm
