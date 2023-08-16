import { useEffect, useMemo, useState } from 'react'
import {
  useLazyGetCellVillagesQuery,
  useLazyGetDistrictCellsQuery,
  useLazyGetSectorVillagesQuery,
} from '../../states/api/apiSlice'
import {
  useGlobalFilter,
  useTable,
  useAsyncDebounce,
  useFilters,
  useSortBy,
  usePagination,
} from 'react-table'
import Loading from '../../components/Loading'
import { setPage, setSize, setTotalPages } from '../../states/features/pagination/paginationSlice'
import { useDispatch, useSelector } from 'react-redux'
import Button, { PageButton } from '../../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BsPersonFill, BsEyeFill } from 'react-icons/bs'
import { Link } from 'react-router-dom'
import { faAnglesLeft, faAnglesRight, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'

const DepartmentsTable = ({ user }) => {
  const [data, setData] = useState([])
  const [
    getSectorVillages,
    {
      data: sectorVillagesData,
      isLoading: sectorVillagesIsLoading,
      isSuccess: sectorVillagesIsSuccess,
      isError: sectorVillagesIsError,
      error: sectorVillagesError,
    },
  ] = useLazyGetSectorVillagesQuery()

  const [
    getCellVillages,
    {
      data: cellVillagesData,
      isSuccess: cellVillagesIsSuccess,
      isLoading: cellVillagesIsLoading,
      isError: cellVillagesIsError,
      error: cellVillagesError,
    },
  ] = useLazyGetCellVillagesQuery()

  const [
    getDistrictCells,
    {
      data: districtCellsData,
      isLoading: districtCellsLoading,
      isSuccess: districtCellsIsSuccess,
      isError: districtCellsIsError,
      error: districtSuccessError,
    },
  ] = useLazyGetDistrictCellsQuery()

  const dispatch = useDispatch()

  const {
    page: offset,
    size,
    totalPages,
  } = useSelector((state) => state.pagination)

  let department = ''

  switch (user?.departments?.level_id) {
    case 1:
      department = 'province'
      useEffect(() => {
        getCellVillages({ department, id: user?.departments?.id })
      }, [])
      useEffect(() => {
        if (cellVillagesIsSuccess) {
          dispatch(setTotalPages(cellVillagesData?.data?.totalPages))
          setData(cellVillagesData?.data?.rows)
        }
      }, [cellVillagesData, cellVillagesIsSuccess])
      break
    case 2:
      department = 'district'
      useEffect(() => {
        getDistrictCells({ department, id: user?.departments?.id })
      }, [])
      useEffect(() => {
        if (districtCellsIsSuccess) {
          dispatch(setTotalPages(districtCellsData?.data?.totalPages))
          setData(districtCellsData?.data?.rows)
        }
      }, [districtCellsData, districtCellsIsSuccess])
      break
    case 3:
      department = 'sector'
      useEffect(() => {
        getSectorVillages({ department, id: user?.departments?.id })
      }, [])
      useEffect(() => {
        if (sectorVillagesIsSuccess) {
          dispatch(setTotalPages(sectorVillagesData?.data?.totalPages))
          setData(sectorVillagesData?.data?.rows?.map((row, index) => {
            return {
              ...row,
              name: row?.name,
              phone1: row?.phone1,
              phone2: row?.phone2,
              email: row?.email,
            }
          }))
        }
      }, [sectorVillagesData, sectorVillagesIsSuccess])
      break
    case 4:
      department = 'cell'
      useEffect(() => {
        getCellVillages({ department, id: user?.departments?.id })
      }, [])
      useEffect(() => {
        if (cellVillagesIsSuccess) {
          dispatch(setTotalPages(cellVillagesData?.data?.totalPages))
          setData(cellVillagesData?.data?.rows)
        }
      }, [cellVillagesData, cellVillagesIsSuccess])
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

  console.log(sectorVillagesData, data)

  const columns = useMemo(
    () => [
      {
        Header: ' ',
        Cell: () => (
          <span>
            <button       
             className="flex items-center justify-center h-8 w-14 text-white bg-primary rounded-sm shadow-md"
              type="button">
                <BsEyeFill className="" />    
            </button>
           
          </span>
        ),
      },
      {
        Header: 'Name',
        accessor: 'name',
        sortable: true,
      },
      {
        Header: 'Primary Phone',
        accessor: 'phone1',
        sortable: true,
      },
      {
        Header: 'Other',
        accessor: 'phone2',
        sortable: true,
      },
      {
        Header: 'Email',
        accessor: 'email',
        sortable: true,
      },
      {
        Header: 'Staff',
        Cell: () => (
          <span>
            <button  
            className="flex items-center justify-center h-8 w-14 text-white bg-primary rounded-sm shadow-md"
            type="button">
              <BsPersonFill className="" />
            </button>
            
          </span>
        ),
      },
      
    ],
    []
  )

  const TableInstance = useTable(
    {
      columns,
      data,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    setGlobalFilter,
    rows,
    prepareRow,
    state,
    preGlobalFilteredRows,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
  } = TableInstance

  if (sectorVillagesIsLoading || cellVillagesIsLoading || districtCellsLoading) {
    return (
      <main className='min-h-[80vh] flex items-center justify-center'>
        <Loading />
      </main>
    )
  }

  return (
    <main>
      <div className="flex flex-col items-center gap-6">
        <div className="search-filter flex flex-col items-center gap-6">
          <span className="w-full h-fit flex items-center gap-4">
            {headerGroups.map((headerGroup) =>
              headerGroup.headers.map((column) =>
                column.Filter ? (
                  <div
                    key={column.id}
                    className="p-[5px] px-2 border-[1px] shadow-md rounded-md"
                  >
                    <label htmlFor={column.id}></label>
                    {column.render('Filter')}
                  </div>
                ) : null
              )
            )}
          </span>
        </div>
        <div className="mt-2 flex flex-col w-[95%] mx-auto">
          <div className="-my-2 overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
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
                    {page.map((row, i) => {
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
            </div>
          </div>
        </div>
      </div>
      <div className="pagination w-[95%] mx-auto">
          <div className="py-3 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
                value="Previous"
              >
                Previous
              </Button>
              <Button
                onClick={() => nextPage()}
                disabled={!canNextPage}
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
                    onClick={() => gotoPage(0)}
                    // disabled={!canPreviousPage}
                  >
                    <span className="px-4 cursor-pointer hover:scale-[1.02] sr-only">
                      First
                    </span>
                    <FontAwesomeIcon icon={faAnglesLeft} />
                  </PageButton>
                  <PageButton
                    onClick={() => {
                      previousPage()
                      dispatch(setPage(offset > 0 ? offset - 1 : offset))
                    }}
                    // disabled={!canPreviousPage}
                    className="px-4 cursor-pointer hover:scale-[1.02] p-2 shadow-md"
                  >
                    <span className="px-4 cursor-pointer hover:scale-[1.02] sr-only">
                      Previous
                    </span>
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </PageButton>
                  <PageButton
                    onClick={() => {
                      nextPage()
                      dispatch(setPage(offset + 1))
                    }}
                    // disabled={!canNextPage}
                    className="px-4 cursor-pointer hover:scale-[1.02] shadow-md"
                  >
                    <span className="px-4 cursor-pointer hover:scale-[1.02] sr-only">
                      Next
                    </span>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </PageButton>
                  <PageButton
                    className="px-4 cursor-pointer hover:scale-[1.02] rounded-r-md shadow-md"
                    onClick={() => {
                      gotoPage(offset - 1)
                      dispatch(setPage(offset > 0 ? offset - 1 : offset))
                    }}
                    // disabled={!canNextPage}
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

export default DepartmentsTable
