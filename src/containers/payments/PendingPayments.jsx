import 'core-js/stable'
import 'regenerator-runtime/runtime'
import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import PropTypes from 'prop-types'
import queryString from 'query-string'
import {
  faAnglesLeft,
  faAnglesRight,
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faChevronUp,
  faUser,
  faPhone,
  faMapMarkerAlt,
  faClock,
  faMoneyBillWave,
  faFile,
  faFileExcel,
  faFilePdf,
  faClose,
} from '@fortawesome/free-solid-svg-icons'
import {
  useGlobalFilter,
  useTable,
  useFilters,
  useSortBy,
  usePagination,
} from 'react-table'
import {
  setPage,
  setSize,
  setTotalPages,
} from '../../states/features/pagination/paginationSlice'
import { useLazyGetPendingPaymentsQuery } from '../../states/api/apiSlice'
import Loading from '../../components/Loading'
import Button, { PageButton } from '../../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector, useDispatch } from 'react-redux'
import Input from '../../components/Input'
import {
  setSelectedCell,
  setSelectedDistrict,
  setSelectedProvince,
  setSelectedSector,
  setSelectedVillage,
} from '../../states/features/modals/householdSlice'
import { toast } from 'react-toastify'
import OverlayLoading from '../../components/OverlayLoading'
import GlobalFilter from '../dashboard/GlobalFilter'
import formatFunds from '../../utils/Funds'
import API_URL from '../../constants'
import axios from 'axios'
import download from 'downloadjs'

