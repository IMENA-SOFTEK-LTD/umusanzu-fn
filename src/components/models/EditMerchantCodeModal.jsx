import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import Button from '../Button'
import Loading from './../Loading'
import PropTypes from 'prop-types'
import {
  useLazyGetDepartmentProfileQuery,
  useUpdateDepartmentCodesMutation,
} from '../../states/api/apiSlice'
import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog } from '@fortawesome/free-solid-svg-icons'
import DepartmentServicesManager from './DepartmentServicesManager'

function EditMerchantCodeModal({ department, isOpen, onClose, onUpdate }) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('codes')

  const [updateDepartmentCodes] = useUpdateDepartmentCodesMutation()

  const [getDepartmentProfile, { data, isSuccess }] =
    useLazyGetDepartmentProfileQuery()

  const {
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm({
    defaultValues: {
      merchant_code: department?.merchant_code || '',
      bk_service_code: department?.bk_service_code || '',
    },
  })

  useEffect(() => {
    if (isOpen && department?.ID) {
      getDepartmentProfile({
        id: department.ID,
      })
    }
  }, [isOpen, department?.ID, getDepartmentProfile])

  useEffect(() => {
    if (isSuccess && data?.data) {
      // Reset form with the loaded data
      reset({
        merchant_code: data.data.merchant_code || '',
        bk_service_code: data.data.bk_service_code || '',
      })
    }
  }, [data, isSuccess, reset])

  const onSubmit = async (values) => {
    setIsLoading(true)

    try {
      await updateDepartmentCodes({
        id: department.ID,
        merchant_code: values.merchant_code,
        bk_service_code: values.bk_service_code,
      })
        .unwrap()
        .then(() => {
          toast.success(
            'Merchant Code and BK Service Code Updated Successfully'
          )
          onUpdate && onUpdate()
          onClose()
        })
        .catch((error) => {
          console.error(error)
          if (error.data && error.data.message) {
            toast.error(error.data.message)
          } else {
            toast.error('An error occurred while updating codes')
          }
        })
        .finally(() => {
          setIsLoading(false)
        })
    } catch (error) {
      setIsLoading(false)
      return error
    }
  }

  if (!isOpen) return null

  return (
    <div
      tabIndex={-1}
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-50 w-full h-screen p-4 flex items-center justify-center bg-gray-800 bg-opacity-60"
    >
      <div className="relative bg-white rounded-lg shadow max-w-lg w-full">
        <div className="bg-primary rounded-t-lg p-3">
          <button
            onClick={onClose}
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
              <FontAwesomeIcon icon={faCog} className="text-white" />
            </span>
            <h3 className="mb-4 mt-2 text-xl text-center font-medium text-white">
              Edit {department.name} {department.level} Settings
            </h3>
          </div>
        </div>
        <div className="px-6 pt-4 lg:px-8">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab('codes')}
              className={`px-4 py-2 text-sm font-medium rounded-t-md ${
                activeTab === 'codes'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Edit codes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('services')}
              className={`px-4 py-2 text-sm font-medium rounded-t-md ${
                activeTab === 'services'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Assign services
            </button>
          </div>
        </div>

        <div className="px-6 py-6 lg:px-8">
          {activeTab === 'codes' && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label
                  htmlFor="merchant_code"
                  className="block mb-2 text-sm font-medium text-black"
                >
                  Merchant Code <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="merchant_code"
                  control={control}
                  rules={{
                    required: 'Merchant code is required',
                  }}
                  render={({ field }) => (
                    <input
                      type="text"
                      {...field}
                      placeholder="Enter merchant code"
                      className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                    />
                  )}
                />
                {errors.merchant_code && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.merchant_code.message}
                  </span>
                )}
              </div>

              <div>
                <label
                  htmlFor="bk_service_code"
                  className="block mb-2 text-sm font-medium text-black"
                >
                  BK Service Code <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="bk_service_code"
                  control={control}
                  rules={{
                    required: 'BK service code is required',
                  }}
                  render={({ field }) => (
                    <input
                      type="text"
                      {...field}
                      placeholder="Enter BK service code"
                      className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                    />
                  )}
                />
                {errors.bk_service_code && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.bk_service_code.message}
                  </span>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  name="cancel"
                  value="Cancel"
                  onClick={onClose}
                  className="flex-1 bg-gray-500 hover:bg-gray-600"
                />
                <Button
                  submit
                  name="submit"
                  value={isLoading ? <Loading /> : 'Update Codes'}
                  className="flex-1"
                />
              </div>
            </form>
          )}

          {activeTab === 'services' && (
            <DepartmentServicesManager
              departmentId={department?.ID}
              onChanged={() => {
                onUpdate && onUpdate()
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

EditMerchantCodeModal.propTypes = {
  department: PropTypes.shape({
    ID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func,
}

export default EditMerchantCodeModal
