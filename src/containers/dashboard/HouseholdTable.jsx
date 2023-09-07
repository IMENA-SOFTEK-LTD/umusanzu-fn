import 'core-js/stable'
import 'jspdf-autotable'
import logo from '../../assets/LOGO.png'
import jsPDF from 'jspdf'
import ExcelJS from "exceljs"
import 'regenerator-runtime/runtime'
import { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { FaEye } from 'react-icons/fa'
import {
  faAnglesLeft,
  faAnglesRight,
  faChevronLeft,
  faChevronRight,
  faFileExcel,
  faFilePdf
} from '@fortawesome/free-solid-svg-icons'
import {
  useGlobalFilter,
  useTable,
  useAsyncDebounce,
  useFilters,
  useSortBy,
  usePagination
} from 'react-table'
import {
  setPage,
  setSize,
  setTotalPages
} from '../../states/features/pagination/paginationSlice'
import { useLazyGetHouseholdsListQuery } from '../../states/api/apiSlice'
import Loading from '../../components/Loading'
import Button, { PageButton } from '../../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector, useDispatch } from 'react-redux'
import Input from '../../components/Input'
import { Link } from 'react-router-dom'

const HouseholdTable = ({ user }) => {
  const [
    getHouseholdsList,
    {
      data: householdsListData,
      isLoading: householdsListIsLoading,
      isSuccess: householdsListIsSuccess,
      isError: householdsListIsError,
      error: householdsListError
    }
  ] = useLazyGetHouseholdsListQuery()

  const {
    page: offset,
    size,
    totalPages
  } = useSelector((state) => state.pagination)

  const dispatch = useDispatch()

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

  const [data, setData] = useState(householdsListData?.data || [])

  useEffect(() => {
    if (householdsListIsSuccess) {
      dispatch(setTotalPages(householdsListData?.data?.totalPages))
      setData(
        householdsListData?.data?.rows?.map((row, index) => ({
          id: index + 1,
          name: row?.name,
          phone1: row?.phone1,
          phone2: row?.phone2,
          ubudehe: row?.ubudehe,
          status: row?.status,
          ID: row?.id
        })) || []
      )
    }
  }, [householdsListData, householdsListIsSuccess, dispatch])

  useEffect(() => {
    getHouseholdsList({
      department,
      departmentId: user?.departments?.id,
      id: user?.departments?.id,
      size,
      page: offset
    })
      .unwrap()
      .then((data) => {
        dispatch(setTotalPages(data?.data?.totalPages))
        setData(
          data?.data?.rows?.map((row, index) => ({
            id: index + 1,
            name: row?.name,
            phone1: row?.phone1,
            phone2: row?.phone2,
            ubudehe: row?.ubudehe,
            status: row?.status,
            ID: row?.id
          })) || []
        )
      })
  }, [offset, size, department, user?.departments?.id, dispatch])

  const handleExportToPdf = async () => {
    const doc = new jsPDF('landscape')
    const logoResponse = await fetch(logo)
    const logoData = await logoResponse.blob()
    const reader = new FileReader()

    reader.onload = () => {
      const logoBase64 = reader.result.split(',')[1]
      doc.setFontSize(16)
      doc.setFillColor(255, 166, 1)
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F')
      doc.addImage(logoBase64, 'PNG', 10, 5, 30, 30)
      doc.setTextColor(0)
      doc.text('Households List', 50, 25)

      doc.setFontSize(10)

      const columnHeader = ['NO', 'Name', 'Phone 1', 'Phone 2', 'Ubudehe', 'Status']
      const headerRow = columnHeader.map(header => ({ content: header, styles: { halign: 'center' } }))
      doc.autoTable({
        startY: 50,
        head: [headerRow],
        theme: 'grid',
        styles: {
          cellPadding: { top: 5, right: 5, bottom: 5, left: 5 }
        },
        columnStyles: {}
      })

      const filteredData = data.map(({ ID, ...rest }) => rest)
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 5,
        head: false,
        body: filteredData,
        theme: 'grid',
        styles: {},
        columnStyles: {}
      })

      doc.save('households.pdf')
    }

    reader.readAsDataURL(logoData)
  }

  const handleExportToExcel = () => {
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet("HouseHold Lists")
    sheet.properties.defaultRowHeight = 80

    sheet.getRow(1).border = {
      top: { style: "thick" },
      left: { style: "thick" },
      bottom: { style: "thick" },
      right: { style: "thick" }
    }

    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "darkVertical",
      fgColor: { argb: "FFFF00" }
    }

    sheet.getRow(1).font = {
      name: "",
      family: 4,
      size: 12,
      bold: true
    }

    sheet.columns = [
      { header: "Name", key: "name", width: 20 },
      {
        header: "Phone No",
        key: "phone1",
        width: 20
      },
      {
        header: "Phone No 2",
        key: "phone2",
        width: 10
      },
      {
        header: "Ubudehe",
        key: "ubudehe",
        width: 15
      },
      {
        header: "Status",
        key: "status",
        width: 10
      }
    ]

    const promise = Promise.all(
      data?.map(async (household, index) => {
        sheet.addRow({
          name: household?.name,
          phone1: household?.phone1,
          phone2: household?.phone2,
          ubudehe: household?.ubudehe,
          status: household?.status
        })
      })
    )

    promise.then(() => {

      workbook.xlsx.writeBuffer().then(function (data) {
        const blob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        })
        const url = window.URL.createObjectURL(blob)
        const anchor = document.createElement("a")
        anchor.href = url
        anchor.download = "download.xlsx"
        anchor.click()
        window.URL.revokeObjectURL(url)
      })
    })
  }
  const columns = useMemo(
    () => [
      {
        Header: 'Names',
        accessor: 'name',
        sortable: true
      },
      {
        Header: 'Ubudehe',
        accessor: 'ubudehe',
        sortable: true,
        Filter: SelectColumnFilter
      },
      {
        Header: 'status',
        accessor: 'status',
        sortable: true,
        Filter: SelectColumnFilter,
        Cell: ({ value }) => (
          <div
            className={`${value === 'ACTIVE'
              ? 'bg-green-500 shadow-md rounded-sm shadow-200'
              : 'bg-red-500 rounded-sm shadow-md shadow-200'
              } p-1 rounded-md text-white text-center`}
          >
            {value}
          </div>
        )
      },
      {
        Header: 'phone',
        accessor: 'phone1'
      },
      {
        id: 'ID',
        Header: 'Action',
        accessor: 'ID',
        Cell: ({ row }) => (
          <Link
            to={`/households/${row?.original?.ID}`}
            className="flex items-center justify-center h-8 w-14 text-white bg-primary rounded-sm shadow-md"
          >
            <FaEye className="" />
          </Link>
        )
      }
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
        sortable: true
      },
      ...columns
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

  if (householdsListIsSuccess) {
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
                  column.Filter
                    ? (
                      <div
                        key={column.id}
                        className="p-[5px] px-2 border-[1px] shadow-md rounded-md"
                      >
                        <label htmlFor={column.id}></label>
                        {column.render('Filter')}
                      </div>
                      )
                    : null
                )
              )}
            </span>
          </div>
          <div className="mt-2 flex flex-col w-[95%] mx-auto">
            <div className="-my-2 overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <div className="flex gap-2">

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
                      onClick={handleExportToExcel}
                    />
                  </div>
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
                    <tbody className="bg-white divide-y divide-gray-200" {...getTableBodyProps()}>
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

  if (householdsListError) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center flex-col gap-6">
        <h1 className="text-[25px] font-medium text-center">
          Could not load households records
        </h1>
        <Button value="Go to dashboard" route="/dashboard" />
      </main>
    )
  }

  if (householdsListIsLoading) {
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

HouseholdTable.propTypes = {
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

function GlobalFilter ({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter
}) {
  const count = preGlobalFilteredRows.length
  const [value, setValue] = useState(globalFilter)
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

export default HouseholdTable
