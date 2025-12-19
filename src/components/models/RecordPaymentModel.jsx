import { useEffect, useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { toast } from 'react-toastify'
import { useForm, Controller, useWatch } from 'react-hook-form'
import Button from '../Button'
import Input from '../Input'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoneyBill, faX } from '@fortawesome/free-solid-svg-icons'
import moment from 'moment'
import {
  useCreatePaymentSessionMutation,
  useGetHouseholdDepartmentServicesQuery,
} from '../../states/api/apiSlice'
import Loading from '../Loading'
import WaitingForPayment from './WaitingForPayment'

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

function RecordPaymentModel({ household, showModal, setShowModal }) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm()

  const [selectedServiceId, setSelectedServiceId] = useState('')

  // Load household services
  const { data: householdServicesData, isLoading: isLoadingServices } =
    useGetHouseholdDepartmentServicesQuery(
      { householdId: household?.id },
      { skip: !household?.id || !showModal }
    )

  const householdServices = useMemo(
    () => normalizePayload(householdServicesData),
    [householdServicesData]
  )

  // Auto-select service if there's only one
  useEffect(() => {
    if (householdServices.length === 1 && !selectedServiceId) {
      const singleService = householdServices[0]
      const serviceId = singleService?.id ?? singleService?.ID
      if (serviceId) {
        setSelectedServiceId(serviceId.toString())
        setValue('selected_service_id', serviceId.toString())
        if (singleService?.ubudehe) {
          setValue('total_month_paid', singleService.ubudehe)
        }
      }
    }
  }, [householdServices, selectedServiceId, setValue])

  // Watch the total_month_paid field to display it in the button
  const totalMonthPaid = useWatch({
    control,
    name: 'total_month_paid',
    defaultValue: household?.ubudehe || 0,
  })

  // Get selected service's ubudehe for validation
  const selectedService = useMemo(() => {
    if (!selectedServiceId) return null
    return householdServices.find(
      (s) =>
        s?.id?.toString() === selectedServiceId ||
        s?.ID?.toString() === selectedServiceId
    )
  }, [selectedServiceId, householdServices])

  // Handle service selection
  const handleServiceChange = (e) => {
    const serviceId = e.target.value
    setSelectedServiceId(serviceId)
    setValue('selected_service_id', serviceId)

    if (serviceId) {
      const selectedService = householdServices.find(
        (s) =>
          s?.id?.toString() === serviceId || s?.ID?.toString() === serviceId
      )
      if (selectedService?.ubudehe) {
        setValue('total_month_paid', selectedService.ubudehe)
      }
    } else {
      // Reset to household ubudehe if no service selected
      setValue('total_month_paid', household?.ubudehe || 0)
    }
  }

  const [
    createPaymentSession,
    {
      data: paymentSessionData,
      isLoading: paymentSessionIsLoading,
      isError: paymentSessionIsError,
      isSuccess: paymentSessionIsSuccess,
    },
  ] = useCreatePaymentSessionMutation()

  const [isWaitingCompletePayment, setIWaitingCompletePayment] = useState(false)
  const [lastPaymentType, setLastPaymentType] = useState(null)

  const startWaiting = () => {
    setIWaitingCompletePayment(true)
  }

  const stopWaiting = () => {
    setIWaitingCompletePayment(false)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const onSubmit = (data, type) => {
    setLastPaymentType(type)
    createPaymentSession({
      household_id: household?.guid,
      month_paid: data?.month_paid,
      total_month_paid: data?.total_month_paid,
      payment_method: data?.payment_method,
      payment_phone: data?.payment_phone,
      lang: data?.lang,
      agent: household?.agents.id || 'N/A',
      merchant_code: household?.sectors[0].merchant_code || 'N/A',
      phone1: data?.payment_phone,
      type: type,
      service_id: selectedService?.serviceId || selectedServiceId || null,
      ubudehe: selectedService?.ubudehe || household?.ubudehe || null,
    })
  }

  const handleConfirm = () => {
    if (
      window.confirm(
        `Are you sure you want to initiate payment of ${
          totalMonthPaid || 0
        } RWF?`
      )
    ) {
      handleSubmit((data) => onSubmit(data, 'emeza'))()
    }
  }

  const handleIshyura = (e) => {
    e.preventDefault()
    if (
      window.confirm(
        `Are you sure you want to continue with payment of ${
          totalMonthPaid || 0
        } RWF?`
      )
    ) {
      handleSubmit((data) => onSubmit(data, 'ishyura'))()
    }
  }

  useEffect(() => {
    if (paymentSessionIsSuccess) {
      toast.success(
        paymentSessionData.message || 'Payment created successfully'
      )

      if (lastPaymentType === 'emeza') {
        // Reload the page for emeza
        window.location.reload()
      } else {
        // Start waiting for ishyura
        startWaiting()
      }
    }
    if (paymentSessionIsError) {
      stopWaiting()
      toast.error(
        'Could not create payment. Please check if all information is correct'
      )
    }
  }, [paymentSessionData, lastPaymentType])

  return (
    <main className="relative">
      {showModal && (
        <section
          tabIndex={-1}
          aria-hidden="true"
          className="fixed top-0 left-0 right-0 z-50 w-full h-screen p-4 flex items-center justify-center bg-gray-800 bg-opacity-60"
        >
          <div className="relative bg-white rounded-lg w-[500px] shadow md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] mx-auto">
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
                Record Transaction
              </h4>
            </article>
            {isWaitingCompletePayment ? (
              <>
                <WaitingForPayment onCancel={stopWaiting} />
              </>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4 items-center w-full p-4 md:px-6 lg:px-10"
              >
                <div className="w-full flex flex-col gap-2 items-center">
                  <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
                    Select month paid
                    <Controller
                      name="month_paid"
                      control={control}
                      defaultValue={moment().format('YYYY-MM')}
                      rules={{ required: 'Paid month is required' }}
                      render={({ field }) => <Input type="month" {...field} />}
                    />
                    {errors.month_paid && (
                      <span className="text-red-500">
                        {errors.month_paid.message}
                      </span>
                    )}
                  </label>
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
                              isLoadingServices ||
                              householdServices.length === 1
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
                    </label>
                  )}
                  <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
                    Amount Paid
                    <Controller
                      name="total_month_paid"
                      control={control}
                      defaultValue={household?.ubudehe}
                      rules={{
                        required: 'Amount is required',
                        validate: (value) => {
                          const amount = parseFloat(value) || 0

                          // Check if amount is less than or equal to zero
                          if (amount <= 0) {
                            return 'Amount must be greater than zero'
                          }

                          // Check if amount exceeds service ubudehe
                          if (selectedService?.ubudehe) {
                            const serviceUbudehe =
                              parseFloat(selectedService.ubudehe) || 0
                            if (amount > serviceUbudehe) {
                              return `Amount cannot exceed service ubudehe (${serviceUbudehe})`
                            }
                          }

                          return true
                        },
                      }}
                      render={({ field }) => (
                        <Input type="number" {...field} placeholder="1000" />
                      )}
                    />
                    {errors.total_month_paid && (
                      <span className="text-red-500">
                        {errors.total_month_paid.message}
                      </span>
                    )}
                    {selectedService?.ubudehe && (
                      <p className="text-xs text-gray-500 mt-1">
                        Service ubudehe: {selectedService.ubudehe} RWF
                      </p>
                    )}
                  </label>
                </div>
                <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
                  Numero iriho amafaranga
                  <Controller
                    name="payment_phone"
                    control={control}
                    defaultValue={household?.phone1}
                    rules={{ required: 'Please enter the phone number' }}
                    render={({ field }) => (
                      <Input type="text" {...field} placeholder="07XXXXXXXX" />
                    )}
                  />
                  {errors.payment_phone && (
                    <span className="text-red-500">
                      {errors.payment_phone.message}
                    </span>
                  )}
                </label>
                {/* <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
                  Choose payment option
                  <Controller
                    name="payment_method"
                    control={control}
                    disabled={true}
                    rules={{
                      required: 'Payment option is required',
                    }}
                    defaultValue={'MOMO'}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="p-2 outline-none border-[1px] rounded-md border-primary w-full focus:border-[1.5px] ease-in-out duration-150"
                      >
                        <option value="MOMO">MTN Mobile Money</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="Airtel">Airtel Money</option>
                      </select>
                    )}
                  />
                  {errors.payment_method && (
                    <span className="text-red-500">
                      {errors.payment_method.message}
                    </span>
                  )}
                </label> */}
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
                <div className="flex gap-4 w-full mt-2">
                  <Button
                    type="button"
                    onClick={handleConfirm}
                    disabled={paymentSessionIsLoading}
                    className="!w-full !bg-blue-600 hover:!bg-blue-700 !text-white"
                    value={
                      paymentSessionIsLoading ? (
                        <>
                          <Loading /> Pay
                        </>
                      ) : (
                        `Emeza ${totalMonthPaid || 0} RWF`
                      )
                    }
                  />
                  <Button
                    type="button"
                    onClick={handleIshyura}
                    disabled={paymentSessionIsLoading}
                    className="!w-full !bg-green-600 hover:!bg-green-700 !text-white"
                    value={
                      paymentSessionIsLoading ? (
                        <>
                          <Loading /> Pay
                        </>
                      ) : (
                        `Ishyura ${totalMonthPaid || 0} RWF`
                      )
                    }
                  />
                </div>
              </form>
            )}
          </div>
        </section>
      )}
    </main>
  )
}

RecordPaymentModel.propTypes = {
  household: PropTypes.shape({}),
  showModal: PropTypes.bool,
  setShowModal: PropTypes.func,
}

export default RecordPaymentModel
