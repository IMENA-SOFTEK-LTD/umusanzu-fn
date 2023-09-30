import { useForm, Controller } from 'react-hook-form'
import Button from '../Button'
import Input from '../Input'
import {
  useCompleteInitiatedPaymentsMutation,
  useLazyGetInitiatedTransactionsQuery,
} from '../../states/api/apiSlice'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import Loading from '../Loading'

export const CompleteInitiatedPaymentsForm = ({ user }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm()

  const [totalAmount, setTotalAmount] = useState(0)

  const [
    getInitiatedTransactions,
    {
      data: initiatedTransactionsData,
      isLoading: initiatedTransactionsLoading,
      isError: initiatedTransactionsError,
      isSuccess: initiatedTransactionsSuccess,
    },
  ] = useLazyGetInitiatedTransactionsQuery()

  const [
    completeInitiatedPayments,
    {
      data: completeInitiatedPaymentsData,
      isLoading: completeInitiatedPaymentsLoading,
      isError: completeInitiatedPaymentsError,
      isSuccess: completeInitiatedPaymentsSuccess,
    },
  ] = useCompleteInitiatedPaymentsMutation()

  useEffect(() => {
    getInitiatedTransactions({
      staffId: user?.id,
    })
  }, [])

  useEffect(() => {
    if (initiatedTransactionsSuccess) {
      setValue('total_month_paid', initiatedTransactionsData?.totalAmount)
      setTotalAmount(initiatedTransactionsData?.totalAmount)
    }
  }, [initiatedTransactionsData])

  const onSubmit = (data) => {
    completeInitiatedPayments({
      staffId: user?.id,
      payment_phone: data?.payment_phone,
      totalAmount: data?.total_month_paid,
    })
  }

  useEffect(() => {
    if (completeInitiatedPaymentsSuccess) {
      toast.success('Completed payments successfully')
    }
    if (completeInitiatedPaymentsError) {
      toast.error('Could not complete payment. Refresh and try again')
    }
  }, [completeInitiatedPaymentsData])

  if (initiatedTransactionsError) {
    return (
      <main className="min-h-[80vh] flex flex-col items-center justify-center gap-6">
        <h1 className="text-[20px] uppercase font-semibold">
          You have completed all initiated transactions
        </h1>
        <Button value="Go to dashboard" route="/dashboard" />
      </main>
    )
  }

  return (
    <main className="fixed top-0 left-0 right-0 z-50 w-full h-screen p-4 flex items-center justify-center bg-gray-800 bg-opacity-60">
      <div className="relative bg-white rounded-lg shadow max-w-[600px]">
        <article className="bg-primary relative rounded-sm flex flex-row-reverse items-center justify-center py-4 px-4">
          <h4 className="text-[20px] text-center font-medium uppercase text-white">
            Complete Initiated payment
          </h4>
        </article>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 items-center w-full min-w-[30rem] p-6 pl-10"
        >
          <div className="w-full flex flex-col gap-2 items-center">
            <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
              Total Amount
              <Controller
                name="total_month_paid"
                control={control}
                defaultValue={totalAmount}
                render={({ field }) => {
                  return (
                    <input
                      readOnly
                      type="number"
                      {...field}
                      className="text-sm border-[1.3px] mx-auto focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                    />
                  )
                }}
              />
            </label>
          </div>
          <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
            Numero iriho amafaranga
            <Controller
              name="payment_phone"
              control={control}
              defaultValue={user?.phone1}
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
          <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
            Choose payment option
            <Controller
              name="payment_method"
              control={control}
              rules={{
                required: 'Payment option is required',
              }}
              defaultValue={'MOMO'}
              render={({ field }) => (
                <select
                  {...field}
                  className="p-2 outline-none border-[1px] rounded-md border-primary w-[100%] focus:border-[1.5px] ease-in-out duration-150"
                >
                  <option value="MTN">Choose payment</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="MOMO">MTN Mobile Money</option>
                  <option value="Airtel">Airtel Money</option>
                </select>
              )}
            />
            {errors.payment_method && (
              <span className="text-red-500">
                {errors.payment_method.message}
              </span>
            )}
          </label>
          <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
            Numero yakira message
            <Controller
              name="phone1"
              defaultValue={user?.phone1}
              control={control}
              render={({ field }) => (
                <Input
                  readonly
                  type="text"
                  {...field}
                  placeholder="0785767647"
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
                  className="p-2 outline-none border-[1px] rounded-md border-primary w-[100%] focus:border-[1.5px] ease-in-out duration-150"
                >
                  <option value="rw">Kinyarwanda</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              )}
            />
          </label>
          <article className="hidden">
            <p className="hidden">Payment created successfully</p>
            <p className="hidden">
              Could not create payment. Please check if all information is
              correct
            </p>
          </article>
          <Controller
            name="submit"
            control={control}
            render={() => {
              return (
                <Button
                  className="w-fit"
                  submit
                  value={
                    completeInitiatedPaymentsLoading ? <Loading /> : 'Pay now'
                  }
                />
              )
            }}
          />
        </form>
      </div>
    </main>
  )
}
