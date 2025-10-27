import { useNavigate } from 'react-router-dom'
import Button, { PageButton } from '../../components/Button'
import { setPathRoute } from '../../states/features/navigation/sidebarSlice'
import { useDispatch, useSelector } from 'react-redux'
import {
  setSelectedCell,
  setSelectedDistrict,
  setSelectedProvince,
  setSelectedSector,
  setSelectedVillage,
} from '../../states/features/modals/householdSlice'
import download from 'downloadjs'
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
  faUserTie,
  faMoneyBillWave,
  faBuilding,
  faChartLine,
} from '@fortawesome/free-solid-svg-icons'
import GlobalFilter from '../dashboard/GlobalFilter'
import { useEffect, useMemo, useState, useCallback, memo } from 'react'
import formatFunds from '../../utils/Funds'
import { useFilters, useTable } from 'react-table'
import {
  setPage,
  setSize,
  setTotalPages,
} from '../../states/features/pagination/paginationSlice'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import moment from 'moment'
import { useLazyGetPerformanceQuery } from '../../states/api/apiSlice'
import OverlayLoading from '../../components/OverlayLoading'
import { toast } from 'react-toastify'
import API_URL from '../../constants'
import axios from 'axios'

const Reports = ({ user }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const {
    page: offset,
    size,
    totalPages,
  } = useSelector((state) => state.pagination)
  
  // State management
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalCommission, setTotalCommission] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [totalAmountTransferred, setTotalAmountTransferred] = useState(0)
  const [expandedRows, setExpandedRows] = useState({})

  const [monthPaidLabel, setMonthPaidLabel] = useState(
    moment(new Date()).format('MMMM YYYY').toUpperCase()
  )
  const [transactionsListIsLoading, setTransactionsListIsLoading] =
    useState(false)
  const [householdListError, setHouseholdListError] = useState(false)

  const [showExportPopup, setShowExportPopup] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const { userOrSelectedDepartmentNames } = useSelector(
    (state) => state.departments
  )
  const [reportName, setReportName] = useState(
    `${user?.departments?.name?.toUpperCase()} ${user?.department?.toUpperCase()} TRANSACTIONS REPORT - ${monthPaidLabel}`
  )

  const [getPerformance] = useLazyGetPerformanceQuery()

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
    let reportName = `${user?.departments?.name?.toUpperCase()} ${user?.department?.toUpperCase()}`

    if (userOrSelectedDepartmentNames?.province) {
      reportName = `${userOrSelectedDepartmentNames?.province?.toUpperCase()} PROVINCE`
    }
    if (userOrSelectedDepartmentNames?.district) {
      reportName = `${userOrSelectedDepartmentNames?.district?.toUpperCase()} DISTRICT`
    }

    if (userOrSelectedDepartmentNames?.sector) {
      reportName = `${userOrSelectedDepartmentNames?.sector?.toUpperCase()} SECTOR`
    }

    if (userOrSelectedDepartmentNames?.cell) {
      reportName = `${userOrSelectedDepartmentNames?.cell?.toUpperCase()} CELL`
    }
    setReportName(` ${reportName} TRANSACTIONS REPORT - ${monthPaidLabel}`)
  }, [setReportName, userOrSelectedDepartmentNames, monthPaidLabel])

  const [data, setData] = useState([])
  const [reportQueries, setReportQueries] = useState(null)
  const [queries, setQueries] = useState({
    departmentId: user?.departments?.id,
    searchTerm: '',
    monthPaid: moment(new Date()).format('YYYY-MM'),
    village: '',
    cell: '',
    sector: '',
    district: '',
    province: '',
    transaction_from: moment().startOf('month').format('YYYY-MM-DD'),
    transaction_to: moment().endOf('month').format('YYYY-MM-DD'),
  })

  useEffect(() => {
    onLoadPerformances({
      department,
      size,
      page: offset,
      ...queries,
    })
  }, [size, offset])

  const onLoadPerformances = async (data) => {
    setTransactionsListIsLoading(true)
    try {
      await getPerformance(data)
        .unwrap()
        .then((res) => {
          dispatch(setTotalPages(res?.data?.totalPages))
          setTotalRecords(res?.data?.count)
          setTotalAmount(res?.data?.totalAmount)
          setTotalCommission(res?.data?.totalCommission)
          setTotalAmountTransferred(res?.data?.totalAmountTransferred)
          // console.log(res?.data?.rows);
          setData(
            res?.data?.rows?.map((item, index) => ({
              id: index + 1,
              village: item?.village_name,
              agent: item?.names,
              cell: item?.cell_name,
              total: item?.totalAmount,
              bank_transfer: item?.totalAmountTransferred,
              commission: item?.totalCommission,
              bank_slip: 0,
            })) || []
          )
        })
        .catch((error) => {
          setHouseholdListError(true)
          if (error.data && error.data.message) {
            toast.error(error.data.message)
          } else {
            toast.error(
              'An error occurred while retrieving the report. Please try again'
            )
          }
        })
        .finally(() => {
          setTransactionsListIsLoading(false)
        })
    } catch (error) {
      return error
    }
  }
  const handleExportToPdf = async () => {
    try {
      setIsExporting(true)

      const { data } = await axios.get(
        `${API_URL}/transactions/performance/pdf-reports?reportName=${reportName}&${new URLSearchParams(
          reportQueries
        ).toString()}`,
        {
          responseType: 'blob',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      setIsExporting(false)
      download(new Blob([data]), `${reportName}.pdf`, '.pdf')
    } catch (error) {
      // console.log(error)
      setIsExporting(false)
      toast.error('Try again.')
    }
  }

  const handleExportToExcel = async () => {
    try {
      setIsExporting(true)

      const { data } = await axios.get(
        `${API_URL}/transactions/performance/excel-reports?reportName=${reportName}&${new URLSearchParams(
          reportQueries
        ).toString()}`,
        {
          responseType: 'blob',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      setIsExporting(false)
      download(new Blob([data]), `${reportName}.csv`, '.csv')
    } catch (error) {
      console.log(error)
      setIsExporting(false)
      toast.error('Try again.')
    }
  }

  useEffect(() => {
    document.title = 'Reports | Umusanzu Digital'
  }, [])

  const gotoPage1 = useCallback((newPage) => {
    if (newPage < 0 || newPage >= totalPages) return
    dispatch(setPage(Number(newPage)))
  }, [totalPages, dispatch])

  // Mobile Report Card Component
  const ReportCard = memo(({ report, index }) => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4 p-4">
      {/* Main Info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <FontAwesomeIcon
              className="text-blue-600"
              icon={faUserTie}
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {report.agent}
            </h3>
            <p className="text-xs text-gray-500">{report.village}</p>
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

      {/* Performance Summary */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-center">
          <p className="text-lg font-bold text-green-600">
            {formatFunds(report.total)}
          </p>
          <p className="text-xs text-gray-500">Total Amount</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-blue-600">
            {formatFunds(report.commission)}
          </p>
          <p className="text-xs text-gray-500">Commission (10%)</p>
        </div>
      </div>

      {/* Expanded Content */}
      {expandedRows[index] && (
        <div className="border-t border-gray-100 pt-3 space-y-3">
          {/* Financial Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500 block text-xs">Bank Transfer</span>
              <p className="font-medium text-green-600 flex items-center">
                <FontAwesomeIcon icon={faMoneyBillWave} className="w-3 h-3 mr-1" />
                {formatFunds(report.bank_transfer)}
              </p>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Bank Slips/Cheques</span>
              <p className="font-medium">{report.bank_slip}</p>
            </div>
          </div>

          {/* Location Details */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Location Details</h4>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Cell:</span>
                <p className="font-medium">{report.cell}</p>
              </div>
              <div>
                <span className="text-gray-500">Village:</span>
                <p className="font-medium">{report.village}</p>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-blue-50 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-blue-700 mb-2 flex items-center">
              <FontAwesomeIcon icon={faChartLine} className="w-3 h-3 mr-1" />
              Performance Summary
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-blue-600">Total Collected:</span>
                <p className="font-bold text-green-600">{formatFunds(report.total)}</p>
              </div>
              <div>
                <span className="text-blue-600">Commission Earned:</span>
                <p className="font-bold text-blue-600">{formatFunds(report.commission)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  ))

  return (
    <main className={`my-12`}>
      <OverlayLoading color="black" isLoading={transactionsListIsLoading} />
      <div className="flex flex-col items-center gap-6 px-4 sm:px-8">
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

        {/* Header Section */}
        <div className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Performance Reports
              </h1>
              <p className="text-sm text-gray-600">
                {`${user?.departments?.name} ${user?.department}`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Report Period: {monthPaidLabel}
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
        <div className="mt-2 flex flex-col w-[95%] mx-auto">
          <table>
            <tr className="w-100">
              <td>
                {' '}
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
                    monthPaid: true,
                  }}
                  isLoading={transactionsListIsLoading}
                  placeholder={'Search by agent names or phone'}
                  onChange={(query) => {
                    setMonthPaidLabel(
                      moment(query.monthPaid || new Date())
                        .format('MMMM YYYY')
                        .toUpperCase()
                    )
                    const queries2 = {
                      departmentId: user?.departments?.id,
                      searchTerm: query.searchTerm || '',
                      monthPaid: query.monthPaid || '',
                      village: query.village || '',
                      cell: query.cell || '',
                      sector: query.sector || '',
                      district: query.district || '',
                      province: query.province || '',

                      transaction_from: query?.dateFrom || '',
                      transaction_to: query?.dateTo || '',
                    }
                    setReportQueries({ ...queries2 })
                  }}
                  onSearch={(query) => {
                    gotoPage1(0)
                    const queries2 = {
                      departmentId: user?.departments?.id,
                      searchTerm: query.searchTerm || '',
                      monthPaid: query.monthPaid || '',
                      village: query.village || '',
                      cell: query.cell || '',
                      sector: query.sector || '',
                      district: query.district || '',
                      province: query.province || '',

                      transaction_from: query?.dateFrom || '',
                      transaction_to: query?.dateTo || '',
                    }
                    setQueries({ ...queries2 })
                    onLoadPerformances({
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center sm:text-left">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatFunds(totalAmount)} RWF
                      </p>
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-sm text-gray-600">Bank Transfer</p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatFunds(totalAmountTransferred)} RWF
                      </p>
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-sm text-gray-600">Commission (10%)</p>
                      <p className="text-xl font-bold text-orange-600">
                        {formatFunds(totalCommission)} RWF
                      </p>
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-sm text-gray-600">Total Records</p>
                      <p className="text-xl font-bold text-gray-900">
                        {totalRecords}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile View */}
                <div className="block md:hidden">
                  <div className="space-y-4">
                    {data.map((row, index) => (
                      <ReportCard
                        key={row.id || index}
                        report={row}
                        index={index}
                      />
                    ))}
                  </div>
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                  <table
                    border="1"
                    className="min-w-full divide-y divide-gray-200"
                  >
                    <thead className="bg-gray-50">
                      <tr role="row">
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          No
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Agent
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Village
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Cell
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Total
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Bank Transfer
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          10% Commission
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Bank Slips / Cheques
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.map((row, index) => (
                        <tr key={index} role="row">
                          <td
                            role="cell"
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          >
                            {row.id}
                          </td>
                          <td role="cell" className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row.agent}
                          </td>
                          <td role="cell" className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row.village}
                          </td>
                          <td role="cell" className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row.cell}
                          </td>
                          <td role="cell" className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                            {formatFunds(row.total)}
                          </td>
                          <td role="cell" className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                            {formatFunds(row.bank_transfer)}
                          </td>
                          <td role="cell" className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-orange-600">
                            {formatFunds(row.commission)}
                          </td>
                          <td role="cell" className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row.bank_slip}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalRecords === 0 && (
                  <main className="min-h-[40vh] flex items-center justify-center flex-col gap-6">
                    <h1 className="text-lg font-medium text-center text-gray-500">
                      No performance records found for this period
                    </h1>
                    <p className="text-sm text-gray-400">
                      Try adjusting your search criteria or date range
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
                  value={size}
                  onChange={(e) => {
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
Reports.propTypes = {
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

// Memoize the component for performance optimization
export default memo(Reports)
