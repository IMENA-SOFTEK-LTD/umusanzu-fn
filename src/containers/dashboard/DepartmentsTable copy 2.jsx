import { useEffect, useMemo, useState } from 'react'
import 'jspdf-autotable'
import logo from '../../assets/LOGO.png'
import cachet from '../../assets/cachet.png'
import signature from '../../assets/signature.png'
import jsPDF from 'jspdf'
import ExcelJS from 'exceljs'
import { useLazyGetDepartmentListsQuery } from '../../states/api/apiSlice'
import PropTypes from 'prop-types'
import { FaEye } from 'react-icons/fa'
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
} from '@fortawesome/free-solid-svg-icons'
import Input from '../../components/Input'
import { Link } from 'react-router-dom'
import { DepartmentModals } from './DepartmentModals'
import moment from 'moment'
import queryString from 'query-string'
import {
  setSelectedCell,
  setSelectedDistrict,
  setSelectedProvince,
  setSelectedSector,
  setSelectedVillage,
} from '../../states/features/modals/householdSlice'
import HouseHoldFilter from './HouseHoldFilter'

const DepartmentsTable = ({ user }) => {
  const [isExporting, setIsExporting] = useState(false)
  const [reportName, setReportName] = useState(
    "UMUSANZU DIGITAL'S  REGISTERED HOUSEHOLDS"
  )
  const [showExportPopup, setShowExportPopup] = useState(false)
  const { sectorId, userOrSelectedDepartmentNames } = useSelector(
    (state) => state.departments
  )
  const openExportPopup = () => {
    setShowExportPopup(true)
  }
  const closeExportPopup = () => {
    setShowExportPopup(false)
  }
  const [
    getDepartmentLists,
    {
      data: departmentListData,
      isSuccess: departmentListIsSuccess,
      isLoading: departmentListIsLoading,
      isError: departmentListIsError,
      error: departmentListError,
    },
  ] = useLazyGetDepartmentListsQuery()

  const dispatch = useDispatch()
  let department = ''
  const queryRoute = queryString.parse(location.search)
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

  const [queries, setQueries] = useState({
    departmentId:
      +queryRoute?.cell ||
      +queryRoute?.sector ||
      +queryRoute?.district ||
      +queryRoute?.province ||
      user?.departments?.id,
    searchTerm: '',
    level_id:
      +queryRoute?.level ||
      (['country'].includes(department)
        ? 1
        : ''),
  })
  // console.log(queryRoute);
  const {
    page: offset,
    size,
    totalPages,
  } = useSelector((state) => state.pagination)

  const [data, setData] = useState(departmentListData?.data || [])
  useEffect(() => {

    setQueries({
      ...queries,
      level_id:
        +queryRoute?.level ||
        (['country'].includes(department)
          ? 1
          : ''),
      departmentId:
        queryRoute?.cell ||
        +queryRoute?.sector ||
        +queryRoute?.district ||
        +queryRoute?.province ||
        user?.departments?.id,
    })
  }, [
    queryRoute?.level,
    queryRoute?.province,
    queryRoute?.district,
    queryRoute?.sector,
    queryRoute?.cell,
  ])

  useEffect(() => {
    // console.log(queries);
    getDepartmentLists({
      ...queries,
      size,
      page: offset,
    })
  }, [size, offset, queries])
  useEffect(() => {
    if (departmentListIsSuccess) {
      dispatch(setTotalPages(departmentListData?.data?.totalPages))
      setData(
        departmentListData?.data?.rows?.map((row, index) => ({
          ID: row?.id,
          id: index + 1,
          name: row?.name,
          email: row?.email,
          phone1: row?.phone1,
          phone2: row?.phone2,

          village: row?.name,
          cell: row?.cell,
          sector: row?.sector,
          district: row?.district,
          province: row?.province,

          level_id: row?.level_id,
          level: row?.level,
          merchant_code: row?.merchant_code,
          department_id: row?.department_id,
        })) || []
      )
    }
  }, [departmentListData, departmentListIsSuccess])

  const handleExportToPdf = async () => {
    /* eslint-ignore-next-line */
    const doc = new jsPDF('landscape')
    const logoResponse = await fetch(logo)
    const logoData = await logoResponse.blob()
    const reader = new FileReader()

    reader.onload = async () => {
      const logoBase64 = reader.result.split(',')[1]
      doc.addImage(logoBase64, 'PNG', 130, 10, 30, 30)
      doc.setFont('Symbol', 'bold')
      doc.setFontSize(12)
      doc.text('IMENA SOFTEK LTD', 125, 50)

      if (userOrSelectedDepartmentNames?.village !== undefined) {
        doc.text(
          `UMUSANZU  DIGITAL'S  ${userOrSelectedDepartmentNames.village}  VILLAGE  REGISTERED  DEPARTMENTS`,
          65,
          65
        )
      } else if (
        userOrSelectedDepartmentNames?.cell !== undefined &&
        userOrSelectedDepartmentNames?.village === undefined
      ) {
        doc.text(
          `UMUSANZU  DIGITAL'S  ${userOrSelectedDepartmentNames.cell}  CELL  REGISTERED  DEPARTMENTS`,
          65,
          65
        )
      } else {
        doc.text(
          `UMUSANZU  DIGITAL'S  ${userOrSelectedDepartmentNames.sector}  SECTOR  REGISTERED  DEPARTMENTS`,
          65,
          65
        )
      }
      doc.line(61, 67, 210, 67)

      doc.setFontSize(10)
      const columnHeader = [
        'NO',
        'VILLAGE',
        'CELL',
        ' SECTOR',
        ' DISTRICT',
        ' MERCHANT CODE',
        ' PHONE',
      ]
      const headerRow = columnHeader.map((header) => ({
        content: header,
      }))
      doc.autoTable({
        startY: 75,
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
      const noValues = Array.from(
        { length: TableInstance.rows.length },
        (_, index) => index + 1
      )
      // Combine the "NO" values with your existing data, excluding the ID
      const exportData = TableInstance.rows.map((row, index) => {
        const { id, ID, ...rest } = row.original
        return {
          NO: noValues[index],
          ...rest,
        }
      })
      doc.autoTable({
        startY: doc.lastAutoTable.finalY,
        head: false,
        body: exportData,
        theme: 'grid',
        styles: {},
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 40 },
          2: { cellWidth: 30 },
          3: { cellWidth: 40 },
          4: { cellWidth: 50 },
          5: { cellWidth: 39 },
        },
      })
      // Add your custom content here
      const customContent = [
        ['BITEGUWE NA:', 'BYEMEJWE NA:'],
        ['', ''],
        ['TETA TAMARA', 'NDAGIJIMANA Gedeon'],
        ['DATA MANAGEMENT', 'CEO IMENA SOFTEK LTD'],
        ['IMENA SOFTEK LTD', ''],
      ]

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
      }

      if (doc.lastAutoTable.finalY + 90 > doc.internal.pageSize.height) {
        doc.addPage()
        doc.text(`Done on : ${moment().format('DD-MM-YYYY HH:mm:ss')}`, 16, 30)

        doc.autoTable({
          startY: 50,
          head: false,
          body: customContent,
          ...customContentStyles,
        })

        const cachetResponse = await fetch(cachet)
        const cachetData = await cachetResponse.blob()
        const cachetBase64 = await convertBlobToBase64(cachetData)

        doc.addImage(
          cachetBase64,
          'PNG',
          200,
          doc.lastAutoTable.finalY - 50,
          50,
          50
        )

        // Add the signature image here
        const signatureResponse = await fetch(signature)
        const signatureData = await signatureResponse.blob()
        const signatureBase64 = await convertBlobToBase64(signatureData)

        doc.addImage(
          signatureBase64,
          'PNG',
          20,
          doc.lastAutoTable.finalY - 50,
          50,
          50
        )
      } else {
        doc.text(
          `Done on : ${moment().format('DD-MM-YYYY HH:mm:ss')}`,
          16,
          doc.lastAutoTable.finalY + 20
        )

        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 40,
          head: false,
          body: customContent,
          ...customContentStyles,
        })
        const cachetResponse = await fetch(cachet)
        const cachetData = await cachetResponse.blob()
        const cachetBase64 = await convertBlobToBase64(cachetData)

        doc.addImage(
          cachetBase64,
          'PNG',
          200,
          doc.lastAutoTable.finalY - 50,
          50,
          50
        )

        // Add the signature image here
        const signatureResponse = await fetch(signature)
        const signatureData = await signatureResponse.blob()
        const signatureBase64 = await convertBlobToBase64(signatureData)

        doc.addImage(
          signatureBase64,
          'PNG',
          20,
          doc.lastAutoTable.finalY - 50,
          50,
          50
        )
      }

      doc.save(`${reportName}.pdf`)
    }
    reader.readAsDataURL(logoData)
  }

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
      { header: 'ID', key: 'id' },
      { header: 'Name', key: 'name', width: 20 },
      {
        header: 'Phone No',
        key: 'phone1',
        width: 20,
      },
      {
        header: 'Phone No 2',
        key: 'phone2',
        width: 10,
      },
      {
        header: 'Email',
        key: 'email',
        width: 15,
      },
    ]

    const promise = Promise.all(
      data?.map(async (department, index) => {
        sheet.addRow({
          id: index + 1,
          name: department?.name,
          phone1: department?.phone1,
          phone2: department?.phone2,
          email: department?.email,
          level_id: department?.level_id,
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
      // {
      //   id: 'level',
      //   Header: 'Level',
      //   accessor: 'level',
      //   sortable: true,
      //   Filter: SelectColumnFilter,
      // },
      {
        id: 'name',
        Header: 'Name',
        accessor: 'name',
        sortable: true,
        Filter: SelectColumnFilter,
      },

      {
        Header: 'Phone',
        accessor: 'phone1',
        sortable: true,
      },
      {
        Header: 'Phone2',
        accessor: 'phone2',
        sortable: true,
      },
      {
        Header: 'Email',
        accessor: 'email',
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
      {
        id: 'ID',
        Header: 'Action',
        accessor: 'ID',
        Cell: ({ row }) => (
          <>
            <div className="flex items-center justify-start">
              <Link
                to={`/admins/${row?.original?.ID}`}
                className="mx-2 px-2 py-1  w-25 text-white bg-primary rounded-sm shadow-md"
              >
                Admins
              </Link>
              {/* Manage District */}
              {row?.original?.level_id === 1 && (
                <Link
                  to={`/departments?level=2&province=${row?.original?.ID || user?.myAddress?.province?.id}`}
                  className="mx-2 px-2 py-1 w-30 text-white bg-primary rounded-sm shadow-md"
                  onClick={(e) => {
                    e.preventDefault(); // Prevent React Router from handling the navigation
                    window.location.href = e.currentTarget.href; // Force a full-page reload
                  }}
                >
                  Manage Districts
                </Link>
              )}
              {row?.original?.level_id === 2 && (
                <Link
                  to={`/departments?level=3&province=${queryRoute?.province || user?.myAddress?.province?.id}&district=${row?.original?.ID || user?.myAddress?.district?.id}`}
                  className="mx-2 px-2 py-1 w-30 text-white bg-primary rounded-sm shadow-md"
                  onClick={(e) => {
                    e.preventDefault(); // Prevent React Router from handling the navigation
                    window.location.href = e.currentTarget.href; // Force a full-page reload
                  }}
                >
                  Manage Sectors
                </Link>
              )}
              {row?.original?.level_id === 3 && (
                <Link
                  to={`/departments?level=4&province=${queryRoute?.province || user?.myAddress?.province?.id}&district=${queryRoute?.district || user?.myAddress?.district?.id}&sector=${row?.original?.ID || user?.myAddress?.sector?.id}`}
                  className="mx-2 px-2 py-1 w-30 text-white bg-primary rounded-sm shadow-md"
                  onClick={(e) => {
                    e.preventDefault(); // Prevent React Router from handling the navigation
                    window.location.href = e.currentTarget.href; // Force a full-page reload
                  }}
                >
                  Manage Cells
                </Link>
              )}
              {row?.original?.level_id === 4 && (
                <Link
                  to={`/departments?level=6&province=${queryRoute?.province || user?.myAddress?.province?.id}&district=${queryRoute?.district || user?.myAddress?.district?.id}&sector=${queryRoute?.sector || user?.myAddress?.sector?.id}&cell=${row?.original?.ID || user?.myAddress?.cell?.id}`}
                  className="mx-2 px-2 py-1 w-30 text-white bg-primary rounded-sm shadow-md"
                  onClick={(e) => {
                    e.preventDefault(); // Prevent React Router from handling the navigation
                    window.location.href = e.currentTarget.href; // Force a full-page reload
                  }}
                >
                  Manage Villages
                </Link>
              )}

              {row?.original?.level_id === 6 && (
                <Link
                  to={`/agents`}
                  className="mx-2 px-2 py-1 w-30 text-white bg-primary rounded-sm shadow-md"
                  onClick={(e) => {
                    e.preventDefault(); // Prevent React Router from handling the navigation
                    window.location.href = e.currentTarget.href; // Force a full-page reload
                  }}
                >
                  Manage Agents
                </Link>
              )}
            </div>
          </>
        ),
        sortable: true,
      },
      ...columns,
    ])
  }

  const TableInstance = useTable(
    {
      columns,
      data,
      queryRoute,
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
    document.title = 'Departments | Umusanzu Digital'
  }, [])
  const gotoPage1 = (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return
    dispatch(setPage(Number(newPage)))
    // Optionally trigger your API fetch here if it's not automatically triggered by page change
  }

  const order = ['province', 'district', 'sector', 'cell']
  if (departmentListIsSuccess) {
    return (
      <main className={`my-12`}>
        {departmentListIsLoading && <Loading />}
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
                  onClick={() => handleExportToExcel(queries)}
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

        <div className="flex my-8 flex-col w-full items-center gap-6 relative">
          <div className="search-filter flex flex-col w-full items-center gap-6">
            <span className="flex flex-wrap items-center justify-between gap-4 w-full px-8 max-md:flex-col max-md:items-center">
              <div className="flex gap-2 max-md:pl-0">
                <dl className="mt-1 max-w-xl space-y-8 text-base/7 text-gray-600 lg:max-w-none">
                  <div className="relative pl-0">
                    <dt className="inline font-semibold text-gray-900">
                      {!!Object.entries(userOrSelectedDepartmentNames)
                        .length ? (
                        <nav className="flex" aria-label="Breadcrumb">
                          <ol className="inline-flex items-center space-x-1 md:space-x-2">
                            {order
                              .filter(
                                (key) => userOrSelectedDepartmentNames[key]
                              ) // Ensure key exists
                              .map((key) => (
                                <li key={key}>
                                  <a
                                    href="#"
                                    className="inline-flex items-center text-gray-500 hover:text-gray-700"
                                  >
                                    {userOrSelectedDepartmentNames[key]}
                                    <svg
                                      className="w-5 h-5 text-gray-400 mx-1"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                        clipRule="evenodd"
                                      ></path>
                                    </svg>
                                  </a>
                                </li>
                              ))}
                            {queryRoute?.level && (
                              <li>
                                <div className="flex items-center">
                                  <span className="ml-1 text-gray-700 md:ml-2">
                                    {+queryRoute?.level === 2 ? (
                                      <>Districts</>
                                    ) : +queryRoute?.level === 3 ? (
                                      <>Sectors</>
                                    ) : +queryRoute?.level === 4 ? (
                                      <>Cells</>
                                    ) : +queryRoute?.level === 6 ? (
                                      <>Villages</>
                                    ) : (
                                      <></>
                                    )}
                                    ({departmentListData?.data?.count || 0})
                                  </span>
                                </div>
                              </li>
                            )}
                          </ol>
                        </nav>
                      ) : (
                        <>Departments({departmentListData?.data?.count || 0})</>
                      )}
                      
                    </dt>
                  </div>
                </dl>
              </div>

              <span className="w-full flex flex-col items-end justify-end mt-4">
                <HouseHoldFilter
                  user={user}
                  fieldEnabled={{
                    level: ['country'].includes(department),
                    province: ['country'].includes(department),
                    district: ['country', 'province'].includes(department),
                    sector: ['country', 'province', 'district'].includes(
                      department
                    ),
                    cell: [
                      'country',
                      'province',
                      'district',
                      'sector',
                    ].includes(department),
                    village: false,
                    status: false,
                    searchTerm: true,
                  }}
                  isLoading={departmentListIsLoading}
                  onChange={(query) => {
                    const queries2 = {
                      departmentId:
                        query.village ||
                        query.cell ||
                        query.sector ||
                        query.district ||
                        query.province ||
                        user?.departments?.id,
                      searchTerm: query.searchTerm,
                      level_id: query.level,
                    }
                    setQueries({ ...queries2 })
                  }}
                  onSearch={(query) => {
                    gotoPage1(0)
                    const queries2 = {
                      departmentId:
                        query.village ||
                        query.cell ||
                        query.sector ||
                        query.district ||
                        query.province ||
                        user?.departments?.id,
                      searchTerm: query.searchTerm,
                      level_id: query.level,
                    }
                    setQueries({ ...queries2 })
                    getDepartmentLists({
                      ...queries2,
                      size,
                      page: offset,
                    })
                  }}
                  exportButton={
                    <>
                      <Button
                        // className="mt-6"
                        value={
                          <span className="flex items-center">
                            Export Report
                            <FontAwesomeIcon icon={faFile} />
                          </span>
                        }
                        route={'#'}
                        onClick={openExportPopup}
                      />
                    </>
                  }
                />
              </span>
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
                onClick={() => gotoPage1(Number(offset) - 1)}
                disabled={offset === 0 || departmentListIsLoading}
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
                    disabled={offset === 0 || departmentListIsLoading}
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
                    disabled={offset === 0 || departmentListIsLoading}
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
                      offset >= totalPages || departmentListIsLoading
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
                      offset >= totalPages - 1 || departmentListIsLoading
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

  if (departmentListError) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center flex-col gap-6">
        <h1 className="text-[25px] font-medium text-center">
          Could not load department records
        </h1>
        <Button value="Go to dashboard" route="/dashboard" />
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

export default DepartmentsTable
