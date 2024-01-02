import PropTypes from 'prop-types'
import Modal from '../../components/models/Modal'
import { useDispatch, useSelector } from 'react-redux'
import { setOfflinePaymentModal, setPayment } from '../../states/features/transactions/paymentSlice'
import { Controller, useForm } from 'react-hook-form'
import moment from 'moment'
import Button from '../../components/Button'
import Loading from '../../components/Loading'
import { useEffect } from 'react'
import { useRecordOfflinePaymentMutation } from '../../states/api/apiSlice'
import { toast } from 'react-toastify'

const RecordOfflinePayment = ({ household }) => {
  // STATE VARIABLES
  const dispatch = useDispatch()
  const { offlinePaymentModal } = useSelector((state) => state.payment)
  const { user } = useSelector((state) => state.auth)

  // INITIATE RECORD OFFLINE PAYMENT
  const [recordOfflinePayment, {
    isLoading: recordOfflinePaymentLoading,
    isSuccess: recordOfflinePaymentSuccess,
    isError: recordOfflinePaymentError,
    data: recordOfflinePaymentData,
  }] = useRecordOfflinePaymentMutation()

  // REACT HOOK FORM
  const { handleSubmit, control, setValue, watch } = useForm()

  // UPDATE DEFAULT VALUES
  useEffect(() => {
    setValue('phone1', household?.phone1)
    setValue('sms_phone', household?.phone1)
    setValue('amount', household?.ubudehe)
  }, [household])

  // HANDLE SUBMIT
  const onSubmit = (data) => {
    recordOfflinePayment({
        amount: data?.amount,
        household_id: household?.guid,
        month_paid: data?.month_paid,
        sms_phone: data?.sms_phone,
        agent: user?.id,
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
            render={({ field }) => (
              <input
                {...field}
                type="number"
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
                readOnly
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
