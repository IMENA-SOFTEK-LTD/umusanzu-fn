import { useSelector } from 'react-redux'
import { useLazyGetDepartmentPerformancesQuery } from '../../states/api/apiSlice'
import { useEffect, useMemo, useState } from 'react'
import formatFunds from '../../utils/Funds'
import Table from '../../components/table/Table'
import moment from 'moment'
import Loading from '../../components/Loading'
import { toast } from 'react-toastify'
import GlobalFilter from '../../containers/dashboard/GlobalFilter'
import {
  setSelectedCell,
  setSelectedDistrict,
  setSelectedProvince,
  setSelectedSector,
  setSelectedVillage,
} from '../../states/features/modals/householdSlice'

const Performances = () => {
  // STATE VARIABLES
  const { user } = useSelector((state) => state.auth)
  const { sectorId, userOrSelectedDepartmentNames } = useSelector(
    (state) => state.departments
  )
  const [data, setData] = useState([])

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

  const [
    getDepartmentPerformances,
    {
      data: departmentPerformancesData,
      isLoading: departmentPerformancesLoading,
      isError: departmentPerformancesError,
      isSuccess: departmentPerformancesSuccess,
    },
  ] = useLazyGetDepartmentPerformancesQuery()

  let currentMonth = moment().format('MMMM')
  useEffect(() => {
    getDepartmentPerformances({
      departmentId:
        user?.departments?.level_id === 3 ? user?.departments?.id : sectorId,
      department: 'sector',
      month: moment().format('YYYY-MM'),
    })
  }, [])

  useEffect(() => {
    if (departmentPerformancesSuccess) {
      setData(
        departmentPerformancesData?.data?.map((row, index) => {
          return {
            no: index + 1,
            village: row?.village,
            cell: row?.cellName || row?.cell,
            district: row?.districtName || row?.district,
            sector: row?.sectorName || row?.sector,
            province: row?.provinceName || row?.province,
            merchantCode: row?.merchant_code,
            phone: row?.phone1,
            monthlyTarget: formatFunds(row?.monthlyTarget),
            monthlyCollections: formatFunds(row?.monthlyCollections),
            difference: formatFunds(row?.monthlyDifference.replace('-', '')),
            percentage:
              Math.round(
                (Number(row?.monthlyCollections) / Number(row?.monthlyTarget)) *
                  100
              ) + '%',
            ID: row?.id,
            staffId: row?.id,
          }
        })
      )
    } else if (departmentPerformancesError) {
      setData([])
      toast.error('Error fetching performances. Please try again.')
    }
  }, [departmentPerformancesData])

  // COLUMNS
  const columns = useMemo(
    () => [
      {
        id: 'no',
        Header: 'No',
        accessor: 'no',
        sortable: true,
      },
      {
        id: 'village',
        Header: 'Village',
        accessor: 'village',
        sortable: true,
      },
      {
        id: 'cell',
        Header: 'Cell',
        accessor: 'cell',
        sortable: true,
        filter: true,
      },
      {
        id: 'sector',
        Header: 'Sector',
        accessor: 'sector',
        sortable: true,
      },
      {
        id: 'monthlyTarget',
        Header: 'Target',
        accessor: 'monthlyTarget',
        sortable: true,
      },
      {
        id: 'monthlyCollections',
        Header: 'Progress',
        accessor: 'monthlyCollections',
        sortable: true,
      },
      {
        id: 'difference',
        Header: 'REMAIN',
        accessor: 'difference',
        sortable: true,
      },
      {
        id: 'percentage',
        Header: 'Percentage',
        accessor: 'percentage',
        sortable: true,
        filter: true,
      },
    ],
    []
  )

  return (
    <main className="p-6 flex flex-col gap-6">
      <div className="search-filter flex flex-col w-full items-center gap-6">
        <span className="w-[95%] mx-auto h-fit flex items-center flex-wrap gap-4 max-md:justify-center">
          <GlobalFilter
            user={user}
            fieldEnabled={{
              province: ['country'].includes(department),
              district: ['country', 'province'].includes(department),
              sector: ['country', 'province', 'district'].includes(department),
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
            isLoading={departmentPerformancesLoading}
            placeholder={'Search for transaction....'}
            onChange={(query) => {
              
            }}
            onSearch={(query) => {
              // gotoPage1(0)
              // const queries2 = {
              //   departmentId: user?.departments?.id,
              //   searchTerm: query.searchTerm || queryRoute?.searchTerm || '',
              //   village: query.village || queryRoute?.village || '',
              //   cell: query.cell || queryRoute?.cell || '',
              //   sector: query.sector || queryRoute?.sector || '',
              //   district: query.district || queryRoute?.district || '',
              //   province: query.province || queryRoute?.province || '',
              //   payment_status:
              //     query.paymentStatus || queryRoute?.paymentStatus || 'All',
              //   payment_method:
              //     query.paymentMethod || queryRoute?.paymentMethod || 'All',
              //   transaction_from: query?.dateFrom || '',
              //   transaction_to: query?.dateTo || '',
              // }
              // setQueries({ ...queries2 })
              // onLoadTransactionLists({
              //   department,
              //   size,
              //   page: offset,
              //   ...queries2,
              // })
            }}
          />
        </span>
      </div>

      {departmentPerformancesSuccess && (
        <Table
          data={data}
          columns={columns}
          user={user}
          reportTitleObj={{
            title: `UMUSANZU  DIGITAL'S  ${
              userOrSelectedDepartmentNames.village !== undefined
                ? userOrSelectedDepartmentNames.village + '  VILLAGE'
                : userOrSelectedDepartmentNames.cell !== undefined
                ? userOrSelectedDepartmentNames.cell + '  CELL'
                : userOrSelectedDepartmentNames.sector + '  SECTOR'
            }  ${currentMonth.toUpperCase()}  PERFORMANCES`,
            province: userOrSelectedDepartmentNames.province,
            district: userOrSelectedDepartmentNames.district,
            sector: userOrSelectedDepartmentNames.sector,
          }}
        />
      )}
    </main>
  )
}

export default Performances
