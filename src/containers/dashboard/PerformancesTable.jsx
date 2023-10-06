import { useEffect, useMemo, useState } from "react";
import moment from "moment/moment";
import PropTypes from "prop-types";
import {
  useGlobalFilter,
  useTable,
  useAsyncDebounce,
  useFilters,
  useSortBy,
  usePagination
} from 'react-table'
import Loading from '../../components/Loading'
import {
  setPage,
  setSize,
} from '../../states/features/pagination/paginationSlice'
import { useLazyGetDepartmentPerformancesQuery } from "../../states/api/apiSlice";
import Button, { PageButton } from "../../components/Button";
import {
  faAnglesLeft,
  faAnglesRight,
  faChevronLeft,
  faChevronRight,
  faClose,
  faFile,
  faFileExcel,
  faFilePdf,
  faUser
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaFile, FaEye } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import Input from "../../components/Input";
import { Link } from "react-router-dom";
import formatFunds from "../../utils/Funds";

const PerformancesTable = ({ user }) => {

  const [getDepartmentPerformances, {
    data: departmentPerformancesData,
    isLoading: departmentPerformancesLoading,
    isError: departmentPerformancesError,
    isSuccess: departmentPerformancesSuccess
  }] = useLazyGetDepartmentPerformancesQuery();

  const [data, setData] = useState([])
  const [showExportPopup, setShowExportPopup] = useState(false);


  const openExportPopup = () => {
    setShowExportPopup(true);
  };

  const closeExportPopup = () => {
    setShowExportPopup(false);
  };

  const dispatch = useDispatch()

  const {
    page: offset,
    size,
    totalPages
  } = useSelector((state) => state.pagination)

    /**
   * SWITCH DEPARTMENT
   */

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

    useEffect(() => {
      getDepartmentPerformances({
        departmentId: user?.departments?.id,
        department,
        month: moment().format('YYYY-MM')
      })
    }, [])

    useEffect(() => {
      if (departmentPerformancesSuccess) {
        setData(departmentPerformancesData?.data?.map((row) => {
          return {
            name: row?.name,
            district: row?.districtName || row?.district,
            sector: row?.sectorName || row?.sector,
            province: row?.provinceName || row?.province,
            merchantCode: row?.merchant_code,
            phone: row?.phone1,
            monthlyTarget: formatFunds(row?.monthlyTarget),
            monthlyCollections: formatFunds(row?.monthlyCollections),
            difference: formatFunds(row?.monthlyDifference.replace('-', '')),
            ID: row?.id,
            staffId: row?.id
          }
        }))
      }
    }, [departmentPerformancesData])

    const columns = useMemo(() => {
      const baseColumns = [
        {
          id: 'name',
          Header: 'Name',
          accessor: 'name',
          sortable: true
        },
        {
          id: 'sector',
          Header: 'Sector',
          accessor: 'sector',
          sortable: true
        },
        {
          id: 'district',
          Header: 'District',
          accessor: 'district',
          sortable: true,
          Filter: SelectColumnFilter
        },
        {
          id: 'province',
          Header: 'Province',
          accessor: 'province',
          sortable: true,
          Filter: SelectColumnFilter
        },
        {
          id: 'monthlyTarget',
          Header: 'Target',
          accessor: 'monthlyTarget',
          sortable: true
        },
        {
          id: 'monthlyCollections',
          Header: 'Progress',
          accessor: 'monthlyCollections',
          sortable: true
        },
        {
          id: 'difference',
          Header: 'Difference',
          accessor: 'difference',
          sortable: true
        }
      ];
    
      if (department === 'sector') {
        return baseColumns;
      } else {
        return baseColumns.filter(column => column.id !== 'sector' || column.id === 'staff');
      }
    }, []);
  
  
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
          id: 'ID',
          Header: `${department === 'country' ? 'Cells' : ''}`,
          accessor: 'ID',
          Cell: ({ row }) => {
            if (department === 'sector') {
              return null
            }
            return (
            <Link
              to={`/performances/${row?.original?.ID}`}
              className="flex items-center justify-center h-8 w-14 text-white bg-primary rounded-sm shadow-md"
            >
              <FaEye className="" />
            </Link>
            )
          },
          sortable: true
        },
        ...columns,
        {
          id: 'staff',
          Header: 'Staff',
          accessor: 'staffId',
          Cell: ({ row }) => {
            if (department === 'sector') {
              return null
            }
            return (
              <Link
              to={`/admins/${row?.original?.ID}`}
              className="flex items-center justify-center h-8 w-14 text-white bg-primary rounded-sm shadow-md"
            >
              <FontAwesomeIcon icon = {faUser} />
            </Link>
            )
            },
          sortable: true
        },
      ])
    }
  
    const TableInstance = useTable(
      {
        columns,
        data
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
      setPageSize
    } = TableInstance

    if (departmentPerformancesLoading) {
      return (
        <main className="flex min-h-[80vh] items-center justify-center flex-col gap-6">
          <Loading />
          <h1 className="text-xl font-semibold uppercase text-primary text-center">Performances loading...</h1>
        </main>
      )
    }

    return (
      <main className="my-12 w-full">
        <div className="flex flex-col items-center gap-6">
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
                <div className="shadow flex flex-col gap-4 overflow-hidden border-b border-gray-200">
                  <div className="hidden gap-2 max-md:pl-2">
                    <Button
                      value={
                        <span className="items-center gap-2 !hidden">
                          Export Report
                          <FontAwesomeIcon icon={FaFile} />
                        </span>
                      }
                      onClick={openExportPopup}
                    />
                  </div>
                  {/* Export Popup/Modal */}
                  {showExportPopup && (
                    <div className="fixed inset-0 flex items-center justify-center z-10">
                      <div className="bg-white p-4 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold mb-4">Export Report</h2>
                        <input
                          type="text"
                          placeholder="Enter report name"
                          value={reportName}
                          onChange={(e) => setReportName(e.target.value)}
                          className="border p-2 rounded-md w-full mb-4"
                        />
                        <div className="flex gap-3">
                          <Button
                            value={
                              <span className="flex items-center gap-2">
                                Export PDF
                                <FontAwesomeIcon icon={faFilePdf} />
                              </span>
                            }
                            onClick={handleExportToPdf}

                          />
                          <Button
                            value={
                              <span className="flex items-center gap-2">
                                Export Excel
                                <FontAwesomeIcon icon={faFileExcel} />
                              </span>
                            }
                            className={user?.departments?.level_id === 5 ? 'flex' : 'hidden'}
                            onClick={handleExportToExcel}

                          />
                          <Button
                            value={
                              <span className="flex items-center gap-2">
                                Close
                                <FontAwesomeIcon icon={faClose} />
                              </span>
                            }
                            onClick={closeExportPopup} />
                        </div>
                      </div>
                    </div>
                  )}
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

PerformancesTable.propTypes = {
  user: PropTypes.shape({})
}

export function SelectColumnFilter ({
  column: { filterValue, setFilter, preFilteredRows, id, render }
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
    <label className="flex gap-4 items-center min-w-[25rem] mx-auto max-md:flex-col max-md:items-center max-md:min-w-full">
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

export default PerformancesTable;