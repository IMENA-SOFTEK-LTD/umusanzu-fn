import 'core-js/stable'
import 'jspdf-autotable'
import 'regenerator-runtime/runtime'
import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import PropTypes from 'prop-types'
import queryString from 'query-string'
import {
  faAnglesLeft,
  faAnglesRight,
  faChevronLeft,
  faChevronRight,
  faHouseChimney,
  faChevronDown,
  faChevronUp,
  faSearch,
  faUser,
  faPhone,
  faMapMarkerAlt,
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
  
  // State management
  const [totalRecords, setTotalRecords] = useState(0)
  const [householdsListIsLoading, setHouseholdsListIsLoading] = useState(false)
  const [householdListError, setHouseholdListError] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0)
  const [expandedRows, setExpandedRows] = useState({})

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

  // Toggle row expansion for mobile view
  const toggleRowExpansion = useCallback((index) => {
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
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
      return
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

  const gotoPage1 = useCallback((newPage) => {
    if (newPage < 0 || newPage >= totalPages) return
    dispatch(setPage(Number(newPage)))
  }, [totalPages, dispatch])

  // Mobile Household Card Component
  const HouseholdCard = memo(({ household, index }) => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4 p-4">
      {/* Main Info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Button
            className="!p-2 !rounded-full !bg-blue-100 hover:!bg-blue-200"
            route={`/households/${household.ID}`}
            value={
              <FontAwesomeIcon
                className="text-blue-600"
                icon={faHouseChimney}
              />
            }
          />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {household.name}
            </h3>
            <p className="text-xs text-gray-500 flex items-center">
              <FontAwesomeIcon icon={faPhone} className="w-3 h-3 mr-1" />
              {household.phone1}
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
            household.status === 'ACTIVE'
              ? 'bg-green-100 text-green-800'
              : household.status === 'MOVED' || household.status === 'REQUESTED'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {household.status}
        </span>
      </div>

      {/* Expanded Content */}
      {expandedRows[index] && (
        <div className="border-t border-gray-100 pt-3 space-y-3">
          {/* Household Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500 block text-xs">Amount</span>
              <p className="font-medium text-green-600">{formatFunds(household.ubudehe)}</p>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Email</span>
              <p className="font-medium">{household.email || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">NID</span>
              <p className="font-medium">{household.nid || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Phone 2</span>
              <p className="font-medium">{household.phone2 || 'N/A'}</p>
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
                <span className="text-gray-500">Village:</span>
                <p className="font-medium">{household.village}</p>
              </div>
              <div>
                <span className="text-gray-500">Cell:</span>
                <p className="font-medium">{household.cell}</p>
              </div>
              <div>
                <span className="text-gray-500">Sector:</span>
                <p className="font-medium">{household.sector}</p>
              </div>
              <div>
                <span className="text-gray-500">District:</span>
                <p className="font-medium">{household.district}</p>
              </div>
              <div>
                <span className="text-gray-500">Province:</span>
                <p className="font-medium">{household.province}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {user?.staff_role === 1 && [3, 5].includes(user?.departments?.level_id) && (
            <div className="flex gap-2 mt-3">
              {household.status === 'REQUESTED' && (
                <>
                  <Button
                    value="Approve"
                    className="!bg-green-600 !text-white !text-xs !py-1 !px-3"
                    onClick={(e) => {
                      e.preventDefault()
                      const payload = {
                        name: household.name,
                        ubudehe: household.ubudehe,
                        nid: household.nid,
                        phone1: household.phone1,
                        phone2: household.phone2,
                        village: household.villageId,
                        cell: household.cellId,
                        sector: household.sectorId,
                        district: household.districtId,
                        province: household.provinceId,
                        email: household.email,
                        existingHouseholdId: household.ID,
                      }
                      moveHousehold(payload)
                    }}
                  />
                  <Button
                    value="Deny"
                    className="!bg-red-600 !text-white !text-xs !py-1 !px-3"
                    onClick={(e) => {
                      e.preventDefault()
                      cancelMoveHousehold({ id: household.ID })
                    }}
                  />
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  ))

  return (
    <main className={`my-12`}>
      <OverlayLoading color="black" isLoading={householdsListIsLoading} />
      {/* Search Section */}
      <section className="p-4 sm:p-6 flex flex-col items-center gap-4 w-full max-w-2xl mx-auto">
        <div className="text-center">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            Search Households
          </h1>
          <p className="text-sm text-gray-600">
            Enter name, phone number, or location to find households
          </p>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col sm:flex-row items-center gap-3 sm:gap-4"
        >
          <div className="w-full">
            <Controller
              name="search"
              control={control}
              render={({ field }) => {
                return (
                  <Input
                    type="text"
                    placeholder="Enter name, phone, or location"
                    className="w-full"
                    {...field}
                  />
                )
              }}
            />
          </div>
          <Controller
            name="submit"
            control={control}
            render={({ field }) => {
              return (
                <Button
                  submit
                  material
                  isLoading={householdsListIsLoading}
                  className="w-full sm:w-auto flex items-center gap-2"
                  value={
                    <span className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faSearch} className="w-4 h-4" />
                      <span>Search</span>
                    </span>
                  }
                />
              )
            }}
          />
        </form>
      </section>
      <div className="flex my-8 flex-col w-full items-center gap-6 relative px-4 sm:px-8">
        {/* Summary Stats */}
        {totalRecords > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 w-full max-w-4xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-600">Total Households</p>
                <p className="text-xl font-bold text-gray-900">
                  {totalRecords || 0}
                </p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-xl font-bold text-green-600">
                  {formatFunds(totalAmount || 0)} RWF
                </p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-lg font-semibold text-blue-600">
                  {queries?.status?.toLowerCase() || 'Active'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-0 flex flex-col w-full max-w-6xl mx-auto">
          <div className="overflow-x-auto">
            <div className="py-2 align-middle inline-block min-w-full">
              <div className="shadow overflow-hidden flex flex-col gap-4 border-b border-gray-200">
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
                    {/* Mobile View */}
                    <div className="block md:hidden">
                      <div className="space-y-4">
                        {page.map((row, index) => {
                          prepareRow(row)
                          return (
                            <HouseholdCard
                              key={row.original.ID || index}
                              household={row.original}
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
                  </>
                )}

                {totalRecords === 0 && (
                  <main className="min-h-[40vh] flex items-center justify-center flex-col gap-6">
                    <div className="text-center">
                      <FontAwesomeIcon 
                        icon={faSearch} 
                        className="w-16 h-16 text-gray-300 mb-4" 
                      />
                      <h1 className="text-lg font-medium text-center text-gray-500 mb-2">
                        No households found
                      </h1>
                      <p className="text-sm text-gray-400">
                        Try adjusting your search criteria
                      </p>
                    </div>
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
export default memo(SearchHousehold)
