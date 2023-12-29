import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Button from '../../components/Button'
import Table from '../../components/table/Table'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import moment from 'moment'
import { setCompletePaymentModal } from '../../states/features/modals/householdSlice'
import CompletePayment from './CompletePayment'
import { setPayment } from '../../states/features/transactions/paymentSlice'

const HouseholdPayments = ({ household }) => {
  // STATE VARIABLES
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

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
        if (user?.departments?.id === 0) {
          return (
            <Button
              background={false}
              value={<FontAwesomeIcon icon={faTrash} />}
              className={`!text-white !bg-red-500 !p-2 !px-[10px] !rounded-full hover:!bg-red-600 hover:!scale-[.99] hover:!text-white`}
              onClick={(e) => {
                e.preventDefault()
              }}
            />
          )
        } else {
          return (
            <Button
              value="Pay Now"
              className={`${
                row?.original?.status === 'PAID' && 'hidden'
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
            value={status === 'PAID' ? 'Receipt' : 'Invoice'}
            className={`${
              status === 'PAID' ? '!bg-green-600' : status === 'PENDING' ? '!bg-red-600' : 'bg-yellow-600'
            } uppercase`}
          />
        )
      },
    },
    {
      Header: 'Payment Method',
      accessor: 'payment_method',
    },
  ]

  return (
    <main className="flex flex-col items-center min-w-[70%] p-2">
      <Table
        search={false}
        report={false}
        data={household?.payments?.map((payment, index) => {
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
    </main>
  )
}

export default HouseholdPayments
