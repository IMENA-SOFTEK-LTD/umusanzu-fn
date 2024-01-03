import Modal from '../../components/models/Modal'
import { useDispatch, useSelector } from 'react-redux'
import { setDeletePaymentModal } from '../../states/features/transactions/paymentSlice'
import Button from '../../components/Button'
import { useDeletePaymentMutation } from '../../states/api/apiSlice'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import Loading from '../../components/Loading'

const DeletePayment = () => {
  // STATE VARIABLES
  const dispatch = useDispatch()
  const { deletePaymentModal, payment } = useSelector((state) => state.payment)

  // INITIATE DELETE PAYMENT REQUEST
  const [
    deletePayment,
    {
      isLoading: deletePaymentIsLoading,
      isSuccess: deletePaymentIsSuccess,
      isError: deletePaymentIsError,
    },
  ] = useDeletePaymentMutation()

  // HANDLE DELETE PAYMENT REQUEST
  useEffect(() => {
    if (deletePaymentIsSuccess) {
      toast.success('Payment deleted successfully')
      window.location.reload()
    } else if (deletePaymentIsError) {
      toast.error('Could not delete payment. Please check your internet')
    }
  }, [deletePaymentIsSuccess])

  return (
    <Modal
      isOpen={deletePaymentModal}
      onClose={() => {
        dispatch(setDeletePaymentModal(false))
      }}
    >
      <h1 className="flex px-4 text-lg uppercase w-full items-center justify-center font-semibold text-center text-primary">
        Confirm Delete Payment
      </h1>
      <section className="flex w-full flex-col gap-5 px-4 items-center">
        <h1 className="text-md uppercase font-medium">
          Are you sure you want to delete this payment
        </h1>
        <span className="flex items-center gap-4 mx-auto">
          <Button
            value="Cancel"
            className={`!bg-red-600`}
            onClick={(e) => {
              e.preventDefault()
              dispatch(setDeletePaymentModal(false))
            }}
          />
          <Button
            value={deletePaymentIsLoading ? <Loading /> : 'Confirm'}
            onClick={(e) => {
              e.preventDefault()
              deletePayment({ id: payment?.id })
            }}
          />
        </span>
      </section>
    </Modal>
  )
}

export default DeletePayment
