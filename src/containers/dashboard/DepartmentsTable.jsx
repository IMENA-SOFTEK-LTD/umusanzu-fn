import { useEffect, useMemo, useState } from 'react'
import {
  useLazyGetCellVillagesQuery,
  useLazyGetDistrictCellsQuery,
  useLazyGetSectorVillagesQuery,
  useLazyGetCountryDistrictsQuery,
} from '../../states/api/apiSlice'
import PropTypes from 'prop-types'
import {
  useGlobalFilter,
  useTable,
  useAsyncDebounce,
  useFilters,
  useSortBy,
  usePagination,
} from 'react-table'
import Loading from '../../components/Loading'
import {
  setPage,
  setSize,
  setTotalPages,
} from '../../states/features/pagination/paginationSlice'
import { useDispatch, useSelector } from 'react-redux'
import Button, { PageButton } from '../../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BsPersonFill, BsEyeFill } from 'react-icons/bs'
import {
  faAnglesLeft,
  faAnglesRight,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import Input from '../../components/Input'

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
      error: districtCellsError,
    },
  ] = useLazyGetDistrictCellsQuery()

  const [
    getCountryDistricts,
    {
      data: countryDistrictsData,
      isLoading: countryDistrictsLoading,
      isSuccess: countryDistrictsIsSuccess,
      isError: countryDistrictsIsError,
      error: countryDistrictsError,
    },
  ] = useLazyGetCountryDistrictsQuery()

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
  getCellVillages({ department, id: user?.departments?.id, size, page: offset })
    .unwrap()
    .then((data) => {
      dispatch(setTotalPages(data?.data?.totalPages));
      setData(
        (data?.data?.rows || []).map((row, index) => ({
          id: index + 1,
          name: row?.name,
          phone1: row?.phone1,
          phone2: row?.phone2,
          email: row?.email,
        }))
      );
    });
}, [offset, size, department, user?.departments?.id, dispatch]);

useEffect(() => {
  if (cellVillagesIsSuccess) {
    dispatch(setTotalPages(cellVillagesData?.data?.totalPages))
    setData(
      cellVillagesData?.data?.rows?.map((row, index) => ({
          id: index + 1,
          name: row?.name,
          phone1: row?.phone1,
          phone2: row?.phone2,
          email: row?.email,
        
      })) || []
    )
  }
}, [cellVillagesData, cellVillagesIsSuccess, dispatch])

      break
    case 2:
      department = 'district'
        useEffect(() => {
        getDistrictCells({ department, id: user?.departments?.id, size, page: offset })
          .unwrap()
          .then((data) => {
            dispatch(setTotalPages(data?.data?.totalPages));
            setData(
              (data?.data?.rows || []).map((row, index) => ({
                id: index + 1,
                name: row?.name,
                phone1: row?.phone1,
                phone2: row?.phone2,
                email: row?.email,
              }))
            );
          });
      }, [offset, size, department, user?.departments?.id, dispatch]);

      useEffect(() => {
        if (districtCellsIsSuccess) {
          dispatch(setTotalPages(districtCellsData?.data?.totalPages))
          setData(
            districtCellsData?.data?.rows?.map((row, index) => ({
                id: index + 1,
                name: row?.name,
                phone1: row?.phone1,
                phone2: row?.phone2,
                email: row?.email,
              
            })) || []
          )
        }
      }, [districtCellsData, districtCellsIsSuccess, dispatch])
      break
    case 3:
      department = 'sector'
       useEffect(() => {
        getSectorVillages({ department, id: user?.departments?.id, size, page: offset })
          .unwrap()
          .then((data) => {
            dispatch(setTotalPages(data?.data?.totalPages));
            setData(
              (data?.data?.rows || []).map((row, index) => ({
                id: index + 1,
                name: row?.name,
                phone1: row?.phone1,
                phone2: row?.phone2,
                email: row?.email,
              }))
            );
          });
      }, [offset, size, department, user?.departments?.id, dispatch]);

      useEffect(() => {
        if (sectorVillagesIsSuccess) {
          dispatch(setTotalPages(sectorVillagesData?.data?.totalPages))
          setData(
            sectorVillagesData?.data?.rows?.map((row, index) => ({
                id: index + 1,
                name: row?.name,
                phone1: row?.phone1,
                phone2: row?.phone2,
                email: row?.email,
              
            })) || []
          )
        }
      }, [sectorVillagesData, sectorVillagesIsSuccess, dispatch])
      break
    case 4:
      department = 'cell'      
useEffect(() => {
  getCellVillages({ department, id: user?.departments?.id, size, page: offset })
    .unwrap()
    .then((data) => {
      dispatch(setTotalPages(data?.data?.totalPages));
      setData(
        (data?.data?.rows || []).map((row, index) => ({
          id: index + 1,
          name: row?.name,
          phone1: row?.phone1,
          phone2: row?.phone2,
          email: row?.email,
        }))
      );
    });
}, [offset, size, department, user?.departments?.id, dispatch]);

