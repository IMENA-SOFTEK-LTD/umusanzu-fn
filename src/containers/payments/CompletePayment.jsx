import { useDispatch, useSelector } from 'react-redux'
import Modal from '../../components/models/Modal'
import { setCompletePaymentModal } from '../../states/features/modals/householdSlice'
import { Controller, useForm } from 'react-hook-form'
import Input from '../../components/Input'
import moment from 'moment'
import Button from '../../components/Button'
import { setPayment } from '../../states/features/transactions/paymentSlice'
import { useEffect } from 'react'
import { useCompletePendingPaymentMutation } from '../../states/api/apiSlice'
import Loading from '../../components/Loading'
import { toast } from 'react-toastify'

const CompletePayment = () => {
  // STATE VARIABLES
  const { completePaymentModal, household } = useSelector(
    (state) => state.household
  )
  const { payment } = useSelector((state) => state.payment)
  const dispatch = useDispatch()

  // COMPLETE PENDING PAYMENT
  const [
    completePendingPayment,
    {
      data: completePendingPaymentData,
      isLoading: completePendingPaymentLoading,
      isSuccess: completePendingPaymentSuccess,
      isError: completePendingPaymentError,
    },
  ] = useCompletePendingPaymentMutation()

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm()

  useEffect(() => {
    setValue('month_paid', moment(payment?.month_paid)?.format('YYYY-MM'))
  }, [payment, setValue])

  const onSubmit = (data) => {
    completePendingPayment({
      payment_phone: data?.payment_phone,
      id: payment?.id,
    })
  }

  // HANDLE COMPLETE PENDING PAYMENT
  useEffect(() => {
    if (completePendingPaymentSuccess) {
      dispatch(setCompletePaymentModal(false))
      dispatch(setPayment(completePendingPaymentData?.data?.payment))
      toast.success(
        'Payment completed successfully.'
      )
    } else if (completePendingPaymentError) {
      toast.error('Could not complete payment. Please try again later.')
    }
  }, [completePendingPaymentSuccess, completePendingPaymentError])

  return (
    <Modal
      isOpen={completePaymentModal}
      onClose={() => {
        dispatch(setCompletePaymentModal(false))
        dispatch(setPayment(null))
      }}
    >
      <h1 className="text-primary uppercase font-semibold">Complete payment</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-3 p-4"
      >
        <Controller
          name="month_paid"
          control={control}
          defaultValue={moment(payment?.month_paid)?.format('YYYY-MM')}
          rules={{ required: 'Paid month is required' }}
          render={({ field }) => (
            <label className="flex flex-col gap-2 w-full">
              <span className="text-[15px]">Ukwezi wishyura</span>
              <input
                id={payment?.id}
                className="text-sm border-[1.3px] mx-auto focus:outline-primary border-primary rounded-lg block w-full p-2 px-4"
                type="month"
                {...field}
              />
              {errors.month_paid && (
                <span className="text-red-500">
                  {errors.month_paid.message}
                </span>
              )}
            </label>
          )}
        />

        <label className="flex flex-col gap-2 items-start w-full">
          <p>Amafaranga wishyura</p>
          <Input
            type="number"
            readonly
            defaultValue={Number(payment?.remain_amount)}
            placeholder={payment?.remain_amount}
          />
        </label>

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
            <span className="text-red-500">{errors.payment_phone.message}</span>
          )}
        </label>

        <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
          <p>Numero yakira message</p>
          <Input
            readonly
            type="text"
            defaultValue={household?.phone1}
            placeholder={household?.phone1}
          />
        </label>
        <Button
          submit
          className="!w-full mt-3"
          value={
            completePendingPaymentLoading ? (
              <Loading />
            ) : (
              `Ishyura ${payment?.remain_amount} RWF`
            )
          }
        />
      </form>
    </Modal>
  )
}

export default CompletePayment