const PendingPayments = ({ user }) => {
  // State management
  const [pendingPaymentsIsLoading, setPendingPaymentsIsLoading] =
    useState(false)
  const [pendingPaymentsIsError, setPendingPaymentsIsError] = useState(false)
  const [expandedRows, setExpandedRows] = useState({})
  const [isExporting, setIsExporting] = useState(false)
  const [, setDownloadProgress] = useState(0)
  const [showExportPopup, setShowExportPopup] = useState(false)
  const [reportName, setReportName] = useState('')

  const [getPendingPayments] = useLazyGetPendingPaymentsQuery()

  const {
    page: offset,
    size,
    totalPages,
  } = useSelector((state) => state.pagination)

  const [totalRecords, setTotalRecords] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [totalPendingMonths, setTotalPendingMonths] = useState(0)
  const [reportQueries, setReportQueries] = useState(null)

  const { userOrSelectedDepartmentNames } = useSelector(
    (state) => state.departments
  )
  const dispatch = useDispatch()

  // Toggle row expansion for mobile view
  const toggleRowExpansion = useCallback((index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }, [])

  const queryRoute = queryString.parse(location.search)

  // Determine department type based on level_id
  let department = ''
  switch (user?.departments?.level_id) {
    case 1:
      department = 'province'
      break
    case 2:
      department = 'district'
      break
    case 3:
      department = 'sector'
      break
    case 4:
      department = 'cell'
      break
    case 5:
      department = 'country'
      break
    case 6:
      department = 'agent'
      break
    default:
      department = 'agent'
  }

  // Dispatch Redux actions based on department level - moved to useEffect to prevent render loops
  useEffect(() => {
    if (!user?.departments?.level_id || !user?.departments?.id) return

    switch (user.departments.level_id) {
      case 1:
        dispatch(setSelectedProvince(user.departments.id))
        break
      case 2:
        dispatch(setSelectedDistrict(user.departments.id))
        break
      case 3:
        dispatch(setSelectedSector(user.departments.id))
        break
      case 4:
        dispatch(setSelectedCell(user.departments.id))
        break
      case 6:
        dispatch(setSelectedVillage(user.departments.id))
        break
    }
  }, [user?.departments?.level_id, user?.departments?.id, dispatch])

  const [data, setData] = useState([])
  const [queries, setQueries] = useState({
    departmentId: user?.departments?.id,
    searchTerm: '',
    village: queryRoute?.village || '',
    cell: queryRoute?.cell || '',
    sector: queryRoute?.sector || '',
    district: queryRoute?.district || '',
    province: queryRoute?.province || '',
    status: 'PENDING',
  })

  useEffect(() => {
    onLoadPendingPayments({
      department,
      size,
      page: offset,
      ...queries,
    })
  }, [size, offset])

  const onLoadPendingPayments = async (data) => {
    setPendingPaymentsIsLoading(true)
    try {
      await getPendingPayments(data)
        .unwrap()
        .then((res) => {
          dispatch(setTotalPages(res?.data?.totalPages))
          setTotalRecords(res?.data?.count)
          setTotalAmount(res?.data?.totalAmount)
          setTotalPendingMonths(res?.data?.totalPendingMonths)

          setData(
            res?.data?.rows?.map((row, index) => ({
              id: index + 1,
              householdId: row?.household_id,
              name: row?.household_name,
              phone: row?.household_phone1,
              sector: row?.household_sector_name,
              cell: row?.household_cell_name,
              village: row?.household_village_name,
              district: row?.household_district_name,
              province: row?.household_province_name,
              nid: row?.household_nid,
              ubudehe: row?.household_ubudehe,
              totalAmount: formatFunds(row?.total_pending_amount),
              pendingMonths: row?.pending_months_count,
              pendingMonthsList: row?.formatted_pending_months,
              allPendingMonths: row?.all_pending_months,
              firstPendingMonth: row?.first_pending_month,
              lastPendingMonth: row?.last_pending_month,
              agentName: row?.agent_names,
              status: row?.transaction_status,
              serviceName: row?.service_name,
              date: 'All Time',
            })) || []
          )
        })
        .catch((error) => {
          setPendingPaymentsIsError(true)
          if (error.data && error.data.message) {
            toast.error(error.data.message)
          } else {
            toast.error(
              'An error occurred while retrieving the pending payments. Please try again'
            )
          }
        })
        .finally(() => {
          setPendingPaymentsIsLoading(false)
        })
    } catch (error) {
      return error
    }
  }

  const columns = useMemo(
    () => [
      {
        Header: 'No',
        accessor: 'id',
        Cell: ({ row }) => <p>{row.index + 1}</p>,
        sortable: true,
      },
      {
        Header: 'Household Names',
        accessor: 'name',
        sortable: true,
        Filter: SelectColumnFilter,
      },
      {
        Header: 'Phone Number',
        accessor: 'phone',
        sortable: true,
        Filter: SelectColumnFilter,
      },
      {
        Header: 'Sector',
        accessor: 'sector',
        sortable: true,
        Filter: SelectColumnFilter,
      },
      {
        Header: 'Cell',
        accessor: 'cell',
        sortable: true,
        Filter: SelectColumnFilter,
      },
      {
        Header: 'Village',
        accessor: 'village',
        sortable: true,
        Filter: SelectColumnFilter,
      },
      {
        Header: 'Service',
        accessor: 'serviceName',
        sortable: true,
        Filter: SelectColumnFilter,
      },
      {
        Header: 'Total Amount',
        accessor: 'totalAmount',
        sortable: true,
        Filter: SelectColumnFilter,
      },
      {
        Header: 'Pending Months',
        accessor: 'pendingMonths',
        sortable: true,
        Cell: ({ row }) => (
          <div className="text-sm">
            <span className="font-medium text-orange-600">
              {row.original.pendingMonths} Month(s)
            </span>
            <div className="text-xs text-gray-500 mt-1">
              {row.original.pendingMonthsList}
            </div>
          </div>
        ),
        Filter: SelectColumnFilter,
      },
      {
        Header: 'Agent',
        accessor: 'agentName',
        sortable: true,
        Filter: SelectColumnFilter,
      },
      {
        Header: 'Status',
        accessor: 'status',
        sortable: true,
        Cell: ({ value }) => (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              value === 'PENDING'
                ? 'bg-yellow-100 text-yellow-800'
                : value === 'PARTIAL'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {value}
          </span>
        ),
        Filter: SelectColumnFilter,
      },
      {
        Header: 'Date',
        accessor: 'date',
        sortable: true,
        Filter: SelectColumnFilter,
      },
    ],
    []
  )

  const TableInstance = useTable(
    {
      columns,
      data,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    state,
    page,
    setPageSize,
  } = TableInstance

  useEffect(() => {
    document.title = 'Pending Payments | Umusanzu Digital'
  }, [])

  // Initialize report name
  useEffect(() => {
    let reportName = `PENDING PAYMENTS IN ${user?.departments?.name?.toUpperCase()} ${user?.department?.toUpperCase()}`

    if (userOrSelectedDepartmentNames?.province) {
      reportName = `PENDING PAYMENTS IN ${userOrSelectedDepartmentNames?.province?.toUpperCase()} PROVINCE`
    }
    if (userOrSelectedDepartmentNames?.district) {
      reportName = `PENDING PAYMENTS IN ${userOrSelectedDepartmentNames?.district?.toUpperCase()} DISTRICT`
    }
    if (userOrSelectedDepartmentNames?.sector) {
      reportName = `PENDING PAYMENTS IN ${userOrSelectedDepartmentNames?.sector?.toUpperCase()} SECTOR`
    }
    if (userOrSelectedDepartmentNames?.cell) {
      reportName = `PENDING PAYMENTS IN ${userOrSelectedDepartmentNames?.cell?.toUpperCase()} CELL`
    }
    if (userOrSelectedDepartmentNames?.village) {
      reportName = `PENDING PAYMENTS IN ${userOrSelectedDepartmentNames?.village?.toUpperCase()} VILLAGE`
    }
    setReportName(reportName)
  }, [userOrSelectedDepartmentNames, user])

  const gotoPage1 = useCallback(
    (newPage) => {
      if (newPage < 0 || newPage >= totalPages) return
      dispatch(setPage(Number(newPage)))
    },
    [totalPages, dispatch]
  )

  const openExportPopup = useCallback(() => {
    setShowExportPopup(true)
  }, [])

  const closeExportPopup = useCallback(() => {
    setShowExportPopup(false)
  }, [])

  const handleExportToPdf = async () => {
    try {
      setIsExporting(true)
      setDownloadProgress(0)

      const { data } = await axios.get(
        `${API_URL}/payment/pending/pdf-reports?reportName=${reportName}&${new URLSearchParams(
          reportQueries
        ).toString()}`,
        {
          responseType: 'blob',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          onDownloadProgress: (progressEvent) => {
            const total =
              progressEvent.total ||
              progressEvent.target?.getResponseHeader('Content-Length')
            if (total) {
              const percent = Math.round((progressEvent.loaded * 100) / total)
              setDownloadProgress(percent)
            }
          },
        }
      )
      download(new Blob([data]), `${reportName}.pdf`, '.pdf')
    } catch (error) {
      toast.error('Failed to export PDF. Please try again.')
    } finally {
      setIsExporting(false)
      setDownloadProgress(0)
    }
  }

  const handleExportToExcel = async () => {
    try {
      setIsExporting(true)
      setDownloadProgress(0)

      const { data } = await axios.get(
        `${API_URL}/payment/pending/excel-reports?reportName=${reportName}&${new URLSearchParams(
          reportQueries
        ).toString()}`,
        {
          responseType: 'blob',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          onDownloadProgress: (progressEvent) => {
            const total =
              progressEvent.total ||
              progressEvent.target?.getResponseHeader('Content-Length')
            if (total) {
              const percent = Math.round((progressEvent.loaded * 100) / total)
              setDownloadProgress(percent)
            }
          },
        }
      )
      download(new Blob([data]), `${reportName}.csv`, '.csv')
    } catch (error) {
      toast.error('Failed to export Excel. Please try again.')
    } finally {
      setIsExporting(false)
      setDownloadProgress(0)
    }
  }

  // Mobile Pending Payment Card Component
  const PendingPaymentCard = memo(({ payment, index }) => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4 p-4">
      {/* Main Info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-full">
            <FontAwesomeIcon className="text-orange-600" icon={faUser} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {payment.name}
            </h3>
            <p className="text-xs text-gray-500 flex items-center">
              <FontAwesomeIcon icon={faPhone} className="w-3 h-3 mr-1" />
              {payment.phone}
            </p>
          </div>
        </div>
        <button
          onClick={() => toggleRowExpansion(index)}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FontAwesomeIcon
            icon={expandedRows[index] ? faChevronUp : faChevronDown}
            className="w-4 h-4"
          />
        </button>
      </div>

      {/* Status Badge */}
      <div className="mb-3">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            payment.status === 'PENDING'
              ? 'bg-yellow-100 text-yellow-800'
              : payment.status === 'PARTIAL'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {payment.status}
        </span>
      </div>

      {/* Expanded Content */}
      {expandedRows[index] && (
        <div className="border-t border-gray-100 pt-3 space-y-3">
          {/* Payment Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500 block text-xs">Total Amount</span>
              <p className="font-medium text-red-600">{payment.totalAmount}</p>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">
                Pending Months
              </span>
              <p className="font-medium text-orange-600 flex items-center">
                <FontAwesomeIcon icon={faClock} className="w-3 h-3 mr-1" />
                {payment.pendingMonths} Month(s)
              </p>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Agent</span>
              <p className="font-medium">{payment.agentName || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Service</span>
              <p className="font-medium">{payment.serviceName || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">
                Ubudehe Category
              </span>
              <p className="font-medium">{payment.ubudehe || 'N/A'}</p>
            </div>
          </div>

          {/* Pending Months Details */}
          <div className="bg-orange-50 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-orange-700 mb-2 flex items-center">
              <FontAwesomeIcon icon={faClock} className="w-3 h-3 mr-1" />
              Pending Months Details
            </h4>
            <div className="space-y-1">
              <p className="text-xs text-orange-600 font-medium">
                {payment.pendingMonthsList}
              </p>
              {payment.firstPendingMonth && (
                <p className="text-xs text-orange-500">
                  First: {payment.firstPendingMonth}
                </p>
              )}
              {payment.lastPendingMonth && (
                <p className="text-xs text-orange-500">
                  Last: {payment.lastPendingMonth}
                </p>
              )}
            </div>
          </div>

          {/* Location Details */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3 h-3 mr-1" />
              Location Details
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Province:</span>
                <p className="font-medium">{payment.province}</p>
              </div>
              <div>
                <span className="text-gray-500">District:</span>
                <p className="font-medium">{payment.district}</p>
              </div>
              <div>
                <span className="text-gray-500">Sector:</span>
                <p className="font-medium">{payment.sector}</p>
              </div>
              <div>
                <span className="text-gray-500">Cell:</span>
                <p className="font-medium">{payment.cell}</p>
              </div>
              <div>
                <span className="text-gray-500">Village:</span>
                <p className="font-medium">{payment.village}</p>
              </div>
              <div>
                <span className="text-gray-500">NID:</span>
                <p className="font-medium">{payment.nid || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  ))

  return (
    <main className="my-12 w-full">
      {showExportPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-10 bg-gray-800 bg-opacity-60">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Export Report</h2>
            <input
              type="text"
              disabled={isExporting}
              placeholder="Enter report name"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              className="border p-2 rounded-md w-full mb-4"
            />
            <div className="flex gap-3">
              <Button
                disabled={isExporting}
                value={
                  <span className="flex items-center gap-2">
                    {isExporting ? 'Wait...' : 'Export PDF'}
                    <FontAwesomeIcon icon={faFilePdf} />
                  </span>
                }
                onClick={handleExportToPdf}
              />
              <Button
                disabled={isExporting}
                value={
                  <span className="flex items-center gap-2">
                    {isExporting ? 'Wait...' : 'Export Excel'}
                    <FontAwesomeIcon icon={faFileExcel} />
                  </span>
                }
                onClick={handleExportToExcel}
              />
              <Button
                value={
                  <span className="flex items-center gap-2">
                    Close
                    <FontAwesomeIcon icon={faClose} />
                  </span>
                }
                onClick={closeExportPopup}
              />
            </div>
          </div>
        </div>
      )}
      <OverlayLoading color="black" isLoading={pendingPaymentsIsLoading} />
      <div className="flex flex-col items-center gap-6 px-4 sm:px-8">
        <div className="search-filter flex flex-col w-full items-center gap-6">
          {/* Header Section */}
          <div className="w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Pending Payments Management
                </h1>
                <p className="text-sm text-gray-600">
                  {`${user?.departments?.name} ${user?.department}`}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Track and manage pending household payments
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {user?.departments.level_id !== 6 &&
                  parseInt(user?.staff_role) === 1 && (
                    <Button
                      className="w-full sm:w-auto"
                      value={
                        <span className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faFile} />
                          <span className="hidden sm:inline">
                            Export Report
                          </span>
                          <span className="sm:hidden">Export</span>
                        </span>
                      }
                      onClick={openExportPopup}
                    />
                  )}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-2 flex flex-col w-[95%] mx-auto">
          <table>
            <tr className="w-100">
              <td className="w-100">
                <GlobalFilter
                  user={user}
                  fieldEnabled={{
                    province: ['country'].includes(department),
                    district: ['country', 'province'].includes(department),
                    sector: ['country', 'province', 'district'].includes(
                      department
                    ),
                    cell: [
                      'country',
                      'province',
                      'district',
                      'sector',
                    ].includes(department),
                    village: [
                      'country',
                      'province',
                      'district',
                      'sector',
                      'cell',
                    ].includes(department),
                    householdStatus: false,
                    searchTerm: true,
                    paymentMethod: false,
                    paymentStatus: false,
                    dateTo: false,
                    dateFrom: false,
                  }}
                  isLoading={pendingPaymentsIsLoading}
                  placeholder="Search for pending payments by household name, phone..."
                  onChange={(query) => {
                    const queries2 = {
                      departmentId: user?.departments?.id,
                      searchTerm:
                        query.searchTerm || queryRoute?.searchTerm || '',
                      village: query.village || queryRoute?.village || '',
                      cell: query.cell || queryRoute?.cell || '',
                      sector: query.sector || queryRoute?.sector || '',
                      district: query.district || queryRoute?.district || '',
                      province: query.province || queryRoute?.province || '',
                      status: 'PENDING',
                    }
                    setReportQueries(queries2)
                  }}
                  onSearch={(query) => {
                    gotoPage1(0)
                    const queries2 = {
                      departmentId: user?.departments?.id,
                      searchTerm:
                        query.searchTerm || queryRoute?.searchTerm || '',
                      village: query.village || queryRoute?.village || '',
                      cell: query.cell || queryRoute?.cell || '',
                      sector: query.sector || queryRoute?.sector || '',
                      district: query.district || queryRoute?.district || '',
                      province: query.province || queryRoute?.province || '',
                      status: 'PENDING',
                    }
                    setQueries({ ...queries2 })
                    setReportQueries({ ...queries2 })
                    onLoadPendingPayments({
                      department,
                      size,
                      page: offset,
                      ...queries2,
                    })
                  }}
                />
              </td>
            </tr>
          </table>
        </div>
        <div className="mt-0 flex flex-col w-[95%] mx-auto">
          <div className="overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden flex flex-col gap-4 border-b border-gray-200">
                {/* Summary Stats */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="text-center lg:text-left">
                      <p className="text-sm text-gray-600">Total Households</p>
                      <p className="text-xl font-bold text-gray-900">
                        {totalRecords}
                      </p>
                    </div>
                    <div className="text-center lg:text-left">
                      <p className="text-sm text-gray-600">
                        Total Pending Amount
                      </p>
                      <p className="text-xl font-bold text-red-600">
                        {formatFunds(totalAmount)} RWF
                      </p>
                    </div>
                    <div className="text-center lg:text-left">
                      <p className="text-sm text-gray-600">
                        Total Pending Months
                      </p>
                      <p className="text-xl font-bold text-orange-600">
                        {totalPendingMonths}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile View */}
                <div className="block md:hidden">
                  <div className="space-y-4">
                    {page.map((row, index) => {
                      prepareRow(row)
                      return (
                        <PendingPaymentCard
                          key={row.original.householdId || index}
                          payment={row.original}
                          index={index}
                        />
                      )
                    })}
                  </div>
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                  <table
                    {...getTableProps()}
                    className="min-w-full divide-y divide-gray-200"
                  >
                    <thead className="bg-gray-50">
                      {headerGroups.map((headerGroup) => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                          {headerGroup.headers.map((column) => (
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              {...column.getHeaderProps(
                                column.getSortByToggleProps()
                              )}
                            >
                              {column.render('Header')}
                              <span>
                                {column.isSorted
                                  ? column.isSortedDesc
                                    ? ' ▼'
                                    : ' ▲'
                                  : ''}
                              </span>
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody
                      className="bg-white divide-y divide-gray-200"
                      {...getTableBodyProps()}
                    >
                      {page.map((row) => {
                        prepareRow(row)
                        return (
                          <tr {...row.getRowProps()}>
                            {row.cells.map((cell) => {
                              return (
                                <td
                                  {...cell.getCellProps()}
                                  className="px-6 py-4 whitespace-nowrap"
                                >
                                  {cell.render('Cell')}
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                {totalRecords === 0 && (
                  <main className="min-h-[40vh] flex items-center justify-center flex-col gap-6">
                    <h1 className="text-lg font-medium text-center text-gray-500">
                      No pending payments found
                    </h1>
                    <p className="text-sm text-gray-400">
                      All payments are up to date
                    </p>
                  </main>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pagination w-[95%] mx-auto">
        <div className="py-3 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              onClick={() => gotoPage1(Number(offset) - 1)}
              disabled={offset === 0 || pendingPaymentsIsLoading}
              value="Previous"
            >
              Previous
            </Button>
            <Button
              onClick={() => gotoPage1(Number(offset) + 1)}
              disabled={offset >= totalPages - 1}
              value="Next"
            >
              Next
            </Button>
          </div>
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <span className="text-sm text-gray-700">
                Page <span className="font-medium">{offset + 1}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </span>
              <label>
                <span className="sr-only">Items Per Page</span>
                <select
                  className="p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm"
                  value={state.pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    dispatch(setSize(Number(e.target.value)))
                  }}
                >
                  {[20, 50, 100].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      Show {pageSize}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div>
              <nav
                className="relative z-0 gap-1 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <PageButton
                  className="px-4 cursor-pointer hover:scale-[1.02] rounded-l-md shadow-md"
                  disabled={offset === 0 || pendingPaymentsIsLoading}
                  onClick={() => gotoPage1(0)}
                >
                  <span className="px-4 cursor-pointer hover:scale-[1.02] sr-only">
                    First
                  </span>
                  <FontAwesomeIcon icon={faAnglesLeft} />
                </PageButton>
                <PageButton
                  onClick={() => gotoPage1(Number(offset) - 1)}
                  disabled={offset === 0 || pendingPaymentsIsLoading}
                  className="px-4 cursor-pointer hover:scale-[1.02] p-2 shadow-md"
                >
                  <span className="px-4 cursor-pointer hover:scale-[1.02] sr-only">
                    Previous
                  </span>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </PageButton>
                <PageButton
                  onClick={() => gotoPage1(Number(offset) + 1)}
                  disabled={
                    offset >= totalPages - 1 || pendingPaymentsIsLoading
                  }
                  className="px-4 cursor-pointer hover:scale-[1.02] shadow-md"
                >
                  <span className="px-4 cursor-pointer hover:scale-[1.02] sr-only">
                    Next
                  </span>
                  <FontAwesomeIcon icon={faChevronRight} />
                </PageButton>
                <PageButton
                  className="px-4 cursor-pointer hover:scale-[1.02] rounded-r-md shadow-md"
                  onClick={() => gotoPage1(Number(totalPages) - 1)}
                  disabled={
                    offset >= totalPages - 1 || pendingPaymentsIsLoading
                  }
                >
                  <span className="px-4 cursor-pointer hover:scale-[1.02] sr-only">
                    Last
                  </span>
                  <FontAwesomeIcon icon={faAnglesRight} />
                </PageButton>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

PendingPayments.propTypes = {
  user: PropTypes.shape({
    departments: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      level_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    staff_role: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    department: PropTypes.string,
  }),
}

// SelectColumnFilter component (reused from TransactionTable)
export function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id, render },
}) {
  const options = useMemo(() => {
    const options = new Set()
    preFilteredRows.forEach((row) => {
      options.add(row.values[id])
    })
    return [...options.values()]
  }, [id, preFilteredRows])

  return (
    <label className="flex gap-x-2 items-baseline">
      <span className="text-gray-1000 text-[14px]">{render('Header')}: </span>
      <select
        className="rounded-sm bg-transparent outline-none border-none focus:border-none focus:outline-primary"
        name={id}
        id={id}
        value={filterValue}
        onChange={(e) => {
          setFilter(e.target.value || undefined)
        }}
      >
        <option className="text-[13px]" value="">
          All
        </option>
        {options.map((option, i) => (
          <option className="text-[13px]" key={i} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

// Memoize the component for performance optimization
export default memo(PendingPayments)
