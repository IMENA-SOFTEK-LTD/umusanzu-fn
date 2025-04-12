import { useEffect, useState } from 'react'
import 'jspdf-autotable'
import logo from '../../assets/LOGO.png'
import cachet from '../../assets/cachet.png'
import signature from '../../assets/signature.png'
import jsPDF from 'jspdf'
import ExcelJS from 'exceljs'
import { useLazyGetDepartmentListsQuery } from '../../states/api/apiSlice'
import PropTypes from 'prop-types'
import Button, { PageButton } from '../../components/Button'
import { DepartmentModals } from '../../containers/dashboard/DepartmentModals'
import Loading from '../../components/Loading'
import {
  faAdd,
  faClose,
  faFileExcel,
  faFilePdf,
} from '@fortawesome/free-solid-svg-icons'
import {
  setPage,
  setSize,
  setTotalPages,
} from '../../states/features/pagination/paginationSlice'
import { useDispatch, useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faAnglesLeft,
  faAnglesRight,
  faChevronLeft,
  faChevronRight,
  faFile,
} from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
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
import CustomDialog from '../../components/models/CustomDialog'
import Admins from './Admins'
import CreateDepartmentModel from '../../components/models/CreateDepartmentModel'

const DepartmentsTable = ({ user }) => {
  const [isExporting, setIsExporting] = useState(false)
  const [openAdmins, setOpenAdmins] = useState(false)
  const [showDepartmentModal, setShowDepartmentModal] = useState(false)
  const [selectDepartment, setSelectDepartment] = useState(null)
  const [selectedLevelId, setSelectedLevelId] = useState('')
  const [selectedDepartmentName, setSelectedDepartmentName] = useState('')
  const { user: stateUser } = useSelector((state) => state.auth)
  //  console.log(stateUser);
  const [reportName, setReportName] = useState(
    `UMUSANZU DIGITAL'S  REGISTERED DEPARTMENTS IN ${user?.departments?.name?.toUpperCase()} ${user?.department?.toUpperCase()}`
  )
  const [showExportPopup, setShowExportPopup] = useState(false)
  const { userOrSelectedDepartmentNames } = useSelector(
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
    level_id: +queryRoute?.level || (['country'].includes(department) ? 1 : ''),
  })
  // console.log(queryRoute);
  const {
    page: offset,
    size,
    totalPages,
  } = useSelector((state) => state.pagination)

  const [data, setData] = useState(departmentListData?.data?.rows || [])
  useEffect(() => {
    setQueries({
      ...queries,
      level_id:
        +queryRoute?.level || (['country'].includes(department) ? 1 : ''),
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

  useEffect(() => {
    document.title = 'Departments | Umusanzu Digital'
  }, [])
  const gotoPage1 = (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return
    dispatch(setPage(Number(newPage)))
    // Optionally trigger your API fetch here if it's not automatically triggered by page change
  }

  const order = ['province', 'district', 'sector', 'cell']

  return (
    <main className={`my-12`}>
      <CustomDialog
        size="xl"
        title={
          <>
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-2">
                <li>
                  <a href="#" className="inline-flex items-center ">
                    {selectDepartment && selectDepartment?.name}
                    <svg
                      className="w-5 h-5 text-gray-400 mx-3 mt-1"
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

                <li>
                  <div className="flex">
                    <span>{selectDepartment?.level_id === 6 ? 'Agents' : 'Admins'}</span>
                  </div>
                </li>
              </ol>
            </nav>
          </>
        }
        open={openAdmins}
        onClose={() => {
          setOpenAdmins(false)
          setSelectDepartment(null)
        }}
        children={
          <>
            {selectDepartment && (
              <Admins
                type={selectDepartment?.level_id === 6 ? 'Agent' : 'Admin'}
                selectDepartment={{ id: selectDepartment?.ID }}
                user={user}
              />
            )}
          </>
        }
      />
      {showDepartmentModal && (
        <CreateDepartmentModel
          title={
            'Add ' +
            selectDepartment?.name?.charAt(0).toUpperCase() +
            selectDepartment?.name?.slice(1).toLowerCase() +
            ''
          }
          showModal={showDepartmentModal}
          setShowModal={setShowDepartmentModal}
          department={selectedDepartmentName}
          departmentId={selectDepartment?.ID}
          levelId={selectedLevelId}
        />
      )}

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

      <div className="flex items-center  justify-between mx-4">
        <dt className=" font-semibold text-gray-900 ">
          {!!Object.entries(userOrSelectedDepartmentNames).length ? (
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-2">
                {order
                  .filter((key) => userOrSelectedDepartmentNames[key]) // Ensure key exists
                  .map((key) => (
                    <li key={key}>
                      <a
                        href="#"
                        className="inline-flex items-center text-gray-500 hover:text-gray-700 text-truncate"
                      >
                        {userOrSelectedDepartmentNames[key]
                          ?.charAt(0)
                          .toUpperCase() +
                          userOrSelectedDepartmentNames[key]
                            ?.slice(1)
                            .toLowerCase()}
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

        <div className="mr-2">
          <div className="flex items-center  justify-between">
            <Button
              className="mr-2 py-2 px-2 bg-primary text-white rounded-[50%]"
              value={
                <>
                  <FontAwesomeIcon icon={faFile} />
                  <span className="px-1">Export Report</span>
                </>
              }
              route={'#'}
              onClick={openExportPopup}
            />
            <DepartmentModals />
          </div>
        </div>
      </div>
      <div className="flex items-center  justify-between mx-4">
        <div className="mt-0 flex flex-col w-[100%] mx-auto">
          <div className="mx-4 sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg flex flex-col gap-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <caption className="caption-top p-2">
                    <HouseHoldFilter
                      user={user}
                      fieldEnabled={{
                        level: false, //['country'].includes(department),
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
                      placeholder={'Search for department....'}
                      exportButton={
                        <>
                          <Button
                            value={
                              <span className="flex items-center">
                                Export Report
                                <FontAwesomeIcon icon={faFile} />
                              </span>
                            }
                            onClick={openExportPopup}
                          />
                        </>
                      }
                    />
                  </caption>
                  <thead className="bg-gray-50">
                    <tr role="row">
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Action
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Phone
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Phone2
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Email
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className="bg-white divide-y divide-gray-200"
                    role="rowgroup"
                  >
                    {data.map((row, index) => (
                      <tr key={index} role="row">
                        <td
                          role="cell"
                          className="px-6 py-4 whitespace-nowrap flex items-center "
                        >
                          <button
                            className=" flex items-center  rounded-md w-[100px] bg-slate-800 p-1.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                            type="button"
                            onClick={() => {
                              setOpenAdmins(true)
                              setSelectDepartment(row)
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                fill-rule="evenodd"
                                d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
                                clip-rule="evenodd"
                              />
                            </svg>
                            <span className="pl-2">
                              {row?.level_id === 6 ? 'Agents' : 'Admins'}{' '}
                            </span>
                          </button>

                          {/* Manage District */}
                          {row?.level_id === 1 && (
                            <>
                              {stateUser?.staff_role === 1 && (
                                <Button
                                  type="button"
                                  size="sm"
                                  color="blue"
                                  material
                                  className="mx-2 p-1.5 rounded-md"
                                  value={
                                    <>
                                      <FontAwesomeIcon icon={faAdd} />
                                      <span className="px-1">
                                        {' '}
                                        Add District
                                      </span>
                                    </>
                                  }
                                  onClick={() => {
                                    setSelectDepartment(row)
                                    setSelectedDepartmentName('District')
                                    setSelectedLevelId(2)
                                    setShowDepartmentModal(true)
                                  }}
                                  submit
                                />
                              )}

                              <Link
                                to={`/departments?level=2&province=${
                                  row?.ID || user?.myAddress?.province?.id
                                }`}
                                className="flex items-center  mx-2 px-2 py-1 text-white rounded-md  bg-primary p-1.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                onClick={(e) => {
                                  e.preventDefault() // Prevent React Router from handling the navigation
                                  window.location.href = e.currentTarget.href // Force a full-page reload
                                }}
                              >
                                All Districts
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                  stroke="currentColor"
                                  class="w-4 h-4 ml-1.5"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                                  />
                                </svg>
                              </Link>
                            </>
                          )}
                          {row?.level_id === 2 && (
                            <>
                              {stateUser?.staff_role === 1 && (
                                <Button
                                  type="button"
                                  size="sm"
                                  color="blue"
                                  material
                                  className="mx-2 p-1.5 rounded-md"
                                  value={
                                    <>
                                      <FontAwesomeIcon icon={faAdd} />
                                      <span className="px-1"> Add Sector</span>
                                    </>
                                  }
                                  onClick={() => {
                                    setSelectDepartment(row)
                                    setSelectedDepartmentName('Sector')
                                    setSelectedLevelId(3)
                                    setShowDepartmentModal(true)
                                  }}
                                  submit
                                />
                              )}

                              <Link
                                to={`/departments?level=3&province=${
                                  queryRoute?.province ||
                                  user?.myAddress?.province?.id
                                }&district=${
                                  row?.ID || user?.myAddress?.district?.id
                                }`}
                                className="flex items-center  mx-2 px-2 py-1 text-white rounded-md  bg-primary p-1.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                onClick={(e) => {
                                  e.preventDefault() // Prevent React Router from handling the navigation
                                  window.location.href = e.currentTarget.href // Force a full-page reload
                                }}
                              >
                                All Sectors
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                  stroke="currentColor"
                                  class="w-4 h-4 ml-1.5"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                                  />
                                </svg>
                              </Link>
                            </>
                          )}
                          {row?.level_id === 3 && (
                            <>
                              {stateUser?.staff_role === 1 && (
                                <Button
                                  type="button"
                                  size="sm"
                                  color="blue"
                                  material
                                  className="mx-2 p-1.5 rounded-md"
                                  value={
                                    <>
                                      <FontAwesomeIcon icon={faAdd} />
                                      <span className="px-1"> Add Cell</span>
                                    </>
                                  }
                                  onClick={() => {
                                    setSelectDepartment(row)
                                    setSelectedDepartmentName('Cell')
                                    setSelectedLevelId(4)
                                    setShowDepartmentModal(true)
                                  }}
                                  submit
                                />
                              )}
                              <Link
                                to={`/departments?level=4&province=${
                                  queryRoute?.province ||
                                  user?.myAddress?.province?.id
                                }&district=${
                                  queryRoute?.district ||
                                  user?.myAddress?.district?.id
                                }&sector=${
                                  row?.ID || user?.myAddress?.sector?.id
                                }`}
                                className="flex items-center  mx-2 px-2 py-1 text-white rounded-md  bg-primary p-1.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                onClick={(e) => {
                                  e.preventDefault() // Prevent React Router from handling the navigation
                                  window.location.href = e.currentTarget.href // Force a full-page reload
                                }}
                              >
                                All Cells
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                  stroke="currentColor"
                                  class="w-4 h-4 ml-1.5"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                                  />
                                </svg>
                              </Link>
                            </>
                          )}
                          {row?.level_id === 4 && (
                            <>
                              {stateUser?.staff_role === 1 && (
                                <Button
                                  type="button"
                                  size="sm"
                                  color="blue"
                                  material
                                  className="mx-2 p-1.5 rounded-md"
                                  value={
                                    <>
                                      <FontAwesomeIcon icon={faAdd} />
                                      <span className="px-1"> Add Village</span>
                                    </>
                                  }
                                  onClick={() => {
                                    setSelectDepartment(row)
                                    setSelectedDepartmentName('Village')
                                    setSelectedLevelId(6)
                                    setShowDepartmentModal(true)
                                  }}
                                  submit
                                />
                              )}
                              <Link
                                to={`/departments?level=6&province=${
                                  queryRoute?.province ||
                                  user?.myAddress?.province?.id
                                }&district=${
                                  queryRoute?.district ||
                                  user?.myAddress?.district?.id
                                }&sector=${
                                  queryRoute?.sector ||
                                  user?.myAddress?.sector?.id
                                }&cell=${row?.ID || user?.myAddress?.cell?.id}`}
                                className="flex items-center  mx-2 px-2 py-1 text-white rounded-md  bg-primary p-1.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                onClick={(e) => {
                                  e.preventDefault() // Prevent React Router from handling the navigation
                                  window.location.href = e.currentTarget.href // Force a full-page reload
                                }}
                              >
                                All Villages
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                  stroke="currentColor"
                                  class="w-4 h-4 ml-1.5"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                                  />
                                </svg>
                              </Link>
                            </>
                          )}
                        </td>
                        <td role="cell" className="px-6 py-4 whitespace-nowrap">
                          {row.name}
                        </td>
                        <td role="cell" className="px-6 py-4 whitespace-nowrap">
                          {row.phone1}
                        </td>
                        <td role="cell" className="px-6 py-4 whitespace-nowrap">
                          {row.phone2}
                        </td>
                        <td role="cell" className="px-6 py-4 whitespace-nowrap">
                          {row.email}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {departmentListIsLoading && (
                  <main className="w-full min-h-[10vh] flex items-center justify-center">
                    <Loading />
                  </main>
                )}

                {departmentListError && (
                  <main className="min-h-[40vh] flex items-center justify-center flex-col gap-6">
                    <h1 className="text-[25px] font-medium text-center">
                      Could not load department records
                    </h1>
                    {/* <Button value="Go to dashboard" route="/dashboard" /> */}
                  </main>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {departmentListIsSuccess && (
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
                    value={size}
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
                    disabled={offset >= totalPages || departmentListIsLoading}
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
      )}
    </main>
  )
}

DepartmentsTable.propTypes = {
  user: PropTypes.shape({}),
}

export default DepartmentsTable
