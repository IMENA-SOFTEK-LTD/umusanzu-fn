import 'core-js/stable'
import 'jspdf-autotable'
import logo from '../../assets/LOGO.png'
import jsPDF from 'jspdf'
import cachet from '../../assets/cachet.png'
import signature from '../../assets/signature.png'
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
import {
  setPage,
  setSize,
  setTotalPages,
} from '../../states/features/pagination/paginationSlice'
import { useLazyGetTransactionsListQuery } from '../../states/api/apiSlice'
import Button, { PageButton } from '../../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector, useDispatch } from 'react-redux'
import Input from '../../components/Input'
import formatFunds from '../../utils/Funds'
import {
  setSelectedCell,
  setSelectedDistrict,
  setSelectedProvince,
  setSelectedSector,
  setSelectedVillage,
} from '../../states/features/modals/householdSlice'
import OverlayLoading from '../../components/OverlayLoading'
import GlobalFilter from './GlobalFilter'
import API_URL from '../../constants'
import axios from 'axios'
import download from 'downloadjs'

const TransactionTable = ({ user }) => {
  const [transactionsListIsLoading, setTransactionsListIsLoading] =
    useState(false)
  const [transactionsListIsError, setTransactionsListIsError] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const [getTransactionsList] = useLazyGetTransactionsListQuery()

  const {
    page: offset,
    size,
    totalPages,
  } = useSelector((state) => state.pagination)

  const [totalRecords, setTotalRecords] = useState(0)
  const [totalCommission, setTotalCommission] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [totalRemaining, setTotalRemaining] = useState(0)
  const [showExportPopup, setShowExportPopup] = useState(false)
  const [reportName, setReportName] = useState(
    `UMUSANZU DIGITAL'S TRANSACTIONS IN ${user?.departments?.name?.toUpperCase()} ${user?.department?.toUpperCase()}`
  )

  const openExportPopup = () => {
    setShowExportPopup(true)
  }

  const closeExportPopup = () => {
    setShowExportPopup(false)
  }
  const dispatch = useDispatch()

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
    payment_status: 'All',
    payment_method: 'All',
    village: queryRoute?.village || '',
    cell: queryRoute?.cell || '',
    sector: queryRoute?.sector || '',
    district: queryRoute?.district || '',
    province: queryRoute?.province || '',
    query: queryRoute?.query || '',
    transaction_from: queryRoute?.transaction_from || '',
    transaction_to: queryRoute?.transaction_to || '',
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
        payment_status: queryRoute_?.payment_status || 'All',
        payment_method: queryRoute_?.payment_method || 'All',
        village: queryRoute_?.village || '',
        cell: queryRoute_?.cell || '',
        sector: queryRoute_?.sector || '',
        district: queryRoute_?.district || '',
        province: queryRoute_?.province || '',
        transaction_from: queryRoute_?.transaction_from || '',
        transaction_to: queryRoute_?.transaction_to || '',
      })
    }
  }, [location])

  useEffect(() => {
    onLoadTransactionLists({
      department,
      size,
      page: offset,
      ...queries,
    })
  }, [size, offset])

  const onLoadTransactionLists = async (data) => {
    setTransactionsListIsLoading(true)
    try {
      await getTransactionsList(data)
        .unwrap()
        .then((res) => {
          dispatch(setTotalPages(res?.data?.totalPages))
          setTotalRecords(res?.data?.count)
          setTotalAmount(res?.data?.totalAmount)
          setTotalCommission(res?.data?.totalCommission)
          setTotalRemaining(
            +res?.data?.totalAmount - +res?.data?.totalCommission
          )

          setData(
            res?.data?.rows?.map((row, index) => ({
              id: index + 1,
              name: row?.household_name,
              village: row?.household_village_name,
              cell: row?.household_cell_name,
              sector: row?.household_sector_name,
              district: row?.household_district_name,
              amount: row?.transaction_amount,
              month_paid: moment(row.transaction_month_paid).format('MM-YYYY'),
              payment_method: row?.transaction_payment_method
                ?.split('_')
                .join(' '),
              status: row?.transaction_status,
              remain_amount: row?.transaction_remain_amount || 0,
              agent: row?.agent_names,
              commission: row?.transaction_total_commission,
              transaction_date: moment(
                row?.transaction_transaction_date
              ).format('DD-MM-YYYY'),
            })) || []
          )
        })
        .catch((error) => {
          setTransactionsListIsError(true)
          if (error.data && error.data.message) {
            toast.error(error.data.message)
          } else {
            toast.error(
              'An error occurred while retrieving the transaction lists. Please try again'
            )
          }
        })
        .finally(() => {
          setTransactionsListIsLoading(false)
        })
    } catch (error) {
      return error
    }
  }


  // const handleExportToPdf = async () => {
  //   const doc = new jsPDF({
  //     orientation: 'landscape',
  //     format: 'a4',
  //     margins: { top: 60, right: 60, bottom: 40, left: 200 },
  //   })
  //   const logoResponse = await fetch(logo)
  //   const logoData = await logoResponse.blob()
  //   const reader = new FileReader()

  //   reader.onload = async () => {
  //     const logoBase64 = reader.result.split(',')[1]
  //     doc.addImage(logoBase64, 'PNG', 130, 10, 30, 30)
  //     doc.setFont('Symbol', 'bold')
  //     doc.setFontSize(12)
  //     doc.text('IMENA SOFTEK LTD', 125, 50)

  //     let currentMonth = moment().format('MMMM')
  //     if (userOrSelectedDepartmentNames?.village !== undefined) {
  //       doc.text(
  //         `UMUSANZU  DIGITAL'S  ${
  //           userOrSelectedDepartmentNames.village
  //         }  VILLAGE  ${currentMonth.toUpperCase()}  TRANSACTIONS`,
  //         65,
  //         65
  //       )
  //     } else if (
  //       userOrSelectedDepartmentNames?.cell !== undefined &&
  //       userOrSelectedDepartmentNames?.village === undefined
  //     ) {
  //       doc.text(
  //         `UMUSANZU  DIGITAL'S  ${
  //           userOrSelectedDepartmentNames.cell
  //         }  CELL  ${currentMonth.toUpperCase()}  TRANSACTIONS`,
  //         65,
  //         65
  //       )
  //     } else {
  //       doc.text(
  //         `UMUSANZU  DIGITAL'S  ${
  //           userOrSelectedDepartmentNames.sector
  //         }  SECTOR  ${currentMonth.toUpperCase()}  TRANSACTIONS`,
  //         65,
  //         65
  //       )
  //     }
  //     doc.line(61, 67, 220, 67)

  //     doc.setFontSize(8)

  //     const columnHeader = [
  //       { content: 'NO', cellWidth: 10 },
  //       { content: 'NAMES', cellWidth: 30 },
  //       { content: 'VILLAGE', cellWidth: 23 },
  //       { content: 'CELL', cellWidth: 20 },
  //       { content: 'SECTOR', cellWidth: 20 },
  //       { content: 'DISTRICT', cellWidth: 20 },
  //       { content: 'AMOUNT PAID', cellWidth: 15 },
  //       { content: 'MONTH PAID', cellWidth: 16 },
  //       { content: 'PAYMENT METHOD', cellWidth: 23 },
  //       { content: 'STATUS', cellWidth: 18 },
  //       { content: 'REMAINING AMOUNT', cellWidth: 18 },
  //       { content: 'AGENT', cellWidth: 30 },
  //       { content: 'COMMISSION', cellWidth: 13 },
  //       { content: 'DATE', cellWidth: 18 },
  //     ]
  //     const headerRow = columnHeader.map((header) => ({
  //       content: header.content,
  //       styles: { cellWidth: header.cellWidth },
  //     }))
  //     doc.autoTable({
  //       startY: 75,
  //       head: [headerRow],
  //       theme: 'grid',
  //       styles: {
  //         fillColor: '#EDEDED',
  //         textColor: '#000000',
  //         fontStyle: 'bold',
  //         halign: 'center',
  //         valign: 'middle',
  //         fontSize: 7,
  //       },
  //     })

  //     // Create a separate array for "NO" values starting from 1
  //     const noValues = Array.from(
  //       { length: TableInstance.rows.length },
  //       (_, index) => index + 1
  //     )

  //     // Combine the "NO" values with your existing data, excluding the ID
  //     const exportData = TableInstance.rows.map((row, index) => {
  //       const { id, ...rest } = row.original
  //       return {
  //         NO: noValues[index],
  //         ...rest,
  //       }
  //     })
  //     doc.autoTable({
  //       startY: doc.lastAutoTable.finalY + 5,
  //       head: false,
  //       body: exportData,
  //       theme: 'grid',
  //       styles: {
  //         fontSize: 7.5,
  //       },
  //       columnStyles: columnHeader.reduce((acc, value, index) => {
  //         acc[index] = { cellWidth: value.cellWidth }
  //         return acc
  //       }, {}),
  //     })

  //     // Add your custom content here
  //     const customContent = [
  //       ['BITEGUWE NA:', 'BYEMEJWE NA:'],
  //       ['', ''],
  //       ['TETA TAMARA', 'NDAGIJIMANA Gedeon'],
  //       ['DATA MANAGEMENT', 'CEO IMENA SOFTEK LTD'],
  //       ['IMENA SOFTEK LTD', ''],
  //     ]

  //     // Define custom styles for the custom content (no lines and normal font weight)
  //     const customContentStyles = {
  //       theme: 'plain', // Use plain theme to remove table lines
  //       styles: {
  //         fontSize: 8,
  //         fontStyle: 'normal', // Use normal font weight
  //       },
  //       columnStyles: {
  //         0: { cellWidth: 150 },
  //         1: { cellWidth: 100 },
  //       },
  //     }

  //     if (doc.lastAutoTable.finalY + 90 > doc.internal.pageSize.height) {
  //       doc.addPage()
  //       doc.text(
  //         `Done on: ${moment().format('DD-MM-YYYY HH:mm:ss')}`,
  //         16,
  //         doc.lastAutoTable.finalY + 20
  //       )
  //       doc.autoTable({
  //         startY: doc.lastAutoTable.finalY + 30,
  //         head: false,
  //         body: customContent,
  //         ...customContentStyles,
  //       })
  //     } else {
  //       doc.text(
  //         `Done on : ${moment().format('DD-MM-YYYY HH:mm:ss')}`,
  //         16,
  //         doc.lastAutoTable.finalY + 20
  //       )

  //       doc.autoTable({
  //         startY: doc.lastAutoTable.finalY + 30,
  //         head: false,
  //         body: customContent,
  //         ...customContentStyles,
  //       })
  //     }

  //     // Add the cachet image here
  //     const cachetResponse = await fetch(cachet)
  //     const cachetData = await cachetResponse.blob()
  //     const cachetBase64 = await convertBlobToBase64(cachetData)

  //     doc.addImage(
  //       cachetBase64,
  //       'PNG',
  //       200,
  //       doc.lastAutoTable.finalY - 50,
  //       50,
  //       50
  //     )

  //     // Add the signature image here
  //     const signatureResponse = await fetch(signature)
  //     const signatureData = await signatureResponse.blob()
  //     const signatureBase64 = await convertBlobToBase64(signatureData)

  //     doc.addImage(
  //       signatureBase64,
  //       'PNG',
  //       20,
  //       doc.lastAutoTable.finalY - 50,
  //       50,
  //       50
  //     )

  //     doc.save(`${reportName}.pdf`)
  //   }

  //   reader.readAsDataURL(logoData)
  // }

  // Helper function to convert Blob to Base64
  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve(reader.result.split(',')[1])
      }
      reader.readAsDataURL(blob)
    })
  }

  // const handleExportToExcel = () => {
  //   const workbook = new ExcelJS.Workbook()
  //   const sheet = workbook.addWorksheet(`${reportName}`)
  //   sheet.properties.defaultRowHeight = 80

  //   sheet.getRow(1).border = {
  //     top: { style: 'thick' },
  //     left: { style: 'thick' },
  //     bottom: { style: 'thick' },
  //     right: { style: 'thick' },
  //   }

  //   sheet.getRow(1).fill = {
  //     type: 'pattern',
  //     pattern: 'darkVertical',
  //     fgColor: { argb: 'FFFF00' },
  //   }

  //   sheet.getRow(1).font = {
  //     name: '',
  //     family: 4,
  //     size: 12,
  //     bold: true,
  //   }

  //   sheet.columns = [
  //     {
  //       header: 'Id',
  //       key: 'id',
  //       width: 5,
  //     },
  //     { header: 'Name', key: 'name', width: 20 },
  //     {
  //       header: 'Department',
  //       key: 'department',
  //       width: 20,
  //     },
  //     {
  //       header: 'Amount',
  //       key: 'amount',
  //       width: 10,
  //     },
  //     {
  //       header: 'Month paid',
  //       key: 'month_paid',
  //       width: 15,
  //     },
  //     {
  //       header: 'Payment method',
  //       key: 'payment_method',
  //       width: 15,
  //     },
  //     {
  //       header: 'Status',
  //       key: 'status',
  //       width: 10,
  //     },
  //     {
  //       header: 'Remain amount',
  //       key: 'remain_amount',
  //       width: 10,
  //     },
  //     {
  //       header: 'Agent',
  //       key: 'agent',
  //       width: 20,
  //     },
  //     {
  //       header: 'Commission',
  //       key: 'commission',
  //       width: 10,
  //     },
  //     {
  //       header: 'Transaction date',
  //       key: 'transaction_date',
  //       width: 20,
  //     },
  //   ]

  //   const promise = Promise.all(
  //     TableInstance.rows.map(async (row) => {
  //       sheet.addRow({
  //         id: row.original?.id,
  //         name: row.original?.name,
  //         department: row.original?.department,
  //         amount: row.original?.amount,
  //         month_paid: row.original?.month_paid,
  //         payment_method: row.original?.payment_method,
  //         status: row.original?.status,
  //         remain_amount: row.original?.remain_amount,
  //         agent: row.original?.agent,
  //         commission: row.original?.commission,
  //         transaction_date: row.original?.transaction_date,
  //       })
  //     })
  //   )

  //   promise.then(() => {
  //     workbook.xlsx.writeBuffer().then(function (data) {
  //       const blob = new Blob([data], {
  //         type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  //       })
  //       const url = window.URL.createObjectURL(blob)
  //       const anchor = document.createElement('a')
  //       anchor.href = url
  //       anchor.download = 'download.xlsx'
  //       anchor.click()
  //       window.URL.revokeObjectURL(url)
  //     })
  //   })
  // }


  
    const handleExportToPdf = async () => {
      try {
        setIsExporting(true)
  
        const { data } = await axios.get(
          `${API_URL}/transactions/pdf-reports?reportName=${reportName}&${new URLSearchParams(queries).toString()}`,
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
          `${API_URL}/transactions/excel-reports?reportName=${reportName}&${new URLSearchParams(queries).toString()}`,
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
        Header: 'Status',
        accessor: 'status',
        sortable: true,
        Filter: SelectColumnFilter,
        Cell: ({ value }) => (
          <div
            className={`${
              value === 'PAID'
                ? 'bg-green-600 shadow-md rounded-sm shadow-200'
                : value === 'INITIATED'
                ? 'bg-black-600 rounded-sm shadow-md shadow-200'
                : value === 'PARTIAL'
                ? 'bg-blue-600 rounded-sm shadow-md shadow-200'
                : 'bg-yellow-600 rounded-sm shadow-md shadow-200'
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
        Filter: DateRangeColumnFilter,
        filter: (rows, id, filterValues) => {
          const sd = filterValues[0]
            ? moment(filterValues[0]).format('DD-MM-YYYY')
            : undefined
          const ed = filterValues[1]
            ? moment(filterValues[1]).format('DD-MM-YYYY')
            : undefined

          if (ed || sd) {
            return rows.filter((r) => {
              const cellDate = r.values[id]

              if (ed && sd) {
                return cellDate >= sd && cellDate <= ed
              } else if (sd) {
                return cellDate >= sd
              } else if (ed) {
                return cellDate <= ed
              }
            })
          } else {
            return rows
          }
        },
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
        dateRange: DateRangeColumnFilter,
      },
      getTheadFilterThProps: (state, rowInfo, column) => {
        return {
          style: {
            overflow: 'visible',
          },
        }
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
    prepareRow,
    state,
    page,
    setPageSize,
  } = TableInstance

  useEffect(() => {
    document.title = 'Transactions | Umusanzu Digital'
  }, [])

  const gotoPage1 = (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return
    dispatch(setPage(Number(newPage)))
    // Optionally trigger your API fetch here if it's not automatically triggered by page change
  }

  return (
    <main className="my-12 w-full">
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
                onClick={handleExportToExcel}
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
      <OverlayLoading color="black" isLoading={transactionsListIsLoading} />
      <div className="flex flex-col items-center gap-6">
        <div className="search-filter flex flex-col w-full items-center gap-6">
          <span className="flex flex-wrap items-center justify-between gap-4 w-full px-8 max-md:flex-col max-md:items-center">
            <div className="flex gap-2 max-md:pl-0"></div>
            <div className="flex gap-2 max-md:pl-2">
              {user?.departments.level_id !== 6 && (
                <div className="flex gap-2 justify-end">
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
            </div>
          </span>
        </div>
        <div className="search-filter flex flex-col w-full items-center gap-6">
          <span className="w-[95%] mx-auto h-fit flex items-center flex-wrap gap-4 max-md:justify-center">
            <GlobalFilter
              user={user}
              fieldEnabled={{
                province: ['country'].includes(department),
                district: ['country', 'province'].includes(department),
                sector: ['country', 'province', 'district'].includes(
                  department
                ),
                cell: ['country', 'province', 'district', 'sector'].includes(
                  department
                ),
                village: [
                  'country',
                  'province',
                  'district',
                  'sector',
                  'cell',
                ].includes(department),
                householdStatus: false,
                searchTerm: true,

                paymentMethod: true,
                paymentStatus: true,
                dateTo: true,
                dateFrom: true,
              }}
              isLoading={transactionsListIsLoading}
              placeholder={'Search for transaction....'}
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
                  searchTerm: query.searchTerm || queryRoute?.searchTerm || '',
                  village: query.village || queryRoute?.village || '',
                  cell: query.cell || queryRoute?.cell || '',
                  sector: query.sector || queryRoute?.sector || '',
                  district: query.district || queryRoute?.district || '',
                  province: query.province || queryRoute?.province || '',
                  payment_status:
                    query.paymentStatus || queryRoute?.paymentStatus || 'All',
                  payment_method:
                    query.paymentMethod || queryRoute?.paymentMethod || 'All',
                  transaction_from: query?.dateFrom || '',
                  transaction_to: query?.dateTo || '',
                }
                setQueries({ ...queries2 })
                onLoadTransactionLists({
                  department,
                  size,
                  page: offset,
                  ...queries2,
                })
              }}
            />
          </span>
        </div>
        <div className="mt-2 flex flex-col w-[95%] mx-auto">
          <div className="overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden flex flex-col gap-4 border-b border-gray-200">
                <table
                  {...getTableProps()}
                  border="1"
                  className="min-w-full divide-y divide-gray-200"
                >
                  <caption className="caption-top p-0">
                    <table className="w-[100%] mx-auto my-0 divide-y divide-gray-200">
                      <tbody>
                        <tr className="bg-[#F9FAFB] flex items-center flex-wrap">
                          <td className="px-6 py-4 text-black font-semibold">
                            Total Transactions:
                          </td>
                          <td className="px-6 py-4 green font-semibold">
                            {totalRecords}
                          </td>
                          <td className="px-6 py-4 text-black font-semibold">
                            Total Amount:
                          </td>
                          <td className="px-6 py-4 green font-semibold">
                            {formatFunds(totalAmount)} RWF
                          </td>
                          <td className="px-6 py-1 green font-semibold">
                            Total Commission:
                          </td>
                          <td className="px-6 py-1 green font-semibold">
                            {formatFunds(totalCommission)}
                            RWF
                          </td>
                          <td className="px-6 py-4 green font-semibold">
                            Total Remaining:
                          </td>
                          <td className="px-6 py-4 green font-semibold">
                            {formatFunds(totalRemaining)}
                            RWF
                          </td>
                        </tr>
                      </tbody>
                    </table>
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
              disabled={offset === 0 || transactionsListIsLoading}
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
                  disabled={offset === 0 || transactionsListIsLoading}
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
                  disabled={offset === 0 || transactionsListIsLoading}
                  className="px-4 cursor-pointer hover:scale-[1.02] p-2 shadow-md"
                >
                  <span className="px-4 cursor-pointer hover:scale-[1.02] sr-only">
                    Previous
                  </span>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </PageButton>
                <PageButton
                  onClick={() => gotoPage1(Number(offset) + 1)}
                  disabled={
                    offset >= totalPages - 1 || transactionsListIsLoading
                  }
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
                  disabled={
                    offset >= totalPages - 1 || transactionsListIsLoading
                  }
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

TransactionTable.propTypes = {
  user: PropTypes.shape({}),
}

export const DateRangeColumnFilter = ({
  column: { filterValue = [], preFilteredRows, setFilter, id },
}) => {
  const [min, max] = React.useMemo(() => {
    let min = filterValue[0] ? moment(filterValue[0]) : undefined
    let max = filterValue[1] ? moment(filterValue[1]) : undefined

    preFilteredRows.forEach((row) => {
      const rowDate = moment(row.values[id], 'DD-MM-YYYY')

      if (min && max) {
        if (rowDate.isBetween(min, max, null, '[]')) {
        }
      } else if (min) {
        if (rowDate.isSameOrAfter(min)) {
        }
      } else if (max) {
        if (rowDate.isSameOrBefore(max)) {
        }
      }
    })

    return [min, max]
  }, [id, preFilteredRows])

  return (
    <div>
      <span className="mr-2">From:</span>
      <input
        type="date"
        className="w-[130px] px-[5px] rounded-[5px] border border-[#165F75] "
        min={min !== undefined ? min.format('YYYY-MM-DD') : undefined}
        value={filterValue[0] || ''}
        onChange={(e) => {
          const val = e.target.value
          setFilter((old = []) => [val ? val : undefined, old[1]])
        }}
      />
      <span className="ml-4 mr-2">To:</span>
      <input
        type="date"
        className="w-[130px] px-[5px] rounded-[5px] border border-[#165F75] "
        max={max !== undefined ? max.format('YYYY-MM-DD') : undefined}
        value={filterValue[1] || ''}
        onChange={(e) => {
          const val = e.target.value
          setFilter((old = []) => [old[0], val ? val : undefined])
        }}
      />
    </div>
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

// function GlobalFilter({
//   preGlobalFilteredRows,
//   globalFilter,
//   setGlobalFilter,
// }) {
//   const count = preGlobalFilteredRows.length
//   const [value, setValue] = React.useState(globalFilter)
//   const onChange = useAsyncDebounce((value) => {
//     setGlobalFilter(value || undefined)
//   }, 200)

//   return (
//     <div className="flex items-center justify-center gap-4">
//       <Input
//         type="text"
//         className="p-2 outline-[2px] w-[20rem] border rounded-md border-primary outline-primary focus:outline-primary"
//         value={value || ''}
//         onChange={(e) => {
//           setValue(e.target.value)
//           onChange(e.target.value)
//         }}
//         placeholder={`${count} records...`}
//       />
//       <button
//         className="p-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:ring focus:ring-primary focus:ring-opacity-50"
//         onClick={() => {
//           setGlobalFilter(value || undefined)
//         }}
//       >
//         Search
//       </button>
//     </div>
//   )
// }

export default TransactionTable
