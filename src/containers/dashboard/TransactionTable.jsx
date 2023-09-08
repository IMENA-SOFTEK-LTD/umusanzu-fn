import 'core-js/stable'
import 'jspdf-autotable'
import logo from '../../assets/LOGO.png'
import jsPDF from 'jspdf'
import ExcelJS from 'exceljs'
import 'regenerator-runtime/runtime'
import { useState, useEffect, useMemo } from 'react'
import moment from 'moment'
import PropTypes from 'prop-types'
import queryString from 'query-string'
import {
  faAnglesLeft,
  faAnglesRight,
  faChevronLeft,
  faChevronRight,
  faFileExcel,
  faFilePdf,
} from '@fortawesome/free-solid-svg-icons'
import {
  useGlobalFilter,
  useTable,
  useAsyncDebounce,
  useFilters,
  useSortBy,
  usePagination,
} from 'react-table'
import { useLocation } from 'react-router-dom'
import {
  setPage,
  setSize,
  setTotalPages,
} from '../../states/features/pagination/paginationSlice'
import { useLazyGetTransactionsListQuery } from '../../states/api/apiSlice'
import Loading from '../../components/Loading'
import Button, { PageButton } from '../../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector, useDispatch } from 'react-redux'
import Input from '../../components/Input'

const TransactionTable = ({ user }) => {
  const [
    getTransactionsList,
    {
      data: transactionsListData,
      isLoading: transactionsListIsLoading,
      isSuccess: transactionsListIsSuccess,
      isError: transactionsListIsError,
      error: transactionsListError,
    },
  ] = useLazyGetTransactionsListQuery()

  const {
    page: offset,
    size,
    totalPages,
  } = useSelector((state) => state.pagination)
  const [totalCommission, setTotalCommission] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [totalRemaining, setTotalRemaining] = useState(0)
  const dispatch = useDispatch()
  let department = ''

  const location = useLocation()

  const queryRoute =
    queryString.parse(location.search).query || 'monthlyCollections'

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

  const [data, setData] = useState(transactionsListData?.data || [])

  useEffect(() => {
    getTransactionsList({
      department,
      departmentId: user?.departments?.id,
      route: `${queryRoute}/list`,
      id: user?.departments?.id,
    })
  }, [])

  useEffect(() => {
      if (transactionsListIsSuccess) setTimeout(() => {
        dispatch(setSize(1000000000))
      }, 3000);
  }, [transactionsListData, transactionsListIsSuccess])

  useEffect(() => {
    getTransactionsList({
      department,
      departmentId: user?.departments?.id,
      route: `${queryRoute}/list`,
      id: user?.departments?.id,
      size,
      page: offset,
    })
      .unwrap()
      .then((data) => {
        dispatch(setTotalPages(data?.data?.totalPages))
        setData(
          data?.data?.rows?.map((row, index) => ({
            id: index + 1,
            name: row?.households?.name,
            village: row?.households?.villages[0]?.name,
          cell: row?.households?.cells[0]?.name,
          sector: row?.households?.sectors[0]?.name,
          district: row?.households?.districts[0]?.name,
            amount: row?.amount,
            month_paid: moment(row.month_paid).format('MM-YYYY'),
            payment_method: row?.payment_method?.split('_').join(' '),
            status: row?.payments[0]?.status,
            remain_amount: row?.payments[0]?.remain_amount,
            agent: row?.agents?.names,
            commission: Number(row?.amount) / 10,
            transaction_date: moment(row?.transaction_date).format(
              'DD-MM-YYYY'
            ),
          })) || []
        )
      })
  }, [size, queryRoute])

  useEffect(() => {
    if (transactionsListIsSuccess) {
      dispatch(setTotalPages(data?.data?.totalPages))
      let totalCommission = 0
      let totalPaidAmount = 0
      let totalRemainingAmount = 0

      const mappedData = transactionsListData?.data?.rows?.map((row, index) => {
        const paidAmount = Number(row?.amount) || 0
        const remainingAmount = Number(row?.payments[0]?.remain_amount) || 0

        totalCommission += Number(row?.amount) / 10
        totalPaidAmount += paidAmount
        totalRemainingAmount = totalPaidAmount - totalCommission
        return {
          id: index + 1,
          name: row.households.name,
          village: row?.households?.villages[0]?.name,
          cell: row?.households?.cells[0]?.name,
          sector: row?.households?.sectors[0]?.name,
          district: row?.households?.districts[0]?.name,
          amount: row?.amount,
          month_paid: moment(row.month_paid).format('MM-YYYY'),
          payment_method: row.payment_method.split('_').join(' '),
          agent: row?.agents?.names,
          status: row?.payments[0]?.status,
          remain_amount: row?.payments[0]?.remain_amount,
          commission: Number(row?.amount) / 10,
          transaction_date: moment(row.created_at).format('DD-MM-YYYY')
        }
      })
 
      setTotalCommission(totalCommission)
      setTotalAmount(totalPaidAmount)
      setTotalRemaining(totalRemainingAmount)
      setData(mappedData)
      
    }
  }, [transactionsListIsSuccess, transactionsListIsError, queryRoute])

  const handleExportToPdf = async () => {
    const doc = new jsPDF('landscape')
    const logoResponse = await fetch(logo)
    const logoData = await logoResponse.blob()
    const reader = new FileReader()

    reader.onload = () => {
      const logoBase64 = reader.result.split(',')[1]
      doc.setFontSize(12)
      doc.setFillColor(255, 166, 1)
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F')
      doc.addImage(logoBase64, 'PNG', 10, 5, 30, 30)
      doc.setTextColor(0)
      doc.text('Transaction Report', 50, 25)

      doc.setFontSize(8)
      const columnHeader = [
        'NO',
        'NAMES',
        'VILLAGE',
        'AMOUNT',
        'MONTH PAID',
        'STATUS',
        'REMAINING',
        'PAYMENT',
        'METHOD',
        'AGENT',
        'COMMISSION',
        'DATE',
      ]
      const headerRow = columnHeader.map((header) => ({ content: header }))
      doc.autoTable({
        startY: 50,
        head: [headerRow],
        theme: 'grid',
        styles: {
          cellPadding: { top: 5, right: 5, bottom: 5, left: 5 },
          fontSize: 8,
        },
        columnStyles: {},
      })

      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 5,
        head: false,
        body: data,
        theme: 'grid',
        styles: {
          fontSize: 8,
        },
        columnStyles: {},
      })

      // Save the PDF
      doc.save('households.pdf')
    }

    reader.readAsDataURL(logoData)
  }
  const handleExportToExcel = () => {
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet("Transaction")
    sheet.properties.defaultRowHeight = 80

    sheet.getRow(1).border = {
      top: { style: "thick"  },
      left: { style: "thick"  },
      bottom: { style: "thick"  },
      right: { style: "thick"  }
    }

    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "darkVertical",
      fgColor: { argb: "FFFF00" }
    }

    sheet.getRow(1).font = {
      name: '',
      family: 4,
      size: 12,
      bold: true
    }

    sheet.columns = [
      {
        header: 'Id',
        key: 'id',
        width: 5,
      },
      { header: 'Name', key: 'name', width: 20 },
      {
        header: 'Department',
        key: 'department',
        width: 20,
      },
      {
        header: 'Amount',
        key: 'amount',
        width: 10,
      },
      {
        header: 'Month paid',
        key: 'month_paid',
        width: 15,
      },
      {
        header: 'Payment method',
        key: 'payment_method',
        width: 15,
      },
      {
        header: 'Status',
        key: 'status',
        width: 10,
      },
      {
        header: 'Remain amount',
        key: 'remain_amount',
        width: 10,
      },
      {
        header: 'Agent',
        key: 'agent',
        width: 20,
      },
      {
        header: 'Commission',
        key: 'commission',
        width: 10,
      },
      {
        header: 'Transaction date',
        key: 'transaction_date',
        width: 20,
      },
    ]

    const promise = Promise.all(
      data?.map(async (transaction) => {
        sheet.addRow({
          id: transaction?.id,
          name: transaction?.name,
          department: transaction?.department,
          amount: transaction?.amount,
          month_paid: transaction?.month_paid,
          payment_method: transaction?.payment_method,
          status: transaction?.status,
          remain_amount: transaction?.remain_amount,
          agent: transaction?.agent,
          commission: transaction?.commission,
          transaction_date: transaction?.transaction_date,
        })
      })
    )

    promise.then(() => {
      workbook.xlsx.writeBuffer().then(function (data) {
        const blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        const url = window.URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = 'download.xlsx'
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
        Header: 'Amount',
        accessor: 'amount',
        sortable: true,
        Filter: SelectColumnFilter,
      },
      {
        Header: 'Month Paid',
        accessor: 'month_paid',
        sortable: true,
        Filter: SelectColumnFilter,
      },
      {
        Header: 'Status',
        accessor: 'status',
        sortable: true,
        Filter: SelectColumnFilter,
      },
      {
        Header: 'Remaining Amount',
        accessor: 'remain_amount',
        sortable: true,
      },
      {
        Header: 'Payment Method',
        accessor: 'payment_method',
        sortable: true,
        Filter: SelectColumnFilter,
      },
      {
        Header: 'Agent',
        accessor: 'agent',
        sortable: true,
      },
      {
        Header: 'Commission',
        accessor: 'commission',
        sortable: true,
      },
      {
        Header: 'Date',
        accessor: 'transaction_date',
        sortable: true,
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
      filterTypes: {
        dateRange: dateRangeFilter,
      },
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

  if (transactionsListIsSuccess) {
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
            <span className="w-[95%] mx-auto h-fit flex items-center flex-wrap gap-4">
             
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
              <div className="shadow overflow-hidden flex flex-col gap-4 border-b border-gray-200">
                
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
                  {transactionsListIsLoading ? (
                    <span className="w-full flex items-center justify-center my-6 mx-auto">
                      <Loading size={4} />
                    </span>
                  ) : (
                    <tbody
                      className="bg-white divide-y divide-gray-200"
                      {...getTableBodyProps()}
                    >
                      {page.map((row) => {
                        prepareRow(row);
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
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  )}
                </table>
              </div>
              </div>
            </div>
          </div>
        </div>
        <table className="w-[95%] mx-auto my-6 divide-y divide-gray-200">
          <tr className="bg-gray-100 ">
            <td className="px-6 py-4 text-gray-800 font-semibold">
              Total Amout:
            </td>
            <td className="px-6 py-4 text-gray-800 font-semibold">
              {totalAmount} RWF
            </td>
            <td className="px-6 py-4 text-gray-800 font-semibold">
              Total Commission:
            </td>
            <td className="px-6 py-4 text-gray-800 font-semibold">
              {totalCommission} RWF
            </td>
            <td className="px-6 py-4 text-gray-800 font-semibold">
              Total Remaining:
            </td>
            <td className="px-6 py-4 text-gray-800 font-semibold">
              {totalRemaining} RWF
            </td>
          </tr>
        </table>
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
                  <span className="font-medium">{state.rows?.length}</span>
                </span>
                <label>
                  <span className="sr-only">Items Per Page</span>
                  <select
                    className="w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    value={state.pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value))
                      // dispatch(setSize(Number(e.target.value)))
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

  if (transactionsListError) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center flex-col gap-6">
        <h1 className="text-[25px] font-medium text-center">
          Could not load transactions records
        </h1>
        <Button value="Go to dashboard" route="/dashboard" />
      </main>
    )
  }

  if (transactionsListIsLoading) {
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

TransactionTable.propTypes = {
  user: PropTypes.shape({}),
}

function dateRangeFilter(rows, columnIds, filterValue) {
  const { startDate, endDate } = filterValue
  if (!startDate || !endDate) {
    return rows
  }

  return rows.filter((row) => {
    const date = moment(row.values[columnIds].transaction_date, 'DD-MM-YYYY')
    return date.isBetween(startDate, endDate, null, '[]')
  })
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

export default TransactionTable
