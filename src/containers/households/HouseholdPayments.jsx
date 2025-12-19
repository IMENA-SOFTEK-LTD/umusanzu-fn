import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import { toast } from 'react-toastify'

import Button from '../../components/Button'
import Table from '../../components/table/Table'
import Loading from '../../components/Loading'
import Modal from '../../components/models/Modal'

import CompletePayment from '../payments/CompletePayment'
import DeletePayment from '../payments/DeletePayment'
import EditPayment from '../payments/EditPayment'

import { printTransactionPDF } from '../../components/table/Export'
import { setCompletePaymentModal } from '../../states/features/modals/householdSlice'
import {
  setDeletePaymentModal,
  setEditPaymentModal,
  setPayment,
} from '../../states/features/transactions/paymentSlice'
import { useLazyGetPaymentDetailsQuery } from '../../states/api/apiSlice'

const HouseholdPayments = ({ household }) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const [isLoading, setIsLoading] = useState(false)
  const [expandedRow, setExpandedRow] = useState(null)

  const [
    getPaymentDetails,
    {
      data: paymentDetailsData,
      isLoading: paymentDetailsIsLoading,
      isError: paymentDetailsIsError,
      isSuccess: paymentDetailsIsSuccess,
    },
  ] = useLazyGetPaymentDetailsQuery()

  // Handle receipt printing
  useEffect(() => {
    if (paymentDetailsIsSuccess && paymentDetailsData) {
      printTransactionPDF({ payment: paymentDetailsData?.data })
      setIsLoading(false)
    }
    if (paymentDetailsIsError) {
      toast.error('Could not print receipt. Please check your internet')
      setIsLoading(false)
    }
  }, [paymentDetailsIsSuccess, paymentDetailsData, paymentDetailsIsError])

  // Memoized action buttons
  const renderActionButtons = useCallback(
    (row) => {
      const status = row?.row?.original?.status || row?.original?.status || ''
      const paymentMethod = row?.row?.original?.payment_method
      const levelId = user?.departments?.level_id
      const original = row?.original || row?.row?.original || null
      //  console.log(user)
      if ([5, 3, 1].includes(levelId)) {
        return (
          <>
            {parseInt(user?.staff_role) === 1 && (
              <span className="flex gap-2">
                <Button
                  background={false}
                  value={<FontAwesomeIcon icon={faTrash} />}
                  className={`${
                     levelId !== 5 &&
                    'hidden'
                  } ${
                    status && ['PARTIAL', 'INITIATED', 'PENDING'].includes(
                      status.toUpperCase()
                    ) &&
                    levelId === 5 &&
                    'flex'
                  } ${
                    status && status.toUpperCase() === 'PAID' ? 'hidden'
                      : ''
                  } !text-white !bg-red-500 !p-2 !rounded-full hover:!bg-red-600`}
                  onClick={(e) => {
                    e.preventDefault()
                    dispatch(setPayment(original))
                    dispatch(setDeletePaymentModal(true))
                  }}
                />
                <Button
                  background={false}
                  value={<FontAwesomeIcon icon={faPenToSquare} />}
                  className={`${
                    levelId !== 5 && 'hidden'
                  } !p-2 !rounded-full !bg-primary !text-white hover:!bg-primary/80`}
                  onClick={(e) => {
                    e.preventDefault()
                    dispatch(setPayment(original))
                    dispatch(setEditPaymentModal(true))
                  }}
                />
                {status && ['PAID'].includes(status.toUpperCase()) ? (
                  ''
                ) : (
                  <Button
                    value="Pay"
                    className={`!w-fit`}
                    onClick={(e) => {
                      e.preventDefault()
                      dispatch(setCompletePaymentModal(true))
                      dispatch(setPayment(original))
                    }}
                  />
                )}
              </span>
            )}
          </>
        )
      } else {
        //  if (levelId === 6)
        return (
          <>
        
            {parseInt(user?.staff_role) === 2 && (
              <Button
                value="Pay"
                className={`!w-fit ${
                  status && ['PAID'].includes(status.toUpperCase()) 
                    ? 'hidden'
                    : ''
                }`}
                onClick={(e) => {
                  e.preventDefault()
                  dispatch(setCompletePaymentModal(true))
                  dispatch(setPayment(original))
                }}
              />
            )}
          </>
        )
      }
      return null
    },
    [user, dispatch]
  )

  // Memoized columns for desktop table
  const columns = useMemo(
    () => [
      { Header: 'No', accessor: 'no' },
      { Header: 'Action', accessor: 'action', Cell: renderActionButtons },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ row }) => {
          const status = row?.original?.status
          const color =
            status === 'PAID'
              ? 'bg-green-600'
              : status === 'PENDING'
              ? 'bg-yellow-600'
              : status === 'PARTIAL'
              ? 'bg-blue-600'
              : 'bg-red-600'
          return (
            <span
              className={`${color} w-auto px-2 py-1 text-white text-xs rounded`}
            >
              {status}
            </span>
          )
        },
      },

      {
        Header: 'Month',
        accessor: 'month_paid',
        Cell: ({ row }) => {
          return <span>{row?.original?.month_paid}</span>
        },
      },
      {
        Header: 'Paid',
        accessor: 'paid',
        Cell: ({ row }) => <span>{row?.original?.total_amount} RWF</span>,
      },
      {
        Header: 'Remain',
        accessor: 'remain',
        Cell: ({ row }) => <span>{row?.original?.remain_amount} RWF</span>,
      },
      { Header: 'Service', accessor: 'service', Cell: ({ row }) => <span>{row?.original?.serviceDetails?.title}</span>, },
      { Header: 'Date', accessor: 'date' },
      {
        Header: 'Method',
        accessor: 'payment_method',
        Cell: ({ row }) => {
          const pm = row?.original?.payment_method
          return (
            <span
              className={`${
                pm === 'Mobile_Money' ? 'text-gray-600' : 'text-blue-600'
              }`}
            >
              {pm === 'Mobile_Money' ? 'MOMO' : pm}
            </span>
          )
        },
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
              } uppercase !w-fit`}
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
    ],
    [renderActionButtons, dispatch, getPaymentDetails]
  )

  // Memoized data for table
  const data = useMemo(() => {
    return household?.payments
      ?.filter((p) => p?.status !== 'FAILED')
      ?.sort((a, b) => {
        const statusOrder = (status) =>
          status === 'PENDING' ? 0 : status === 'PARTIAL' ? 1 : 2
        const statusA = statusOrder(a.status)
        const statusB = statusOrder(b.status)
        if (statusA !== statusB) return statusA - statusB
        return moment(b?.month_paid).diff(moment(a?.month_paid))
      })
      ?.map((payment, index) => ({
        ...payment,
        no: index + 1,
        date: moment(payment?.updatedAt).format('DD-MM-YYYY HH:mm'),
      }))
  }, [household])

  // Memoized mobile rows
  const MobileRows = useMemo(() => {
    return (
      <div className="flex flex-col w-full gap-2 md:hidden">
        {data?.map((row, idx) => (
          <div
            key={idx}
            className="bg-white shadow rounded p-3 flex flex-col gap-2"
          >
            <div className="flex justify-between">
              <span className="font-bold">#{row.no}</span>
              <span
                className={`text-xs px-2 py-1 rounded text-white ${
                  row.status === 'PAID'
                    ? 'bg-green-600'
                    : row.status === 'PENDING'
                    ? 'bg-yellow-600'
                    : row.status === 'PARTIAL'
                    ? 'bg-blue-600'
                    : 'bg-red-600'
                }`}
              >
                {row.status}
              </span>
            </div>
            <div className="text-sm">
              <p>Month: {row?.month_paid}</p>
              <p>Paid: {row.total_amount} RWF</p>
              <p>Service: {row.serviceDetails?.title}</p>
              <button
                className="text-primary underline text-sm"
                onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
              >
                {expandedRow === idx ? 'Hide details' : 'More details'}
              </button>
            </div>
            {expandedRow === idx && (
              <div className="text-sm flex flex-col gap-1">
                <p>Remain: {row.remain_amount} RWF</p>
                <p>Date: {row.date}</p>
                <p>Method: {row.payment_method}</p>
                <p>Service: {row.serviceDetails?.title}</p>
                <div>{renderActionButtons({ original: row })}</div>
                <div>
                  <Button
                    value={
                      row.status === 'PAID' || row.status === 'INITIATED'
                        ? 'Receipt'
                        : 'Invoice'
                    }
                    className="!bg-green-600 uppercase !w-fit mt-1"
                    onClick={(e) => {
                      e.preventDefault()
                      dispatch(setPayment(row))
                      getPaymentDetails({ id: row.id })
                      setIsLoading(true)
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }, [data, expandedRow, dispatch, getPaymentDetails, renderActionButtons])

  return (
    <main className="pb-24">
      {/* Desktop Table */}
      <div className="hidden md:block w-full">
        <Table search={false} report={false} data={data} columns={columns} />
      </div>

      {/* Mobile Cards */}
      {MobileRows}

      {/* Modals */}
      <CompletePayment />
      <DeletePayment />
      <EditPayment />

      {/* Loading Modal */}
      <Modal isOpen={isLoading}>
        <div className="flex flex-col gap-3 items-center justify-center py-8">
          <h1 className="text-primary text-lg">
            {paymentDetailsIsSuccess ? 'Printing receipt...' : null}
          </h1>
          <Loading />
        </div>
      </Modal>
    </main>
  )
}

export default HouseholdPayments
