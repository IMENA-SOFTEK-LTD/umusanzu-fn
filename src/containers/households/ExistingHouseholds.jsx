import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import Button from '../../components/Button'
import { useDispatch, useSelector } from 'react-redux'
import { setMoveHouseholdModal } from '../../states/features/modals/householdSlice'
import {
  useCreateDuplicateHouseHoldMutation,
  useRequestMoveHouseholdMutation,
} from '../../states/api/apiSlice'
import Loading from '../../components/Loading'
import Table from '../../components/table/Table'

const ExistingHouseholds = ({ conflict = false, households }) => {
  const { userOrSelectedDepartmentNames } = useSelector((state) => state.departments)
  const [data, setData] = useState(
    households?.map((row, index) => {
      return {
        id: index + 1,
        name: row?.name,
        nid: row?.nid,
        phone1: row?.phone1,
        phone2: row?.phone2,
        ubudehe: row?.ubudehe,
        status: row?.status,
        village: row?.villages[0]?.name,
        cell: row?.cells[0]?.name,
        sector: row?.sectors[0]?.name,
        district: row?.districts[0]?.name,
        province: row?.provinces[0]?.name,
        ID: row?.id,
      }
    })
  )

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

  const user = JSON.parse(localStorage.getItem('user'))

  const dispatch = useDispatch()

  useEffect(() => {
    setData(
      households?.map((row, index) => {
        return {
          id: index + 1,
          name: row?.name,
          phone1: row?.phone1,
          nid: row?.nid,
          phone2: row?.phone2,
          ubudehe: row?.ubudehe,
          status: row?.status,
          village: row?.villages[0]?.name,
          cell: row?.cells[0]?.name,
          sector: row?.sectors[0]?.name,
          district: row?.districts[0]?.name,
          province: row?.provinces[0]?.name,
          ID: row?.id,
          villageId: row?.village,
          cellId: row?.cell,
          sectorId: row?.sector,
          districtId: row?.district,
          provinceId: row?.province,
        }
      })
    )
    return () => {
      setData([])
    }
  }, [households])

  const columns = useMemo(
    () => [
      {
        id: 'ID',
        Header: 'Details',
        accessor: 'ID',
        Cell: ({ row }) => (
          <span className="flex flex-col items-start gap-[4px] min-w-fit">
            <Button
              className="!p-2 !text-[14px]"
              value={
                requestMoveHouseholdLoading ? (
                  <Loading />
                ) : user?.departments?.level_id === 6 ? (
                  'Saba kumwimura'
                ) : (
                  'Request move'
                )
              }
              onClick={(e) => {
                e.preventDefault()
                requestMoveHousehold({
                  id: row?.original?.ID,
                })
                dispatch(setMoveHouseholdModal(true))
              }}
            />
            <Button
              className="!p-2 !text-[14px]"
              value={
                user?.departments?.level_id === 6
                  ? 'Fungura irindi shami'
                  : 'Create another branch'
              }
              onClick={() => {
                createDuplicateHousehold({
                  name: row?.original?.name,
                  nid: row?.original?.nid,
                  province: row?.original?.provinceId,
                  district: row?.original?.districtId,
                  sector: row?.original?.sectorId,
                  cell: row?.original?.cellId,
                  phone1: row?.original?.phone1,
                  phone2: row?.original?.phone2,
                  ubudehe: row?.original?.ubudehe,
                  type: row?.original?.type,
                  village: row?.original?.villageId,
                })
              }}
            />
          </span>
        ),
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
    <main
      className={`${
        !conflict && 'hidden'
      } flex items-center justify-center w-full flex-col`}
    >
      {createDuplicateHouseholdLoading || requestMoveHouseholdLoading ? (
        <span className="flex items-center justify-center min-h-[30vh] flex-col gap4">
          <Loading />
          <h4 className="uppercase text-primary text-center text-lg font-bold">
            Creating household...
          </h4>
        </span>
      ) : createDuplicateHouseholdSuccess || requestMoveHouseholdSuccess ? (
        <span className="flex flex-col items-center justify-center gap-4 min-h-[50vh]">
          <h4 className="uppercase text-primary text-center text-lg font-bold">
            Household {createDuplicateHouseholdSuccess ? 'created' : 'moved'}{' '}
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
      ) : createDuplicateHouseholdError || requestMoveHouseholdError ? (
        <span className="flex flex-col items-center justify-center gap-4 min-h-[50vh]">
          <h4 className="uppercase text-primary text-center text-lg font-bold">
            Error occurred while creating household
          </h4>
          <Button value="Return to households" route="/households" />
        </span>
      ) : null}
      {!(createDuplicateHouseholdSuccess || requestMoveHouseholdSuccess) && (
        <Table columns={columns} data={data} report={false} />
      )}
    </main>
  )
}

ExistingHouseholds.propTypes = {
  conflict: PropTypes.bool,
  households: PropTypes.array.isRequired,
}

export default ExistingHouseholds
