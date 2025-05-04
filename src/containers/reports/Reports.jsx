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
} from '@fortawesome/free-solid-svg-icons'
import GlobalFilter from '../dashboard/GlobalFilter'
import { useEffect, useMemo, useState } from 'react'
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
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalCommission, setTotalCommission] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [totalAmountTransferred, setTotalAmountTransferred] = useState(0)

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

  let department = ''

  switch (user?.departments?.level_id) {
    case 1:
      department = 'province'
      dispatch(setSelectedProvince(user?.departments?.id))
      break
    case 2:
      department = 'district'
      dispatch(setSelectedDistrict(user?.departments?.id))
      break
    case 3:
      department = 'sector'
      dispatch(setSelectedSector(user?.departments?.id))
      break
    case 4:
      department = 'cell'
      dispatch(setSelectedCell(user?.departments?.id))
      break
    case 5:
      department = 'country'
      break
    case 6:
      department = 'agent'
      dispatch(setSelectedVillage(user?.departments?.id))
      break
    default:
      department = 'agent'
  }

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

  const openExportPopup = () => {
    setShowExportPopup(true)
  }

  const closeExportPopup = () => {
    setShowExportPopup(false)
  }

  useEffect(() => {
    document.title = 'Reports | Umusanzu Digital'
  }, [])

  const gotoPage1 = (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return
    dispatch(setPage(Number(newPage)))
    // Optionally trigger your API fetch here if it's not automatically triggered by page change
  }
  return (
    <main className={`my-12`}>
      <OverlayLoading color="black" isLoading={transactionsListIsLoading} />
      <div className="flex my-8 flex-col w-full items-center gap-6 relative">
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
        <div className="search-filter flex flex-col w-full items-center gap-6">
          <span className="flex flex-wrap items-center justify-between gap-4 w-full px-8 max-md:flex-col max-md:items-center">
            <div className="flex gap-2 max-md:pl-0">
              <strong>
                {`${user?.departments?.name?.toUpperCase()} ${user?.department?.toUpperCase()} TRANSACTIONS REPORT - ${monthPaidLabel}`}
              </strong>
            </div>
            <div className="flex gap-2 max-md:pl-2">
              {user?.departments.level_id !== 6 && (
                <div className="flex gap-2 justify-end">
                  <Button
                    value={
                      <span className="flex items-center gap-2">
                        Export Report
                        <FontAwesomeIcon icon={faFile} />
                      </span>
                    }
                    onClick={openExportPopup}
                  />
                </div>
              )}
            </div>
          </span>
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
                <table
                  border="1"
                  className="min-w-full divide-y divide-gray-200"
                >
                  <caption className="caption-top p-0">
                    <table className="w-[100%] mx-auto my-0 divide-y divide-gray-200">
                      <tbody>
                        <tr className="bg-[#F9FAFB] flex items-center flex-wrap">
                          <td className="px-6 py-4 text-black font-semibold">
                            Total:
                          </td>
                          <td className="px-6 py-4 green font-semibold">
                            {formatFunds(totalAmount)} RWF
                          </td>
                          <td className="px-6 py-1 green font-semibold">
                            Bank:
                          </td>
                          <td className="px-6 py-1 green font-semibold">
                            {formatFunds(totalAmountTransferred)}
                            RWF
                          </td>
                          <td className="px-6 py-4 green font-semibold">
                            Commission(10%):
                          </td>
                          <td className="px-6 py-4 green font-semibold">
                            {formatFunds(totalCommission)}
                            RWF
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </caption>
                  <thead className="bg-gray-50">
                    <tr role="row">
                      <th
                        scope="col"
                        className="px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        No
                      </th>
                      <th
                        scope="col"
                        className="px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        AGENT
                      </th>
                      <th
                        scope="col"
                        className="px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        VILLAGE
                      </th>
                      <th
                        scope="col"
                        className="px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        CELL
                      </th>
                      <th
                        scope="col"
                        className="px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        TOTAL
                      </th>
                      <th
                        scope="col"
                        className="px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        BANK
                      </th>
                      <th
                        scope="col"
                        className="px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        10% COMMISSION
                      </th>
                      <th
                        scope="col"
                        className="px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        BANK SLIPS / CHEQUES
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((row, index) => (
                      <tr key={index} role="row">
                        <td
                          role="cell"
                          className="px-1 py-1 whitespace-nowrap flex items-center "
                        >
                          {row.id}
                        </td>

                        <td role="cell" className="px-1 py-1 whitespace-nowrap">
                          {row.agent}
                        </td>
                        <td role="cell" className="px-1 py-1 whitespace-nowrap">
                          {row.village}
                        </td>
                        <td role="cell" className="px-1 py-1 whitespace-nowrap">
                          {row.cell}
                        </td>
                        <td role="cell" className="px-1 py-1 whitespace-nowrap">
                          {formatFunds(row.total)}
                        </td>
                        <td role="cell" className="px-1 py-1 whitespace-nowrap">
                          {formatFunds(row.bank_transfer)}
                        </td>
                        <td role="cell" className="px-1 py-1 whitespace-nowrap">
                          {formatFunds(row.commission)}
                        </td>
                        <td role="cell" className="px-1 py-1 whitespace-nowrap">
                          {row.bank_slip}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

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
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex gap-x-2">
              <span className="text-sm text-gray-700 p-2">
                {' '}
                <span className="font-medium">{offset + 1}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </span>
              <label>
                <span className="sr-only">Items Per Page</span>
                <select
                  className="w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
  user: PropTypes.shape({}),
}

export default Reports
