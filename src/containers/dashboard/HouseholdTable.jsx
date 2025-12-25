import 'core-js/stable'
import 'jspdf-autotable'
import 'regenerator-runtime/runtime'
import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
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
  faChevronDown,
  faChevronUp,
  faMapMarkerAlt,
  faPhone,
  faDownload,
} from '@fortawesome/free-solid-svg-icons'
import {
  useGlobalFilter,
  useTable,
  useFilters,
  useSortBy,
  usePagination,
} from 'react-table'
import {
  setPage,
  setSize,
  setTotalPages,
} from '../../states/features/pagination/paginationSlice'
import {
  useCancelMoveHouseholdMutation,
  useLazyGetHouseholdsListQuery,
  useMoveHouseholdMutation,
  useImportHouseholdsMutation,
} from '../../states/api/apiSlice'
import Loading from '../../components/Loading'
import Button, { PageButton } from '../../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector, useDispatch } from 'react-redux'
import GlobalFilter from './GlobalFilter'
import Modal from '../../components/models/Modal'
import ImportHouseholdsModal from '../../components/models/ImportHouseholdsModal'
import DeleteHouseholdsModal from '../../components/models/DeleteHouseholdsModal'
import DeleteTransactionsModal from '../../components/models/DeleteTransactionsModal'
import {
  setSelectedCell,
  setSelectedSector,
  setSelectedVillage,
  setSelectedProvince,
  setSelectedDistrict,
} from '../../states/features/modals/householdSlice'
import formatFunds from '../../utils/Funds'
import { useLocation } from 'react-router-dom'
import API_URL from '../../constants'
import { toast } from 'react-toastify'
import download from 'downloadjs'
import OverlayLoading from '../../components/OverlayLoading'
import * as XLSX from 'xlsx'

