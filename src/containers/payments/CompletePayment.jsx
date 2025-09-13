import { useDispatch, useSelector } from 'react-redux'
import Modal from '../../components/models/Modal'
import { setCompletePaymentModal } from '../../states/features/modals/householdSlice'
import { Controller, useForm } from 'react-hook-form'
import Input from '../../components/Input'
import moment from 'moment'
import Button from '../../components/Button'
import { setPayment } from '../../states/features/transactions/paymentSlice'
import { useEffect, useState } from 'react'
import { useCompletePendingPaymentMutation } from '../../states/api/apiSlice'
import Loading from '../../components/Loading'
import { toast } from 'react-toastify'
import WaitingForPayment from '../../components/models/WaitingForPayment'

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

  const [isWaitingCompletePayment, setIWaitingCompletePayment] = useState(false)

  const startWaiting = () => {
    setIWaitingCompletePayment(true)
  }

  const stopWaiting = () => {
    setIWaitingCompletePayment(false)
  }

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
    if (Number(data?.total_month_paid) <= 0) {
      toast.error('The amount to be paid must be greater than zero.')
      return
    }
    if (Number(data?.total_month_paid) > Number(payment?.remain_amount)) {
      toast.error(
        'The amount to be paid cannot be greater than the remaining amount.'
      )
      return
    }
    // console.log({
    //   total_month_paid: data?.total_month_paid,
    //   payment_method: data?.payment_method,
    //   payment_phone: data?.payment_phone,
    //   lang: data?.lang,
    //   id: payment?.id,
    //   status: payment.status,
    // })
    completePendingPayment({
      total_month_paid: data?.total_month_paid,
      payment_method: data?.payment_method,
      payment_phone: data?.payment_phone,
      lang: data?.lang,
      id: payment?.id,
      status: payment.status,
       phone1: data?.payment_phone,
    })
  }

  // HANDLE COMPLETE PENDING PAYMENT

  useEffect(() => {
    if (completePendingPaymentSuccess) {
      startWaiting()
      toast.success(
        completePendingPaymentData.message || 'Payment created successfully'
      )
    }
    if (completePendingPaymentError) {
      stopWaiting()
      toast.error(
        'Could not create payment. Please check if all information is correct'
      )
    }
  }, [completePendingPaymentData])

  return (
    <Modal
      isOpen={completePaymentModal}
      onClose={() => {
        dispatch(setCompletePaymentModal(false))
        dispatch(setPayment(null))
      }}
    >
      <h1 className="text-primary uppercase font-semibold">Complete payment</h1>
      {isWaitingCompletePayment ? (
        <>
          <WaitingForPayment onCancel={stopWaiting} />
        </>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3 p-4"
        >
          <Controller
            name="month_paid"
            control={control}
            readonly
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

            <Controller
              name="total_month_paid"
              control={control}
              defaultValue={payment?.remain_amount}
              rules={{ required: 'Amount is required' }}
              render={({ field }) => (
                <Input
                  type="number"
                  {...field}
                  defaultValue={payment?.remain_amount}
                  placeholder={payment?.remain_amount}
                />
              )}
            />
            {errors.total_month_paid && (
              <span className="text-red-500">
                {errors.total_month_paid.message}
              </span>
            )}
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
              <span className="text-red-500">
                {errors.payment_phone.message}
              </span>
            )}
          </label>
          {/* 
        <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
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
      )}
    </Modal>
  )
}

export default CompletePayment
