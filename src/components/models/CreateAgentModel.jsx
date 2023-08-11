import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { BsFillHouseAddFill } from 'react-icons/bs'
import { useForm, Controller } from 'react-hook-form'
import Button from '../Button'
import Loading from '../Loading'
import { toast } from 'react-toastify'
import {
  useCreateAgentMutation,
  useLazyGetSectorVillagesQuery,
} from '../../states/api/apiSlice'

const CreateAgentModel = () => {
  const [showModal, setShowModal] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm()

  const [
    getSectorVillages,
    {
      data: sectoVillages,
      isLoading: sectorVillagesLoading,
      isSuccess: sectorVillagesSuccess,
      isError: sectorVillagesIsError,
      error: sectorVillagesError,
    },
  ] = useLazyGetSectorVillagesQuery()

  const [
    createAgent,
    {
      data: agentData,
      isLoading: agentLoading,
      isSuccess: agentSuccess,
      isError: agentError,
    },
  ] = useCreateAgentMutation()

  const openModal = () => {
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const onSubmit = (data) => {
    if (data.phone2 === undefined || data.phone2 === null) {
      setValue('phone2', '')
    }

    createAgent({
      names: data?.names,
      username: data?.username,
      nid: data?.nid,
      password: data?.password,
      email: data?.email,
      department_id: data?.department_id,
      staff_role: data?.staff_role,
      phone1: data?.phone1,
      phone2: data?.phone2,
    })
  }

  const { user: stateUser } = useSelector((state) => state.auth)
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    getSectorVillages({
      id: stateUser?.departments?.id || user?.departments?.id,
    })
  }, [])

  useEffect(() => {
    if (agentSuccess || agentError) {
      if (agentSuccess) {
        closeModal()
        toast.success('Agent created successfully')
      }
      if (agentError) {
        toast.error('Failed to create agent')
      }
    }
  }, [agentData, agentSuccess, agentError])

  return (
    <div className="relative">
      <button
        onClick={openModal}
        className="flex items-center absolute right-6 top-4 justify-center px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg shadow-md ease-in-out duration-300 hover:scale-[]"
        type="button"
      >
        <BsFillHouseAddFill className="mr-2 text-lg" />
        Add New Agent
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
                Add New Agent
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label
                      htmlFor="agentName"
                      className="block mb-2 text-sm font-medium text-black"
                    >
                      Agent Name
                    </label>
                    <Controller
                      name="names"
                      control={control}
                      rules={{ required: 'Agent Name is required' }}
                      render={({ field }) => (
                        <input
                          type="text"
                          {...field}
                          placeholder="Agent Name"
                          className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                        />
                      )}
                    />
                    {errors.agentName && (
                      <span className="text-red-500 text-[12px]">
                        {errors.names.message}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="adminUsername"
                      className="block mb-2 text-sm font-medium text-black"
                    >
                      Username
                    </label>
                    <Controller
                      name="username"
                      control={control}
                      rules={{ required: 'Username is required' }}
                      render={({ field }) => (
                        <input
                          type="text"
                          {...field}
                          placeholder="Username"
                          className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                        />
                      )}
                    />
                    {errors.adminUsername && (
                      <span className="text-red-500 text-[12px]">
                        {errors.username.message}
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
                    render={({ field }) => (
                      <input
                        type="text"
                        {...field}
                        placeholder="National ID(NID)"
                        className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                      />
                    )}
                  />
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
                    <span className="text-red-500 text-[12px]">
                      {errors.email.message}
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
                          placeholder="Phone Number 1"
                          className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                        />
                      )}
                    />
                    {errors.phone1 && (
                      <span className="text-red-500 text-[12px]">
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
                      render={({ field }) => (
                        <input
                          type="text"
                          required={false}
                          {...field}
                          placeholder="Phone Number 2"
                          className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                        />
                      )}
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="amount"
                    className="block mb-2 text-sm font-medium text-black"
                  >
                    Choose Village
                  </label>
                  <Controller
                    name="department_id"
                    control={control}
                    rules={{ required: 'Amount is required' }}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                      >
                        <option value="" disabled>
                          {sectorVillagesLoading
                            ? 'Loading...'
                            : 'Select your village'}
                        </option>
                        {sectorVillagesLoading ? (
                          <option disabled>Loading...</option>
                        ) : sectorVillagesIsError ? (
                          <option disabled>Could not load villages</option>
                        ) : (
                          sectoVillages?.data?.map((village, index) => {
                            return (
                              <option
                                selected={index === 0}
                                key={village.id}
                                value={Number(village.id)}
                              >
                                {village.name}
                              </option>
                            )
                          })
                        )}
                      </select>
                    )}
                  />
                  {errors.amount && (
                    <span className="text-red-500 text-[12px]">
                      {errors.amount.message}
                    </span>
                  )}
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
                      <span className="text-red-500 text-[12px]">
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
                        required: 'Repeat entered password',
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
                      <span className="text-red-500 text-[12px]">
                        {errors.confirmPassword.message}
                      </span>
                    )}
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
                          sectorVillagesLoading ? <Loading /> : 'Add New Agent'
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

export default CreateAgentModel
