import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Button from '../../components/Button'
import Table from '../../components/table/Table'
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import moment from 'moment'
import { setCompletePaymentModal } from '../../states/features/modals/householdSlice'
import CompletePayment from '../payments/CompletePayment'
import { setDeletePaymentModal, setEditPaymentModal, setPayment } from '../../states/features/transactions/paymentSlice'
import {
  useLazyGetPaymentDetailsQuery,
  useDeletePaymentMutation,
} from '../../states/api/apiSlice'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { printTransactionPDF } from '../../components/table/Export'
import Loading from '../../components/Loading'
import Modal from '../../components/models/Modal'
import DeletePayment from '../payments/DeletePayment'
import EditPayment from '../payments/EditPayment'

const HouseholdPayments = ({ household }) => {
  // STATE VARIABLES
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  // MODAL LOADING STATE
  const [isLoading, setIsLoading] = useState(false)

  // INITIATE GET PAYMENT DETAILS REQUEST
  const [
    getPaymentDetails,
    {
      data: paymentDetailsData,
      isLoading: paymentDetailsIsLoading,
      isError: paymentDetailsIsError,
      isSuccess: paymentDetailsIsSuccess,
      reset: resetPaymentDetails,
    },
  ] = useLazyGetPaymentDetailsQuery()

  // COLUMN CONFIGURATION
  const columns = [
    {
      Header: 'No',
      accessor: 'no',
    },
    {
      Header: 'Action',
      accessor: 'action',
      Cell: ({ row }) => {
        if ([5, 3]?.includes(user?.departments?.level_id)) {
          const status = row?.original?.status
          return (
            <span className="w-full flex items-center gap-2">
              <Button
                background={false}
                value={<FontAwesomeIcon icon={faTrash} />}
                className={`${
                  status !== 'PENDING' &&
                  user?.departments?.level_id !== 5 &&
                  'hidden'
                } ${
                  ['PARTIAL', 'INITIATED', 'PENDING']?.includes(status) &&
                  user?.departments?.level_id === 5 &&
                  'flex'
                } ${
                  status === 'PAID' && 'hidden'
                } !text-white !bg-red-500 !p-2 !px-[10px] !rounded-full hover:!bg-red-600 hover:!scale-[.99] hover:!text-white`}
                onClick={(e) => {
                  e.preventDefault()
                  dispatch(setPayment(row?.original))
                  dispatch(setDeletePaymentModal(true))
                }}
              />
              <Button
                background={false}
                value={<FontAwesomeIcon icon={faPenToSquare} />}
                className={`${
                  user?.departments?.level_id !== 5 && 'hidden'
                } !p-2 !rounded-full !bg-primary !text-white hover:!text-white`}
                primary
                onClick={(e) => {
                  e.preventDefault()
                  dispatch(setPayment(row?.original))
                  dispatch(setEditPaymentModal(true))
                }}
              />
            </span>
          )
        } else if (user?.departments?.level_id === 6) {
          return (
            <Button
              value="Pay Now"
              className={`${
                ['PAID', 'INITIATED']?.includes(row?.original?.status) &&
                'hidden'
              } !w-fit !min-w-full`}
              onClick={(e) => {
                e.preventDefault()
                dispatch(setCompletePaymentModal(true))
                dispatch(setPayment(row?.original))
              }}
            />
          )
        }
      },
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: ({ row }) => {
        const status = row?.original?.status
        return (
          <Link
            className={`${
              status === 'PAID'
                ? 'bg-green-600'
                : status === 'INITIATED' || status === 'PARTIAL'
                ? 'bg-yellow-600'
                : 'bg-red-600'
            } w-full p-2 text-white text-center rounded-sm cursor-auto`}
          >
            {status}
          </Link>
        )
      },
    },
    {
      Header: 'Month',
      accessor: 'month_paid',
    },
    {
      Header: 'Amount',
      accessor: 'amount',
      Cell: ({ row }) => {
        const status = row?.original?.status
        return (
          <span>
            {status === 'PAID' || status === 'INITIATED' ? (
              <p>{row?.original?.total_amount} RWF</p>
            ) : (
              <p>{row?.original?.remain_amount} RWF</p>
            )}
          </span>
        )
      },
    },
    {
      Header: 'Date',
      accessor: 'date',
    },
    {
      Header: 'Receipt',
      accessor: 'receipt',
      Cell: ({ row }) => {
        const status = row?.original?.status
        return (
          <Button
            value={
              status === 'PAID' || status === 'INITIATED'
                ? 'Receipt'
                : 'Invoice'
            }
            className={`${
              status === 'PAID' || status === 'INITIATED'
                ? '!bg-green-600'
                : status === 'PENDING'
                ? '!bg-red-600'
                : 'bg-yellow-600'
            } uppercase`}
            onClick={(e) => {
              e.preventDefault()
              dispatch(setPayment(row?.original))
              getPaymentDetails({ id: row?.original?.id })
              setIsLoading(true)
            }}
          />
        )
      },
    },
    {
      Header: 'Payment Method',
      accessor: 'payment_method',
    },
  ]

  // HANDLE GET PAYMENT DETAILS REQUEST
  useEffect(() => {
    if (paymentDetailsIsSuccess && paymentDetailsData) {
      printTransactionPDF({ payment: paymentDetailsData?.data })
      setIsLoading(false)
    }
    if (paymentDetailsIsError) {
      toast.error('Could not print receipt. Please check your internet')
      setIsLoading(false)
    }
  }, [paymentDetailsIsSuccess, paymentDetailsData])

  return (
    <main className="flex flex-col items-center min-w-[70%] p-2">
      <Table
        search={false}
        report={false}
        data={household?.payments
          ?.slice()
          ?.filter((payment) => payment?.status !== 'FAILED')
          ?.sort((a, b) => moment(b?.month_paid) - moment(a?.month_paid))
          ?.map((payment, index) => {
            return {
              ...payment,
              no: index + 1,
              month_paid: moment(payment?.month_paid).format('MMMM YYYY'),
              date: moment(payment?.updatedAt).format('DD-MM-YYYY HH:mm'),
            }
          })}
        columns={columns}
      />
      <CompletePayment />
      <DeletePayment />
      <EditPayment />
      <Modal isOpen={isLoading}>
        <span className="flex flex-col gap-3 items-center justify-center min-h-[30vh]">
          <h1
            className={`${
              paymentDetailsIsSuccess ? 'text-primary' : 'text-red-600'
            } flex text-center uppercasetext-lg`}
          >
            {paymentDetailsIsSuccess ? 'Printing receipt...' : null}
          </h1>
          <Loading />
        </span>
      </Modal>
    </main>
  )
}

export default HouseholdPayments
