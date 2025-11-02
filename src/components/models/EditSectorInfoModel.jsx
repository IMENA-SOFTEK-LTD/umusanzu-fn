import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import Button from '../Button'
import { useSelector } from 'react-redux'
import Loading from './../Loading'
import { BiSolidEditAlt } from 'react-icons/bi'
import PropTypes from 'prop-types'
import { useLazyGetDepartmentProfileQuery, useUpdateDepartmentProfileMutation } from '../../states/api/apiSlice'
import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons'

function EditSectorInfoModel({ user ,onUpdateSectorInfo}) {
  const { user: stateUser } = useSelector((state) => state.auth)
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [departmentData, setDepartmentData] = useState(null)

  const [updateDepartmentProfile] = useUpdateDepartmentProfileMutation()

  const [getDepartmentProfile, { data, isLoadingData, isError, isSuccess }] =
    useLazyGetDepartmentProfileQuery()

  const {
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm({
    defaultValues: {
      merchant_code: '',
      email: '',
      phone1: '',
      phone2: '',
      account_bank: '',
      account_name: '',
      service_offer: '',
      leader_name: '',
      leader_title: '',
    },
  })

  useEffect(() => {
    getDepartmentProfile({
      id: user.department_id || stateUser?.department_id,
    })
  }, [])

  useEffect(() => {
    if (isSuccess && data?.data) {
      setDepartmentData(data.data)
    }
  }, [data, isSuccess])

  // Separate useEffect to reset form when data is available
  useEffect(() => {
    if (departmentData && reset) {
      reset({
        merchant_code: departmentData.department_infos?.[0]?.merchant_code || '',
        email: departmentData.email || '',
        phone1: departmentData.phone1 || '',
        phone2: departmentData.phone2 || '',
        account_bank: departmentData.department_infos?.[0]?.account_bank || '',
        account_name: departmentData.department_infos?.[0]?.account_name || '',
        service_offer: departmentData.department_infos?.[0]?.service_offer || '',
        leader_name: departmentData.department_infos?.[0]?.leader_name || '',
        leader_title: departmentData.department_infos?.[0]?.leader_title || '',
      })
    }
  }, [departmentData, reset])

  const openModal = () => {
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const onSubmit = async (values) => {
    setIsLoading(true)

    try {
      await updateDepartmentProfile({
        id: user.department_id || stateUser?.department_id,
        merchant_code: values.merchant_code,
        email: values.email,
        phone1: values.phone1,
        phone2: values.phone2,
        account_bank: values.account_bank,
        account_name: values.account_name,
        service_offer: values.service_offer,
        leader_name: values.leader_name,
        leader_title: values.leader_title,
      })
        .unwrap()
        .then(() => {
          toast.success('Sector Info Updated Successfully')
          closeModal()
        })
        .catch((error) => {
          console.error(error)
          if (error.data && error.data.message) {
            toast.error(error.data.message)
          } else {
            toast.error('An error occurred while updating department profile')
          }
        })
        .finally(() => {
          setIsLoading(false)

          onUpdateSectorInfo(true)
        })
    } catch (error) {
      return error
    }
  }

  return (
    <div className="relative">
      {parseInt(user?.staff_role) === 1 && (
      <Button
        value={
          <span className="flex items-center gap-2">
            <FontAwesomeIcon icon={faPenToSquare} />
            Edit department profile
          </span>
        }
        onClick={openModal}
      />
      )}
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
              <div className="flex items-center justify-center gap-5">
                <span className="text-3xl">
                  <BiSolidEditAlt
                    className="
                                    text-white
                                    
                                    "
                  />
                </span>
                <h3 className="mb-4 mt-2 text-xl text-center font-medium text-white">
                  Edit Sector Info
                </h3>
              </div>
            </div>
            <div className="px-6 py-6 lg:px-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label
                      htmlFor="service_offer"
                      className="block mb-2 text-sm font-medium text-black"
                    >
                      Service
                    </label>
                    <Controller
                      name="service_offer"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="text"
                          {...field}
                          placeholder="Umutekano"
                          className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                        />
                      )}
                    />

                    {errors.service_offer && (
                      <span className="text-red-500">
                        {errors.service_offer.message}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="leader_name"
                      className="block mb-2 text-sm font-medium text-black"
                    >
                      Representative Names
                    </label>

                    <Controller
                      name="leader_name"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="text"
                          {...field}
                          placeholder="Representative Names"
                          className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                        />
                      )}
                    />

                    {errors.leader_name && (
                      <span className="text-red-500">
                        {errors.leader_name.message}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="leader_title"
                    className="block mb-2 text-sm font-medium text-black"
                  >
                    Representative Position
                  </label>
                  <Controller
                    name="leader_title"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="text"
                        {...field}
                        placeholder="Representative Position"
                        className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                      />
                    )}
                  />

                  {errors.leader_title && (
                    <span className="text-red-500">
                      {errors.leader_title.message}
                    </span>
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
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
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
                      htmlFor="account_bank"
                      className="block mb-2 text-sm font-medium text-black"
                    >
                      Bank Account Number
                    </label>
                    <Controller
                      name="account_bank"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="text"
                          {...field}
                          placeholder="Bank Account "
                          className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                        />
                      )}
                    />

                    {errors.account_bank && (
                      <span className="text-red-500">
                        {errors.account_bank.message}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="account_name"
                      className="block mb-2 text-sm font-medium text-black"
                    >
                      Bank Account Name
                    </label>

                    <Controller
                      name="account_name"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="text"
                          {...field}
                          placeholder="Bank Account Name"
                          className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                        />
                      )}
                    />

                    {errors.account_name && (
                      <span className="text-red-500">
                        {errors.account_name.message}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  submit
                  name="submit"
                  value={isLoading ? <Loading /> : 'Edit Department profile'}
                />
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

EditSectorInfoModel.propTypes = {
    user: PropTypes.shape({
        department_id: PropTypes.number
    })
}
export default EditSectorInfoModel