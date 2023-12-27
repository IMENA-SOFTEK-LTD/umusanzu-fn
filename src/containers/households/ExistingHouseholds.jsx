import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import {
  useGlobalFilter,
  useTable,
  useAsyncDebounce,
  useFilters,
  useSortBy,
  usePagination,
} from 'react-table'
import Input from '../../components/Input'
import {
  setPage,
  setSize,
  setTotalPages,
} from '../../states/features/pagination/paginationSlice'
import Button, { PageButton } from '../../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { useDispatch, useSelector } from 'react-redux'
import { setMoveHouseholdModal } from '../../states/features/modals/householdSlice'
import { useCreateDuplicateHouseHoldMutation, useRequestMoveHouseholdMutation } from '../../states/api/apiSlice'
import Loading from '../../components/Loading'

const ExistingHouseholds = ({ conflict = false, households }) => {
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
  const [requestMoveHousehold, {
    data: requestMoveHouseholdData,
    isLoading: requestMoveHouseholdLoading,
    isSuccess: requestMoveHouseholdSuccess,
    isError: requestMoveHouseholdError,
  }] = useRequestMoveHouseholdMutation()

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
          <span className="flex flex-col items-start gap-[4px]">
            <Button
              className="!p-2 !text-[14px]"
              value={
                requestMoveHouseholdLoading ? <Loading /> :
                user?.departments?.level_id === 6
                  ? 'Saba kumwimura'
                  : 'Request move'
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
        Filter: SelectColumnFilter,
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

  return (
    <section className={`${conflict ? 'flex' : 'hidden'} my-4 w-full mx-auto`}>
      <div className="flex my-8 flex-col w-full items-center gap-6 relative">
        <div className="search-filter flex flex-col w-full items-center gap-6">
          <span className="flex flex-wrap items-center justify-between gap-4 w-full px-8 max-md:flex-col max-md:items-center">
            <span className="w-full flex flex-col items-end justify-center">
              <GlobalFilter
                preGlobalFilteredRows={preGlobalFilteredRows}
                globalFilter={state.globalFilter}
                setGlobalFilter={setGlobalFilter}
              />
            </span>
          </span>
          <span className="w-[95%] mx-auto h-fit flex items-center flex-wrap gap-4 justify-center max-md:justify-center">
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
                {createDuplicateHouseholdLoading ||
                requestMoveHouseholdLoading ? (
                  <span className="flex items-center justify-center min-h-[30vh] flex-col gap4">
                    <Loading />
                    <h4 className="uppercase text-primary text-center text-lg font-bold">
                      Creating household...
                    </h4>
                  </span>
                ) : createDuplicateHouseholdSuccess ||
                  requestMoveHouseholdSuccess ? (
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
                      <Button
                        value="Return to households"
                        route="/households"
                      />
                    )}
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
    </section>
  )
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
    <form className="flex gap-4 items-center w-full max-w-[20rem] mx-auto max-md:flex-col max-md:items-center">
      <Input
        type="text"
        className="p-2 outline-[2px] w-full max-w-[20rem] border-[1px] border-primary rounded-md outline-primary focus:outline-primary"
        value={value || ''}
        onChange={(e) => {
          setValue(e.target.value)
          onChange(e.target.value)
        }}
        placeholder={`Filter from ${count} households...`}
      />
      <Button
        value={
          <FontAwesomeIcon
            className="p-[10px] !rounded-[50%]"
            icon={faSearch}
          />
        }
        className="!p-0 !py-0 !px-0 !rounded-[50%]"
        onClick={() => {
          setGlobalFilter(value || undefined)
        }}
      />
    </form>
  )
}

ExistingHouseholds.propTypes = {
  conflict: PropTypes.bool,
  households: PropTypes.array.isRequired,
}

export default ExistingHouseholds
