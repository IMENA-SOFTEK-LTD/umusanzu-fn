import 'core-js/stable'
import 'jspdf-autotable'
import logo from '../../assets/LOGO.png'
import jsPDF from 'jspdf'
import cachet from '../../assets/cachet.png'
import signature from '../../assets/signature.png'
import ExcelJS from 'exceljs/dist/exceljs.min.js'
import 'regenerator-runtime/runtime'
import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import moment from 'moment'
import PropTypes from 'prop-types'
import queryString from 'query-string'
import {
  faAnglesLeft,
  faAnglesRight,
  faChevronLeft,
  faChevronRight,
  faClose,
  faFile,
  faFileExcel,
  faFilePdf,
  faChevronDown,
  faChevronUp,
  faReceipt,
  faCalendarAlt,
  faMoneyBillWave,
} from '@fortawesome/free-solid-svg-icons'
import {
  useGlobalFilter,
  useTable,
  useAsyncDebounce,
  useFilters,
  useSortBy,
  usePagination,
} from 'react-table'
import {
  setPage,
  setSize,
  setTotalPages,
} from '../../states/features/pagination/paginationSlice'
import { useLazyGetTransactionsListQuery } from '../../states/api/apiSlice'
import Button, { PageButton } from '../../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector, useDispatch } from 'react-redux'
import Input from '../../components/Input'
import formatFunds from '../../utils/Funds'
import {
  setSelectedCell,
  setSelectedDistrict,
  setSelectedProvince,
  setSelectedSector,
  setSelectedVillage,
} from '../../states/features/modals/householdSlice'
import OverlayLoading from '../../components/OverlayLoading'
import GlobalFilter from './GlobalFilter'
import API_URL from '../../constants'
import axios from 'axios'
import download from 'downloadjs'

