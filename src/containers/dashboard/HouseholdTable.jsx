import 'core-js/stable'
import 'jspdf-autotable'
import logo from '../../assets/LOGO.png'
import jsPDF from 'jspdf'
import cachet from "../../assets/cachet.png"
import signature from "../../assets/signature.png"
import * as XLSX from 'xlsx';
import 'regenerator-runtime/runtime'
import { useState, useEffect, useMemo } from 'react'
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
  setSize,
  setTotalPages,
} from '../../states/features/pagination/paginationSlice'
import { useCancelMoveHouseholdMutation, useLazyGetHouseholdsListQuery, useMoveHouseholdMutation } from '../../states/api/apiSlice'
import Loading from '../../components/Loading'
import Button, { PageButton } from '../../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector, useDispatch } from 'react-redux'
import Input from '../../components/Input'

const HouseholdTable = ({ user }) => {

  const [showExportPopup, setShowExportPopup] = useState(false);
  const [reportName, setReportName] = useState('');

  const openExportPopup = () => {
    setShowExportPopup(true);
  };

  const closeExportPopup = () => {
    setShowExportPopup(false);
  };
  const [
    getHouseholdsList,
    {
      data: householdsListData,
      isLoading: householdsListIsLoading,
      isSuccess: householdsListIsSuccess,
      isError: householdsListIsError,
      error: householdsListError,
    },
  ] = useLazyGetHouseholdsListQuery()

  const [moveHousehold, {
    data: moveHouseholdData,
    isLoading: moveHouseholdIsLoading,
    isSuccess: moveHouseholdIsSuccess,
    isError: moveHouseholdIsError,
  }] = useMoveHouseholdMutation();

  const [cancelMoveHousehold, {
    data: cancelMoveHouseholdData,
    isLoading: cancelMoveHouseholdIsLoading,
    isSuccess: cancelMoveHouseholdIsSuccess,
    isError: cancelMoveHouseholdIsError,
  }] = useCancelMoveHouseholdMutation();

  const {
    page: offset,
    size,
    totalPages,
  } = useSelector((state) => state.pagination)

  const dispatch = useDispatch()

  const { sectorId } = useSelector((state) => state.departments)

  const queryRoute = queryString.parse(location.search)

  let department = ''

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

  const [data, setData] = useState(householdsListData?.data || [])

  useEffect(() => {
    getHouseholdsList({
      department,
      departmentId: sectorId || user?.departments?.id,
      id: sectorId || user?.departments?.id,
      size,
      route: queryRoute?.query || '',
      page: offset,
      ubudehe: queryRoute?.ubudehe,
    })
  }, [])

  useEffect(() => {
    if (householdsListIsSuccess) {
      dispatch(setTotalPages(householdsListData?.data?.totalPages))
      setData(
        householdsListData?.data?.rows?.map((row, index) => ({
          ID: row?.id,
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
        })) || []
      )
    }
  }, [householdsListData, householdsListIsSuccess])

  useEffect(() => {
    if (householdsListIsSuccess) {
      setTimeout(() => {
        getHouseholdsList({
          department,
          departmentId: sectorId || user?.departments?.id,
          id: sectorId || user?.departments?.id,
          size: 1000000,
          page: offset,
          ubudehe: queryRoute?.ubudehe,
          route: queryRoute?.query || '',
        })
          .unwrap()
          .then((data) => {
            dispatch(setTotalPages(data?.data?.totalPages))
            setData(
              data?.data?.rows?.map((row, index) => ({
                ID: row?.id,
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
              })) || []
            )
          })
      }, 2000);
    }
  }, [householdsListData])

  const handleExportToPdf = async () => {
    const doc = new jsPDF('landscape')
    const logoResponse = await fetch(logo)
    const logoData = await logoResponse.blob()
    const reader = new FileReader()

    reader.onload = async () => {
      const logoBase64 = reader.result.split(',')[1]
      doc.setFontSize(16)
      doc.setFillColor(255, 166, 1)
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F')
      doc.addImage(logoBase64, 'PNG', 10, 5, 30, 30)
      doc.setTextColor(0)
      doc.text(`${reportName}`, 50, 25)

      doc.setFontSize(10)

      // eslint-disable-next-line no-sparse-arrays
      const columnHeader = [
        { content: 'NO', cellWidth: 10 },
        { content: 'NAME', cellWidth: 40 },
        { content: 'PHONE 1', cellWidth: 25 },
        { content: 'PHONE 2', cellWidth: 29 },
        { content: 'UBUDEHE', cellWidth: 18 },
        { content: 'STATUS', cellWidth: 20 },
        { content: 'VILLAGE', cellWidth: 27 },
        { content: 'CELL', cellWidth: 27 },
        { content: 'SECTOR', cellWidth: 27 },
        { content: 'DISTRICT', cellWidth: 25 },
        { content: 'PROVINCE', cellWidth: 25 },
      ]
      const headerRow = columnHeader.map(header => ({ content: header.content, styles: { halign: 'left', cellWidth: header.cellWidth },
    }))
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
         })
      // Create a separate array for "NO" values starting from 1
      const noValues = Array.from({ length: TableInstance.rows.length }, (_, index) => index + 1);
    
      // Combine the "NO" values with your existing data, excluding the ID
      const exportData = TableInstance.rows.map((row, index) => {
        const { id,ID, ...rest } = row.original;
        return {
          NO: noValues[index],
          ...rest,
        };
      });
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 5,
        head: false,
        body: exportData.map((row) => Object.values(row)),
        theme: 'grid',
        styles: {
          fontSize: 9,
        },
        /** column cellWidths generated from header cellWidths for proper horizontal alignment with header */
        columnStyles: columnHeader.reduce((acc, value, index) => { 
          acc[index] = { cellWidth: value.cellWidth };
          return acc;
        }, {}),
      })


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
        startY: doc.lastAutoTable.finalY + 30,
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
      doc.text(` Done on: ${dateNow}`, 15, doc.lastAutoTable.finalY - 50);

      doc.save(`${reportName}.pdf`);
    };

    reader.readAsDataURL(logoData)
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
    if (TableInstance) {
      const filteredAndSortedData = TableInstance.rows.map(
        (row) => row.original
      )

      const ws = XLSX.utils.json_to_sheet(filteredAndSortedData)

      const headerStyle = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '000000' } },
      }
      const range = XLSX.utils.decode_range(ws['!ref'])

      for (let i = range.s.c; i <= range.e.c; i++) {
        const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: i })
        ws[cellAddress].s = headerStyle
      }
      const columnStyles = [
        {
          column: 'A',
          style: {
            fontSize: 8,
          },
        },
        { column: 'B', style: { fontSize: 8 } },
        { column: 'C', style: { fontSize: 8 } },
        { column: 'D', style: { fontSize: 8 } },
        { column: 'E', style: { fontSize: 8 } },
        { column: 'F', style: { fontSize: 8 } },
      ]

      columnStyles.forEach((colStyle) => {
        for (let i = range.s.r + 1; i <= range.e.r; i++) {
          const cellAddress = XLSX.utils.encode_cell({
            r: i,
            c: XLSX.utils.decode_col(colStyle.column),
          })
          ws[cellAddress].s = colStyle.style
        }
      })
      ws['!autofilter'] = { ref: ws['!ref'] }
      ws['!cols'] = [
        { width: 5 },
        { width: 25 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
      ]
      ws['!rows'] = []

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'REPORTS ')
      const wbBinary = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' })

      XLSX.utils.book_append_sheet(
        wb,
        ws,
        `${reportName}`
      );

      const buf = new ArrayBuffer(wbBinary.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < wbBinary.length; i++) {
        view[i] = wbBinary.charCodeAt(i) & 0xff
      }

      const blob = new Blob([buf], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      const blobUrl = URL.createObjectURL(blob)

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${reportName}.xlsx`;
      link.click();
    }
  };

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
            <span className='flex items-center gap-[3px]'>
            <Button
              value="Approve"
              className={
                row?.original?.status === 'REQUESTED'
                  ? '!bg-green-600'
                  : '!hidden'
              }
              onClick={(e) => {
                e.preventDefault()
                moveHousehold({
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
                  existingHouseholdId: row?.original?.ID
                })
              }}
            />
            <Button
              value={`${row?.original?.status === 'REQUESTED' ? 'Deny' : 'Return'}`}
              className={
                row?.original?.status === 'REQUESTED'
                  ? '!bg-red-600'
                  : row?.original?.status === 'MOVED' ? '!bg-green-600' : '!hidden'
              }
              onClick={(e) => {
                e.preventDefault()
                cancelMoveHousehold({
                  id: row?.original?.ID
                })
              }}
            />
            </span>
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
    document.title = 'Households | Umusanzu Digital'
  }, [])

  if (householdsListIsSuccess) {
    return (
      <main className={`my-12`}>
        <div className="flex my-8 flex-col w-full items-center gap-6 relative">
          <div className="search-filter flex flex-col w-full items-center gap-6">
            <span className="flex flex-wrap items-center justify-between gap-4 w-full px-8 max-md:flex-col max-md:items-center">
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
                  <div className="flex gap-2 max-md:pl-2">
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
                  {/* Export Popup/Modal */}
                  {showExportPopup && (
                    <div className="fixed inset-0 flex items-center justify-center z-10 bg-gray-800 bg-opacity-60">
                      <div className="bg-white p-4 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold mb-4">
                          Export Report
                        </h2>
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
                            className={
                              user?.departments?.level_id === 5
                                ? 'flex'
                                : 'hidden'
                            }
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

                  {moveHouseholdIsLoading || cancelMoveHouseholdIsLoading ? (
                    <span className="flex flex-col items-center justify-center min-h-[30vh]">
                      <Loading />
                      <h4 className="uppercase text-primary text-md font-bold text-center">
                        {moveHouseholdIsLoading ? 'Moving Household...' : 'Cancelling request...'}
                      </h4>
                    </span>
                  ) : moveHouseholdIsSuccess || cancelMoveHouseholdIsSuccess ? (
                    <span className="flex flex-col items-center justify-center gap-4 min-h-[30vh]">
                      <h4 className="uppercase text-primary text-md font-bold text-center">
                        {moveHouseholdIsSuccess ? 'Household moved successfully' : 'Request cancelled successfully'}
                      </h4>
                      <Button
                        value={`${moveHouseholdIsSuccess ? 'View household' : 'Go to dashboard'}`}
                        route={moveHouseholdIsSuccess ? `/households/${moveHouseholdData?.data?.id}` : '/dashboard'}
                      />
                    </span>
                  ) : (
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

export default HouseholdTable
