import { AiFillPlusCircle } from 'react-icons/ai'
import { useForm, Controller } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import Button from '../Button'
import Loading from '../Loading'
import {
  useLazyGetHouseHoldDetailsQuery,
  useRecordOfflinePaymentMutation,
} from '../../states/api/apiSlice'
import { useParams } from 'react-router-dom'
const CreateOfflinePaymentModel = () => {
  const { id } = useParams()
  const [showModal, setShowModal] = useState(false)
  const [
    GetHouseHoldDetails,
    {
      data: houseHoldDetailsData,
      isLoading: houseHoldDetailsLoading,
      isSuccess: houseHoldDetailsSuccess,
      isError: houseHoldDetailsError,
      error: houseHoldError,
    },
  ] = useLazyGetHouseHoldDetailsQuery()
  const [
    recordOfflinePayment,
    {
      isLoading: recordOfflinePaymentLoading,
      isSuccess: recordOfflinePaymentSuccess,
      isError: recordOfflinePaymentError,
      error: recordOfflinePaymentEror,
      data: recordOfflinePaymentData,
    },
  ] = useRecordOfflinePaymentMutation()

  const [data, setData] = useState(houseHoldDetailsData?.data || [])
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
  useEffect(() => {
    if (houseHoldDetailsSuccess) {
      setData(houseHoldDetailsData?.data || [])
    }
  }, [houseHoldDetailsSuccess, houseHoldDetailsData])

  useEffect(() => {
    GetHouseHoldDetails({ id })
  }, [GetHouseHoldDetails])
  const onSubmit = (formData) => {
    recordOfflinePayment({
      service: formData.service,
      amount: formData.amount,
      month_paid: formData.month_paid,
      agent: data?.transactions[0]?.agents?.id,
      household: {
        guid: data.guid,
        ubudehe: data.ubudehe,
        phone1: data.phone1,
      },
    })
  }
  useEffect(() => {
    if (recordOfflinePaymentSuccess) {
      closeModal()
      toast.success('Village created successfully')
    }
    if (recordOfflinePaymentEror) {
      toast.error('An error occurred while creating the village')
    }
  }, [
    recordOfflinePaymentData,
    recordOfflinePaymentSuccess,
    recordOfflinePaymentEror,
  ])

  return (
    <div className="relative">
      <button
        onClick={openModal}
        className="flex items-center absolute right-6 top-4 justify-center px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg shadow-md ease-in-out duration-300 hover:scale-[]"
        type="button"
      >
        <AiFillPlusCircle className="mr-2 text-lg" />
        Record offline payment
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
              <h3 className="mb-4 text-xl text-center font-medium text-white">
                Record Offline Payment
              </h3>
            </div>
            <div className="px-6 py-6 lg:px-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 min-w-[30rem]">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label
                      htmlFor="service"
                      className="block mb-2 text-sm font-medium text-black"
                    >
                      Service
                    </label>
                    <Controller
                      name="service"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                        >
                          <option value={1}>Umutekano</option>
                        </select>
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="month_paid"
                      className="block mb-2 text-sm font-medium text-black"
                    >
                      Month Paid
                    </label>
                    <Controller
                      name="month_paid"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                          }}
                          type="month"
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
                    Amount
                  </label>
                  <Controller
                    name="amount"
                    control={control}
                    defaultValue={houseHoldDetailsData?.data?.ubudehe}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                      />
                    )}
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block mb-2 text-sm font-medium text-black"
                  >
                    Phone Number
                  </label>
                  <Controller
                    name="phone"
                    control={control}
                    defaultValue={houseHoldDetailsData?.data?.phone1}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="tel"
                        placeholder="0785767647"
                        className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                      />
                    )}
                  />
                </div>
                <Controller
                  name="submit"
                  control={control}
                  render={() => {
                    return (
                      <Button
                        submit
                        value={
                          recordOfflinePaymentLoading ? <Loading /> : 'Pay now'
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

export default CreateOfflinePaymentModel
