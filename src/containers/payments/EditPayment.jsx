import { useDispatch, useSelector } from 'react-redux'
import Modal from '../../components/models/Modal'
import { setEditPaymentModal, setPayment } from '../../states/features/transactions/paymentSlice'
import { Controller, useForm } from 'react-hook-form'
import Input from '../../components/Input'
import { useEffect } from 'react'
import moment from 'moment'
import Select from '../../components/Select'
import Button from '../../components/Button'
import { useEditPaymentMutation } from '../../states/api/apiSlice'
import { toast } from 'react-toastify'
import Loading from '../../components/Loading'

const EditPayment = () => {
  // STATE VARIABLES
  const dispatch = useDispatch()
  const { editPaymentModal, payment } = useSelector((state) => state.payment)
  const { user } = useSelector((state) => state.auth)

  // INITIATE EDIT PAYMENT REQUEST
  const [editPayment, {
    isLoading: editPaymentIsLoading,
    isSuccess: editPaymentIsSuccess,
    isError: editPaymentIsError,
    data: editPaymentData,
  }] = useEditPaymentMutation()

  // REACT HOOK FORM
  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
  } = useForm()

  useEffect(() => {
    setValue('month_paid', moment(payment?.month_paid)?.format('YYYY-MM'))
    setValue('amount', payment?.amount)
  }, [payment, setValue])

  // HANDLE FORM SUBMISSION
  const onSubmit = (data) => {
    editPayment({
      id: payment?.id,
      month_paid: moment(data?.month_paid).format('YYYY-MM'),
      amount: data?.amount,
      status: data?.status,
      agent: user?.id,
    })
  }

  // PAYMENT STATUSES
  const statuses = [
    {
      value: 'PENDING',
      text: 'PENDING',
    },
    {
      value: 'PAID',
      text: 'PAID',
    },
    {
      value: 'FAILED',
      text: 'FAILED',
    },
    {
      value: 'CANCELLED',
      text: 'CANCELLED',
    },
    {
      value: 'PARTIAL',
      text: 'PARTIAL',
    },
  ]

  // HANDLE EDIT PAYMENT REQUEST
  useEffect(() => {
    if (editPaymentIsSuccess) {
      dispatch(setEditPaymentModal(false))
      dispatch(setPayment(editPaymentData?.data?.payment))
      window.location.reload()
    } else if (editPaymentIsError) {
      toast.error('Could not edit payment. Please try again later.')
    }
  }, [editPaymentIsSuccess, editPaymentIsError])

  return (
    <Modal
      isOpen={editPaymentModal}
      onClose={() => {
        dispatch(setEditPaymentModal(false))
      }}
    >
      <h1 className="flex px-4 text-lg uppercase w-full font-semibold text-center text-primary">
        Edit Payment
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 px-4"
      >
        <Controller
          name="amount"
          control={control}
          defaultValue={payment?.amount}
          render={({ field }) => {
            return (
              <Input
                label="Amount"
                placeholder={payment?.amount}
                defaultValue={payment?.amount}
                {...field}
              />
            )
          }}
        />
        <Controller
          name="month_paid"
          control={control}
          rules={{ required: 'Paid month is required' }}
          defaultValue={moment(payment?.month_paid)?.format('YYYY-MM')}
          render={({ field }) => {
            return (
              <label className="flex flex-col gap-2 w-full">
                <span className="text-[15px]">Month Paid</span>
                <input
                  id={payment?.id}
                  className="text-sm border-[1.3px] mx-auto focus:outline-primary border-primary rounded-lg block w-full p-2 px-4"
                  type="month"
                  {...field}
                />
                {errors.month_paid && (
                  <span className="text-red-600 text-sm">
                    {errors.month_paid?.message}
                  </span>
                )}
              </label>
            )
          }}
        />
        <Controller
          name="status"
          control={control}
          rules={{ required: 'Status is required' }}
          render={({ field }) => {
            return (
              <label className="flex flex-col gap-2 w-full">
                <Select
                  label="Status"
                  defaultLabel={'Status'}
                  defaultValue={payment?.status}
                  options={statuses}
                  {...field}
                />
                {errors.status && (
                  <span className="text-red-600 text-sm">
                    {errors.status?.message}
                  </span>
                )}
              </label>
            )
          }}
        />
        <Button submit value={editPaymentIsLoading ? <Loading /> : 'Submit'} />
      </form>
    </Modal>
  )
}

export default EditPayment
