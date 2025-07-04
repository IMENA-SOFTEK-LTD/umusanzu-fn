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
import { useLazyGetHouseholdsListQuery } from '../../states/api/apiSlice'
import OverlayLoading from '../../components/OverlayLoading'
import { toast } from 'react-toastify'

const HouseHoldsReports = ({ user, route, department, departmentId }) => {
  const dispatch = useDispatch()
  const {
    page: offset,
    size,
    totalPages,
  } = useSelector((state) => state.pagination)
  const [totalRecords, setTotalRecords] = useState(0)
  const [householdListError, setHouseholdListError] = useState(false)
  const [householdsListIsLoading, setHouseholdsListIsLoading] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0)
  const [getHouseholdsList] = useLazyGetHouseholdsListQuery()
  const [data, setData] = useState([])

  const [queries, setQueries] = useState({
    departmentId: departmentId,
    searchTerm: '',
    status: ['active', 'monthlyTarget'].includes(route)
      ? 'ACTIVE'
      : route === 'inactive'
      ? 'INACTIVE'
      : route === 'moved'
      ? 'MOVED'
      : route === 'requested'
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

  const onLoadHouseholdLists = async (data) => {
    setHouseholdsListIsLoading(true)
    try {
      await getHouseholdsList(data)
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
          setHouseholdListError(true)
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
      <OverlayLoading color="black" isLoading={householdsListIsLoading} />
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
                      Total Households:
                    </td>

                    <td className="px-6 py-4 green font-semibold">
                      {formatFunds(totalRecords) || 0}
                    </td>
                    <td className="px-6 py-4 green font-semibold">
                      Total Amount:
                    </td>
                    <td className="px-6 py-4 green font-semibold">
                      {formatFunds(totalAmount || 0)}
                      RWF
                    </td>
                  </tr>
                </tbody>
              </table>
            </caption>
            <thead className="bg-gray-50 block">
              <tr role="row" className="flex w-full">
                <th className="w-[40px] px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="w-[60px] px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="w-[200px] px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Names
                </th>
                <th className="w-[100px] px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="w-[140px] px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="w-[140px] px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="w-[100px] px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Village
                </th>
                <th className="w-[100px] px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cell
                </th>
                <th className="w-[100px] px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sector
                </th>
                <th className="w-[100px] px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  District
                </th>
                <th className="w-[100px] px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Province
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200 h-[66vh] overflow-y-auto block">
              {data?.map((row, index) => (
                <tr key={index} role="row" className="flex w-full">
                  <td className="w-[40px] px-1 py-1 whitespace-nowrap flex items-center">
                    {index + 1}
                  </td>
                  <td className="w-[90px] px-1 py-1 whitespace-nowrap">
                    <p
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
                    </p>
                  </td>
                  <td className="w-[200px] px-1 py-1 whitespace-nowrap">
                    {row.name}
                  </td>
                  <td className="w-[100px] px-1 py-1 whitespace-nowrap">
                    {formatFunds(row.ubudehe)} RWF
                  </td>
                  <td className="w-[140px] px-1 py-1 whitespace-nowrap">
                    {row.phone1}
                  </td>
                  <td className="w-[140px] px-1 py-1 whitespace-nowrap">
                    {row?.type?.toUpperCase()}
                  </td>
                  <td className="w-[100px] px-1 py-1 whitespace-nowrap">
                    {row.village}
                  </td>
                  <td className="w-[100px] px-1 py-1 whitespace-nowrap">
                    {row.cell}
                  </td>
                  <td className="w-[100px] px-1 py-1 whitespace-nowrap">
                    {row.sector}
                  </td>
                  <td className="w-[100px] px-1 py-1 whitespace-nowrap">
                    {row.district}
                  </td>
                  <td className="w-[100px] px-1 py-1 whitespace-nowrap">
                    {row.province}
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
              disabled={offset === 0 || householdsListIsLoading}
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
                  disabled={offset === 0 || householdsListIsLoading}
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
                  disabled={offset === 0 || householdsListIsLoading}
                  className="px-4 cursor-pointer hover:scale-[1.02] p-2 shadow-md"
                >
                  <span className="px-4 cursor-pointer hover:scale-[1.02] sr-only">
                    Previous
                  </span>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </PageButton>
                <PageButton
                  onClick={() => gotoPage1(Number(offset) + 1)}
                  disabled={offset >= totalPages - 1 || householdsListIsLoading}
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
                  disabled={offset >= totalPages - 1 || householdsListIsLoading}
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
HouseHoldsReports.propTypes = {
  user: PropTypes.shape({}),
  route: PropTypes.any,
  departmentId: PropTypes.any,
  department: PropTypes.any,
}

export default HouseHoldsReports
