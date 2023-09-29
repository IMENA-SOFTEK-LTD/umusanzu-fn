import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import Input from '../../components/Input'
import Button, { PageButton } from '../../components/Button'
import { useEffect, useMemo, useState } from 'react'
import { useSearchHouseholdMutation } from '../../states/api/apiSlice'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faAnglesLeft,
  faAnglesRight,
  faChevronLeft,
  faChevronRight,
  faHouseChimney,
  faSearch,
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
import { setSearchTerm } from '../../states/features/modals/householdSlice'
import Loading from '../../components/Loading'

const SearchHousehold = () => {
  const { control, handleSubmit } = useForm()
  const [data, setData] = useState([])

  const dispatch = useDispatch()
  const { page: offset, size } = useSelector((state) => state.pagination)
  const { searchTerm } = useSelector((state) => state.household)

  const [
    searchHousehold,
    {
      data: searchHouseholdData,
      isLoading: searchHouseholdLoading,
      isSuccess: searchHouseholdSuccess,
      isError: searchHouseholdError,
    },
  ] = useSearchHouseholdMutation()

  useEffect(() => {
    document.title = 'Search Household | Umusanzu Digital'
  }, [])

  const onSubmit = (data) => {
    if (data.search) {
        dispatch(setSearchTerm(data?.search))
    searchHousehold({
      search: data.search || 'Nishimwe',
      offset,
      size: 10000,
    })
    }
  }

  useEffect(() => {
    if (searchHouseholdSuccess) {
      dispatch(setTotalPages(searchHouseholdData?.data?.totalPages))
      setData(
        searchHouseholdData?.data?.rows.map((row, index) => {
          return {
            id: index + 1,
            name: row?.name,
            phone1: row?.phone1,
            phone2: row?.phone2,
            ubudehe: row?.ubudehe,
            status: row?.status,
            village: row?.villages[0]?.name,
            cell: row?.cells[0]?.name,
            sector: row?.sectors[0]?.name,
            district: row?.districts[0]?.name,
            province: row?.provinces[0]?.name,
            ID: row?.id,
          }
        })
      )
    }
  }, [searchHouseholdData])

  /**
   * HOUSEHOLD TABLE
   */

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
        Cell: ({ row }) => (
          <p
            className={`${
              row?.original?.status === 'ACTIVE'
                ? 'bg-green-600'
                : row?.original?.status === 'MOVED'
                ? 'bg-yellow-700'
                : 'bg-red-600'
            } p-2 flex items-center justify-center text-white rounded-sm`}
          >
            {row?.original?.status}
          </p>
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

  return (
    <main className="w-[100%] mx-auto flex flex-col items-center my-12">
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
                  value={searchHouseholdLoading ? '...' : 'Search'}
                />
              )
            }}
          />
        </form>
      </section>
      {searchHouseholdLoading && (
        <section className='h-[50vh] flex items-center justify-center'>
            {<Loading />}
        </section>
      )}
      {(searchHouseholdSuccess && (
          <section className={`my-12 w-full mx-auto`}>
            <div className="flex my-8 flex-col w-full items-center gap-6 relative">
              <div className="search-filter flex flex-col w-full items-center gap-6">
                <span className="flex flex-wrap items-center justify-between gap-4 w-full px-8 max-md:flex-col max-md:items-center">
                  <span className="w-full flex flex-col items-end justify-center">
                    <GlobalFilter
                      preGlobalFilteredRows={preGlobalFilteredRows}
                      globalFilter={state.globalFilter}
                      setGlobalFilter={setGlobalFilter}
                    />
                  </span>
                </span>
                <span className="w-[95%] mx-auto h-fit flex items-center flex-wrap gap-4 justify-center max-md:justify-center">
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
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg flex flex-col gap-4">
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
                      <span className="font-medium">{pageCount}</span>
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
                          gotoPage(page - 1)
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
          </section>
        ))}
    </main>
  )
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
  const [value, setValue] = useState(globalFilter)
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined)
  }, 200)

  return (
    <form className="flex gap-4 items-center w-full max-w-[20rem] mx-auto max-md:flex-col max-md:items-center">
      <Input
        type="text"
        className="p-2 outline-[2px] w-full max-w-[20rem] border-[1px] border-primary rounded-md outline-primary focus:outline-primary"
        value={value || ''}
        onChange={(e) => {
          setValue(e.target.value)
          onChange(e.target.value)
        }}
        placeholder={`Filter from ${count} households...`}
      />
      <Button
        value={
          <FontAwesomeIcon
            className="p-[10px] !rounded-[50%]"
            icon={faSearch}
          />
        }
        className="!p-0 !py-0 !px-0 !rounded-[50%]"
        onClick={() => {
          setGlobalFilter(value || undefined)
        }}
      />
    </form>
  )
}

export default SearchHousehold
