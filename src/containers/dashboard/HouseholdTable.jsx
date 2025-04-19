import 'core-js/stable'
import 'jspdf-autotable'
import 'regenerator-runtime/runtime'
import { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
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
  faHouse,
  faHouseChimney,
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
import HouseHoldFilter from './HouseHoldFilter'
import {
  setSelectedCell,
  setSelectedSector,
  setSelectedVillage,
} from '../../states/features/modals/householdSlice'
import formatFunds from '../../utils/Funds'
import { useLocation } from 'react-router-dom'
import API_URL from '../../constants'
import { toast } from 'react-toastify'
import download from 'downloadjs'
import OverlayLoading from '../../components/OverlayLoading'

const HouseholdTable = ({ user }) => {
  const [showExportPopup, setShowExportPopup] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [totalRecords, setTotalRecords] = useState(0)
  const [householdsListIsLoading, setHouseholdsListIsLoading] = useState(false)
  const [householdListError, setHouseholdListError] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0)
  const [reportName, setReportName] = useState(
    `UMUSANZU DIGITAL'S REGISTERED HOUSEHOLDS IN ${user?.departments?.name?.toUpperCase()} ${user?.department?.toUpperCase()}`
  )
  const location = useLocation()
  const openExportPopup = () => {
    setShowExportPopup(true)
  }

  const closeExportPopup = () => {
    setShowExportPopup(false)
  }
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
    ubudehe: queryRoute?.ubudehe || '',
    route: queryRoute?.query || '',
    id: sectorId || user?.departments?.id,
    status: queryRoute?.query === 'monthlyTarget' ? '' : 'ACTIVE',
    village: queryRoute?.village || '',
    cell: queryRoute?.cell || '',
    sector: queryRoute?.sector || '',
    district: queryRoute?.district || '',
    province: queryRoute?.province || '',
    query:queryRoute?.query || ''
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
        ubudehe: queryRoute_?.ubudehe || '',
        route: queryRoute_?.query || '',
        status: queryRoute_?.query === 'monthlyTarget' ? '' : 'ACTIVE',
        village: queryRoute_?.village || '',
        cell: queryRoute_?.cell || '',
        sector: queryRoute_?.sector || '',
        district: queryRoute_?.district || '',
        province: queryRoute_?.province || '',
      })
    }
  }, [location])

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

  const handleExportToPdf = async () => {
    try {
      setIsExporting(true)

      const { data } = await axios.get(
        `${API_URL}/households/pdf-reports?level=${department}&query=${
          queryRoute?.query || ''
        }&reportName=${reportName}&${new URLSearchParams(queries).toString()}`,
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
      toast.error('Househould not found')
    }
  }

  const handleExportToExcel = async () => {
    try {
      setIsExporting(true)

      const { data } = await axios.get(
        `${API_URL}/households/excel-reports?level=${department}&query=${
          queryRoute?.query || ''
        }&reportName=${reportName}&${new URLSearchParams(queries).toString()}`,
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
                onClick={() => handleExportToExcel(queries)}
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
      <OverlayLoading color="black" isLoading={householdsListIsLoading} />

      <div className="flex my-8 flex-col w-full items-center gap-6 relative">
        <div className="search-filter flex flex-col w-full items-center gap-6">
          <span className="flex flex-wrap items-center justify-between gap-4 w-full px-8 max-md:flex-col max-md:items-center">
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
            <div className="flex gap-2 max-md:pl-2">
              {/* {user.staff_role === 1 && ( */}
              <Button
                className="right-6 top-0"
                value={
                  <span className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faHouse} />
                    <p>Add new household</p>
                  </span>
                }
                route="/households/create"
              />
              <Button
                value={
                  <span className="flex items-center gap-2">
                    Export Report
                    <FontAwesomeIcon icon={faFile} />
                  </span>
                }
                route={'#'}
                onClick={openExportPopup}
              />
            </div>
          </span>
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
                      <caption className="caption-top p-2">
                        <HouseHoldFilter
                          user={user}
                          fieldEnabled={{
                            province: ['country'].includes(department),
                            district: ['country', 'province'].includes(
                              department
                            ),
                            sector: [
                              'country',
                              'province',
                              'district',
                            ].includes(department),
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
                            status: !['monthlyTarget'].includes(
                              queryRoute?.query
                            ),
                            searchTerm: true,
                          }}
                          isLoading={householdsListIsLoading}
                          placeholder={'Search for household....'}
                          onChange={(query) => {
                            // const queries2 = {
                            //   departmentId: user?.departments?.id,
                            //   searchTerm:
                            //     query.searchTerm ||
                            //     queryRoute?.searchTerm ||
                            //     '',
                            //   ubudehe: queryRoute?.ubudehe || '',
                            //   route: queryRoute?.query || '',
                            //   id: sectorId || user?.departments?.id,
                            //   status: query.status || 'ACTIVE',
                            //   village:
                            //     query.village || queryRoute?.village || '',
                            //   cell: query.cell || queryRoute?.cell || '',
                            //   sector:
                            //     query.sector || queryRoute?.sector || '',
                            //   district:
                            //     query.district || queryRoute?.district || '',
                            //   province:
                            //     query.province || queryRoute?.province || '',
                            // }
                            // setQueries({ ...queries2 })
                          }}
                          onSearch={(query) => {
                            gotoPage1(0)
                            const queries2 = {
                              departmentId: user?.departments?.id,
                              searchTerm:
                                query.searchTerm ||
                                queryRoute?.searchTerm ||
                                '',
                              ubudehe: queryRoute?.ubudehe || '',
                              route: queryRoute?.query || '',
                              id: sectorId || user?.departments?.id,
                              status: query.status || 'ACTIVE',
                              village:
                                query.village || queryRoute?.village || '',
                              cell: query.cell || queryRoute?.cell || '',
                              sector: query.sector || queryRoute?.sector || '',
                              district:
                                query.district || queryRoute?.district || '',
                              province:
                                query.province || queryRoute?.province || '',
                            }
                            setQueries({ ...queries2 })
                            onLoadHouseholdLists({
                              department,
                              size,
                              page: offset,
                              ...queries2,
                            })
                          }}
                        />
                      </caption>
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

HouseholdTable.propTypes = {
  user: PropTypes.shape({}),
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


export default HouseholdTable
