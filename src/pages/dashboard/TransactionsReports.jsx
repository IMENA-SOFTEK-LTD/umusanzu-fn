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
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import formatFunds from '../../utils/Funds'
import PropTypes from 'prop-types'
import moment from 'moment'

const TransactionsReports = ({ user, route, department, departmentId }) => {
  const dispatch = useDispatch()
  const { page: offset, size, totalPages } = useSelector(
    (state) => state.pagination
  )
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

  const gotoPage = (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return
    dispatch(setPage(Number(newPage)))
  }

  return (
    <main className="my-0">
      <OverlayLoading color="black" isLoading={transactionsListIsLoading} />

      {/* Summary */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full">
          <tbody>
            <tr className="bg-[#F9FAFB] flex flex-wrap md:table-row">
              <td className="px-6 py-2 text-black font-semibold">Total:</td>
              <td className="px-6 py-2 green font-semibold">
                {formatFunds(totalAmount)} RWF
              </td>
              <td className="px-6 py-2 green font-semibold">Bank Transferred:</td>
              <td className="px-6 py-2 green font-semibold">
                {formatFunds(totalAmountTransferred)} RWF
              </td>
              <td className="px-6 py-2 green font-semibold">Commission(10%):</td>
              <td className="px-6 py-2 green font-semibold">
                {formatFunds(totalCommission)} RWF
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table
          border="1"
          className="min-w-full divide-y divide-gray-200 table-fixed"
        >
          <thead className="bg-gray-50">
            <tr>
              <th>No</th>
              <th>Agent</th>
              <th>Household</th>
              <th>Village</th>
              <th>Cell</th>
              <th>Period</th>
              <th>Amount</th>
              <th>Bank</th>
              <th>Commission</th>
              <th>Status</th>
              <th>Method</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{row.agent}</td>
                <td>{row.household}</td>
                <td>{row.village}</td>
                <td>{row.cell}</td>
                <td>{row.month_paid}</td>
                <td>{formatFunds(row.total)} RWF</td>
                <td>{formatFunds(row.bank_transfer)} RWF</td>
                <td>{formatFunds(row.commission)} RWF</td>
                <td>
                  <span
                    className={`${
                      row.transaction_status === 'PAID'
                        ? 'bg-green-600'
                        : row.transaction_status === 'PENDING'
                        ? 'bg-yellow-700'
                        : 'bg-blue-600'
                    } py-1 px-2 text-white rounded`}
                  >
                    {row.transaction_status}
                  </span>
                </td>
                <td>
                  {row.payment_method === 'Mobile_Money'
                    ? 'MOMO'
                    : row.payment_method}
                </td>
                <td>{moment(row.transaction_date).format('YYYY-MM-DD HH:mm')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {data.map((row, index) => (
          <div
            key={index}
            className="border rounded-md p-3 mb-3 shadow-sm"
          >
            <div className="flex justify-between items-center cursor-pointer">
              <div>
                <p className="font-semibold">{row.agent}</p>
                <p className="text-sm text-gray-500">{row.household}</p>
              </div>
              <Button
                onClick={() =>
                  setExpandedRow(expandedRow === index ? null : index)
                }
              >
                {expandedRow === index ? 'Hide' : 'Show'}
              </Button>
            </div>

            {expandedRow === index && (
              <div className="mt-2 space-y-1 text-sm">
                <p>
                  <span className="font-semibold">Village:</span> {row.village}
                </p>
                <p>
                  <span className="font-semibold">Cell:</span> {row.cell}
                </p>
                <p>
                  <span className="font-semibold">Period:</span> {row.month_paid}
                </p>
                <p>
                  <span className="font-semibold">Amount:</span>{' '}
                  {formatFunds(row.total)} RWF
                </p>
                <p>
                  <span className="font-semibold">Bank:</span>{' '}
                  {formatFunds(row.bank_transfer)} RWF
                </p>
                <p>
                  <span className="font-semibold">Commission:</span>{' '}
                  {formatFunds(row.commission)} RWF
                </p>
                <p>
                  <span className="font-semibold">Status:</span>{' '}
                  <span
                    className={`${
                      row.transaction_status === 'PAID'
                        ? 'bg-green-600'
                        : row.transaction_status === 'PENDING'
                        ? 'bg-yellow-700'
                        : 'bg-blue-600'
                    } py-1 px-2 text-white rounded`}
                  >
                    {row.transaction_status}
                  </span>
                </p>
                <p>
                  <span className="font-semibold">Method:</span>{' '}
                  {row.payment_method === 'Mobile_Money'
                    ? 'MOMO'
                    : row.payment_method}
                </p>
                <p>
                  <span className="font-semibold">Date:</span>{' '}
                  {moment(row.transaction_date).format('YYYY-MM-DD HH:mm')}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination w-[95%] mx-auto mt-4">
        <div className="py-3 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              onClick={() => gotoPage(offset - 1)}
              disabled={offset === 0 || transactionsListIsLoading}
              value="Previous"
            />
            <Button
              onClick={() => gotoPage(offset + 1)}
              disabled={offset >= totalPages - 1}
              value="Next"
            />
          </div>

          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex gap-x-2 items-center">
              <span className="text-sm text-gray-700 p-2">
                <span className="font-medium">{offset + 1}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </span>
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
            </div>

            <nav
              className="relative z-0 gap-1 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <PageButton
                onClick={() => gotoPage(0)}
                disabled={offset === 0 || transactionsListIsLoading}
              >
                <FontAwesomeIcon icon={faAnglesLeft} />
              </PageButton>
              <PageButton
                onClick={() => gotoPage(offset - 1)}
                disabled={offset === 0 || transactionsListIsLoading}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </PageButton>
              <PageButton
                onClick={() => gotoPage(offset + 1)}
                disabled={offset >= totalPages - 1 || transactionsListIsLoading}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </PageButton>
              <PageButton
                onClick={() => gotoPage(totalPages - 1)}
                disabled={offset >= totalPages - 1 || transactionsListIsLoading}
              >
                <FontAwesomeIcon icon={faAnglesRight} />
              </PageButton>
            </nav>
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
