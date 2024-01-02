import Modal from '../../components/models/Modal'
import { useDispatch, useSelector } from 'react-redux'
import { setReceiptsModal } from '../../states/features/transactions/paymentSlice'
import { Controller, useForm } from 'react-hook-form'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { useLazyGetReceiptQuery } from '../../states/api/apiSlice'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import { printReceiptsPDF } from '../../components/table/Export'
import { capitalizeWords } from '../../utils/Words'
import Loading from '../../components/Loading'

const GenerateReceipts = ({ title = 'receipts' }) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm()

  // INITIATE GET RECEIPT/INVOICE REQUEST
  const [
    getReceipt,
    {
      data: receiptData,
      isLoading: receiptIsLoading,
      isError: receiptIsError,
      isSuccess: receiptIsSuccess,
      error: receiptError,
    },
  ] = useLazyGetReceiptQuery()

  // STATE VARIABLES
  const dispatch = useDispatch()
  const { receiptsModal } = useSelector((state) => state.payment)
  const { household } = useSelector((state) => state.household)

  const onSubmit = (data) => {
    getReceipt({
      id: household?.id,
      request: title?.slice(0, -1),
      start_month: data?.start_month,
      end_month: data?.end_month,
    })
  }

  // HANDLE GET RECEIPT/INVOICE DETAILS
  useEffect(() => {
    if (receiptIsSuccess) {
      printReceiptsPDF({ household: receiptData?.data, request: title?.slice(0, -1) })
      dispatch(setReceiptsModal(false))
      toast.success(`${capitalizeWords(title)} generated successfully.`)
    } else if (receiptIsError) {
      if (receiptError?.status === 404) {
        toast.error('No receipt/invoice found.')
      } else {
        toast.error(
          'Could not get receipt/invoice details. Please try again later.'
        )
      }
    }
  }, [receiptIsSuccess, receiptData, receiptError])

  return (
    <Modal
      isOpen={receiptsModal}
      onClose={() => {
        dispatch(setReceiptsModal(false))
      }}
    >
      <h1 className="uppercase text-lg text-primary font-semibold px-4">
        Generate {title}
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6 w-full items-center p-4"
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
        <Button
          submit
          value={receiptIsLoading ? <Loading /> : 'Generate'}
          className="w-full"
        />
      </form>
    </Modal>
  )
}

export default GenerateReceipts
