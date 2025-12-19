import { useDispatch, useSelector } from 'react-redux'
import Modal from '../../components/models/Modal'
import { setMultiplePaymentModal } from '../../states/features/transactions/paymentSlice'
import { Controller, useForm } from 'react-hook-form'
import Input from '../../components/Input'
import { useEffect, useMemo, useState } from 'react'
import { monthsBetween } from '../../utils/Dates'
import Button from '../../components/Button'
import { useRecordMultiplePaymentsMutation, useGetHouseholdDepartmentServicesQuery } from '../../states/api/apiSlice'
import { toast } from 'react-toastify'
import Loading from '../../components/Loading'
import moment from 'moment'
import WaitingForPayment from '../../components/models/WaitingForPayment'

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

const RecordMultipleMonths = () => {
  // STATE VARIABLES
  const dispatch = useDispatch()
  const { multiplePaymentModal } = useSelector((state) => state.payment)
  const { household } = useSelector((state) => state.household)
  const { user } = useSelector((state) => state.auth)
  const [isWaitingCompletePayment, setIWaitingCompletePayment] = useState(false)
  const [waitingDetails, setWaitingDetails] = useState(null)
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [lastPaymentType, setLastPaymentType] = useState(null)

  const startWaiting = () => {
    setIWaitingCompletePayment(true)
  }

  const stopWaiting = () => {
    setIWaitingCompletePayment(false)
    setWaitingDetails(null)
  }
  // INITIATE RECORD MULTIPLE MONTHS FORM
  const [
    recordMultiplePayments,
    {
      data: recordMultiplePaymentsData,
      isLoading: recordMultiplePaymentsLoading,
      isSuccess: recordMultiplePaymentsSuccess,
      isError: recordMultiplePaymentsError,
    },
  ] = useRecordMultiplePaymentsMutation()

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm()

  // Load household services
  const { data: householdServicesData, isLoading: isLoadingServices } =
    useGetHouseholdDepartmentServicesQuery(
      { householdId: household?.id },
      { skip: !household?.id || !multiplePaymentModal }
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
        setValue('selected_service_id', serviceId.toString())
      }
    }
  }, [householdServices, selectedServiceId, setValue])

  // Calculate minimum allowed month (first day of next month)
  const minMonth = useMemo(() => {
    return moment().add(1, 'month').startOf('month').format('YYYY-MM')
  }, [])

  // Validation function to ensure month is in the future
  const validateFutureMonth = (value) => {
    if (!value) return 'Month is required'
    const selectedDate = moment(value, 'YYYY-MM')
    const nextMonth = moment().add(1, 'month').startOf('month')
    if (selectedDate.isBefore(nextMonth, 'month')) {
      return 'Only future months are allowed'
    }
    return true
  }

  // Validation function for end month to ensure it's not before start month
  const validateEndMonth = (value, formValues) => {
    const startMonth = formValues.start_month
    if (!startMonth) return true // Will be caught by required validation

    const startDate = moment(startMonth, 'YYYY-MM')
    const endDate = moment(value, 'YYYY-MM')

    if (endDate.isBefore(startDate, 'month')) {
      return 'End month must be after or equal to start month'
    }
    return validateFutureMonth(value)
  }

  // Handle service selection
  const handleServiceChange = (e) => {
    const serviceId = e.target.value
    setSelectedServiceId(serviceId)
    setValue('selected_service_id', serviceId)
  }

  // CALCULATE TOTAL AMOUNT
  useEffect(() => {
    const months = monthsBetween(watch('start_month'), watch('end_month'))
    const ubudehe = selectedService?.ubudehe || household?.ubudehe || 0
    setValue('total_month_paid', months?.length * ubudehe)
  }, [watch('start_month'), watch('end_month'), selectedService, household, setValue])

  const onSubmit = (data, type = 'ishyura') => {
    setLastPaymentType(type)
    recordMultiplePayments({
      household_id: household?.guid,
      start_month: data?.start_month,
      end_month: data?.end_month,
      payment_phone: data?.payment_phone,
      agent: user?.id,
      phone1: data?.phone1,
      lang: data?.lang,
      type: type === 'emeza' ? 'emeza' : 'ishyura',
      service_id: data?.selected_service_id || selectedServiceId || null,
      ubudehe: selectedService?.ubudehe || household?.ubudehe || null,
    })
  }

  const handleConfirm = () => {
    const totalAmount = watch('total_month_paid') || 0
    if (
      window.confirm(
        `Are you sure you want to initiate payment of ${totalAmount} RWF?`
      )
    ) {
      handleSubmit((data) => onSubmit(data, 'emeza'))()
    }
  }

  const handleIshyura = (e) => {
    e.preventDefault()
    const totalAmount = watch('total_month_paid') || 0
    if (
      window.confirm(
        `Are you sure you want to continue with payment of ${totalAmount} RWF?`
      )
    ) {
      handleSubmit((data) => onSubmit(data, 'ishyura'))()
    }
  }

  // HANDLE RECORD MULTIPLE MONTHS PAYMENT
  useEffect(() => {
    if (recordMultiplePaymentsSuccess) {
      toast.success('Multiple months recorded successfully.')
      
      if (lastPaymentType === 'emeza') {
        // Reload the page for emeza
        window.location.reload()
      } else {
        // Start waiting for ishyura
        startWaiting()
        setWaitingDetails(recordMultiplePaymentsData)
      }
    } else if (recordMultiplePaymentsError) {
      stopWaiting()
      toast.error('Could not record multiple months. Please try again later.')
    }
  }, [
    recordMultiplePaymentsSuccess,
    recordMultiplePaymentsError,
    recordMultiplePaymentsData,
    lastPaymentType,
  ])

  return (
    <Modal
      isOpen={multiplePaymentModal}
      onClose={() => {
        dispatch(setMultiplePaymentModal(false))
      }}
    >
      <h1 className="flex text-lg uppercase font-semibold text-primary px-4">
        Pay Advance
      </h1>
      {isWaitingCompletePayment ? (
        <>
          <WaitingForPayment onCancel={stopWaiting} details={waitingDetails} />
        </>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 items-center w-full p-4"
        >
          {householdServices.length > 0 && (
            <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
              Select Service
              <Controller
                name="selected_service_id"
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
                    className="p-2 outline-none border-[1px] rounded-md border-primary w-full focus:border-[1.5px] ease-in-out duration-150"
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
              {errors.selected_service_id && (
                <span className="text-red-500">
                  {errors.selected_service_id.message}
                </span>
              )}
              {selectedService?.ubudehe && (
                <p className="text-xs text-gray-500 mt-1">
                  Service ubudehe: {selectedService.ubudehe} RWF
                </p>
              )}
            </label>
          )}
          <span className="flex items-start gap-6 w-full">
            <Controller
              rules={{
                required: 'Start month is required',
                validate: validateFutureMonth,
              }}
              name="start_month"
              control={control}
              render={({ field }) => {
                return (
                  <label className="flex flex-col gap-1 items-start w-full">
                    <p>
                      Start Month <span className="text-red-600">*</span>
                    </p>
                    <Input type="month" min={minMonth} {...field} />
                    {errors.start_month && (
                      <span className="text-red-500">
                        {errors.start_month.message}
                      </span>
                    )}
                  </label>
                )
              }}
            />
            <Controller
              rules={{
                required: 'End month is required',
                validate: (value) => {
                  const startMonth = watch('start_month')
                  return validateEndMonth(value, { start_month: startMonth })
                },
              }}
              name="end_month"
              control={control}
              render={({ field }) => {
                return (
                  <label className="flex flex-col gap-1 items-start w-full">
                    <p>
                      End Month <span className="text-red-600">*</span>
                    </p>
                    <Input type="month" min={minMonth} {...field} />
                    {errors.end_month && (
                      <span className="text-red-500">
                        {errors.end_month.message}
                      </span>
                    )}
                  </label>
                )
              }}
            />
          </span>

          <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
            Numero iriho amafaranga
            <Controller
              name="payment_phone"
              control={control}
              defaultValue={household?.phone1}
              rules={{ required: 'Phone number required' }}
              render={({ field }) => (
                <Input
                  type="text"
                  {...field}
                  defaultValue={household?.phone1}
                  placeholder={household?.phone1}
                />
              )}
            />
            {errors.payment_phone && (
              <span className="text-red-500">
                {errors.payment_phone.message}
              </span>
            )}
          </label>
          <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
            Numero yakira message(SMS)
            <Controller
              name="phone1"
              control={control}
              defaultValue={household?.phone1}
              render={({ field }) => (
                <Input
                  readonly
                  type="text"
                  {...field}
                  placeholder="07XX XXX XXX"
                />
              )}
            />
            {errors.phone1 && (
              <span className="text-red-500">{errors.phone1.message}</span>
            )}
          </label>
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

          <Controller
            control={control}
            name="total_month_paid"
            defaultValue={watch('total_month_paid')}
            render={({ field }) => {
              return (
                <label className="flex flex-col gap-1 items-start w-full">
                  <p>
                    Amount paid <span className="text-red-600">*</span>
                  </p>
                  <Input
                    readonly
                    defaultValue={watch('total_month_paid')}
                    type="number"
                    {...field}
                  />
                </label>
              )
            }}
          />
          <div className="flex gap-4 w-full mt-2">
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={recordMultiplePaymentsLoading}
              className="!w-full !bg-blue-600 hover:!bg-blue-700 !text-white"
              value={
                recordMultiplePaymentsLoading ? (
                  <Loading />
                ) : (
                  `Emeza ${watch('total_month_paid') || 0} RWF`
                )
              }
            />
            <Button
              type="button"
              onClick={handleIshyura}
              disabled={recordMultiplePaymentsLoading}
              className="!w-full !bg-green-600 hover:!bg-green-700 !text-white"
              value={
                recordMultiplePaymentsLoading ? (
                  <Loading />
                ) : (
                  `Ishyura ${watch('total_month_paid') || 0} RWF`
                )
              }
            />
          </div>
        </form>
      )}
    </Modal>
  )
}

export default RecordMultipleMonths
