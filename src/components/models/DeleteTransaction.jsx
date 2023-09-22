import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { setDeleteTransactionModal } from '../../states/features/transactions/transactionSlice'
import Button from '../Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faX } from '@fortawesome/free-solid-svg-icons'
import { Controller, useForm } from 'react-hook-form'
import { useDeleteTransactionMutation } from '../../states/api/apiSlice'
import { useEffect } from 'react'

const DeleteTransaction = () => {
  const { deleteTransactionModal, deleteTransactionId } = useSelector(
    (state) => state.transactions
  )
  const dispatch = useDispatch()

  const [
    deleteTransaction,
    {
      data: deleteTransactionData,
      isLoading: deleteTransactionIsLoading,
      isSuccess: deleteTransactionIsSuccess,
      isError: deleteTransactionIsError,
    },
  ] = useDeleteTransactionMutation()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = () => {
    deleteTransaction({
      id: deleteTransactionId,
    })
  }

  useEffect(() => {
    if (deleteTransactionIsSuccess) {
      setTimeout(() => {
        window.location.reload()
      }, 500)
    }
  }, [deleteTransactionData])

  return (
    <main
      className={`${
        deleteTransactionModal ? 'flex' : 'hidden'
      } fixed top-0 left-0 right-0 z-50 w-full h-screen p-4 flex items-center justify-center bg-gray-800 bg-opacity-60`}
    >
      <section className="bg-white w-fit relative max-w-[50%] min-w-[30rem] flex flex-col gap-6">
        <article className="bg-red-600 relative flex flex-row-reverse items-center justify-center py-4 px-4">
          <Button
            onClick={(e) => {
              e.preventDefault()
              dispatch(setDeleteTransactionModal(false))
            }}
            className="absolute right-4 top-4 !px-0 !py-0 bg-red-600"
            value={
              <FontAwesomeIcon
                icon={faX}
                className="bg-white text-red-600 hover:bg-white hover:text-primary p-2 px-[10px] rounded-md"
              />
            }
          />
          <h4 className="text-[20px] text-center font-medium uppercase text-white">
            Delete transaction
          </h4>
        </article>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-8 w-full max-w-[20rem] items-center mx-auto bg-white p-8"
        >
          <h4 className="font-medium text-center text-[16px]">
            Are you sure you want to delete this transaction?
          </h4>

          <section
            className={
              deleteTransactionIsSuccess || deleteTransactionIsError
                ? 'flex text-center mx-auto'
                : 'hidden'
            }
          >
            <p
              className={
                deleteTransactionIsSuccess
                  ? 'text-green-600 text-center'
                  : 'hidden'
              }
            >
              Transaction deleted successfully
            </p>
            <p
              className={
                deleteTransactionIsError ? 'text-red-600 text-center' : 'hidden'
              }
            >
              Could not delete transaction. Please refresh and try again
            </p>
          </section>

          <span className="flex items-center gap-6">
            <Controller
              name="submit"
              control={control}
              render={({ field }) => {
                return (
                  <Button
                    {...field}
                    submit
                    value={
                      deleteTransactionIsLoading
                        ? 'Loading...'
                        : deleteTransactionIsSuccess
                        ? 'Deleted'
                        : 'Delete'
                    }
                    className={`${
                      deleteTransactionIsSuccess
                        ? '!bg-green-500'
                        : 'bg-red-600'
                    }`}
                  />
                )
              }}
            />
            <Button
              value="Cancel"
              onClick={(e) => {
                e.preventDefault()
                dispatch(setDeleteTransactionModal(false))
              }}
            />
          </span>
        </form>
      </section>
    </main>
  )
}

DeleteTransaction.propTypes = {
  transaction: PropTypes.shape({}),
}

export default DeleteTransaction