useEffect(() => {
  if (cellVillagesIsSuccess) {
    dispatch(setTotalPages(cellVillagesData?.data?.totalPages))
    setData(
      sectorVillagesData?.data?.rows?.map((row, index) => ({
          id: index + 1,
          name: row?.name,
          phone1: row?.phone1,
          phone2: row?.phone2,
          email: row?.email,
        
      })) || []
    )
  }
}, [cellVillagesData, cellVillagesIsSuccess, dispatch])
      break
    case 5:
      department = 'country'
      
      useEffect(() => {
        getCountryDistricts({ department, id: user?.departments?.id, size, page: offset })
          .unwrap()
          .then((data) => {
            dispatch(setTotalPages(data?.data?.totalPages));
            setData(
              (data?.data?.rows || []).map((row, index) => ({
                id: index + 1,
                name: row?.name,
                phone1: row?.phone1,
                phone2: row?.phone2,
                email: row?.email,
              }))
            );
          });
      }, [offset, size, department, user?.departments?.id, dispatch]);
      
      useEffect(() => {
        if (countryDistrictsIsSuccess) {
          dispatch(setTotalPages(countryDistrictsData?.data?.totalPages))
          setData(
            countryDistrictsData?.data?.rows?.map((row, index) => ({
                id: index + 1,
                name: row?.name,
                phone1: row?.phone1,
                phone2: row?.phone2,
                email: row?.email,
              
            })) || []
          )
        }
      }, [countryDistrictsData, countryDistrictsIsSuccess, dispatch])
      break
    case 6:
      department = 'agent'
      break
    default:
      department = 'cell'
  }

  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
        sortable: true,
      },
      {
        Header: 'Phone',
        accessor: 'phone1',
        sortable: true,
      },

      {
        Header: 'Details',
        Cell: () => (
          <span>
            <button
              className="flex items-center justify-center h-8 w-14 text-white bg-primary rounded-sm shadow-md"
              type="button"
            >
              <BsEyeFill className="" />
            </button>
          </span>
        ),
      },
      {
        Header: 'Staff',
        Cell: () => (
          <span>
            <button
              className="flex items-center justify-center h-8 w-14 text-white bg-purple-500 rounded-sm shadow-md"
              type="button"
            >
              <BsPersonFill className="" />
            </button>
          </span>
        ),
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
        Cell: ({ row, index }) => <p>{row.index + 1}</p>,
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

  if (
    sectorVillagesIsSuccess ||
    cellVillagesIsSuccess ||
    districtCellsIsSuccess ||
    countryDistrictsIsSuccess
  ) {
    return (
      <main className="my-12 w-full">
        <div className="flex flex-col items-center gap-6">
          <div className="search-filter flex flex-col items-center gap-6">
            <span className="w-fit min-w-[30rem] flex flex-col items-end justify-center">
              <GlobalFilter
                preGlobalFilteredRows={preGlobalFilteredRows}
                globalFilter={state.globalFilter}
                setGlobalFilter={setGlobalFilter}
              />
            </span>
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

if (sectorVillagesError ||cellVillagesError ||districtCellsError||countryDistrictsError) {
  return (
    <main className="min-h-[80vh] flex items-center justify-center flex-col gap-6">
      <h1 className="text-[25px] font-medium text-center">
        Could not load department records
      </h1>
      <Button value="Go to dashboard" route="/dashboard" />
    </main>
  )  
  }

if (sectorVillagesIsLoading || cellVillagesIsLoading || districtCellsLoading || countryDistrictsLoading) {
  return (
    <main className="w-full min-h-[80vh] flex items-center justify-center">
      <Loading />
    </main>
  )
}

return (
  <main className="w-full min-h-[80vh] flex items-center justify-center">
    <Loading />
  </main>
)
}

DepartmentsTable.propTypes = {
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

function GlobalFilter({
preGlobalFilteredRows,
globalFilter,
setGlobalFilter,
}) {
const count = preGlobalFilteredRows.length
const [value, setValue] = React.useState(globalFilter)
const onChange = useAsyncDebounce((value) => {
  setGlobalFilter(value || undefined)
}, 200)

return (
  <label className="flex gap-2 items-center w-full mx-auto">
    <Input
      type="text"
      className="p-2 outline-[2px] w-full max-w-[20rem] border-[1px] border-primary rounded-md outline-primary focus:outline-primary"
      value={value || ''}
      onChange={(e) => {
        setValue(e.target.value)
        onChange(e.target.value)
      }}
      placeholder={`${count} households...`}
    />
    <Button
      value="Search"
      onClick={() => {
        setGlobalFilter(value || undefined)
      }}
    />
  </label>
)
}


export default DepartmentsTable