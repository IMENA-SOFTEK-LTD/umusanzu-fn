import { useEffect, useState } from 'react'
import { useLazyGetCellVillagesQuery, useLazyGetDistrictCellsQuery, useLazyGetSectorVillagesQuery } from '../../states/api/apiSlice'
import { DepartmentModals } from './DepartmentModals'

const DepartmentsTable = ({ user }) => {
  const [
    getSectorVillages,
    {
      data: sectorVillagesData,
      isLoading: sectorVillagesIsLoading,
      isSuccess: sectorVillagesIsSuccess,
      isError: sectorVillagesIsError,
      error: sectorVillagesError,
    },
  ] = useLazyGetSectorVillagesQuery()

  const [
    getCellVillages,
    {
      data: cellVillagesData,
      isSuccess: cellVillagesIsSuccess,
      isLoading: cellVillagesIsLoading,
      isError: cellVillagesIsError,
      error: cellVillagesError,
    },
  ] = useLazyGetCellVillagesQuery()

  const [getDistrictCells, {
    data: districtCellsData,
    isLoading: districtCellsLoading,
    isSuccess: districtCellsIsSuccess,
    isError: districtCellsIsError,
    error: districtSuccessError,
  }] = useLazyGetDistrictCellsQuery()

  let department = ''

  switch (user?.departments?.level_id) {
    case 1:
      department = 'province'
      useEffect(() => {
        getCellVillages({ department, id: user?.departments?.id })
      }, [])
      break
    case 2:
      department = 'district'
      useEffect(() => {
        getDistrictCells({ department, id: user?.departments?.id })
      }, [])
      break
    case 3:
      department = 'sector'
      useEffect(() => {
        getSectorVillages({ department, id: user?.departments?.id })
      }, [])
      break
    case 4:
      department = 'cell'
      useEffect(() => {
        getCellVillages({ department, id: user?.departments?.id })
      }, [])
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

  useEffect(() => {
    getSectorVillages({ department: `${department}`, id: user?.departments?.id })
  }, [])

  return (
    <main>
      <DepartmentModals />
    </main>
  )
}

export default DepartmentsTable
