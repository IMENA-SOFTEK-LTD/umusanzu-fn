import 'core-js/stable'
import 'jspdf-autotable'
import 'regenerator-runtime/runtime'
import { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import queryString from 'query-string'
import {
  faAnglesLeft,
  faAnglesRight,
  faChevronLeft,
  faChevronRight,
  faHouseChimney,
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
import {
  useCancelMoveHouseholdMutation,
  useLazyGetHouseholdsListQuery,
  useMoveHouseholdMutation,
} from '../../states/api/apiSlice'
import Loading from '../../components/Loading'
import Button, { PageButton } from '../../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector, useDispatch } from 'react-redux'
import Input from '../../components/Input'
import {
  setSelectedCell,
  setSelectedSector,
  setSelectedVillage,
} from '../../states/features/modals/householdSlice'
import { toast } from 'react-toastify'
import OverlayLoading from '../../components/OverlayLoading'
import { Controller, useForm } from 'react-hook-form'
import { SelectColumnFilter } from '../dashboard/HouseholdTable'
import formatFunds from '../../utils/Funds'

const SearchHousehold = ({ user }) => {
  const { control, handleSubmit } = useForm()
  const [totalRecords, setTotalRecords] = useState(0)
  const [householdsListIsLoading, setHouseholdsListIsLoading] = useState(false)
  const [householdListError, setHouseholdListError] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0)

  const [getHouseholdsList] = useLazyGetHouseholdsListQuery()

  const [
    moveHousehold,
    {
      data: moveHouseholdData,
      isLoading: moveHouseholdIsLoading,
      isSuccess: moveHouseholdIsSuccess,
      isError: moveHouseholdIsError,
    },
  ] = useMoveHouseholdMutation()

  const [
    cancelMoveHousehold,
    {
      data: cancelMoveHouseholdData,
      isLoading: cancelMoveHouseholdIsLoading,
      isSuccess: cancelMoveHouseholdIsSuccess,
      isError: cancelMoveHouseholdIsError,
    },
  ] = useCancelMoveHouseholdMutation()

  const {
    page: offset,
    size,
    totalPages,
  } = useSelector((state) => state.pagination)

  const dispatch = useDispatch()

  const { sectorId, userOrSelectedDepartmentNames } = useSelector(
    (state) => state.departments
  )

  const queryRoute = queryString.parse(location.search)

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

  const [data, setData] = useState([])
  const [queries, setQueries] = useState({
    departmentId: user?.departments?.id,
    searchTerm: '',
    route: queryRoute?.query || '',
    status: queryRoute?.query === 'monthlyTarget' ? '' : 'ACTIVE',
    village: '',
    cell: '',
    sector: '',
    district: '',
    province: '',
  })

  // useEffect(() => {
  //   onLoadHouseholdLists({
  //     department,
  //     size,
  //     page: offset,
  //     ...queries,
  //   })
  // }, [size, offset])

  const onSubmit = async (data) => {
    if (!data.search) {
      return;
    }
    setHouseholdsListIsLoading(true)
    try {
      const payload = {
        department,
        size,
        page: offset,
        ...queries,
        searchTerm: data.search,
        departmentId: user?.departments?.id,
        query: 'search',
        level: department,
      }
      await getHouseholdsList(payload)
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

  const columns = useMemo(
    () => [
      {
        id: 'ID',
        Header: 'Details',
        accessor: 'ID',
        Cell: ({ row }) => (
          <Button
            className="!p-0 !py-0 !px-0 !rounded-[50%]"
            route={`/households/${row.original.ID}`}
            value={
              <span>
                <FontAwesomeIcon
                  className="p-2 px-[10px]"
                  icon={faHouseChimney}
                />
              </span>
            }
          />
        ),
      },
      {
        Header: 'Status',
        accessor: 'status',
        Filter: SelectColumnFilter,
        Cell: ({ row }) => (
          <span className="flex flex-col items-center gap-[4px]">
            <p
              className={`${
                row?.original?.status === 'ACTIVE'
                  ? 'bg-green-600'
                  : row?.original?.status === 'MOVED' ||
                    row?.original?.status === 'REQUESTED'
                  ? 'bg-yellow-700'
                  : 'bg-red-600'
              } p-2 flex items-center justify-center text-white rounded-sm`}
            >
              {row?.original?.status}
            </p>
            {/* IF ADMIN */}
            {/* IF YOU ARE COUNTRY LEVEL AND SECTOR */}
            {user?.staff_role === 1 &&
              [3, 5].includes(user?.departments?.level_id) && (
                <span className="flex items-center gap-[3px]">
                  <Button
                    value="Approve"
                    className={
                      row?.original?.status === 'REQUESTED'
                        ? '!bg-green-600'
                        : '!hidden'
                    }
                    onClick={(e) => {
                      e.preventDefault()
                      const payload = {
                        name: row?.original?.name,
                        ubudehe: row?.original?.ubudehe,
                        nid: row?.original?.nid,
                        phone1: row?.original?.phone1,
                        phone2: row?.original?.phone2,
                        village: row?.original?.villageId,
                        cell: row?.original?.cellId,
                        sector: row?.original?.sectorId,
                        district: row?.original?.districtId,
                        province: row?.original?.provinceId,
                        email: row?.original?.email,
                        existingHouseholdId: row?.original?.ID,
                      }
                      // console.log(payload)
                      moveHousehold(payload)
                    }}
                  />
                  {row?.original?.status === 'REQUESTED' && (
                    <Button
                      value={`${
                        row?.original?.status === 'REQUESTED'
                          ? 'Deny'
                          : 'Return'
                      }`}
                      className={
                        row?.original?.status === 'REQUESTED'
                          ? '!bg-red-600'
                          : row?.original?.status === 'MOVED'
                          ? '!bg-green-600'
                          : '!hidden'
                      }
                      onClick={(e) => {
                        e.preventDefault()
                        cancelMoveHousehold({
                          id: row?.original?.ID,
                        })
                      }}
                    />
                  )}
                </span>
              )}
          </span>
        ),
      },

      {
        Header: 'Names',
        accessor: 'name',
        sortable: true,
      },
      {
        Header: 'Amount',
        accessor: 'ubudehe',
        sortable: true,
        Filter: SelectColumnFilter,
      },
      {
        Header: 'phone',
        accessor: 'phone1',
        sortable: true,
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
        Header: 'Province',
        accessor: 'province',
        sortable: true,
        Filter: SelectColumnFilter,
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
    document.title = 'Households | Umusanzu Digital'
  }, [])

  const gotoPage1 = (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return
    dispatch(setPage(Number(newPage)))
    // Optionally trigger your API fetch here if it's not automatically triggered by page change
  }

  return (
    <main className={`my-12`}>
      <OverlayLoading color="black" isLoading={householdsListIsLoading} />
      <section className="p-2 flex flex-col items-center gap-4 w-[70%] mx-auto">
        <h1 className="text-[20px] text-center uppercase font-bold text-primary">
          Start searching
        </h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex items-center gap-4"
        >
          <Controller
            name="search"
            control={control}
            render={({ field }) => {
              return (
                <Input
                  type="text"
                  placeholder="Enter name, phone, or location"
                  {...field}
                />
              )
            }}
          />
          <Controller
            name="submit"
            control={control}
            render={({ field }) => {
              return (
                <Button
                  submit
                  material
                  isLoading={householdsListIsLoading}
                  value={'Search'}
                />
              )
            }}
          />
        </form>
      </section>
      <div className="flex my-8 flex-col w-full items-center gap-6 relative">
         <div className="flex gap-2 max-md:pl-0">
                      <dl className="mt-1 max-w-xl space-y-8 text-base/7 text-gray-600 lg:max-w-none">
                        <div className="relative pl-0">
                          <dt className="inline font-semibold text-gray-900">
                            Total{' '}
                            {queryRoute?.query === 'monthlyTarget' && (
                              <>Monthly Target</>
                            )}{' '}
                            {queries?.status && (
                              <span
                                className={`text-${
                                  queries?.status?.toLocaleLowerCase() === 'active'
                                    ? 'green'
                                    : 'red'
                                }-600`}
                              >
                                {queries?.status.toLocaleLowerCase() || 'Active'}
                              </span>
                            )}{' '}
                            Households: {totalPages || 0}
                          </dt>{' '}
                          <dd className="inline">
                            - Total Amount: {formatFunds(totalAmount || 0)} RWF
                          </dd>
                        </div>
                      </dl>
                    </div>

        <div className="mt-2 flex flex-col w-[95%] mx-auto">
          <div className="-my-2 overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg flex flex-col gap-4">
                {/* Export Popup/Modal */}

                {moveHouseholdIsLoading || cancelMoveHouseholdIsLoading ? (
                  <span className="flex flex-col items-center justify-center min-h-[30vh]">
                    <Loading />
                    <h4 className="uppercase text-primary text-md font-bold text-center">
                      {moveHouseholdIsLoading
                        ? 'Moving Household...'
                        : 'Cancelling request...'}
                    </h4>
                  </span>
                ) : moveHouseholdIsSuccess || cancelMoveHouseholdIsSuccess ? (
                  <span className="flex flex-col items-center justify-center gap-4 min-h-[30vh]">
                    <h4 className="uppercase text-primary text-md font-bold text-center">
                      {moveHouseholdIsSuccess
                        ? 'Household moved successfully'
                        : 'Request cancelled successfully'}
                    </h4>
                    <Button
                      value={`${
                        moveHouseholdIsSuccess
                          ? 'View household'
                          : 'Go to dashboard'
                      }`}
                      route={
                        moveHouseholdIsSuccess
                          ? `/households/${moveHouseholdData?.data?.id}`
                          : '/dashboard'
                      }
                    />
                  </span>
                ) : (
                  <>
                    <table
                      {...getTableProps()}
                      border="1"
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
                  </>
                )}
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

SearchHousehold.propTypes = {
  user: PropTypes.shape({}),
}

export default SearchHousehold
