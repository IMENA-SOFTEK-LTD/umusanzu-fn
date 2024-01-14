import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    useGlobalFilter,
    useTable,
    useAsyncDebounce,
    useFilters,
    useSortBy,
    usePagination,
  } from 'react-table'
import { useLazyGetCountrySectorsQuery } from "../../states/api/apiSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft, faAnglesRight, faChevronLeft, faChevronRight, faFile } from "@fortawesome/free-solid-svg-icons";
import Button, { PageButton } from "../../components/Button";
import Input from "../../components/Input";
import { useNavigate } from "react-router";
import { setSectorId, setUserOrSelectedDepartmentNames } from "../../states/features/departments/departmentSlice";

const SectorsReports = ({ user }) => {

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [data, setData] = useState([]);

    const [getCountrySectors, {
        data: countrySectorsData,
        isLoading: countrySectorsLoading,
        isError: countrySectorsError,
        isSuccess: countrySectorsSuccess,
    }] = useLazyGetCountrySectorsQuery();

    const {
        page: offset,
        totalPages,
      } = useSelector((state) => state.pagination)

    useEffect(() => {
        getCountrySectors({
            page: offset,
        })
    }, [])

    useEffect(() => {
       if (countrySectorsSuccess) {
        setData(countrySectorsData?.data?.rows?.map((row) => {
            return {
                ID: row?.id,
                name: row?.name,
                merchantCode: row?.merchant_code,
                phone: row?.phone1,
                district: row?.parent?.name,
                province: row?.parent?.parent?.name,
            }
        }))
       }
    }, [countrySectorsData, countrySectorsLoading, countrySectorsSuccess])

    const columns = useMemo(() => [
        {
          id: 'sector',
          Header: 'Name',
          accessor: 'name',
          sortable: true,
        },
        {
            Header: 'Merchant Code',
            accessor: 'merchantCode',
            sortable: true,
          },
        {
          id: 'district',
          Header: 'District',
          accessor: 'district',
          sortable: true,
          Filter: SelectColumnFilter,
        },
        {
            id: 'province',
            Header: 'province',
            accessor: 'province',
            sortable: true,
            Filter: SelectColumnFilter,
          },
        {
          Header: 'Phone',
          accessor: 'phone',
          sortable: true,
        },
      ], [])

      const tableHooks = (hooks) => {
        hooks.visibleColumns.push((columns) => [
          {
            id: 'no',
            Header: 'No',
            accessor: 'id',
            Cell: ({ row }) => <p>{row.index + 1}</p>,
            sortable: true,
          },
          {
            id: 'actions',
            Header: 'Actions',
            Cell: (({ row }) => {
                return (
                    <article className="flex flex-col items-start gap-2">
                        <Button onClick={(e) => {
                            e.preventDefault()
                            dispatch(setSectorId(row.original.ID))
                            dispatch(setUserOrSelectedDepartmentNames({
                              province: row.values.province,
                              district: row.values.district,
                              sector: row.values.sector,
                            }))
                            navigate('/performances')
                        }} className='py-[4px] text-[14px] !px-4' value = 'Performance' />
                        <Button className='py-[4px] text-[14px] !px-4' onClick={(e) => {
                            e.preventDefault()
                            dispatch(setSectorId(row.original.ID))
                            dispatch(setUserOrSelectedDepartmentNames({
                              province: row.values.province,
                              district: row.values.district,
                              sector: row.values.sector,
                            }))
                            navigate('/departments')
                        }} value = 'Departments' />
                    </article>
                )
            }),
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
    <main className={`my-12`}>
        <div className="flex my-8 flex-col w-full items-center gap-6 relative">
          <div className="search-filter flex flex-col w-full items-center gap-6">
            <span className='flex flex-wrap items-center justify-between gap-4 w-full px-8 max-md:flex-col max-md:items-center'>
          <span className="w-full flex flex-col items-end justify-center">
              <GlobalFilter
                preGlobalFilteredRows={preGlobalFilteredRows}
                globalFilter={state.globalFilter}
                setGlobalFilter={setGlobalFilter}
              />
            </span>
            </span>
            <span className="w-[95%] mx-auto h-fit flex items-center flex-wrap gap-4 max-md:justify-center">
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
      <label className="flex gap-2 items-center w-full mx-auto max-md:flex-col max-md:items-center">
        <Input
          type="text"
          className="p-2 outline-[2px] w-full max-w-[20rem] border-[1px] border-primary rounded-md outline-primary focus:outline-primary"
          value={value || ''}
          onChange={(e) => {
            setValue(e.target.value)
            onChange(e.target.value)
          }}
          placeholder={`${count} records...`}
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

export default SectorsReports;
