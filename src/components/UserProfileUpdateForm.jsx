import { useState, useEffect } from 'react'
import { FaPenNib } from 'react-icons/fa'
import { useForm, Controller, set } from 'react-hook-form'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { useUpdateUserProfileMutation, useLazyGetUserProfileQuery } from '../states/api/apiSlice'
import Loading from './Loading'

 function UserProfileUpdateForm({ user }) {
  const { user: stateUser } = useSelector((state) => state.auth)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [
    updateUserProfile
  ] = useUpdateUserProfileMutation()
  const [getUserProfile, ] =
    useLazyGetUserProfileQuery()

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

  useEffect(() => {
    if (user || stateUser) {
      // Fetch user profile data here and set it in the form fields
      const userId = user?.id || stateUser?.id
      getUserProfile({
        id: userId,
        departmentId: user?.department_id || stateUser?.department_id,
      })
    }
  }, [user, stateUser, getUserProfile])

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
    setErrorMessage('');
    setSuccessMessage('');
    setShowModal(false)
  }

  const onSubmit = async (values) => {
    setIsLoading(true);

  try{
    await updateUserProfile({
      id: user.id,
      route: department,
      departmentId: user?.department_id || stateUser?.department_id,
      names: values.names,
      email: values.email,
      phone1: values.phone1,
      phone2: values.phone2,
      username: values.username,
    }).unwrap()
    .then(() => {
      setErrorMessage('');        
      setSuccessMessage('Profile updated successfully!');             
      setTimeout(() => {
        setIsLoading(false);
        closeModal();
      }, 1200);
    })
    .catch((error) => {     
        console.error(error);
        if (error.data && error.data.message) {
          setTimeout(() => {
          setIsLoading(false);
          setErrorMessage(error.data.message);
          }, 1200);
        } else {
          setIsLoading(false);
          setErrorMessage('An error occurred while updating the profile.');
        }

      });
  }
  catch (error) {
    console.log(error)
  }
}

  return (
    <div>
      <button
        onClick={openModal}
        className="flex mb-3 items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-700 to-blue-800 rounded-lg shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300"
        type="button"
      >
        <FaPenNib className="mr-2 text-lg" />
        Edit
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
                Update Your Profile
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
             
                <div>
                {successMessage && (<span className="success-message text-green-500">{successMessage}</span>)}
                {errorMessage && <span className="error-message text-red-500">{errorMessage}</span>}
                
                  <label
                    htmlFor="names"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Names
                  </label>
                  <Controller
                    name="names"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="text"
                        defaultValue={field.value}
                        onChange={field.onChange}
                        {...field}
                        placeholder="Names"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                      />
                    )}
                  />
                  {errors.names && (
                    <span className="text-red-500">{errors.names.message}</span>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="username"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Username
                  </label>
                  <Controller
                    name="username"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="text"
                        {...field}
                        defaultValue={field.value}
                        onChange={field.onChange}
                        placeholder="Username"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                      />
                    )}
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
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Phone 1 No.
                    </label>
                    <Controller
                      name="phone1"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="text"
                          placeholder="Phone Number"
                          defaultValue={field.value}
                        onChange={field.onChange}
                          {...field}
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
                      render={({ field }) => (
                        <input
                          type="text"
                          {...field}
                          defaultValue={field.value}
                        onChange={field.onChange}
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
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email address',
                      },
                    }}
                    render={({ field }) => (
                      <input
                        type="email"
                        defaultValue={field.value}
                        onChange={field.onChange}
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
                  disabled={isLoading}
                  className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  {isLoading ? <Loading /> : 'Edit profile'}
                </button>
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
    department_id:  PropTypes.oneOfType([PropTypes.string, PropTypes.number]),   

  }),
}

export default UserProfileUpdateForm
