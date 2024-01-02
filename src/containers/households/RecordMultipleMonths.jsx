import { useDispatch, useSelector } from 'react-redux'
import Modal from '../../components/models/Modal'
import { setMultiplePaymentModal } from '../../states/features/transactions/paymentSlice'
import { Controller, useForm } from 'react-hook-form'
import Input from '../../components/Input'
import { useEffect } from 'react'
import { monthsBetween } from '../../utils/Dates'
import Button from '../../components/Button'
import { useRecordMultiplePaymentsMutation } from '../../states/api/apiSlice'
import { toast } from 'react-toastify'
import Loading from '../../components/Loading'

const RecordMultipleMonths = () => {
  // STATE VARIABLES
  const dispatch = useDispatch()
  const { multiplePaymentModal } = useSelector((state) => state.payment)
  const { household } = useSelector((state) => state.household)
  const { user } = useSelector((state) => state.auth)

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

  // CALCULATE TOTAL AMOUNT
  useEffect(() => {
    const months = monthsBetween(watch('start_month'), watch('end_month'))
    setValue('total_month_paid', months?.length * household?.ubudehe)
  }, [watch('start_month'), watch('end_month')])

  const onSubmit = (data) => {
    recordMultiplePayments({
      household_id: household?.guid,
      start_month: data?.start_month,
      end_month: data?.end_month,
      payment_phone: data?.payment_phone,
      agent: user?.id,
    })
  }

  // HANDLE RECORD MULTIPLE MONTHS PAYMENT
  useEffect(() => {
    if (recordMultiplePaymentsSuccess) {
      toast.success('Multiple months recorded successfully.')
      dispatch(setMultiplePaymentModal(false))
    } else if (recordMultiplePaymentsError) {
      toast.error('Could not record multiple months. Please try again later.')
    }
  }, [recordMultiplePaymentsSuccess, recordMultiplePaymentsData])

  return (
    <Modal
      isOpen={multiplePaymentModal}
      onClose={() => {
        dispatch(setMultiplePaymentModal(false))
      }}
    >
      <h1 className="flex text-lg uppercase font-semibold text-primary px-4">
        Record multiple months
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 items-center w-full p-4"
      >
        <span className="flex items-start gap-6 w-full">
          <Controller
            rules={{ required: 'Start month is required' }}
            name="start_month"
            control={control}
            render={({ field }) => {
              return (
                <label className="flex flex-col gap-1 items-start w-full">
                  <p>
                    Start Month <span className="text-red-600">*</span>
                  </p>
                  <Input type="month" {...field} />
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
            rules={{ required: 'End month is required' }}
            name="end_month"
            control={control}
            render={({ field }) => {
              return (
                <label className="flex flex-col gap-1 items-start w-full">
                  <p>
                    End Month <span className="text-red-600">*</span>
                  </p>
                  <Input type="month" {...field} />
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
        <Controller
          name="payment_phone"
          control={control}
          rules={{ required: 'Phone number is required' }}
          defaultValue={household?.phone1}
          render={({ field }) => {
            return (
              <label className="flex flex-col gap-1 items-start w-full">
                <p>
                  Phone number <span className="text-red-600">*</span>
                </p>
                <Input type="tel" defaultValue={household?.phone1} {...field} />
                {errors.payment_phone && (
                  <span className="text-red-500">
                    {errors.payment_phone.message}
                  </span>
                )}
              </label>
            )
          }}
        />
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
        <Button
          submit
          value={
            recordMultiplePaymentsLoading ? (
              <Loading />
            ) : (
              `Pay ${watch('total_month_paid')} RWF`
            )
          }
        />
      </form>
    </Modal>
  )
}

export default RecordMultipleMonths
