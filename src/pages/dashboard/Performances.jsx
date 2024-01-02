import { useSelector } from "react-redux";
import { useLazyGetDepartmentPerformancesQuery } from "../../states/api/apiSlice";
import { useEffect, useMemo, useState } from "react";
import formatFunds from "../../utils/Funds";
import Table from "../../components/table/Table";
import moment from "moment";
import Loading from "../../components/Loading";
import { toast } from "react-toastify";

const Performances = () => {

  // STATE VARIABLES
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState([])

  const [getDepartmentPerformances, {
    data: departmentPerformancesData,
    isLoading: departmentPerformancesLoading,
    isError: departmentPerformancesError,
    isSuccess: departmentPerformancesSuccess
  }] = useLazyGetDepartmentPerformancesQuery();


    useEffect(() => {
      getDepartmentPerformances({
        departmentId: user?.departments?.id,
        department: user?.department,
        month: moment().format('YYYY-MM')
      })
    }, [])

    useEffect(() => {
      if (departmentPerformancesSuccess) {
        setData(departmentPerformancesData?.data?.map((row, index) => {
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
        }))
      } else if (departmentPerformancesError) {
        setData([])
        toast.error('Error fetching performances. Please try again.')
      }
    }, [departmentPerformancesData])

    // COLUMNS
    const columns = useMemo(() => ([
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
        filter: true
      },
      {
        id: 'sector',
        Header: 'Sector',
        accessor: 'sector',
        sortable: true
      },
      {
        id: 'district',
        Header: 'District',
        accessor: 'district',
        sortable: true,
      },
      {
        id: 'province',
        Header: 'Province',
        accessor: 'province',
        sortable: true,
      },
      {
        id: 'monthlyTarget',
        Header: 'Target',
        accessor: 'monthlyTarget',
        sortable: true
      },
      {
        id: 'monthlyCollections',
        Header: 'Progress',
        accessor: 'monthlyCollections',
        sortable: true
      },
      {
        id: 'difference',
        Header: 'REMAIN',
        accessor: 'difference',
        sortable: true
      },
      {
        id: 'percentage',
        Header: 'Percentage',
        accessor: 'percentage',
        sortable: true,
        filter: true
      }
    ]), []);

  return (
    <main className="p-6 flex flex-col gap-6">
      {departmentPerformancesLoading && (
        <span className="flex flex-col gap-3 items-center justify-center min-h-[60vh]">
          <h1 className="text-primary uppercase text-lg font-semibold">
            Loading Performances...
          </h1>
          <Loading />
        </span>
      )}
      {departmentPerformancesSuccess && (
        <Table data={data} columns={columns} user={user} />
      )}
    </main>
  )
}

export default Performances;
