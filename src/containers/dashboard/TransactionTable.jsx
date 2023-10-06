import 'core-js/stable'
import 'jspdf-autotable'
import logo from '../../assets/LOGO.png'
import jsPDF from 'jspdf'
import cachet from "../../assets/cachet.png"
import signature from "../../assets/signature.png"
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
  faClose,
  faFile,
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
import formatFunds from '../../utils/Funds'

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

  const [totals, setTotals] = useState({
    totalCommission: 0,
    totalAmount: 0,
    remainingAmount: 0,
  })

  const {
    page: offset,
    size,
    totalPages,
  } = useSelector((state) => state.pagination)
  const [totalCommission, setTotalCommission] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [totalRemaining, setTotalRemaining] = useState(0)
  const [showExportPopup, setShowExportPopup] = useState(false);
  const [reportName, setReportName] = useState('');

  const openExportPopup = () => {
    setShowExportPopup(true);
  };

  const closeExportPopup = () => {
    setShowExportPopup(false);
  };
  const dispatch = useDispatch()

  const { sectorId } = useSelector((state) => state.departments)

  let department = ''

  const location = useLocation()

  const queryRoute =
    queryString.parse(location.search).query || 'monthlyCollections'

  switch (user?.departments?.level_id) {
    case 1:
      department = 'sector'
      break
    case 2:
      department = 'sector'
      break
    case 3:
      department = 'sector'
      break
    case 4:
      department = 'cell'
      break
    case 5:
      department = 'sector'
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
      departmentId: sectorId || user?.departments?.id,
      route: `${queryRoute}/list`,
      id: sectorId || user?.departments?.id,
    })
  }, [])

  useEffect(() => {
    if (transactionsListIsSuccess)
      setTimeout(() => {
        dispatch(setSize(10000000000))
      }, 2000)
  }, [transactionsListData, transactionsListIsSuccess])

  useEffect(() => {
    getTransactionsList({
      department,
      departmentId: sectorId || user?.departments?.id,
      route: `${queryRoute}/list`,
      id: sectorId || user?.departments?.id,
      size,
      page: offset,
    })
      .unwrap()
      .then((data) => {
        dispatch(setTotalPages(data?.data?.totalPages))
        let totalCommission = 0
        let totalPaidAmount = 0
        let totalRemainingAmount = 0

        // eslint-disable-next-line array-callback-return
        transactionsListData?.data?.rows?.map((row, index) => {
          const paidAmount = Number(row?.amount) || 0
          const remainingAmount = Number(row?.remain) || 0
          totalCommission += Number(row?.amount) / 10
          totalPaidAmount += paidAmount
          totalRemainingAmount = totalPaidAmount - totalCommission
        })

        setTotals({
          totalCommission,
          remainingAmount: totalRemainingAmount,
          totalAmount: totalPaidAmount,
        })

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
            status: row?.status,
            remain_amount: row?.remain || 0,
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
        totalCommission += Number(row?.amount) / 10
        totalPaidAmount += paidAmount
        totalRemainingAmount = totalPaidAmount - totalCommission

        setTotals({
          totalCommission,
          remainingAmount: totalRemainingAmount,
          totalAmount: totalPaidAmount,
        })

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
          status: row?.status,
          remain_amount: row?.remain || 0,
          commission: Number(row?.amount) / 10,
          transaction_date: moment(row.created_at).format('DD-MM-YYYY'),
        }
      })

      setTotalCommission(totalCommission)
      setTotalAmount(totalPaidAmount)
      setTotalRemaining(totalRemainingAmount)
      setData(mappedData)
    }
  }, [transactionsListIsSuccess, transactionsListIsError, queryRoute])

  const handleExportToPdf = async () => {
    const doc = new jsPDF('landscape');
    const logoResponse = await fetch(logo);
    const logoData = await logoResponse.blob();
    const reader = new FileReader();

    reader.onload = async () => {
      const logoBase64 = reader.result.split(',')[1];
      doc.setFontSize(12);
      doc.setFillColor(255, 166, 1);
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
      doc.addImage(logoBase64, 'PNG', 10, 5, 30, 30);
      doc.setTextColor(0);
      doc.text(`${reportName}`, 50, 25);

      doc.setFontSize(8);

      const columnHeader = [
        'NO',
        'NAMES',
        'VILLAGE',
        'CELL',
        'SECTOR',
        'DISTRICT',
        'AMOUNT',
        'MONTH PAID',
        'STATUS',
        'REMAINING AMOUNT',
        'PAYMENT METHOD',
        'AGENT',
        'COMMISSION',
        'DATE',
      ];
      const headerRow = columnHeader.map((header) => ({
        content: header,
      }));
      doc.autoTable({
        startY: 50,
        head: [headerRow],
        theme: 'grid',
        styles: {
          fillColor: '#EDEDED',
          textColor: '#000000',
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
          fontSize: 8,
        },
      });

      // Create a separate array for "NO" values starting from 1
      const noValues = Array.from({ length: TableInstance.rows.length }, (_, index) => index + 1);

      // Combine the "NO" values with your existing data, excluding the ID
      const exportData = TableInstance.rows.map((row, index) => {
        const { id, ...rest } = row.original;
        return {
          NO: noValues[index],
          ...rest,
        };
      });
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 5,
        head: false,
        body: exportData,
        theme: 'grid',
        styles: {
          fontSize: 8,
        },
      });

      // Add your custom content here
      const customContent = [
        ['BITEGUWE NA:', 'BYEMEJWE NA:'],
        ['', ''],
        ['TETA TAMARA', 'NDAGIJIMANA Gedeon'],
        ['DATA MANAGEMENT', 'CEO IMENA SOFTEK LTD'],
        ['IMENA SOFTEK LTD', ''],
      ];

      // Define custom styles for the custom content (no lines and normal font weight)
      const customContentStyles = {
        theme: 'plain', // Use plain theme to remove table lines
        styles: {
          fontSize: 8,
          fontStyle: 'normal', // Use normal font weight
        },
        columnStyles: {
          0: { cellWidth: 150 },
          1: { cellWidth: 100 },
        },
      };
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: false,
        body: customContent,
        ...customContentStyles,
      });

      // Add the cachet image here
      const cachetResponse = await fetch(cachet);
      const cachetData = await cachetResponse.blob();
      const cachetBase64 = await convertBlobToBase64(cachetData);

      doc.addImage(cachetBase64, 'PNG', 200, doc.lastAutoTable.finalY - 50, 50, 50);

      // Add the signature image here
      const signatureResponse = await fetch(signature);
      const signatureData = await signatureResponse.blob();
      const signatureBase64 = await convertBlobToBase64(signatureData);
      const date = new Date();
      const dateNow = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();

      doc.addImage(signatureBase64, 'PNG', 20, doc.lastAutoTable.finalY - 50, 50, 50);
      doc.text(`Date: ${dateNow}`, 20, doc.lastAutoTable.finalY + 2);

      doc.save(`${reportName}.pdf`);
    };

    reader.readAsDataURL(logoData);
  };

  // Helper function to convert Blob to Base64
  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result.split(',')[1]);
      };
      reader.readAsDataURL(blob);
    });
  };

  const handleExportToExcel = () => {
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet(`${reportName}`)
    sheet.properties.defaultRowHeight = 80

    sheet.getRow(1).border = {
      top: { style: 'thick' },
      left: { style: 'thick' },
      bottom: { style: 'thick' },
      right: { style: 'thick' },
    }

    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'darkVertical',
      fgColor: { argb: 'FFFF00' },
    }

    sheet.getRow(1).font = {
      name: '',
      family: 4,
      size: 12,
      bold: true,
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
      TableInstance.rows.map(async (row) => {
        sheet.addRow({
          id: row.original?.id,
          name: row.original?.name,
          department: row.original?.department,
          amount: row.original?.amount,
          month_paid: row.original?.month_paid,
          payment_method: row.original?.payment_method,
          status: row.original?.status,
          remain_amount: row.original?.remain_amount,
          agent: row.original?.agent,
          commission: row.original?.commission,
          transaction_date: row.original?.transaction_date,
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
        Header: 'Status',
        accessor: 'status',
        sortable: true,
        Filter: SelectColumnFilter,
        Cell: ({ value }) => (
          <div
            className={`${value === 'PAID'
              ? 'bg-green-600 shadow-md rounded-sm shadow-200' :
              value === 'INITIATED' ? 'bg-yellow-600 rounded-sm shadow-md shadow-200'
                : 'bg-red-600 rounded-sm shadow-md shadow-200'
              } p-1 rounded-md text-white text-center`}
          >
            {value}
          </div>
        ),
      },
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

  useEffect(() => {
    document.title = 'Transactions | Umusanzu Digital'
  }, [])

  if (transactionsListIsSuccess) {
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
              <div className="shadow overflow-hidden flex flex-col gap-4 border-b border-gray-200">
                  {user?.departments.level_id !== 6 && (
                  <div className="flex gap-2">
                    <Button
                      value={
                        <span className="flex items-center gap-2">
                          Export Report
                          <FontAwesomeIcon icon={faFile} />
                        </span>
                      }
                      onClick={openExportPopup}
                    />
                    </div>
                  )}
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
          <tr className="bg-green-600 flex items-center flex-wrap">
            <td className="px-6 py-4 text-black font-semibold">
              Total Amout:
            </td>
            <td className="px-6 py-4 green font-semibold">
              {formatFunds(totals?.totalAmount) || formatFunds(totalAmount)} RWF
            </td>
            <td className="px-6 py-4 green font-semibold">
              Total Commission:
            </td>
            <td className="px-6 py-4 green font-semibold">
              {formatFunds(totals?.totalCommission) ||
                formatFunds(totalCommission)}{' '}
              RWF
            </td>
            <td className="px-6 py-4 green font-semibold">
              Total Remaining:
            </td>
            <td className="px-6 py-4 green font-semibold">
              {formatFunds(totals?.remainingAmount) ||
                formatFunds(totalRemaining)}{' '}
              RWF
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

export default TransactionTable
