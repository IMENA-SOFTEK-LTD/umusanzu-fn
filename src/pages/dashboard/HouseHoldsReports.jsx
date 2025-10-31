import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import {
  setPage,
  setSize,
  setTotalPages,
} from '../../states/features/pagination/paginationSlice'
import { useEffect, useState } from 'react'
import {
  faAnglesLeft,
  faAnglesRight,
  faArrowCircleDown,
  faArrowDownLong,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useLazyGetHouseholdsListQuery } from '../../states/api/apiSlice'
import { toast } from 'react-toastify'
import OverlayLoading from '../../components/OverlayLoading'
import Button, { PageButton } from '../../components/Button'
import formatFunds from '../../utils/Funds'

const HouseHoldsReports = ({ user, route, department, departmentId }) => {
  const dispatch = useDispatch()
  const {
    page: offset,
    size,
    totalPages,
  } = useSelector((state) => state.pagination)

  const [totalRecords, setTotalRecords] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [data, setData] = useState([])
  const [householdsListIsLoading, setHouseholdsListIsLoading] = useState(false)
  const [getHouseholdsList] = useLazyGetHouseholdsListQuery()
  const [expandedRow, setExpandedRow] = useState(null)
  console.log(route)
  const [queries] = useState({
    departmentId,
    searchTerm: '',
    status: ['active', 'monthlyTarget', 'activeHouseholds'].includes(route)
      ? 'ACTIVE'
      : route === 'inactiveHouseholds'
      ? 'INACTIVE'
      : route === 'movedHouseholds'
      ? 'MOVED'
      : route === 'requestedHouseholds'
      ? 'REQUESTED'
      : '',
    village: '',
    cell: '',
    sector: '',
    district: '',
    province: '',
    query: route === 'monthlyTarget' ? 'monthlyTarget' : '',
  })

  useEffect(() => {
    onLoadHouseholdLists({
      department,
      size,
      page: offset,
      ...queries,
    })
  }, [size, offset])

  const onLoadHouseholdLists = async (params) => {
    setHouseholdsListIsLoading(true)
    try {
      await getHouseholdsList(params)
        .unwrap()
        .then((res) => {
          dispatch(setTotalPages(res?.data?.totalPages))
          setTotalRecords(res?.data?.count)
          setTotalAmount(res?.data?.totalAmount)
          setData(
            res?.data?.rows?.map((row, index) => ({
              ID: row?.id,
              id: index + 1,
              name: row?.name,
              nid: row?.nid,
              email: row?.email,
              phone1: row?.phone1,
              phone2: row?.phone2,
              ubudehe: row?.ubudehe,
              status: row?.status,
              village: row?.village_name,
              villageId: row?.village,
              cell: row?.cell_name,
              cellId: row?.cell,
              sector: row?.sector_name,
              sectorId: row?.sector,
              district: row?.district_name,
              districtId: row?.district,
              province: row?.province_name,
              provinceId: row?.province,
              type: row?.type,
            })) || []
          )
        })
        .catch((error) => {
          if (error.data && error.data.message) {
            toast.error(error.data.message)
          } else {
            toast.error(
              'An error occurred while retrieving the household lists. Please try again'
            )
          }
        })
        .finally(() => {
          setHouseholdsListIsLoading(false)
        })
    } catch (error) {
      setHouseholdsListIsLoading(false)
    }
  }

  const gotoPage1 = (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return
    dispatch(setPage(Number(newPage)))
  }

  return (
    <main className="my-0">
      <OverlayLoading color="black" isLoading={householdsListIsLoading} />

      <div className="overflow-x-auto">
        {/* Table header info */}
        <div className="bg-[#F9FAFB] flex flex-wrap items-center px-4 py-2 text-sm">
          <div className="mr-4 font-semibold">
            Total Households: {formatFunds(totalRecords) || 0}
          </div>
          <div className="font-semibold">
            Total Amount: {formatFunds(totalAmount || 0)} RWF
          </div>
        </div>

        {/* Table */}
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50 hidden md:table-header-group">
            <tr>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">
                No
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">
                Status
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">
                Names
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">
                Amount
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">
                Phone
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">
                Type
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">
                Village
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">
                Cell
              </th>
              {/* <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">
                Sector
              </th> */}
              {/* <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">
                District
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">
                Province
              </th> */}
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
                  {/* Desktop cells */}
                  <td className="hidden md:table-cell px-2 py-1">
                    {index + 1}
                  </td>
                  <td className="hidden md:table-cell px-2 py-1">
                    <span
                      className={`${
                        row?.status === 'ACTIVE'
                          ? 'bg-green-600'
                          : row?.status === 'MOVED' ||
                            row?.status === 'REQUESTED'
                          ? 'bg-yellow-700'
                          : 'bg-red-600'
                      } py-0 flex items-center justify-center text-white rounded-sm px-3`}
                    >
                      {row?.status}
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-2 py-1">{row.name}</td>
                  <td className="hidden md:table-cell px-2 py-1">
                    {formatFunds(row.ubudehe)} RWF
                  </td>
                  <td className="hidden md:table-cell px-2 py-1">
                    {row.phone1}
                  </td>
                  <td className="hidden md:table-cell px-2 py-1">
                    {row?.type?.toUpperCase()}
                  </td>
                  <td className="hidden md:table-cell px-2 py-1">
                    {row.village}
                  </td>
                  <td className="hidden md:table-cell px-2 py-1">{row.cell}</td>
                  {/* <td className="hidden md:table-cell px-2 py-1">
                    {row.sector}
                  </td> */}
                  {/* <td className="hidden md:table-cell px-2 py-1">
                    {row.district}
                  </td>
                  <td className="hidden md:table-cell px-2 py-1">
                    {row.province}
                  </td> */}

                  {/* Mobile view */}
                  <td className="md:hidden block w-full px-2 py-2">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold">{row.name}</p>
                        <p className="text-xs text-gray-500">
                          Status:{' '}
                          <span
                            className={`${
                              row?.status === 'ACTIVE'
                                ? 'text-green-600'
                                : row?.status === 'MOVED' ||
                                  row?.status === 'REQUESTED'
                                ? 'text-yellow-700'
                                : 'text-red-600'
                            }`}
                          >
                            {row?.status}
                          </span>{' '}
                          | Phone: {row.phone1}
                        </p>
                        {isExpanded && (
                          <div className="mt-1 text-xs text-gray-700">
                            <p>Amount: {formatFunds(row.ubudehe)} RWF</p>
                            <p>Type: {row?.type?.toUpperCase()}</p>
                            <p>Village: {row.village}</p>
                            <p>Cell: {row.cell}</p>
                            <p>Sector: {row.sector}</p>
                            <p>District: {row.district}</p>
                            <p>Province: {row.province}</p>
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
              disabled={offset === 0 || householdsListIsLoading}
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
                  disabled={offset === 0 || householdsListIsLoading}
                  onClick={() => gotoPage1(0)}
                >
                  <FontAwesomeIcon icon={faAnglesLeft} />
                </PageButton>
                <PageButton
                  onClick={() => gotoPage1(Number(offset) - 1)}
                  disabled={offset === 0 || householdsListIsLoading}
                  className="px-4 cursor-pointer hover:scale-[1.02] p-2 shadow-md"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </PageButton>
                <PageButton
                  onClick={() => gotoPage1(Number(offset) + 1)}
                  disabled={offset >= totalPages - 1 || householdsListIsLoading}
                  className="px-4 cursor-pointer hover:scale-[1.02] shadow-md"
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </PageButton>
                <PageButton
                  className="px-4 cursor-pointer hover:scale-[1.02] rounded-r-md shadow-md"
                  onClick={() => gotoPage1(Number(totalPages) - 1)}
                  disabled={offset >= totalPages - 1 || householdsListIsLoading}
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

HouseHoldsReports.propTypes = {
  user: PropTypes.shape({}),
  route: PropTypes.any,
  departmentId: PropTypes.any,
  department: PropTypes.any,
}

export default HouseHoldsReports
