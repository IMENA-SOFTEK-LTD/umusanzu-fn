import Button, { PageButton } from '../../components/Button'
import { useDispatch, useSelector } from 'react-redux'
import {
  setPage,
  setSize,
  setTotalPages,
} from '../../states/features/pagination/paginationSlice'
import { useLazyGetTransactionReportsQuery } from '../../states/api/apiSlice'
import OverlayLoading from '../../components/OverlayLoading'
import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faAnglesLeft,
  faAnglesRight,
  faArrowDownLong,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import formatFunds from '../../utils/Funds'
import PropTypes from 'prop-types'
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
  const [transactionsListIsLoading, setTransactionListIsLoading] =
    useState(false)
  const [getTransactionReports] = useLazyGetTransactionReportsQuery()
  const [data, setData] = useState([])
  const [expandedRow, setExpandedRow] = useState(null)

  const [queries] = useState({
    departmentId,
    route,
    department,
  })

  useEffect(() => {
    fetchTransactions({ size, page: offset, ...queries })
  }, [size, offset])

  const fetchTransactions = async (payload) => {
    setTransactionListIsLoading(true)
    try {
      const res = await getTransactionReports(payload).unwrap()
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
    } catch (error) {
      toast.error(
        error?.data?.message ||
          'An error occurred while retrieving the transaction list.'
      )
    } finally {
      setTransactionListIsLoading(false)
    }
  }

  const gotoPage1 = (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return
    dispatch(setPage(Number(newPage)))
  }

  return (
    <main className="my-0">
      <OverlayLoading color="black" isLoading={transactionsListIsLoading} />

      <div className="overflow-x-auto">
        {/* Table header info */}
        <div className="bg-[#F9FAFB] flex flex-wrap items-center px-4 py-2 text-sm">
          <div className="mr-4 font-semibold">
            Total: {formatFunds(totalAmount) || 0}
          </div>
          <div className="font-semibold mr-4">
            Transferred: {formatFunds(totalAmountTransferred || 0)} RWF
          </div>
          <div className="font-semibold ">
            Commission(10%): {formatFunds(totalCommission || 0)} RWF
          </div>
        </div>

        {/* Desktop Table */}
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50 hidden md:table-header-group">
            <tr>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">
                No
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">
                Agent
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">
                Household
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">
                Village
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">
                Period
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">
                Amount
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">
                Bank
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">
                Commission
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">
                Status
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">
                Method
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">
                Date
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {data?.map((row, index) => {
              const isExpanded = expandedRow === index
              return (
                <tr
                  key={index}
                  className="cursor-pointer md:table-row block md:cursor-default"
                  onClick={() => setExpandedRow(isExpanded ? null : index)}
                >
                  <td className="hidden md:table-cell px-2 py-1">
                    {index + 1}
                  </td>
                  <td className="hidden md:table-cell px-2 py-1">
                    {row.agent}
                  </td>
                  <td className="hidden md:table-cell px-2 py-1">
                    {row.household}
                  </td>
                  <td className="hidden md:table-cell px-2 py-1">
                    {row.village}
                  </td>
                  {/* <td>{row.cell}</td> */}
                  <td className="hidden md:table-cell px-2 py-1">
                    {row.month_paid}
                  </td>
                  <td className="hidden md:table-cell px-2 py-1">
                    {formatFunds(row.total)} RWF
                  </td>
                  <td className="hidden md:table-cell px-2 py-1">
                    {formatFunds(row.bank_transfer)} RWF
                  </td>
                  <td className="hidden md:table-cell px-2 py-1">
                    {formatFunds(row.commission)} RWF
                  </td>
                  <td className="hidden md:table-cell px-2 py-1">
                    <span
                      className={`${
                        row.transaction_status === 'PAID'
                          ? 'bg-green-600'
                          : row.transaction_status === 'PENDING'
                          ? 'bg-yellow-700'
                          : 'bg-blue-600'
                      } py-0 flex items-center justify-center text-white rounded-sm px-3`}
                    >
                      {row.transaction_status}
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-2 py-1">
                    {row.payment_method === 'Mobile_Money'
                      ? 'MOMO'
                      : row.payment_method}
                  </td>
                  <td className="hidden md:table-cell px-2 py-1">
                    {moment(row.transaction_date).format('YYYY-MM-DD HH:mm')}
                  </td>
                  <td className="md:hidden block w-full px-2 py-2">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold">{row.agent}</p>
                        <p className="text-xs text-gray-500">
                          Status:{' '}
                          <span
                            className={`${
                              row.transaction_status === 'PAID'
                                ? 'text-green-600'
                                : row.transaction_status === 'PENDING'
                                ? 'text-yellow-700'
                                : 'text-blue-600'
                            }`}
                          >
                            {row.transaction_status}
                          </span>{' '}
                          | Household: {row.household}
                        </p>
                        {isExpanded && (
                          <div className="mt-1 text-xs text-gray-700">
                            <p>Period: {row.month_paid} </p>
                            <p>Village: {row.village}</p>
                            <p>Cell: {row.cell}</p>
                            <p>Amount: {formatFunds(row.total)} RWF</p>
                            <p>Bank: {formatFunds(row.bank_transfer)} RWF</p>
                            <p>Commission: {formatFunds(row.commission)} RWF</p>
                            <p>
                              Method:{' '}
                              {row.payment_method === 'Mobile_Money'
                                ? 'MOMO'
                                : row.payment_method}
                            </p>
                            <p>
                              Date:{' '}
                              {moment(row.transaction_date).format(
                                'YYYY-MM-DD HH:mm'
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="text-gray-400 text-xs">
                        #{index + 1}{' '}
                        <FontAwesomeIcon icon={faArrowDownLong} size="lg" />
                      </div>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {/* No records */}
      {totalRecords === 0 && (
        <div className="min-h-[40vh] flex items-center justify-center flex-col gap-6">
          <h1 className="text-[25px] font-medium text-center">
            No record found
          </h1>
        </div>
      )}

      {/* Pagination */}
      <div className="pagination w-[100%] mx-auto">
        <div className="py-3 flex items-center justify-between">
          {/* Mobile */}
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              onClick={() => gotoPage1(Number(offset) - 1)}
              disabled={offset === 0 || transactionsListIsLoading}
              value="Previous"
            />
            <Button
              onClick={() => gotoPage1(Number(offset) + 1)}
              disabled={offset >= totalPages - 1}
              value="Next"
            />
          </div>

          {/* Desktop */}
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex gap-x-2">
              <span className="text-sm text-gray-700 p-2">
                <span className="font-medium">{offset + 1}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </span>
              <label>
                <span className="sr-only">Items Per Page</span>
                <select
                  className="w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  value={size}
                  onChange={(e) => dispatch(setSize(Number(e.target.value)))}
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
                >
                  <FontAwesomeIcon icon={faAnglesLeft} />
                </PageButton>
                <PageButton
                  onClick={() => gotoPage1(Number(offset) - 1)}
                  disabled={offset === 0 || transactionsListIsLoading}
                  className="px-4 cursor-pointer hover:scale-[1.02] p-2 shadow-md"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </PageButton>
                <PageButton
                  onClick={() => gotoPage1(Number(offset) + 1)}
                  disabled={
                    offset >= totalPages - 1 || transactionsListIsLoading
                  }
                  className="px-4 cursor-pointer hover:scale-[1.02] shadow-md"
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </PageButton>
                <PageButton
                  className="px-4 cursor-pointer hover:scale-[1.02] rounded-r-md shadow-md"
                  onClick={() => gotoPage1(Number(totalPages) - 1)}
                  disabled={
                    offset >= totalPages - 1 || transactionsListIsLoading
                  }
                >
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
