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
import CustomPopover from '../../components/models/CustomPopover'

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
      // const paymentMethod = row?.row?.original?.payment_method
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
                    status && ['PARTIAL', 'PAID'].includes(
                      status.toUpperCase()
                    )  ? 'hidden'
                      : ''
                  } !text-white !bg-red-500 !p-2 !rounded-full hover:!bg-red-600`}
                  onClick={(e) => {
                    e.preventDefault()
                    dispatch(setPayment(original))
                    dispatch(setDeletePaymentModal(true))
                  }}
                />
                {/* <Button
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
                /> */}
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
        Header: 'Initiated',
        accessor: 'pending_amount',
        Cell: ({ row }) => <span className="text-blue-600 font-medium">{row?.original?.pending_amount || 0} RWF</span>,
      },
      
      {
        Header: 'Remain',
        accessor: 'remain',
        Cell: ({ row }) => <span className="text-red-600 font-medium">{row?.original?.remain_amount} RWF</span>,
      },
      {
        Header: 'TotalPaid',
        accessor: 'paid',
        Cell: ({ row }) => <span className="text-green-600 font-medium">{row?.original?.total_amount} RWF</span>,
      },
      { 
        Header: 'Service', 
        accessor: 'service', 
        Cell: ({ row }) => {
          const serviceData = row?.original?.householdDepartmentService
          const serviceTitle = serviceData?.department_service?.service?.title || 'N/A'
           const serviceType = serviceData?.householdType || 'N/A'
          return (
            <div className="flex flex-col gap-1">
              <span>{serviceTitle} / {serviceType}</span>
              {serviceData && (
                <CustomPopover
                  placement="right"
                  height="h-auto"
                  width="w-[400px]"
                  trigger={
                    <span className="text-primary text-xs underline hover:text-primary/80 cursor-pointer">
                      View more
                    </span>
                  }
                >
                  <div className="flex flex-col gap-3 min-w-[300px] max-w-[400px]">
                    <h3 className="font-semibold text-lg text-primary border-b pb-2">
                      Service Details
                    </h3>
                    
                    {/* Service Information */}
                    <div className="flex flex-col gap-2">
                      <h4 className="font-medium text-sm text-gray-700">Service Information</h4>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Title:</span> {serviceData?.department_service?.service?.title || 'N/A'}</p>
                        <p><span className="font-medium">Title (English):</span> {serviceData?.department_service?.service?.title_english || 'N/A'}</p>
                        <p><span className="font-medium">Title (French):</span> {serviceData?.department_service?.service?.title_french || 'N/A'}</p>
                        <p><span className="font-medium">Ubudehe:</span> {serviceData?.ubudehe || 'N/A'} RWF</p>
                        <p><span className="font-medium">Household Type:</span> {serviceData?.householdType || 'N/A'}</p>
                        <p>
                          <span className="font-medium">Status:</span>{' '}
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            serviceData?.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {serviceData?.status || 'N/A'}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Location Information */}
                    <div className="flex flex-col gap-2">
                      <h4 className="font-medium text-sm text-gray-700">Location Information</h4>
                      <div className="text-sm space-y-1">
                        {serviceData?.province && (
                          <p><span className="font-medium">Province:</span> {serviceData.province.name}</p>
                        )}
                        {serviceData?.district && (
                          <p><span className="font-medium">District:</span> {serviceData.district.name}</p>
                        )}
                        {serviceData?.sector && (
                          <p><span className="font-medium">Sector:</span> {serviceData.sector.name}</p>
                        )}
                        {serviceData?.cell && (
                          <p><span className="font-medium">Cell:</span> {serviceData.cell.name}</p>
                        )}
                        {serviceData?.village && (
                          <p><span className="font-medium">Village:</span> {serviceData.village.name}</p>
                        )}
                      </div>
                    </div>

                    {/* Household Information */}
                    <div className="flex flex-col gap-2 pt-2 border-t">
                      <h4 className="font-medium text-sm text-gray-700">Household Information</h4>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Name:</span> {household?.name || 'N/A'}</p>
                        <p><span className="font-medium">Phone 1:</span> {household?.phone1 || 'N/A'}</p>
                        {household?.phone2 && (
                          <p><span className="font-medium">TIN Number:</span> {household.phone2}</p>
                        )}
                        {household?.email && (
                          <p><span className="font-medium">Email:</span> {household.email}</p>
                        )}
                        {household?.nid && (
                          <p><span className="font-medium">National ID:</span> {household.nid}</p>
                        )}
                      
                        <p>
                          <span className="font-medium">Status:</span>{' '}
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            household?.status?.toUpperCase() === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {household?.status?.toUpperCase() || 'N/A'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </CustomPopover>
              )}
            </div>
          )
        }
      },
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
    const userLevelId = user?.departments?.level_id
    const userDepartmentId = user?.departments?.id

    // Filter payments based on user department level
    const filterByDepartment = (payment) => {
      // If no householdDepartmentService, exclude the payment
      if (!payment?.householdDepartmentService) {
        return false
      }

      const serviceData = payment.householdDepartmentService

      // Country level (5) - show all payments
      if (userLevelId === 5) {
        return true
      }

      // Agent level (6) - filter by village_id
      if (userLevelId === 6) {
        return serviceData?.village_id === userDepartmentId
      }

      // Cell level (4) - filter by cell_id
      if (userLevelId === 4) {
        return serviceData?.cell_id === userDepartmentId
      }

      // Sector level (3) - filter by sector_id
      if (userLevelId === 3) {
        return serviceData?.sector_id === userDepartmentId
      }

      // District level (2) - filter by district_id
      if (userLevelId === 2) {
        return serviceData?.district_id === userDepartmentId
      }

      // Province level (1) - filter by province_id
      if (userLevelId === 1) {
        return serviceData?.province_id === userDepartmentId
      }

      // Default: show all if level is not recognized
      return true
    }

    return household?.payments
      ?.filter((p) => p?.status !== 'FAILED')
      ?.filter(filterByDepartment)
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
  }, [household, user])

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
              <p>Service: {row?.householdDepartmentService?.department_service?.service?.title || row.serviceDetails?.title}</p>
              <button
                className="text-primary underline text-sm"
                onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
              >
                {expandedRow === idx ? 'Hide details' : 'More details'}
              </button>
            </div>
            {expandedRow === idx && (
              <div className="text-sm flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-primary border-b pb-1">Payment Details</p>
                  <p>Remain: {row.remain_amount} RWF</p>
                  <p>Date: {row.date}</p>
                  <p>Method: {row.payment_method}</p>
                </div>
                
                {/* Service Information */}
                {row?.householdDepartmentService && (
                  <div className="flex flex-col gap-1 pt-2 border-t">
                    <p className="font-semibold text-primary border-b pb-1">Service Information</p>
                    <p><span className="font-medium">Title:</span> {row.householdDepartmentService?.department_service?.service?.title || 'N/A'}</p>
                    {row.householdDepartmentService?.department_service?.service?.title_english && (
                      <p><span className="font-medium">Title (English):</span> {row.householdDepartmentService.department_service.service.title_english}</p>
                    )}
                    {row.householdDepartmentService?.department_service?.service?.title_french && (
                      <p><span className="font-medium">Title (French):</span> {row.householdDepartmentService.department_service.service.title_french}</p>
                    )}
                    <p><span className="font-medium">Ubudehe:</span> {row.householdDepartmentService?.ubudehe || 'N/A'} RWF</p>
                    <p><span className="font-medium">Household Type:</span> {row.householdDepartmentService?.householdType || 'N/A'}</p>
                    <p>
                      <span className="font-medium">Status:</span>{' '}
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        row.householdDepartmentService?.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {row.householdDepartmentService?.status || 'N/A'}
                      </span>
                    </p>
                  </div>
                )}

                {/* Location Information */}
                {row?.householdDepartmentService && (
                  <div className="flex flex-col gap-1 pt-2 border-t">
                    <p className="font-semibold text-primary border-b pb-1">Location Information</p>
                    {row.householdDepartmentService?.province && (
                      <p><span className="font-medium">Province:</span> {row.householdDepartmentService.province.name}</p>
                    )}
                    {row.householdDepartmentService?.district && (
                      <p><span className="font-medium">District:</span> {row.householdDepartmentService.district.name}</p>
                    )}
                    {row.householdDepartmentService?.sector && (
                      <p><span className="font-medium">Sector:</span> {row.householdDepartmentService.sector.name}</p>
                    )}
                    {row.householdDepartmentService?.cell && (
                      <p><span className="font-medium">Cell:</span> {row.householdDepartmentService.cell.name}</p>
                    )}
                    {row.householdDepartmentService?.village && (
                      <p><span className="font-medium">Village:</span> {row.householdDepartmentService.village.name}</p>
                    )}
                  </div>
                )}

                {/* Household Information */}
                <div className="flex flex-col gap-1 pt-2 border-t">
                  <p className="font-semibold text-primary border-b pb-1">Household Information</p>
                  <p><span className="font-medium">Name:</span> {household?.name || 'N/A'}</p>
                  <p><span className="font-medium">Phone 1:</span> {household?.phone1 || 'N/A'}</p>
                  {household?.phone2 && (
                    <p><span className="font-medium">TIN Number:</span> {household.phone2}</p>
                  )}
                  {household?.email && (
                    <p><span className="font-medium">Email:</span> {household.email}</p>
                  )}
                  {household?.nid && (
                    <p><span className="font-medium">National ID:</span> {household.nid}</p>
                  )}
                 
                  <p>
                    <span className="font-medium">Status:</span>{' '}
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      household?.status?.toUpperCase() === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {household?.status?.toUpperCase() || 'N/A'}
                    </span>
                  </p>
                </div>

                <div className="pt-2 border-t">{renderActionButtons({ original: row })}</div>
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
