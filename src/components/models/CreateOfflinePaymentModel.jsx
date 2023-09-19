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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faGlobe,
  faMoneyBill1Wave,
  faX,
} from '@fortawesome/free-solid-svg-icons'
import moment from 'moment/moment'

const CreateOfflinePaymentModel = ({ householdData, householdDepartments }) => {
  const { id } = useParams()
  const [showModal, setShowModal] = useState(false)
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

  const onSubmit = (formData) => {
    recordOfflinePayment({
      service: formData.service,
      amount: formData.amount,
      month_paid: formData.month_paid,
      agent: householdData?.transactions[0]?.agents?.id,
      sms_phone: formData.sms_phone,
      sector: householdDepartments?.sector,
      household: {
        guid: householdData?.guid,
        ubudehe: householdData?.ubudehe,
        phone1: householdData?.phone1,
        name: householdData?.name
      },
    })
  }
  useEffect(() => {
    if (recordOfflinePaymentSuccess) {
      closeModal()
      toast.success('Payment initiated successfully. Thank you')
    }
    if (recordOfflinePaymentEror) {
      toast.error('An error occurred while inititating payment. Please try again')
    }
  }, [
    recordOfflinePaymentData,
    recordOfflinePaymentSuccess,
    recordOfflinePaymentEror,
  ])

  return (
    <div className="relative">
      <Button
        value={
          <span className="flex items-center gap-2">
            <FontAwesomeIcon icon={faGlobe} />
            Record offline payment
          </span>
        }
        onClick={(e) => {
          e.preventDefault()
          openModal()
        }}
      />

      {showModal && (
        <div
          tabIndex={-1}
          aria-hidden="true"
          className="fixed top-0 left-0 right-0 z-50 w-full h-screen p-4 flex items-center justify-center bg-gray-800 bg-opacity-60"
        >
          <div className="relative bg-white rounded-lg shadow">
            <article className="bg-primary relative rounded-sm flex flex-row-reverse items-center justify-center py-4 px-4">
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  closeModal()
                }}
                className="absolute right-4 top-4 !px-0 !py-0"
                value={
                  <FontAwesomeIcon
                    icon={faX}
                    className="bg-white text-primary hover:bg-white hover:text-primary p-2 px-[10px] rounded-md"
                  />
                }
              />
              <h4 className="text-[20px] text-center font-medium uppercase text-white">
                Record Offline Payment
              </h4>
            </article>
            <div className="px-6 py-6 lg:px-8">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6 min-w-[30rem]"
              >
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
                      defaultValue={moment().format('YYYY-MM')}
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
                    defaultValue={householdData?.ubudehe}
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
                    name="phone1"
                    control={control}
                    rules={{ required: "Please enter phone number" }}
                    defaultValue={householdData?.phone1}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="tel"
                        placeholder="07XX XXX XXX"
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
                    SMS Phone
                  </label>
                  <Controller
                    name="sms_phone"
                    control={control}
                    defaultValue={householdData?.phone1}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="tel"
                        placeholder="07XX XXX XXX"
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
