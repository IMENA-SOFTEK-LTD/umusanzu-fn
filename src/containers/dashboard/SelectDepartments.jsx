import PropTypes from 'prop-types'
import { Controller, useForm } from 'react-hook-form'
import Button from '../../components/Button'
import {
  useLazyGetCountryDistrictsQuery,
  useLazyGetDistrictSectorsQuery,
} from '../../states/api/apiSlice'
import {
  setDistricts,
  setSectors,
  setSelectedDistrict,
  setSelectedProvince,
  setSelectedSector,
} from '../../states/features/modals/householdSlice'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  setSectorId,
  setDistrictId,
  setProvinceId,
} from '../../states/features/departments/departmentSlice'
import { setUserOrSelectedDepartmentNames } from '../../states/features/departments/departmentSlice'
import HouseHoldFilter from './HouseHoldFilter'
import { toast } from 'react-toastify'

const SelectDepartments = ({ user }) => {
  const { handleSubmit, control } = useForm()

  const {
    districts,
    sectors,
    selectedDistrict,
    selectedProvince,
    selectedSector,
    cells,
    selectedCell,
    villages,
    selectedVillage,
    householdConflict,
    existingHousehold,
    moveHouseholdModal,
  } = useSelector((state) => state.household)

  const { pathRoute } = useSelector((state) => state.sidebar)

  const dispatch = useDispatch()

  const navigate = useNavigate()

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

  /**
   *
   * FETCHING DEPARTMENTS CHILDREN
   */

  return (
    <main className="h-[80vh] flex flex-col items-center justify-center gap-2">
      <h1 className="text-center text-[25px]">
        Please select a sector before proceeding
      </h1>
      <HouseHoldFilter
        user={user}
        fieldEnabled={{
          province: ['country'].includes(department),
          district: ['country', 'province'].includes(department),
          sector: ['country', 'province', 'district'].includes(department),
          cell: true,
          village: true,
          status: false,
          searchTerm: false,
        }}
        onChange={(query) => {
          if (
            query.province ||
            query.district ||
            query.sector ||
            query.cell ||
            query.village ||
            query.status ||
            query.searchTerm
          ) {
            navigate(pathRoute + '?' + new URLSearchParams(query).toString())
          } else {
            toast.info('Please search anything...')
          }
        }}
      />
    </main>
  )
}

SelectDepartments.propTypes = {
  user: PropTypes.object.isRequired,
}

export default SelectDepartments
