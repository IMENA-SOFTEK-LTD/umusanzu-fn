import { useEffect, useMemo, useState } from 'react'
import 'jspdf-autotable'
import logo from '../../assets/LOGO.png'
import cachet from "../../assets/cachet.png"
import signature from "../../assets/signature.png"
import jsPDF from 'jspdf'
import ExcelJS from "exceljs"
import {
  useLazyGetCellVillagesQuery,
  useLazyGetProvinceChildrenQuery,
  useLazyGetDistrictChildrenQuery,
  useLazyGetSectorChildrenQuery,
  useLazyGetCellChildrenQuery,
  useLazyGetCountryChildrenQuery
} from '../../states/api/apiSlice'
import PropTypes from 'prop-types'
import { FaEye } from 'react-icons/fa'
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
  faFilePdf
} from '@fortawesome/free-solid-svg-icons'
import Input from '../../components/Input'
import { Link } from 'react-router-dom'
import { DepartmentModals } from './DepartmentModals'

const DepartmentsTable = ({ user }) => {
  const [data, setData] = useState([])
  const [showExportPopup, setShowExportPopup] = useState(false);
  const [reportName, setReportName] = useState('');

  const openExportPopup = () => {
    setShowExportPopup(true);
  };

  const closeExportPopup = () => {
    setShowExportPopup(false);
  };
  const [
    getCellVillages,
    {
      data: cellVillagesData,
      isSuccess: cellVillagesIsSuccess,
      isLoading: cellVillagesIsLoading,
      isError: cellVillagesIsError,
      error: cellVillagesError
    }
  ] = useLazyGetCellVillagesQuery()


  const [getProvinceChildren, {
    data: provinceChildrenData,
    isLoading: provinceChildrenLoading,
    isSuccess: provinceChildrenIsSuccess,
    isError: provinceChildrenIsError,
  }] = useLazyGetProvinceChildrenQuery()

  const [getDistrictChildren, {
    data: districtChildrenData,
    isLoading: districtChildrenLoading,
    isSuccess: districtChildrenIsSuccess,
    isError: districtChildrenIsError,
  }] = useLazyGetDistrictChildrenQuery()

  const [getSectorChildren, {
    data: sectorChildrenData,
    isLoading: sectorChildrenLoading,
    isSuccess: sectorChildrenIsSuccess,
    isError: sectorChildrenIsError,
  }] = useLazyGetSectorChildrenQuery()

  const [getCellChildren, {
    data: cellChildrenData,
    isLoading: cellChildrenLoading,
    isSuccess: cellChildrenIsSuccess,
    isError: cellChildrenIsError,
  }] = useLazyGetCellChildrenQuery()

  const [getCountryChildren, {
    data: countryChildrenData,
    isLoading: countryChildrenLoading,
    isSuccess: countryChildrenIsSuccess,
    isError: countryChildrenIsError,
  }] = useLazyGetCountryChildrenQuery()

  const dispatch = useDispatch()

  const {
    page: offset,
    size,
    totalPages
  } = useSelector((state) => state.pagination)

  const { sectorId } = useSelector((state) => state.departments)

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

  switch (user?.departments?.level_id) {
    case 1:
      department = 'province'

      useEffect(() => {
        getProvinceChildren({
          departmentId: user?.departments?.id,
        })
      }, [])

      useEffect(() => {
        if (provinceChildrenIsSuccess) {
          setData(provinceChildrenData?.data?.map((row, index) => ({
            no: index + 1,
            village: row?.name,
            cell: row?.parent?.name,
            sector: row?.parent?.parent?.name,
            district: row?.parent?.parent?.parent?.name,
            merchantCode: row?.parent?.parent?.merchant_code,
            ID: row?.id,
            phone: row?.phone1,
          })) || [])
        }
      }, [provinceChildrenIsSuccess])

      break
    case 2:
      department = 'district'
      useEffect(() => {
        getDistrictChildren({
          departmentId: user?.departments?.id,
        })
      }, [])

      useEffect(() => {
        if (districtChildrenIsSuccess) {
          setData(districtChildrenData?.data?.map((row, index) => ({
            village: row?.name,
            cell: row?.parent?.name,
            sector: row?.parent?.parent?.name,
            district: row?.parent?.parent?.parent?.name,
            merchantCode: row?.parent?.parent?.merchant_code,
            phone: row?.phone1,
            ID: row?.id,
          })) || [])
        }
      }, [districtChildrenIsSuccess])
      break
    case 3:
      department = 'sector'
      useEffect(() => {
        getSectorChildren({
          departmentId: user?.departments?.id,
        })
      }, [])
      useEffect(() => {
        if (sectorChildrenIsSuccess) {
          setData(sectorChildrenData?.data?.map((row, index) => ({
            village: row?.name,
            cell: row?.parent?.name,
            sector: row?.parent?.parent?.name,
            district: row?.parent?.parent?.parent?.name,
            merchantCode: row?.parent?.parent?.merchant_code,
            phone: row?.phone1,
            ID: row?.id,
          })) || [])
        }
      }, [sectorChildrenIsSuccess])
      break
    case 4:
      department = 'cell'
      useEffect(() => {
        getCellChildren({
          departmentId: user?.departments?.id,
        })
      }, [])

      useEffect(() => {
        if (cellChildrenIsSuccess) {
          setData(cellChildrenData?.data?.map((row, index) => ({
            village: row?.name,
            cell: row?.parent?.name,
            sector: row?.parent?.parent?.name,
            district: row?.parent?.parent?.parent?.name,
            phone: row?.staff[0]?.phone1,
            ID: row?.id,
            merchantCode: row?.parent?.parent?.merchant_code,
            agent: row?.staff[0]?.names
          })) || [])
        }
      }, [cellChildrenIsSuccess])
      break
    case 5:
      department = 'country'
      useEffect(() => {
        getCountryChildren({
          departmentId: user?.departments?.id,
        })
      }, [])

      useEffect(() => {
        if (countryChildrenIsSuccess) {
          setData(countryChildrenData?.data?.map((row, index) => ({
            village: row?.name,
            cell: row?.parent?.name,
            sector: row?.parent?.parent?.name,
            province: row?.parent?.parent?.parent?.name,
            district: row?.parent?.parent?.parent?.parent?.name,
            merchantCode: row?.parent?.parent?.merchant_code,
            phone: row?.phone1,
            ID: row?.id,
          })) || [])
        }
      }, [countryChildrenIsSuccess])
      break
    case 6:
      department = 'agent'
      break
    default:
      department = 'cell'
  }

  const handleExportToPdf = async () => {
    /* eslint-ignore-next-line */
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
      const columnHeader = ['NO', 'VILLAGE', 'CELL', ' SECTOR', ' DISTRICT', ' MERCHANT CODE',' PHONE']
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
        const { id,ID, ...rest } = row.original;
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
    reader.readAsDataURL(logoData)
  }

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
    { header:'ID', key:"id"},
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
        header: "Email",
        key: "email",
        width: 15
      }
    ]

    const promise = Promise.all(
      data?.map(async (department, index) => {
        sheet.addRow({
          id: index + 1,
          name: department?.name,
          phone1: department?.phone1,
          phone2: department?.phone2,
          email: department?.email
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

  const columns = useMemo(() => [
    {
      id: 'village',
      Header: 'Village',
      accessor: 'village',
      sortable: true,
      Filter: SelectColumnFilter,
    },
    {
      id: 'cell',
      Header: 'Cell',
      accessor: 'cell',
      sortable: true,
      Filter: SelectColumnFilter,
    },
    {
      id: 'sector',
      Header: 'Sector',
      accessor: 'sector',
      sortable: true,
      Filter: SelectColumnFilter,
    },
    {
      id: 'district',
      Header: 'District',
      accessor: 'district',
      sortable: true,
      Filter: SelectColumnFilter,
    },
    {
      Header: 'Merchant Code',
      accessor: 'merchantCode',
      sortable: true,
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
        id: 'ID',
        Header: 'Staff',
        accessor: 'ID',
        Cell: ({ row }) => (
          <Link
            to={`/admins/${row?.original?.ID}`}
            className="flex items-center justify-center h-8 w-14 text-white bg-primary rounded-sm shadow-md"
          >
            <FaEye className="" />
          </Link>
        ),
        sortable: true
      },
      ...columns,
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

  if (
    provinceChildrenIsSuccess ||
    districtChildrenIsSuccess ||
    sectorChildrenIsSuccess || 
    cellChildrenIsSuccess || 
    countryChildrenIsSuccess
  ) {
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

  if (
    provinceChildrenIsError
  ) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center flex-col gap-6">
        <h1 className="text-[25px] font-medium text-center">
          Could not load department records
        </h1>
        <Button value="Go to dashboard" route="/dashboard" />
      </main>
    )
  }

  if (
    provinceChildrenLoading
  ) {
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

export default DepartmentsTable