const HouseholdTable = ({ user }) => {
  // State management
  const [showExportPopup, setShowExportPopup] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [totalRecords, setTotalRecords] = useState(0)
  const [householdsListIsLoading, setHouseholdsListIsLoading] = useState(false)
  const [householdListError, setHouseholdListError] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [expandedRows, setExpandedRows] = useState({})
  const [reportName, setReportName] = useState(
    `HOUSEHOLDS REGISTERED IN ${user?.departments?.name?.toUpperCase()} ${user?.department?.toUpperCase()}`
  )
  const [showImportModal, setShowImportModal] = useState(false)
  const [showDeleteHouseholdsModal, setShowDeleteHouseholdsModal] =
    useState(false)
  const [showDeleteTransactionsModal, setShowDeleteTransactionsModal] =
    useState(false)
  const { userOrSelectedDepartmentNames } = useSelector(
    (state) => state.departments
  )
  const location = useLocation()

  // Toggle row expansion for mobile view
  const toggleRowExpansion = useCallback((index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }, [])

  const openExportPopup = useCallback(() => {
    setShowExportPopup(true)
  }, [])

  const closeExportPopup = useCallback(() => {
    setShowExportPopup(false)
  }, [])

  const [
    importHouseholds,
    { isLoading: isImporting, isSuccess: importSuccess, isError: importError },
  ] = useImportHouseholdsMutation()

  const handleImport = useCallback(() => {
    setShowImportModal(true)
  }, [])

  const handleDeleteAllHouseholds = useCallback(() => {
    setShowDeleteHouseholdsModal(true)
  }, [])

  const handleDeleteTransactions = useCallback(() => {
    setShowDeleteTransactionsModal(true)
  }, [])

  const [getHouseholdsList] = useLazyGetHouseholdsListQuery()

  const [
    moveHousehold,
    {
      data: moveHouseholdData,
      isLoading: moveHouseholdIsLoading,
      isSuccess: moveHouseholdIsSuccess,
      isError: moveHouseholdIsError,
    },
  ] = useMoveHouseholdMutation()

  const [
    cancelMoveHousehold,
    {
      data: cancelMoveHouseholdData,
      isLoading: cancelMoveHouseholdIsLoading,
      isSuccess: cancelMoveHouseholdIsSuccess,
      isError: cancelMoveHouseholdIsError,
    },
  ] = useCancelMoveHouseholdMutation()

  const {
    page: offset,
    size,
    totalPages,
  } = useSelector((state) => state.pagination)

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

  useEffect(() => {
    let reportName = `HOUSEHOLDS REGISTERED IN ${user?.departments?.name?.toUpperCase()} ${user?.department?.toUpperCase()}`
    if (userOrSelectedDepartmentNames?.province) {
      reportName = `HOUSEHOLDS REGISTERED IN ${userOrSelectedDepartmentNames?.province?.toUpperCase()} PROVINCE`
    }
    if (userOrSelectedDepartmentNames?.district) {
      reportName = `HOUSEHOLDS REGISTERED IN ${userOrSelectedDepartmentNames?.district?.toUpperCase()} DISTRICT`
    }

    if (userOrSelectedDepartmentNames?.sector) {
      reportName = `HOUSEHOLDS REGISTERED IN ${userOrSelectedDepartmentNames?.sector?.toUpperCase()} SECTOR`
    }

    if (userOrSelectedDepartmentNames?.cell) {
      reportName = `HOUSEHOLDS REGISTERED IN ${userOrSelectedDepartmentNames?.cell?.toUpperCase()} CELL`
    }
    if (userOrSelectedDepartmentNames?.village) {
      reportName = `HOUSEHOLDS REGISTERED IN ${userOrSelectedDepartmentNames?.village?.toUpperCase()} VILLAGE`
    }

    setReportName(reportName)
  }, [setReportName, userOrSelectedDepartmentNames])

  const [data, setData] = useState([])
  const [reportQueries, setReportQueries] = useState(null)
  const [queries, setQueries] = useState({
    departmentId: user?.departments?.id,
    searchTerm: '',
    ubudehe: queryRoute?.ubudehe || '',
    route: queryRoute?.query || '',
    status: queryRoute?.status ? queryRoute?.status : 'ACTIVE',
    village: queryRoute?.village || '',
    cell: queryRoute?.cell || '',
    sector: queryRoute?.sector || '',
    district: queryRoute?.district || '',
    province: queryRoute?.province || '',
    query: queryRoute?.query || '',
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
        queryRoute_?.province ||
        queryRoute_?.query)
    ) {
      setQueries({
        ...queries,
        ubudehe: queryRoute_?.ubudehe || '',
        route: queryRoute_?.query || '',
        status: queryRoute_?.status ? queryRoute_?.status : 'ACTIVE',
        village: queryRoute_?.village || '',
        cell: queryRoute_?.cell || '',
        sector: queryRoute_?.sector || '',
        district: queryRoute_?.district || '',
        province: queryRoute_?.province || '',
        query: queryRoute_?.query || '',
      })
    }
  }, [location])

  useEffect(() => {
    onLoadHouseholdLists({
      department,
      size,
      page: offset,
      ...queries,
    })
  }, [size, offset])

  const onLoadHouseholdLists = async (data) => {
    setHouseholdsListIsLoading(true)
    try {
      await getHouseholdsList(data)
        .unwrap()
        .then((res) => {
          dispatch(setTotalPages(res?.data?.totalPages))
          setTotalRecords(res?.data?.count)
          setTotalAmount(res?.data?.totalAmount)
          setData(
            res?.data?.rows?.map((row, index) => ({
              ID: row?.id,
              id: index + 1,
              name: row?.name,
              nid: row?.nid,
              email: row?.email,
              phone1: row?.phone1,
              phone2: row?.phone2,
              amount: row?.amount,
              status: row?.status,
              village: row?.village_name,
              villageId: row?.village,
              cell: row?.cell_name,
              cellId: row?.cell,
              sector: row?.sector_name,
              sectorId: row?.sector,
              district: row?.district_name,
              districtId: row?.district,
              province: row?.province_name,
              provinceId: row?.province,
              type: row?.type,
              payment_status: row?.payment_status,
              total_services:
                row?.total_services === 0
                  ? 'No Services'
                  : row?.total_services + ' Services',
            })) || []
          )
        })
        .catch((error) => {
          setHouseholdListError(true)
          if (error.data && error.data.message) {
            toast.error(error.data.message)
          } else {
            toast.error(
              'An error occurred while retrieving the household lists. Please try again'
            )
          }
        })
        .finally(() => {
          setHouseholdsListIsLoading(false)
        })
    } catch (error) {
      return error
    }
  }

  // const handleExportToPdf = async () => {
  //   try {
  //     setIsExporting(true)

  //     const { data } = await axios.get(
  //       `${API_URL}/households/pdf-reports?reportName=${reportName}&${new URLSearchParams(
  //         reportQueries
  //       ).toString()}`,
  //       {
  //         responseType: 'blob',
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem('token')}`,
  //         },
  //         onDownloadProgress: (progressEvent) => {
  //           const total = progressEvent.total || progressEvent.target?.getResponseHeader('Content-Length');
  //           if (total) {
  //             const percent = Math.round((progressEvent.loaded * 100) / total);
  //             setDownloadProgress(percent);
  //           }
  //         },
  //       }
  //     )
  //     setIsExporting(false)
  //     download(new Blob([data]), `${reportName}.pdf`, '.pdf')
  //   } catch (error) {
  //     // console.log(error)
  //     setIsExporting(false)
  //     toast.error('Househould not found')
  //   }
  // }

  const handleExport = async (file) => {
    try {
      setIsExporting(true)
      setDownloadProgress(0) // reset progress

      const { data } = await axios.get(
        `${API_URL}/households/${file}-reports?reportName=${reportName}&${new URLSearchParams(
          reportQueries
        ).toString()}`,
        {
          responseType: 'blob',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          onDownloadProgress: (progressEvent) => {
            const total =
              progressEvent.total ||
              progressEvent.target?.getResponseHeader('Content-Length')
            if (total) {
              const percent = Math.round((progressEvent.loaded * 100) / total)
              setDownloadProgress(percent)
            }
          },
        }
      )
      if (file === 'pdf') {
        download(new Blob([data]), `${reportName}.pdf`, '.pdf')
      } else {
        download(new Blob([data]), `${reportName}.csv`, '.csv')
      }
    } catch (error) {
      toast.error('Household not found')
    } finally {
      setIsExporting(false)
      setDownloadProgress(0)
    }
  }

  // Optimized columns with mobile considerations
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
            {/* IF ADMIN */}
            {/* IF YOU ARE COUNTRY LEVEL AND SECTOR */}
            {user?.staff_role === 1 &&
              [3, 5].includes(user?.departments?.level_id) && (
                <span className="flex items-center gap-[3px]">
                  <Button
                    value="Approve"
                    className={
                      row?.original?.status === 'REQUESTED'
                        ? '!bg-green-600'
                        : '!hidden'
                    }
                    onClick={(e) => {
                      e.preventDefault()
                      const payload = {
                        name: row?.original?.name,
                        amount: row?.original?.amount,
                        nid: row?.original?.nid,
                        phone1: row?.original?.phone1,
                        phone2: row?.original?.phone2,
                        village: row?.original?.villageId,
                        cell: row?.original?.cellId,
                        sector: row?.original?.sectorId,
                        district: row?.original?.districtId,
                        province: row?.original?.provinceId,
                        email: row?.original?.email,
                        existingHouseholdId: row?.original?.ID,
                      }
                      // console.log(payload)
                      moveHousehold(payload)
                    }}
                  />
                  {row?.original?.status === 'REQUESTED' && (
                    <Button
                      value={`${
                        row?.original?.status === 'REQUESTED'
                          ? 'Deny'
                          : 'Return'
                      }`}
                      className={
                        row?.original?.status === 'REQUESTED'
                          ? '!bg-red-600'
                          : row?.original?.status === 'MOVED'
                          ? '!bg-green-600'
                          : '!hidden'
                      }
                      onClick={(e) => {
                        e.preventDefault()
                        cancelMoveHousehold({
                          id: row?.original?.ID,
                        })
                      }}
                    />
                  )}
                </span>
              )}
          </span>
        ),
      },

      {
        Header: 'Names',
        accessor: 'name',
        sortable: true,
      },
      {
        Header: 'Commitment',
        accessor: 'amount',
        sortable: true,
        Filter: SelectColumnFilter,
        Cell: ({ row }) => {
          const amount = row?.original?.amount || 0
          return (
            <span className="font-medium">
              {formatFunds(amount)} RWF
            </span>
          )
        },
      },
      {
        Header: 'Services',
        accessor: 'total_services',
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
      // {
      //   Header: 'Cell',
      //   accessor: 'cell',
      //   sortable: true,
      //   Filter: SelectColumnFilter,
      // },
      // {
      //   Header: 'Sector',
      //   accessor: 'sector',
      //   sortable: true,
      //   Filter: SelectColumnFilter,
      // },
      // {
      //   Header: 'District',
      //   accessor: 'district',
      //   sortable: true,
      //   Filter: SelectColumnFilter,
      // },
      {
        Header: 'PaymentStatus',
        accessor: 'payment_status',
        sortable: true,
        Filter: SelectColumnFilter,
        Cell: ({ row }) => {
          const status = row?.original?.payment_status
          const statusUpper = status?.toUpperCase()
          const color =
            statusUpper === 'PAID' || statusUpper === 'CURRENT'
              ? 'bg-green-600'
              : statusUpper === 'PENDING' || statusUpper === 'DUE'
              ? 'bg-yellow-600'
              : statusUpper === 'PARTIAL' || statusUpper === 'PARTIALLY PAID'
              ? 'bg-blue-600'
              : statusUpper === 'UNPAID' || statusUpper === 'OVERDUE' || statusUpper === 'OUTSTANDING'
              ? 'bg-red-600'
              : statusUpper === 'UP TO DATE'
              ? 'bg-green-500'
              : 'bg-gray-600'
          return (
            <span
              className={`${color} w-auto px-2 py-1 text-white text-xs rounded`}
            >
              {status || 'N/A'}
            </span>
          )
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
    document.title = 'Households | Umusanzu Digital'
  }, [])

  const gotoPage1 = useCallback(
    (newPage) => {
      if (newPage < 0 || newPage >= totalPages) return
      dispatch(setPage(Number(newPage)))
    },
    [totalPages, dispatch]
  )

  // Mobile Household Card Component
  const HouseholdCard = memo(({ household, index }) => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4 p-4">
      {/* Main Info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Button
            className="!p-2 !rounded-full !bg-blue-100 hover:!bg-blue-200"
            route={`/households/${household.ID}`}
            value={
              <FontAwesomeIcon
                className="text-blue-600"
                icon={faHouseChimney}
              />
            }
          />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {household.name}
            </h3>
            <p className="text-xs text-gray-500 flex items-center">
              <FontAwesomeIcon icon={faPhone} className="w-3 h-3 mr-1" />
              {household.phone1}
            </p>
          </div>
        </div>
        <button
          onClick={() => toggleRowExpansion(index)}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FontAwesomeIcon
            icon={expandedRows[index] ? faChevronUp : faChevronDown}
            className="w-4 h-4"
          />
        </button>
      </div>

      {/* Status Badge */}
      <div className="mb-3">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            household.status === 'ACTIVE'
              ? 'bg-green-100 text-green-800'
              : household.status === 'MOVED' || household.status === 'REQUESTED'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {household.status}
        </span>
      </div>

      {/* Expanded Content */}
      {expandedRows[index] && (
        <div className="border-t border-gray-100 pt-3 space-y-3">
          {/* Household Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500 block text-xs">Commitment</span>
              <p className="font-medium text-green-600">
                {formatFunds(household.amount)}
              </p>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Total Services</span>
              <p className="font-medium text-green-600">
                {household.total_services}
              </p>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Email</span>
              <p className="font-medium">{household.email || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">NID</span>
              <p className="font-medium">{household.nid || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Phone 2</span>
              <p className="font-medium">{household.phone2 || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">
                Payment Status
              </span>
              <span
                className={`inline-block px-2 py-1 text-white text-xs rounded font-medium ${
                  household.payment_status?.toUpperCase() === 'PAID' || household.payment_status?.toUpperCase() === 'CURRENT'
                    ? 'bg-green-600'
                    : household.payment_status?.toUpperCase() === 'PENDING' || household.payment_status?.toUpperCase() === 'DUE'
                    ? 'bg-yellow-600'
                    : household.payment_status?.toUpperCase() === 'PARTIAL' || household.payment_status?.toUpperCase() === 'PARTIALLY PAID'
                    ? 'bg-blue-600'
                    : household.payment_status?.toUpperCase() === 'UNPAID' || household.payment_status?.toUpperCase() === 'OVERDUE' || household.payment_status?.toUpperCase() === 'OUTSTANDING'
                    ? 'bg-red-600'
                    : household.payment_status?.toUpperCase() === 'UP TO DATE'
                    ? 'bg-green-500'
                    : 'bg-gray-600'
                }`}
              >
                {household.payment_status || 'N/A'}
              </span>
            </div>
          </div>

          {/* Location Details */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3 h-3 mr-1" />
              Location Details
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Village:</span>
                <p className="font-medium">{household.village}</p>
              </div>
              <div>
                <span className="text-gray-500">Cell:</span>
                <p className="font-medium">{household.cell}</p>
              </div>
              <div>
                <span className="text-gray-500">Sector:</span>
                <p className="font-medium">{household.sector}</p>
              </div>
              <div>
                <span className="text-gray-500">District:</span>
                <p className="font-medium">{household.district}</p>
              </div>
              <div>
                <span className="text-gray-500">Province:</span>
                <p className="font-medium">{household.province}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {user?.staff_role === 1 &&
            [3, 5].includes(user?.departments?.level_id) && (
              <div className="flex gap-2 mt-3">
                {household.status === 'REQUESTED' && (
                  <>
                    <Button
                      value="Approve"
                      className="!bg-green-600 !text-white !text-xs !py-1 !px-3"
                      onClick={(e) => {
                        e.preventDefault()
                        const payload = {
                          name: household.name,
                          amount: household.amount,
                          nid: household.nid,
                          phone1: household.phone1,
                          phone2: household.phone2,
                          village: household.villageId,
                          cell: household.cellId,
                          sector: household.sectorId,
                          district: household.districtId,
                          province: household.provinceId,
                          email: household.email,
                          existingHouseholdId: household.ID,
                        }
                        moveHousehold(payload)
                      }}
                    />
                    <Button
                      value="Deny"
                      className="!bg-red-600 !text-white !text-xs !py-1 !px-3"
                      onClick={(e) => {
                        e.preventDefault()
                        cancelMoveHousehold({ id: household.ID })
                      }}
                    />
                  </>
                )}
              </div>
            )}
        </div>
      )}
    </div>
  ))

  return (
    <main className={`my-12`}>
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
                onClick={() => handleExport('pdf')}
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
                onClick={() => handleExport('excel')}
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
      <OverlayLoading color="black" isLoading={householdsListIsLoading} />

      <div className="flex my-6 flex-col w-full items-center gap-6 relative px-4 sm:px-8">
        <div className="search-filter flex flex-col w-full items-center gap-6">
          {/* Header Section */}
          <div className="w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Households Management
                </h1>
                <p className="text-sm text-gray-600">
                  {`${user?.departments?.name} ${user?.department}`}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {[1, 2].includes(parseInt(user?.staff_role)) && (
                  <Button
                    className="w-full sm:w-auto"
                    value={
                      <span className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faHouse} />
                        <span className="hidden sm:inline">
                          Add new household
                        </span>
                        <span className="sm:hidden">Add Household</span>
                      </span>
                    }
                    route="/households/create"
                  />
                )}
                {user?.departments.level_id !== 6 &&
                  parseInt(user?.staff_role) === 1 && (
                    <Button
                      className="w-full sm:w-auto"
                      value={
                        <span className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faFile} />
                          <span className="hidden sm:inline">
                            Export Report
                          </span>
                          <span className="sm:hidden">Export</span>
                        </span>
                      }
                      route={'#'}
                      onClick={openExportPopup}
                    />
                  )}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-2 flex flex-col w-[95%] mx-auto">
          <table>
            <tr className="w-100">
              <td className="w-100">
                <GlobalFilter
                  user={user}
                  fieldEnabled={{
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
                    village: [
                      'country',
                      'province',
                      'district',
                      'sector',
                      'cell',
                    ].includes(department),
                    activationStatus: !['monthlyTarget'].includes(
                      queryRoute?.query
                    ),
                    searchTerm: true,
                  }}
                  isLoading={householdsListIsLoading}
                  placeholder={
                    'Search for household by names, phone, email....'
                  }
                  showImport={
                    parseInt(user?.staff_role) === 1 &&
                    user?.departments.level_id === 5
                  }
                  showDelete={
                    parseInt(user?.staff_role) === 1 &&
                    user?.departments.level_id === 5
                  }
                  onImport={handleImport}
                  onDeleteAllHouseholds={handleDeleteAllHouseholds}
                  onDeleteTransactions={handleDeleteTransactions}
                  onChange={(query) => {
                    const queries2 = {
                      departmentId: user?.departments?.id,
                      searchTerm:
                        query.searchTerm || queryRoute?.searchTerm || '',
                      ubudehe: queryRoute?.ubudehe || '',
                      route: queryRoute?.query || '',
                      // id: sectorId || user?.departments?.id,
                      status: query.activationStatus || 'ACTIVE',
                      village: query.village || queryRoute?.village || '',
                      cell: query.cell || queryRoute?.cell || '',
                      sector: query.sector || queryRoute?.sector || '',
                      district: query.district || queryRoute?.district || '',
                      province: query.province || queryRoute?.province || '',
                    }
                    setReportQueries({ ...queries2 })
                  }}
                  onSearch={(query) => {
                    gotoPage1(0)
                    const queries2 = {
                      departmentId: user?.departments?.id,
                      searchTerm:
                        query.searchTerm || queryRoute?.searchTerm || '',
                      ubudehe: queryRoute?.ubudehe || '',
                      route: queryRoute?.query || '',
                      // id: sectorId || user?.departments?.id,
                      status: query.activationStatus || 'ACTIVE',
                      village: query.village || queryRoute?.village || '',
                      cell: query.cell || queryRoute?.cell || '',
                      sector: query.sector || queryRoute?.sector || '',
                      district: query.district || queryRoute?.district || '',
                      province: query.province || queryRoute?.province || '',
                    }
                    setReportQueries({ ...queries2 })
                    setQueries({ ...queries2 })
                    onLoadHouseholdLists({
                      department,
                      size,
                      page: offset,
                      ...queries2,
                    })
                  }}
                />
              </td>
            </tr>
          </table>
        </div>
        <div className="mt-0 flex flex-col w-[95%] mx-auto">
          <div className="-my-2 overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg flex flex-col gap-4">
                {/* Export Popup/Modal */}

                {moveHouseholdIsLoading || cancelMoveHouseholdIsLoading ? (
                  <span className="flex flex-col items-center justify-center min-h-[30vh]">
                    <Loading />
                    <h4 className="uppercase text-primary text-md font-bold text-center">
                      {moveHouseholdIsLoading
                        ? 'Moving Household...'
                        : 'Cancelling request...'}
                    </h4>
                  </span>
                ) : moveHouseholdIsSuccess || cancelMoveHouseholdIsSuccess ? (
                  <span className="flex flex-col items-center justify-center gap-4 min-h-[30vh]">
                    <h4 className="uppercase text-primary text-md font-bold text-center">
                      {moveHouseholdIsSuccess
                        ? 'Household moved successfully'
                        : 'Request cancelled successfully'}
                    </h4>
                    <Button
                      value={`${
                        moveHouseholdIsSuccess
                          ? 'View household'
                          : 'Go to dashboard'
                      }`}
                      route={
                        moveHouseholdIsSuccess
                          ? `/households/${moveHouseholdData?.data?.id}`
                          : '/dashboard'
                      }
                    />
                  </span>
                ) : (
                  <>
                    {/* Summary Stats */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center sm:text-left">
                          <p className="text-sm text-gray-600">
                            Total Households
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatFunds(totalRecords) || 0}
                          </p>
                        </div>
                        <div className="text-center sm:text-left">
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatFunds(totalAmount || 0)} RWF
                          </p>
                        </div>
                        <div className="text-center sm:text-left">
                          <p className="text-sm text-gray-600">Status</p>
                          <p className="text-lg font-semibold text-blue-600">
                            {queries?.status?.toLowerCase() || 'Active'}
                          </p>
                        </div>
                        <div className="text-center sm:text-left">
                          <p className="text-sm text-gray-600">Department</p>
                          <p className="text-lg font-semibold text-purple-600">
                            {user?.departments?.name}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Mobile View */}
                    <div className="block md:hidden">
                      <div className="space-y-4">
                        {page.map((row, index) => {
                          prepareRow(row)
                          return (
                            <HouseholdCard
                              key={row.original.ID}
                              household={row.original}
                              index={index}
                            />
                          )
                        })}
                      </div>
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table
                        {...getTableProps()}
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
                  </>
                )}
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
              disabled={offset === 0 || householdsListIsLoading}
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
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <span className="text-sm text-gray-700">
                Page <span className="font-medium">{offset + 1}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </span>
              <label>
                <span className="sr-only">Items Per Page</span>
                <select
                  className="p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm"
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
                  disabled={offset === 0 || householdsListIsLoading}
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
                  disabled={offset === 0 || householdsListIsLoading}
                  className="px-4 cursor-pointer hover:scale-[1.02] p-2 shadow-md"
                >
                  <span className="px-4 cursor-pointer hover:scale-[1.02] sr-only">
                    Previous
                  </span>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </PageButton>
                <PageButton
                  onClick={() => gotoPage1(Number(offset) + 1)}
                  disabled={offset >= totalPages - 1 || householdsListIsLoading}
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
                  disabled={offset >= totalPages - 1 || householdsListIsLoading}
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

      {/* Import Modal */}
      <ImportHouseholdsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => {
          // Optionally refresh data after successful import
          if (onLoadHouseholdLists) {
            onLoadHouseholdLists({
              department,
              size,
              page: offset,
              ...queries,
            })
          }
        }}
      />

      {/* Delete All Households Modal */}
      <DeleteHouseholdsModal
        isOpen={showDeleteHouseholdsModal}
        onClose={() => setShowDeleteHouseholdsModal(false)}
        onSuccess={() => {
          // Refresh data after successful deletion
          if (onLoadHouseholdLists) {
            onLoadHouseholdLists({
              department,
              size,
              page: offset,
              ...queries,
            })
          }
        }}
      />

      {/* Delete Transactions Modal */}
      <DeleteTransactionsModal
        isOpen={showDeleteTransactionsModal}
        onClose={() => setShowDeleteTransactionsModal(false)}
        onSuccess={() => {
          // Refresh data after successful deletion
          if (onLoadHouseholdLists) {
            onLoadHouseholdLists({
              department,
              size,
              page: offset,
              ...queries,
            })
          }
        }}
      />
    </main>
  )
}

HouseholdTable.propTypes = {
  user: PropTypes.shape({
    departments: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      level_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    staff_role: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    department: PropTypes.string,
  }),
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

// Memoize the component for performance optimization
export default memo(HouseholdTable)
