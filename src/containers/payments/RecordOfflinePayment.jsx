import PropTypes from 'prop-types'
import Modal from '../../components/models/Modal'
import { useDispatch, useSelector } from 'react-redux'
import {
  setOfflinePaymentModal,
  setPayment,
} from '../../states/features/transactions/paymentSlice'
import { Controller, useForm, useWatch } from 'react-hook-form'
import moment from 'moment'
import Button from '../../components/Button'
import Loading from '../../components/Loading'
import { useEffect, useState, useMemo } from 'react'
import {
  useRecordOfflinePaymentMutation,
  useGetHouseholdDepartmentServicesQuery,
} from '../../states/api/apiSlice'
import { toast } from 'react-toastify'

function normalizePayload(payload) {
  const root = payload?.data ?? payload
  if (Array.isArray(root)) return root
  if (Array.isArray(root?.rows)) return root.rows
  if (Array.isArray(root?.services)) return root.services
  if (Array.isArray(root?.data)) return root.data
  return []
}

function getServiceLabel(item) {
  const service = item?.department_service?.service ?? item?.service ?? item
  return (
    service?.title ??
    service?.title_english ??
    service?.title_french ??
    service?.name ??
    `Service #${item?.id ?? ''}`
  )
}

const RecordOfflinePayment = ({ household }) => {
  // STATE VARIABLES
  const dispatch = useDispatch()
  const { offlinePaymentModal } = useSelector((state) => state.payment)
  const { user } = useSelector((state) => state.auth)

  const [selectedServiceId, setSelectedServiceId] = useState('')

  // REACT HOOK FORM
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm()

  // Load household services
  const { data: householdServicesData, isLoading: isLoadingServices } =
    useGetHouseholdDepartmentServicesQuery(
      { householdId: household?.id },
      { skip: !household?.id || !offlinePaymentModal }
    )

  const householdServices = useMemo(
    () => normalizePayload(householdServicesData),
    [householdServicesData]
  )

  // Get selected service's ubudehe for validation
  const selectedService = useMemo(() => {
    if (!selectedServiceId) return null
    return householdServices.find(
      (s) =>
        s?.id?.toString() === selectedServiceId ||
        s?.ID?.toString() === selectedServiceId
    )
  }, [selectedServiceId, householdServices])

  // Auto-select service if there's only one
  useEffect(() => {
    if (householdServices.length === 1 && !selectedServiceId) {
      const singleService = householdServices[0]
      const serviceId = singleService?.id ?? singleService?.ID
      if (serviceId) {
        setSelectedServiceId(serviceId.toString())
        setValue('service', serviceId.toString())
        if (singleService?.ubudehe) {
          setValue('amount', singleService.ubudehe)
        }
      }
    }
  }, [householdServices, selectedServiceId, setValue])

  // INITIATE RECORD OFFLINE PAYMENT
  const [
    recordOfflinePayment,
    {
      isLoading: recordOfflinePaymentLoading,
      isSuccess: recordOfflinePaymentSuccess,
      isError: recordOfflinePaymentError,
      data: recordOfflinePaymentData,
    },
  ] = useRecordOfflinePaymentMutation()

  // Watch the amount field
  // const amount = useWatch({
  //   control,
  //   name: 'amount',
  //   defaultValue: household?.ubudehe || 0,
  // })

  // UPDATE DEFAULT VALUES
  useEffect(() => {
    setValue('phone1', household?.phone1)
    setValue('sms_phone', household?.phone1)
    if (!selectedService?.ubudehe) {
      setValue('amount', household?.ubudehe)
    }
  }, [household, selectedService])

  // Handle service selection
  const handleServiceChange = (e) => {
    const serviceId = e.target.value
    setSelectedServiceId(serviceId)
    setValue('service', serviceId)

    if (serviceId) {
      const selectedService = householdServices.find(
        (s) =>
          s?.id?.toString() === serviceId || s?.ID?.toString() === serviceId
      )
      if (selectedService?.ubudehe) {
        setValue('amount', selectedService.ubudehe)
      }
    } else {
      // Reset to household ubudehe if no service selected
      setValue('amount', household?.ubudehe || 0)
    }
  }

  // HANDLE SUBMIT
  const onSubmit = (data) => {
    recordOfflinePayment({
      service: selectedService?.serviceId || selectedServiceId || null,
      amount: data?.amount,
      household_id: household?.guid,
      month_paid: data?.month_paid,
      sms_phone: data?.sms_phone,
      agent: user?.id,
      phone1: data?.phone1,
      ubudehe: selectedService?.ubudehe,
      lang: data?.lang,
    })
  }

  // HANDLE RECORD OFFLINE PAYMENT
  useEffect(() => {
    if (recordOfflinePaymentSuccess) {
      dispatch(setOfflinePaymentModal(false))
      toast.success('Payment recorded successfully.')
      dispatch(setPayment(recordOfflinePaymentData?.data?.offlinePayment))
      window.location.reload()
    } else if (recordOfflinePaymentError) {
      toast.error('Could not record payment. Please try again later.')
    }
  }, [recordOfflinePaymentSuccess, recordOfflinePaymentData])

  return (
    <Modal
      isOpen={offlinePaymentModal}
      onClose={() => {
        dispatch(setOfflinePaymentModal(false))
      }}
    >
      <h1 className="text-lg px-4 uppercase text-primary font-semibold">
        Record Cash Payment
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 items-center w-full p-4"
      >
        <div className="flex space-x-4 w-full">
          {householdServices.length > 0 && (
            <div className="flex-1 w-full">
              <label
                htmlFor="service"
                className="block mb-2 text-sm font-medium text-black"
              >
                Service
              </label>
              <Controller
                name="service"
                control={control}
                rules={{
                  required:
                    householdServices.length > 0
                      ? 'Service selection is required'
                      : false,
                }}
                render={({ field }) => (
                  <select
                    {...field}
                    value={selectedServiceId}
                    onChange={(e) => {
                      field.onChange(e)
                      handleServiceChange(e)
                    }}
                    className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                    disabled={
                      isLoadingServices || householdServices.length === 1
                    }
                  >
                    <option value="">
                      {isLoadingServices
                        ? 'Loading services...'
                        : householdServices.length === 1
                        ? 'Auto-selected'
                        : 'Select a service'}
                    </option>
                    {householdServices.map((service) => {
                      const serviceId = service?.id ?? service?.ID
                     
                      return (
                        <option
                          key={serviceId ?? JSON.stringify(service)}
                          value={serviceId?.toString() ?? ''}
                        >
                          {getServiceLabel(service)} - Ubudehe:{' '}
                          {service?.ubudehe || 'N/A'}
                        </option>
                      )
                    })}
                  </select>
                )}
              />
              {errors.service && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.service.message}
                </span>
              )}
              {selectedService?.ubudehe && (
                <p className="text-xs text-gray-500 mt-1">
                  Service ubudehe: {selectedService.ubudehe} RWF
                </p>
              )}
            </div>
          )}
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
        <div className="w-full">
          <label
            htmlFor="amount"
            className="block mb-2 text-sm font-medium text-black"
          >
            Amount
          </label>
          <Controller
            name="amount"
            control={control}
            defaultValue={household?.ubudehe}
            rules={{
              required: 'Amount is required',
              validate: (value) => {
                const amountValue = parseFloat(value) || 0

                // Check if amount is less than or equal to zero
                if (amountValue <= 0) {
                  return 'Amount must be greater than zero'
                }

                // Check if amount exceeds service ubudehe
                if (selectedService?.ubudehe) {
                  const serviceUbudehe =
                    parseFloat(selectedService.ubudehe) || 0
                  if (amountValue > serviceUbudehe) {
                    return `Amount cannot exceed service ubudehe (${serviceUbudehe})`
                  }
                }

                return true
              },
            }}
            render={({ field }) => (
              <input
                {...field}
                type="number"
                className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
              />
            )}
          />
          {errors.amount && (
            <span className="text-red-500 text-sm mt-1">
              {errors.amount.message}
            </span>
          )}
          {selectedService?.ubudehe && (
            <p className="text-xs text-gray-500 mt-1">
              Service ubudehe: {selectedService.ubudehe} RWF
            </p>
          )}
        </div>

        <div className="w-full">
          <label
            htmlFor="phone"
            className="block mb-2 text-sm font-medium text-black"
          >
            Phone Number
          </label>
          <Controller
            name="phone1"
            control={control}
            rules={{ required: 'Please enter phone number' }}
            defaultValue={household?.phone1}
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
        <div className="w-full">
          <label
            htmlFor="phone"
            className="block mb-2 text-sm font-medium text-black"
          >
            SMS Phone
          </label>
          <Controller
            name="sms_phone"
            control={control}
            defaultValue={household?.phone1}
            render={({ field }) => (
              <input
                {...field}
                type="tel"
                // readOnly
                placeholder="07XX XXX XXX"
                className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
              />
            )}
          />
        </div>
        <div className="w-full">
          <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
            Choose SMS Language
            <Controller
              name="lang"
              control={control}
              defaultValue={'rw'}
              render={({ field }) => (
                <select
                  {...field}
                  className="p-2 outline-none border-[1px] rounded-md border-primary w-full focus:border-[1.5px] ease-in-out duration-150"
                >
                  <option value="rw">Kinyarwanda</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              )}
            />
          </label>
        </div>
        <Controller
          name="submit"
          control={control}
          render={() => {
            return (
              <Button
                submit
                value={recordOfflinePaymentLoading ? <Loading /> : 'Pay now'}
              />
            )
          }}
        />
      </form>
    </Modal>
  )
}

RecordOfflinePayment.propTypes = {
  household: PropTypes.shape({}),
}

export default RecordOfflinePayment
