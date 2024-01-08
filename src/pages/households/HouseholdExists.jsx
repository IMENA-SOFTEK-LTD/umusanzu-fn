import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  useCreateDuplicateHouseHoldMutation,
  useLazyGetHouseholdsListQuery,
  useRequestMoveHouseholdMutation,
} from '../../states/api/apiSlice'
import { getDepartment } from '../../utils/User'
import { useEffect, useMemo } from 'react'
import Loading from '../../components/Loading'
import Table from '../../components/table/Table'
import Button from '../../components/Button'

const HouseholdExists = () => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const { user } = useSelector((state) => state.auth)
  const { duplicateHousehold } = useSelector((state) => state.household)

  //  NAVIGATE
  const navigate = useNavigate()

  // CREATE DUPLICATE HOUSEHOLD
  const [
    createDuplicateHousehold,
    {
      data: createDuplicateHouseholdData,
      isLoading: createDuplicateHouseholdLoading,
      isSuccess: createDuplicateHouseholdSuccess,
      isError: createDuplicateHouseholdError,
    },
  ] = useCreateDuplicateHouseHoldMutation()

  // REQUEST MOVE HOUSEHOLD
  const [
    requestMoveHousehold,
    {
      data: requestMoveHouseholdData,
      isLoading: requestMoveHouseholdLoading,
      isSuccess: requestMoveHouseholdSuccess,
      isError: requestMoveHouseholdError,
    },
  ] = useRequestMoveHouseholdMutation()

  // INITITALIZE  GET  HOUSEHOLDS  LIST   QUERY
  const [
    getHouseholdsList,
    {
      data: householdsListData,
      isLoading: householdsListLoading,
      isSuccess: householdsListSuccess,
      isError: householdsListError,
      error: householdsListErrorRes,
    },
  ] = useLazyGetHouseholdsListQuery()

  //  GET   DEPARTMENT
  const department = getDepartment(user?.departments?.level_id)

  const phone1 = queryParams.get('phone1')

  if (!phone1) {
    navigate('/households/create')
  }

  //  LIST HOUSEHOLDS
  useEffect(() => {
    getHouseholdsList({
      phone1,
      department,
      departmentId: user?.departments?.id,
      route: 'active',
    })
  }, [department, phone1])

  // HANDLE HOUSEHOLD RESPONSE
  useEffect(() => {
    if (householdsListSuccess && householdsListData?.data?.length > 0) {
      setData(
        householdsListData?.data?.rows?.map((household, index) => {
          return {
            ...household,
            no: index + 1,
          }
        })
      )
    } else if (
      householdsListSuccess &&
      householdsListData?.data?.length === 0
    ) {
      console.log('household does not exist')
    } else if (householdsListError) {
      console.log(householdsListErrorRes)
    }
  }, [householdsListSuccess, householdsListData])

  // COLUMNS
  const columns = useMemo(
    () => [
      {
        id: 'No',
        Header: 'No',
        accessor: 'no',
      },
      {
        id: 'ID',
        Header: 'Details',
        accessor: 'ID',
        Cell: ({ row }) => {
          return (
            <label className="flex flex-col  gap-1">
              <Button
                value="Fungura irindi shami"
                onClick={(e) => {
                  e.preventDefault()
                  createDuplicateHousehold({
                    ...duplicateHousehold,
                  })
                }}
              />
              <Button
                value="Saba kumwimura"
                onClick={(e) => {
                  e.preventDefault()
                  requestMoveHousehold({
                    id: row?.original?.id,
                  })
                }}
              />
            </label>
          )
        },
      },
      {
        Header: 'Status',
        accessor: 'status',
        filter: true,
        Cell: ({ row }) => (
          <p
            className={`${
              row?.original?.status === 'ACTIVE'
                ? 'bg-green-600'
                : row?.original?.status === 'MOVED'
                ? 'bg-yellow-700'
                : 'bg-red-600'
            } p-2 flex items-center justify-center text-white rounded-sm`}
          >
            {row?.original?.status}
          </p>
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
        filter: true,
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
        filter: true,
      },
      {
        Header: 'Cell',
        accessor: 'cell',
        sortable: true,
        filter: true,
      },
      {
        Header: 'Sector',
        accessor: 'sector',
        sortable: true,
        filter: true,
      },
      {
        Header: 'District',
        accessor: 'district',
        sortable: true,
        filter: true,
      },
      {
        Header: 'Province',
        accessor: 'province',
        sortable: true,
        filter: true,
      },
    ],
    []
  )

  return (
    <main className="p-6 flex  flex-col  gap-6">
      <section className="w-[95%] mx-auto">
        {householdsListLoading ||
        requestMoveHouseholdLoading ||
        createDuplicateHouseholdLoading ? (
          <span className="flex flex-col gap-3 min-h-[70vh] items-center justify-center">
            <Loading />
          </span>
        ) : householdsListSuccess &&
          !requestMoveHouseholdSuccess &&
          !createDuplicateHouseholdSuccess ? (
          <Table
            columns={columns}
            data={householdsListData?.data?.rows?.map((household, index) => {
              return {
                ...household,
                no: index + 1,
                village: household?.villages[0]?.name,
                cell: household?.cells[0]?.name,
                sector: household?.sectors[0]?.name,
                district: household?.districts[0]?.name,
                province: household?.provinces[0]?.name,
              }
            })}
          />
        ) : (
          (requestMoveHouseholdSuccess || createDuplicateHouseholdSuccess) && (
            <span className="flex flex-col items-center justify-center gap-4 min-h-[50vh]">
              <h4 className="uppercase text-primary text-center text-lg font-bold">
                Household{' '}
                {createDuplicateHouseholdSuccess ? 'created' : 'moved'}{' '}
                successfully
              </h4>
              {createDuplicateHouseholdSuccess && (
                <Button
                  value="View household"
                  route={`/households/${createDuplicateHouseholdData?.data?.id}`}
                />
              )}
              {requestMoveHouseholdSuccess && (
                <Button value="Return to households" route="/households" />
              )}
            </span>
          )
        )}
      </section>
    </main>
  )
}

export default HouseholdExists
