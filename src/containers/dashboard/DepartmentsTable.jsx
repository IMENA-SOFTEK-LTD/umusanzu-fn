import { useEffect, useState } from 'react'
import 'jspdf-autotable'
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
import queryString from 'query-string'
import {
  setSelectedCell,
  setSelectedDistrict,
  setSelectedProvince,
  setSelectedSector,
  setSelectedVillage,
} from '../../states/features/modals/householdSlice'
import GlobalFilter from './GlobalFilter'
import CustomDialog from '../../components/models/CustomDialog'
import Admins from './Admins'
import CreateDepartmentModel from '../../components/models/CreateDepartmentModel'
import EditDepartmentModal from '../../components/models/EditDepartmentModal'
import { toast } from 'react-toastify'
import download from 'downloadjs'
import API_URL from '../../constants'
import axios from 'axios'
import OverlayLoading from '../../components/OverlayLoading'

const DepartmentsTable = ({ user }) => {
  const [isExporting, setIsExporting] = useState(false)
  const [openAdmins, setOpenAdmins] = useState(false)
  const [showDepartmentModal, setShowDepartmentModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [expandedRows, setExpandedRows] = useState({})
  const [departmentListLoading, setShowDepartmentListLoading] = useState(false)
  const [departmentListError, setDepartmentListError] = useState(false)
  const [totalRecords, setTotalRecords] = useState(0)
  const [selectDepartment, setSelectDepartment] = useState(null)
  const [selectedLevelId, setSelectedLevelId] = useState('')
  const [selectedDepartmentName, setSelectedDepartmentName] = useState('')
  const { user: stateUser } = useSelector((state) => state.auth)

  // Toggle row expansion
  const toggleRowExpansion = (index) => {
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const [reportName, setReportName] = useState(
    `UMUSANZU DIGITAL'S REGISTERED DEPARTMENTS IN ${user?.departments?.name?.toUpperCase()} ${user?.department?.toUpperCase()}`
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
  const [getDepartmentLists] = useLazyGetDepartmentListsQuery()

  const dispatch = useDispatch()
  let department = ''
  const queryRoute = queryString.parse(location.search)
  
  // Determine department type based on level_id
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

  // Dispatch Redux actions based on department level - moved to useEffect to prevent render loops
  useEffect(() => {
    if (!user?.departments?.level_id || !user?.departments?.id) return

    switch (user.departments.level_id) {
      case 1:
        dispatch(setSelectedProvince(user.departments.id))
        break
      case 2:
        dispatch(setSelectedDistrict(user.departments.id))
        break
      case 3:
        dispatch(setSelectedSector(user.departments.id))
        break
      case 4:
        dispatch(setSelectedCell(user.departments.id))
        break
      case 6:
        dispatch(setSelectedVillage(user.departments.id))
        break
    }
  }, [user?.departments?.level_id, user?.departments?.id, dispatch])
  const [reportQueries, setReportQueries] = useState(null)
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

  const [data, setData] = useState([])
  
  useEffect(() => {
    const newQueries = {
      ...queries,
      level_id:
        +queryRoute?.level || (['country'].includes(department) ? 1 : ''),
      departmentId:
        queryRoute?.cell ||
        +queryRoute?.sector ||
        +queryRoute?.district ||
        +queryRoute?.province ||
        user?.departments?.id,
    }
    
    setQueries(newQueries)
    
    onLoadDepartmentLists({
      ...newQueries,
      size,
      page: offset,
    })
  }, [
    queryRoute?.level,
    queryRoute?.province,
    queryRoute?.district,
    queryRoute?.sector,
    queryRoute?.cell,
    user?.departments?.id,
    size,
    offset
  ])

  useEffect(() => {
    let reportName = `PROVINCES REGISTERED IN ${user?.departments?.name?.toUpperCase()} ${user?.department?.toUpperCase()}`
    if (userOrSelectedDepartmentNames?.province) {
      reportName = `DISTRICTS REGISTERED IN ${userOrSelectedDepartmentNames?.province?.toUpperCase()} PROVINCE`
    }
    if (userOrSelectedDepartmentNames?.district) {
      reportName = `SECTORS REGISTERED IN ${userOrSelectedDepartmentNames?.district?.toUpperCase()} DISTRICT`
    }

    if (userOrSelectedDepartmentNames?.sector) {
      reportName = `CELLS REGISTERED IN ${userOrSelectedDepartmentNames?.sector?.toUpperCase()} SECTOR`
    }

    if (userOrSelectedDepartmentNames?.cell) {
      reportName = `VILLAGES REGISTERED IN ${userOrSelectedDepartmentNames?.cell?.toUpperCase()} CELL`
    }

    setReportName(reportName)
  }, [setReportName, userOrSelectedDepartmentNames])

  const onLoadDepartmentLists = async (data) => {
    setShowDepartmentListLoading(true)
    try {
      await getDepartmentLists(data)
        .unwrap()
        .then((res) => {
          dispatch(setTotalPages(res?.data?.totalPages))
          setTotalRecords(res?.data?.count)
          setData(
            res?.data?.rows?.map((row, index) => ({
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
        })
        .catch((error) => {
          setDepartmentListError(true)
          if (error.data && error.data.message) {
            toast.error(error.data.message)
          } else {
            toast.error(
              'An error occurred while retrieving the department lists. Please try again'
            )
          }
        })
        .finally(() => {
          setShowDepartmentListLoading(false)
        })
    } catch (error) {
      return error
    }
  }

  useEffect(() => {
    document.title = 'Departments | Umusanzu Digital'
  }, [])
  const gotoPage1 = (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return
    dispatch(setPage(Number(newPage)))
    // Optionally trigger your API fetch here if it's not automatically triggered by page change
  }

  const handleExportToPdf = async () => {
    try {
      setIsExporting(true)

      const { data } = await axios.get(
        `${API_URL}/department/pdf-reports?reportName=${reportName}&${new URLSearchParams(
          reportQueries
        ).toString()}`,
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
      // if (reportName.length > 31) {
      //   toast.error('Report name should not exceed to 31 chars')
      //   return false
      // }
      const { data } = await axios.get(
        `${API_URL}/department/excel-reports?reportName=${reportName}&${new URLSearchParams(
          reportQueries
        ).toString()}`,
        {
          responseType: 'blob',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      setIsExporting(false)
      download(new Blob([data]), `${reportName}.xlsx`, '.xlsx')
    } catch (error) {
      console.log(error)
      setIsExporting(false)
      if (error && error?.message) {
        toast.error(error.message)
      } else {
        toast.error(
          'An error occurred while retrieving the department lists. Please try again'
        )
      }
    }
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
                    <span>
                      {selectDepartment?.level_id === 6 ? 'Agents' : 'Admins'}
                    </span>
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
                submit
                type="button"
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
                submit
                type="button"
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
                submit
                type="button"
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

      <OverlayLoading color="black" isLoading={departmentListLoading} />

      <div className="flex items-center  justify-between mx-0">
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
                        ({totalRecords || 0})
                      </span>
                    </div>
                  </li>
                )}
              </ol>
            </nav>
          ) : (
            <>Departments({totalRecords || 0})</>
          )}
        </dt>

        <div className="mr-2">
          <div className="flex items-center  justify-between">
            {parseInt(user?.staff_role) === 1 && (
            <Button
              submit
              type="button"
              className="mr-2 py-2 px-2 bg-primary text-white rounded-[50%]"
              value={
                <>
                  <FontAwesomeIcon icon={faFile} />
                  <span className="px-1">Export Report</span>
                </>
              }
              onClick={openExportPopup}
            />
            )}
            <DepartmentModals />
            
            {/* Edit Department Modal */}
            <EditDepartmentModal
              department={selectDepartment}
              isOpen={showEditModal}
              onClose={() => setShowEditModal(false)}
              onUpdate={() => {
                // Refresh the department list after update
                getDepartmentLists({
                  level: queryRoute?.level || user?.myAddress?.level_id,
                  province: queryRoute?.province || user?.myAddress?.province?.id,
                  district: queryRoute?.district || user?.myAddress?.district?.id,
                  sector: queryRoute?.sector || user?.myAddress?.sector?.id,
                  cell: queryRoute?.cell || user?.myAddress?.cell?.id,
                  village: queryRoute?.village || user?.myAddress?.village?.id,
                  size: size,
                  page: offset,
                })
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex items-center  justify-between">
        <div className="mt-0 flex flex-col w-[100%] mx-auto">
          <div className="mx-4 sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg flex flex-col gap-4">
                {/* Mobile View */}
                <div className="md:hidden space-y-4 p-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <GlobalFilter
                      user={user}
                      fieldEnabled={{
                        level: false,
                        province: ['country'].includes(department),
                        district: ['country', 'province'].includes(department),
                        sector: ['country', 'province', 'district'].includes(department),
                        cell: ['country', 'province', 'district', 'sector'].includes(department),
                        village: false,
                        status: false,
                        searchTerm: true,
                      }}
                      isLoading={departmentListLoading}
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
                        setReportQueries({ ...queries2 })
                        setQueries({ ...queries2 })
                        onLoadDepartmentLists({
                          ...queries2,
                          size,
                          page: offset,
                        })
                      }}
                      placeholder={'Search for department....'}
                    />
                  </div>
                  
                  {data.map((row, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                      {/* Main Card Content */}
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{row.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{row.phone1}</p>
                          </div>
                          <button
                            onClick={() => toggleRowExpansion(index)}
                            className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <svg
                              className={`w-5 h-5 transform transition-transform ${expandedRows[index] ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          <button
                            className="flex items-center rounded-md bg-slate-800 hover:bg-slate-700 p-2 text-sm text-white transition-all"
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
                                fillRule="evenodd"
                                d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="ml-2">
                              {row?.level_id === 6 ? 'Agents' : 'Admins'}
                            </span>
                          </button>
                          {stateUser?.staff_role === 1 && (
                          <button
                            className="flex items-center rounded-md bg-blue-600 hover:bg-blue-700 p-2 text-sm text-white transition-all"
                            type="button"
                            onClick={() => {
                              setSelectDepartment(row)
                              setShowEditModal(true)
                            }}
                            title="Edit Department"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                              />
                            </svg>
                          </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {expandedRows[index] && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <span className="text-sm font-medium text-gray-500">Phone 2:</span>
                              <p className="text-sm text-gray-900">{row.phone2 || '—'}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500">Email:</span>
                              <p className="text-sm text-gray-900">{row.email || '—'}</p>
                            </div>
                          </div>
                          
                          {/* Additional Action Buttons for Mobile */}
                          <div className="flex flex-col gap-2 mt-4">
                            {/* Level 1 - Province */}
                            {row?.level_id === 1 && (
                              <>
                                {stateUser?.staff_role === 1 && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    color="blue"
                                    material
                                    className="w-full"
                                    value={
                                      <>
                                        <FontAwesomeIcon icon={faAdd} />
                                        <span className="px-1">Add District</span>
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
                                  to={`/departments?level=2&province=${row?.ID || user?.myAddress?.province?.id}`}
                                  className="flex items-center justify-center px-4 py-2 text-white rounded-md bg-primary hover:bg-primary/90 transition-colors text-sm"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    window.location.href = e.currentTarget.href
                                  }}
                                >
                                  All Districts
                                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                                  </svg>
                                </Link>
                              </>
                            )}

                            {/* Level 2 - District */}
                            {row?.level_id === 2 && (
                              <>
                                {stateUser?.staff_role === 1 && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    color="blue"
                                    material
                                    className="w-full"
                                    value={
                                      <>
                                        <FontAwesomeIcon icon={faAdd} />
                                        <span className="px-1">Add Sector</span>
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
                                  to={`/departments?level=3&province=${queryRoute?.province || user?.myAddress?.province?.id}&district=${row?.ID || user?.myAddress?.district?.id}`}
                                  className="flex items-center justify-center px-4 py-2 text-white rounded-md bg-primary hover:bg-primary/90 transition-colors text-sm"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    window.location.href = e.currentTarget.href
                                  }}
                                >
                                  All Sectors
                                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                                  </svg>
                                </Link>
                              </>
                            )}

                            {/* Level 3 - Sector */}
                            {row?.level_id === 3 && (
                              <>
                                {stateUser?.staff_role === 1 && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    color="blue"
                                    material
                                    className="w-full"
                                    value={
                                      <>
                                        <FontAwesomeIcon icon={faAdd} />
                                        <span className="px-1">Add Cell</span>
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
                                  to={`/departments?level=4&province=${queryRoute?.province || user?.myAddress?.province?.id}&district=${queryRoute?.district || user?.myAddress?.district?.id}&sector=${row?.ID || user?.myAddress?.sector?.id}`}
                                  className="flex items-center justify-center px-4 py-2 text-white rounded-md bg-primary hover:bg-primary/90 transition-colors text-sm"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    window.location.href = e.currentTarget.href
                                  }}
                                >
                                  All Cells
                                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                                  </svg>
                                </Link>
                              </>
                            )}

                            {/* Level 4 - Cell */}
                            {row?.level_id === 4 && (
                              <>
                                {stateUser?.staff_role === 1 && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    color="blue"
                                    material
                                    className="w-full"
                                    value={
                                      <>
                                        <FontAwesomeIcon icon={faAdd} />
                                        <span className="px-1">Add Village</span>
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
                                  to={`/departments?level=6&province=${queryRoute?.province || user?.myAddress?.province?.id}&district=${queryRoute?.district || user?.myAddress?.district?.id}&sector=${queryRoute?.sector || user?.myAddress?.sector?.id}&cell=${row?.ID || user?.myAddress?.cell?.id}`}
                                  className="flex items-center justify-center px-4 py-2 text-white rounded-md bg-primary hover:bg-primary/90 transition-colors text-sm"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    window.location.href = e.currentTarget.href
                                  }}
                                >
                                  All Villages
                                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                                  </svg>
                                </Link>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <table className="hidden md:table min-w-full divide-y divide-gray-200">
                  <caption className="caption-top p-2">
                    <GlobalFilter
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
                      isLoading={departmentListLoading}
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
                        setReportQueries({ ...queries2 })
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
                        setReportQueries({ ...queries2 })
                        setQueries({ ...queries2 })
                        onLoadDepartmentLists({
                          ...queries2,
                          size,
                          page: offset,
                        })
                      }}
                      placeholder={'Search for department....'}
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
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          <div className="flex justify-between">
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

                            {/* Edit Department Button */}
                            <button
                              className="flex items-center rounded-md bg-blue-600 hover:bg-blue-700 p-1.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow-lg focus:bg-blue-700 focus:shadow-none active:bg-blue-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none mx-2"
                              type="button"
                              onClick={() => {
                                setSelectDepartment(row)
                                setShowEditModal(true)
                              }}
                              title="Edit Department"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                />
                              </svg>
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
                                        <span className="px-1">
                                          {' '}
                                          Add Sector
                                        </span>
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
                                        <span className="px-1">
                                          {' '}
                                          Add Village
                                        </span>
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
                                  }&cell=${
                                    row?.ID || user?.myAddress?.cell?.id
                                  }`}
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
                          </div>
                        </td>
                        <td
                          role="cell"
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          {row.name}
                        </td>
                        <td
                          role="cell"
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          {row.phone1}
                        </td>
                        <td
                          role="cell"
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          {row.phone2}
                        </td>
                        <td
                          role="cell"
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          {row.email}
                        </td>
                      </tr>
                    ))}
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
      {totalRecords > 0 && (
        <div className="pagination w-[100%] mx-auto">
          <div className="py-3 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                onClick={() => gotoPage1(Number(offset) - 1)}
                disabled={offset === 0 || departmentListLoading}
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
                    disabled={offset === 0 || departmentListLoading}
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
                    disabled={offset === 0 || departmentListLoading}
                    className="px-4 cursor-pointer hover:scale-[1.02] p-2 shadow-md"
                  >
                    <span className="px-4 cursor-pointer hover:scale-[1.02] sr-only">
                      Previous
                    </span>
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </PageButton>
                  <PageButton
                    onClick={() => gotoPage1(Number(offset) + 1)}
                    disabled={offset >= totalPages || departmentListLoading}
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
                    disabled={offset >= totalPages - 1 || departmentListLoading}
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