const TransactionTable = ({ user }) => {
  // State management
  const [transactionsListIsLoading, setTransactionsListIsLoading] =
    useState(false)
  const [transactionsListIsError, setTransactionsListIsError] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [, setDownloadProgress] = useState(0)
  const [expandedRows, setExpandedRows] = useState({})

  const [getTransactionsList] = useLazyGetTransactionsListQuery()

  const {
    page: offset,
    size,
    totalPages,
  } = useSelector((state) => state.pagination)

  const [totalRecords, setTotalRecords] = useState(0)
  const [totalCommission, setTotalCommission] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [totalRemaining, setTotalRemaining] = useState(0)
  const [showExportPopup, setShowExportPopup] = useState(false)
  const [fromDateLabel, setFromDateLabel] = useState(
    moment().startOf('month').format('DD MMMM YYYY').toUpperCase()
  )
  const [toDateLabel, setToDateLabel] = useState(
    moment().endOf('month').format('DD MMMM YYYY').toUpperCase()
  )
  const [reportName, setReportName] = useState(
    `TRANSACTIONS IN ${user?.departments?.name?.toUpperCase()} ${user?.department?.toUpperCase()} ${
      fromDateLabel ? 'FROM ' + fromDateLabel : ''
    } ${fromDateLabel ? 'TO ' + toDateLabel : ''}`
  )

  const { userOrSelectedDepartmentNames } = useSelector(
    (state) => state.departments
  )
  const dispatch = useDispatch()

  // Toggle row expansion for mobile view
  const toggleRowExpansion = useCallback((index) => {
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }, [])

  const openExportPopup = useCallback(() => {
    setShowExportPopup(true)
  }, [])

  const closeExportPopup = useCallback(() => {
    setShowExportPopup(false)
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
  useEffect(() => {
    let reportName = `TRANSACTIONS IN ${user?.departments?.name?.toUpperCase()} ${user?.department?.toUpperCase()} ${
      fromDateLabel ? 'FROM ' + fromDateLabel : ''
    } ${toDateLabel ? 'TO ' + toDateLabel : ''}`

    if (userOrSelectedDepartmentNames?.province) {
      reportName = `TRANSACTIONS IN ${userOrSelectedDepartmentNames?.province?.toUpperCase()} PROVINCE ${
        fromDateLabel ? 'FROM ' + fromDateLabel : ''
      } ${toDateLabel ? 'TO ' + toDateLabel : ''}`
    }
    if (userOrSelectedDepartmentNames?.district) {
      reportName = `TRANSACTIONS IN ${userOrSelectedDepartmentNames?.district?.toUpperCase()} DISTRICT ${
        fromDateLabel ? 'FROM ' + fromDateLabel : ''
      } ${toDateLabel ? 'TO ' + toDateLabel : ''}`
    }

    if (userOrSelectedDepartmentNames?.sector) {
      reportName = `TRANSACTIONS IN ${userOrSelectedDepartmentNames?.sector?.toUpperCase()} SECTOR ${
        fromDateLabel ? 'FROM ' + fromDateLabel : ''
      } ${toDateLabel ? 'TO ' + toDateLabel : ''}`
    }

    if (userOrSelectedDepartmentNames?.cell) {
      reportName = `TRANSACTIONS IN ${userOrSelectedDepartmentNames?.cell?.toUpperCase()} CELL ${
        fromDateLabel ? 'FROM ' + fromDateLabel : ''
      } ${toDateLabel ? 'TO ' + toDateLabel : ''}`
    }
    if (userOrSelectedDepartmentNames?.village) {
      reportName = `TRANSACTIONS IN ${userOrSelectedDepartmentNames?.village?.toUpperCase()} VILLAGE ${
        fromDateLabel ? 'FROM ' + fromDateLabel : ''
      } ${toDateLabel ? 'TO ' + toDateLabel : ''}`
    }
    setReportName(`${reportName}`)
  }, [setReportName, userOrSelectedDepartmentNames, fromDateLabel, toDateLabel])

  const [data, setData] = useState([])
  const [reportQueries, setReportQueries] = useState(null)
  const [queries, setQueries] = useState({
    departmentId: user?.departments?.id,
    searchTerm: '',
    payment_status: 'All',
    payment_method: 'All',
    village: queryRoute?.village || '',
    cell: queryRoute?.cell || '',
    sector: queryRoute?.sector || '',
    district: queryRoute?.district || '',
    province: queryRoute?.province || '',
    query: queryRoute?.query || '',
    transaction_from:
      queryRoute?.transaction_from ||
      moment().startOf('month').format('YYYY-MM-DD'),
    transaction_to:
      queryRoute?.transaction_to ||
      moment().endOf('month').format('YYYY-MM-DD'),
  })
  useEffect(() => {
    const queryRoute_ = queryString.parse(location.search)
    if (
      queryRoute_ &&
      (queryRoute_?.ubudehe ||
        queryRoute_?.query ||
        queryRoute_?.village ||
        queryRoute_?.cell ||
        queryRoute_?.sector ||
        queryRoute_?.district ||
        queryRoute_?.province)
    ) {
      setQueries({
        ...queries,
        payment_status: queryRoute_?.payment_status || 'All',
        payment_method: queryRoute_?.payment_method || 'All',
        village: queryRoute_?.village || '',
        cell: queryRoute_?.cell || '',
        sector: queryRoute_?.sector || '',
        district: queryRoute_?.district || '',
        province: queryRoute_?.province || '',
        transaction_from: queryRoute_?.transaction_from || '',
        transaction_to: queryRoute_?.transaction_to || '',
      })
    }
  }, [location])

  useEffect(() => {
    onLoadTransactionLists({
      department,
      size,
      page: offset,
      ...queries,
    })
  }, [size, offset])

  const onLoadTransactionLists = async (data) => {
    setTransactionsListIsLoading(true)
    try {
      const res = await getTransactionsList(data).unwrap()
      
      if (res && res.data) {
        dispatch(setTotalPages(res.data.totalPages))
        setTotalRecords(res.data.count)
        setTotalAmount(res.data.totalAmount)
        setTotalCommission(res.data.totalCommission)
        setTotalRemaining(
          +res.data.totalAmount - +res.data.totalCommission
        )

        setData(
          res.data.rows?.map((row, index) => ({
            id: index + 1,
            name: row?.household_name,
            village: row?.household_village_name,
            cell: row?.household_cell_name,
            sector: row?.household_sector_name,
            district: row?.household_district_name,
            amount: formatFunds(row?.transaction_amount),
            month_paid: moment(row.transaction_month_paid).format('MM-YYYY'),
            payment_method: row?.transaction_payment_method
              ?.split('_')
              .join(' '),
            status: row?.transaction_status,
            remain_amount: formatFunds(row?.transaction_remain_amount || 0),
            agent: row?.agent_names,
            commission: formatFunds(row?.transaction_total_commission),
            transaction_date: moment(
              row?.transaction_transaction_date
            ).format('DD-MM-YYYY'),
            service_name: row?.service_name || 
                         row?.transaction_service_name || 
                         row?.service_title ||
                         row?.transaction_service_title ||
                         row?.service?.title ||
                         row?.transaction_service?.title ||
                         'N/A',
          })) || []
        )
      }
    } catch (error) {
      setTransactionsListIsError(true)
      console.error('Error fetching transaction lists:', error)
      if (error.data && error.data.message) {
        toast.error(error.data.message)
      } else {
        toast.error(
          'An error occurred while retrieving the transaction lists. Please try again'
        )
      }
    } finally {
      setTransactionsListIsLoading(false)
    }
  }

  const handleExportToPdf = async () => {
    try {
      setIsExporting(true)
      setDownloadProgress(0)

      const { data } = await axios.get(
        `${API_URL}/transactions/pdf-reports?reportName=${reportName}&${new URLSearchParams(
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
      // console.log(error)
      toast.error('Househould not found')
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
        `${API_URL}/transactions/excel-reports?reportName=${reportName}&${new URLSearchParams(
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
      console.log(error)
      toast.error('Try again.')
    } finally {
      setIsExporting(false)
      setDownloadProgress(0)
    }
  }

  const columns = useMemo(
    () => [
      {
        Header: 'Status',
        accessor: 'status',
        sortable: true,
        Filter: SelectColumnFilter,
        Cell: ({ value }) => (
          <div
            className={`${
              value === 'PAID'
                ? 'bg-green-600 shadow-md rounded-sm shadow-200'
                : value === 'INITIATED'
                ? 'bg-black-600 rounded-sm shadow-md shadow-200'
                : value === 'PARTIAL'
                ? 'bg-blue-600 rounded-sm shadow-md shadow-200'
                : 'bg-yellow-600 rounded-sm shadow-md shadow-200'
            } p-1 rounded-md text-white text-center`}
          >
            {value}
          </div>
        ),
      },
      {
        Header: 'Names',
        accessor: 'name',
        sortable: true,
      },
      {
        Header: 'Service',
        accessor: 'service_name',
        sortable: true,
        Filter: SelectColumnFilter,
      },
      {
        Header: 'Amount',
        accessor: 'amount',
        sortable: true,
        Filter: SelectColumnFilter,
      },
      {
        Header: 'Month',
        accessor: 'month_paid',
        sortable: true,
        Filter: SelectColumnFilter,
      },
      {
        Header: 'Remaining',
        accessor: 'remain_amount',
        sortable: true,
      },
      {
        Header: 'Method',
        accessor: 'payment_method',
        sortable: true,
        Filter: SelectColumnFilter,
      },
      {
        Header: 'Commission',
        accessor: 'commission',
        sortable: true,
      },
      {
        Header: 'Date',
        accessor: 'transaction_date',
        sortable: true,
        Filter: DateRangeColumnFilter,
        filter: (rows, id, filterValues) => {
          const sd = filterValues[0]
            ? moment(filterValues[0]).format('DD-MM-YYYY')
            : undefined
          const ed = filterValues[1]
            ? moment(filterValues[1]).format('DD-MM-YYYY')
            : undefined

          if (ed || sd) {
            return rows.filter((r) => {
              const cellDate = r.values[id]

              if (ed && sd) {
                return cellDate >= sd && cellDate <= ed
              } else if (sd) {
                return cellDate >= sd
              } else if (ed) {
                return cellDate <= ed
              }
            })
          } else {
            return rows
          }
        },
      },
      {
        Header: 'Village',
        accessor: 'village',
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
        Header: 'Sector',
        accessor: 'sector',
        sortable: true,
        Filter: SelectColumnFilter,
      },
      {
        Header: 'District',
        accessor: 'district',
        sortable: true,
        Filter: SelectColumnFilter,
      },
      
     
      {
        Header: 'Agent',
        accessor: 'agent',
        sortable: true,
      },
   
    ],
    []
  )

  const tableHooks = (hooks) => {
    hooks.visibleColumns.push((columns) => [
      {
        id: 'no',
        Header: 'No',
        accessor: 'id',
        Cell: ({ row }) => <p>{row.index + 1}</p>,
        sortable: true,
      },
      ...columns,
    ])
  }

  const TableInstance = useTable(
    {
      columns,
      data,
      filterTypes: {
        dateRange: DateRangeColumnFilter,
      },
      getTheadFilterThProps: (state, rowInfo, column) => {
        return {
          style: {
            overflow: 'visible',
          },
        }
      },
    },
    useFilters,
    tableHooks,
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
    document.title = 'Transactions | Umusanzu Digital'
  }, [])

  const gotoPage1 = useCallback((newPage) => {
    if (newPage < 0 || newPage >= totalPages) return
    dispatch(setPage(Number(newPage)))
  }, [totalPages, dispatch])

  // Mobile Transaction Card Component
  const TransactionCard = memo(({ transaction, index }) => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4 p-4">
      {/* Main Info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <FontAwesomeIcon
              className="text-blue-600"
              icon={faReceipt}
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {transaction.name}
            </h3>
            <p className="text-xs text-gray-500">{transaction.village}</p>
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

      {/* Status and Amount */}
      <div className="flex items-center justify-between mb-3">
        <div
          className={`${
            transaction.status === 'PAID'
              ? 'bg-green-100 text-green-800'
              : transaction.status === 'INITIATED'
              ? 'bg-gray-100 text-gray-800'
              : transaction.status === 'PARTIAL'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-yellow-100 text-yellow-800'
          } inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}
        >
          {transaction.status}
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-green-600">
            {transaction.amount}
          </p>
          <p className="text-xs text-gray-500">Amount</p>
        </div>
      </div>

      {/* Expanded Content */}
      {expandedRows[index] && (
        <div className="border-t border-gray-100 pt-3 space-y-3">
          {/* Transaction Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500 block text-xs">Month Paid</span>
              <p className="font-medium flex items-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3 mr-1 text-gray-400" />
                {transaction.month_paid}
              </p>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Payment Method</span>
              <p className="font-medium">{transaction.payment_method}</p>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Remaining Amount</span>
              <p className="font-medium text-orange-600">{transaction.remain_amount}</p>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Commission</span>
              <p className="font-medium text-blue-600 flex items-center">
                <FontAwesomeIcon icon={faMoneyBillWave} className="w-3 h-3 mr-1" />
                {transaction.commission}
              </p>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Transaction Date</span>
              <p className="font-medium">{transaction.transaction_date}</p>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Agent</span>
              <p className="font-medium">{transaction.agent || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Service Name</span>
              <p className="font-medium">{transaction.service_name || 'N/A'}</p>
            </div>
          </div>

          {/* Location Details */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Location Details</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Cell:</span>
                <p className="font-medium">{transaction.cell}</p>
              </div>
              <div>
                <span className="text-gray-500">Sector:</span>
                <p className="font-medium">{transaction.sector}</p>
              </div>
              <div>
                <span className="text-gray-500">District:</span>
                <p className="font-medium">{transaction.district}</p>
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
                // className={
                //   user?.departments?.level_id === 5
                //     ? 'flex'
                //     : 'hidden'
                // }
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
      <OverlayLoading color="black" isLoading={transactionsListIsLoading} />
      <div className="flex flex-col items-center gap-6 px-4 sm:px-8">
        <div className="search-filter flex flex-col w-full items-center gap-6">
          {/* Header Section */}
          <div className="w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Transactions Management
                </h1>
                <p className="text-sm text-gray-600">
                  {`${user?.departments?.name} ${user?.department}`}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {fromDateLabel && `From ${fromDateLabel}`} {toDateLabel && `To ${toDateLabel}`}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {user?.departments.level_id !== 6 && parseInt(user?.staff_role) === 1 && (
                  <Button
                    className="w-full sm:w-auto"
                    value={
                      <span className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faFile} />
                        <span className="hidden sm:inline">Export Report</span>
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

                    paymentMethod: true,
                    paymentStatus: true,
                    dateTo: true,
                    dateFrom: true,
                  }}
                  isLoading={transactionsListIsLoading}
                  placeholder={
                    'Search for transaction by names, transaction ID....'
                  }
                  onChange={(query) => {
                    if (query?.dateFrom) setFromDateLabel(query?.dateFrom)

                    if (query?.dateTo) setToDateLabel(query?.dateTo)
                      console.log(query);
                    const queries2 = {
                      departmentId: user?.departments?.id,
                      searchTerm:
                        query.searchTerm || queryRoute?.searchTerm || '',
                      village: query.village || queryRoute?.village || '',
                      cell: query.cell || queryRoute?.cell || '',
                      sector: query.sector || queryRoute?.sector || '',
                      district: query.district || queryRoute?.district || '',
                      province: query.province || queryRoute?.province || '',
                      payment_status:
                        query.paymentStatus ||
                        queryRoute?.paymentStatus ||
                        'All',
                      payment_method:
                        query.paymentMethod ||
                        queryRoute?.paymentMethod ||
                        'All',
                      transaction_from: query?.dateFrom || moment().startOf('month').format('YYYY-MM-DD'),
                      transaction_to: query?.dateTo || moment().endOf('month').format('YYYY-MM-DD'),
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
                      payment_status:
                        query.paymentStatus ||
                        queryRoute?.paymentStatus ||
                        'All',
                      payment_method:
                        query.paymentMethod ||
                        queryRoute?.paymentMethod ||
                        'All',
                      transaction_from: query?.dateFrom || '',
                      transaction_to: query?.dateTo || '',
                    }
                    setQueries({ ...queries2 })
                    onLoadTransactionLists({
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
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center lg:text-left">
                      <p className="text-sm text-gray-600">Total Transactions</p>
                      <p className="text-xl font-bold text-gray-900">
                        {totalRecords}
                      </p>
                    </div>
                    <div className="text-center lg:text-left">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatFunds(totalAmount)} RWF
                      </p>
                    </div>
                    <div className="text-center lg:text-left">
                      <p className="text-sm text-gray-600">Total Commission</p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatFunds(totalCommission)} RWF
                      </p>
                    </div>
                    <div className="text-center lg:text-left">
                      <p className="text-sm text-gray-600">Total Remaining</p>
                      <p className="text-xl font-bold text-orange-600">
                        {formatFunds(totalRemaining)} RWF
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
                        <TransactionCard
                          key={row.original.id || index}
                          transaction={row.original}
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
                    <h1 className="text-[25px] font-medium text-center">
                      No record found
                    </h1>
                    {/* <Button value="Go to dashboard" route="/dashboard" /> */}
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
              disabled={offset === 0 || transactionsListIsLoading}
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
                  disabled={offset === 0 || transactionsListIsLoading}
                  onClick={() => gotoPage1(0)}
                  // disabled={!canPreviousPage}
                >
                  <span className="px-4 cursor-pointer hover:scale-[1.02] sr-only">
                    First
                  </span>
                  <FontAwesomeIcon icon={faAnglesLeft} />
                </PageButton>
                <PageButton
                  onClick={() => gotoPage1(Number(offset) - 1)}
                  disabled={offset === 0 || transactionsListIsLoading}
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
                    offset >= totalPages - 1 || transactionsListIsLoading
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
                    offset >= totalPages - 1 || transactionsListIsLoading
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

TransactionTable.propTypes = {
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

export const DateRangeColumnFilter = ({
  column: { filterValue = [], preFilteredRows, setFilter, id },
}) => {
  const [min, max] = React.useMemo(() => {
    let min = filterValue[0] ? moment(filterValue[0]) : undefined
    let max = filterValue[1] ? moment(filterValue[1]) : undefined

    preFilteredRows.forEach((row) => {
      const rowDate = moment(row.values[id], 'DD-MM-YYYY')

      if (min && max) {
        if (rowDate.isBetween(min, max, null, '[]')) {
        }
      } else if (min) {
        if (rowDate.isSameOrAfter(min)) {
        }
      } else if (max) {
        if (rowDate.isSameOrBefore(max)) {
        }
      }
    })

    return [min, max]
  }, [id, preFilteredRows])

  return (
    <div>
      <span className="mr-2">From:</span>
      <input
        type="date"
        className="w-[130px] px-[5px] rounded-[5px] border border-[#165F75] "
        min={min !== undefined ? min.format('YYYY-MM-DD') : undefined}
        value={filterValue[0] || ''}
        onChange={(e) => {
          const val = e.target.value
          setFilter((old = []) => [val ? val : undefined, old[1]])
        }}
      />
      <span className="ml-4 mr-2">To:</span>
      <input
        type="date"
        className="w-[130px] px-[5px] rounded-[5px] border border-[#165F75] "
        max={max !== undefined ? max.format('YYYY-MM-DD') : undefined}
        value={filterValue[1] || ''}
        onChange={(e) => {
          const val = e.target.value
          setFilter((old = []) => [old[0], val ? val : undefined])
        }}
      />
    </div>
  )
}

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

// function GlobalFilter({
//   preGlobalFilteredRows,
//   globalFilter,
//   setGlobalFilter,
// }) {
//   const count = preGlobalFilteredRows.length
//   const [value, setValue] = React.useState(globalFilter)
//   const onChange = useAsyncDebounce((value) => {
//     setGlobalFilter(value || undefined)
//   }, 200)

//   return (
//     <div className="flex items-center justify-center gap-4">
//       <Input
//         type="text"
//         className="p-2 outline-[2px] w-[20rem] border rounded-md border-primary outline-primary focus:outline-primary"
//         value={value || ''}
//         onChange={(e) => {
//           setValue(e.target.value)
//           onChange(e.target.value)
//         }}
//         placeholder={`${count} records...`}
//       />
//       <button
//         className="p-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:ring focus:ring-primary focus:ring-opacity-50"
//         onClick={() => {
//           setGlobalFilter(value || undefined)
//         }}
//       >
//         Search
//       </button>
//     </div>
//   )
// }

// Memoize the component for performance optimization
export default memo(TransactionTable)
