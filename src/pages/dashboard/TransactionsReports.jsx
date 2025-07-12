import Button, { PageButton } from '../../components/Button'
import { useDispatch, useSelector } from 'react-redux'
import {
  setSelectedCell,
  setSelectedDistrict,
  setSelectedProvince,
  setSelectedSector,
  setSelectedVillage,
} from '../../states/features/modals/householdSlice'
import {
  faAnglesLeft,
  faAnglesRight,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import formatFunds from '../../utils/Funds'
import {
  setPage,
  setSize,
  setTotalPages,
} from '../../states/features/pagination/paginationSlice'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useLazyGetTransactionReportsQuery } from '../../states/api/apiSlice'
import OverlayLoading from '../../components/OverlayLoading'
import { toast } from 'react-toastify'
import moment from 'moment'

const TransactionsReports = ({ user, route, department, departmentId }) => {
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
  const [transactionListError, setTransactionListError] = useState(false)
  const [transactionsListIsLoading, setTransactionListIsLoading] =
    useState(false)
  const [getTransactionReports] = useLazyGetTransactionReportsQuery()
  const [data, setData] = useState([])

  const [queries, setQueries] = useState({
    departmentId: departmentId,
    route: route,
    department,
  })

  useEffect(() => {
    onTransactionReports({
      size,
      page: offset,
      ...queries,
    })
  }, [size, offset])

  const onTransactionReports = async (data) => {
    setTransactionListIsLoading(true)
    try {
      await getTransactionReports(data)
        .unwrap()
        .then((res) => {
          dispatch(setTotalPages(res?.data?.totalPages))
          setTotalRecords(res?.data?.count)
          setTotalAmount(res?.data?.totalAmount)
          setTotalCommission(res?.data?.totalCommission)
          setTotalAmountTransferred(res?.data?.totalAmountTransferred)

          setData(
            res?.data?.rows?.map((item, index) => ({
              id: index + 1,
              household: item?.household,
              village: item?.village_name,
              agent: item?.agent_names,
              cell: item?.cell_name,
              month_paid: item?.month_paid,
              
              transaction_status: item?.transaction_status,
              payment_status: item?.payment_status,
              payment_method: item?.payment_method,
              payment_date: item?.payment_date,
              total: item?.total_amount,
              bank_transfer: item?.total_amount_transferred,
              commission: item?.total_commission,
              bank_slip: 0,
            })) || []
          )
        })
        .catch((error) => {
          setTransactionListError(true)
          if (error.data && error.data.message) {
            toast.error(error.data.message)
          } else {
            toast.error(
              'An error occurred while retrieving the household lists. Please try again'
            )
          }
        })
        .finally(() => {
          setTransactionListIsLoading(false)
        })
    } catch (error) {
      return error
    }
  }

  const gotoPage1 = (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return
    dispatch(setPage(Number(newPage)))
    // Optionally trigger your API fetch here if it's not automatically triggered by page change
  }
  return (
    <main className={`my-0`}>
      <OverlayLoading color="black" isLoading={transactionsListIsLoading} />
      <div className="overflow-x-auto">
        <div className="overflow-x-auto">
          <table
            border="1"
            className="min-w-full divide-y divide-gray-200 table-fixed"
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
                      Bank Transferred:
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
            <thead className="bg-gray-50 block">
              <tr role="row" className="flex w-full">
                <th className="w-[25px] px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="text-left w-[250px] px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="text-left w-[250px] px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Household
                </th>

                <th className="text-left w-[220px] px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Village
                </th>
                <th className="text-left w-[220px] px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cell
                </th>
                <th className="text-center w-[80px] px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>

                <th className="text-center w-[100px] px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-center w-[100px] px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bank
                </th>
                <th className="text-center w-[100px] px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>

                <th className="text-center w-[100px] px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-center w-[100px] px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="text-right w-[100px] px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200 h-[66vh] overflow-y-auto block">
              {data?.map((row, index) => (
                <tr key={index} role="row" className="flex w-full">
                  <td className="w-[25px] px-1 py-1 whitespace-nowrap flex items-center">
                    {index + 1}
                  </td>
                  <td className="text-left w-[250px] px-1 py-1 whitespace-nowrap">
                    {row?.agent}
                  </td>
                  <td className="text-left w-[250px] px-1 py-1 whitespace-nowrap">
                    {row.household}
                  </td>
                  <td className="text-left w-[220px] px-1 py-1 whitespace-nowrap">
                    {row.village}
                  </td>
                  <td className="text-left w-[220px] px-1 py-1 whitespace-nowrap">
                    {row.cell}
                  </td>
                   <td className="text-left w-[80px] px-1 py-1 whitespace-nowrap">
                    {row.month_paid}
                  </td>
                  <td className="text-center w-[100px] px-1 py-1 whitespace-nowrap">
                    {formatFunds(row.total)} RWF
                  </td>
                  <td className="text-center w-[100px] px-1 py-1 whitespace-nowrap">
                    {formatFunds(row.bank_transfer)} RWF
                  </td>
                  <td className="text-center w-[100px] px-1 py-1 whitespace-nowrap">
                    {formatFunds(row.commission)} RWF
                  </td>

                  <td className="w-[100px] px-1 py-1 whitespace-nowrap text-right">
                    <p
                      className={`${
                        row?.transaction_status === 'PAID'
                          ? 'bg-green-600'
                          : row?.transaction_status === 'PENDING'
                          ? 'bg-yellow-700'
                          : 'bg-blue-600'
                      } py-0 flex items-center justify-center text-white rounded-sm px-3`}
                    >
                      {row?.transaction_status}
                    </p>
                  </td>
                  <td className="w-[100px] px-1 py-1 whitespace-nowrap text-right">
                    {row.payment_method === 'Mobile_Money'
                      ? 'MOMO'
                      : row.payment_method}
                  </td>
                  <td className="w-[100px] px-1 py-1 whitespace-nowrap">
                    {moment(row.transaction_date).format('YYYY-MM-DD HH:mm')}
                  </td>
                </tr>
              ))}
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
TransactionsReports.propTypes = {
  user: PropTypes.shape({}),
  route: PropTypes.any,
  departmentId: PropTypes.any,
  department: PropTypes.any,
}

export default TransactionsReports
