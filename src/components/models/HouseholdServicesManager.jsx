import { useMemo, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { toast } from 'react-toastify'
import Loading from '../Loading'
import Button from '../Button'
import {
  useGetHouseholdDepartmentServicesQuery,
  useAssignHouseholdDepartmentServiceMutation,
  useRemoveHouseholdDepartmentServiceMutation,
  useUpdateHouseholdDepartmentServiceStatusMutation,
  useGetDepartmentServicesQuery,
  useLazyGetCountryDistrictsQuery,
  useLazyGetDistrictSectorsQuery,
  useLazyGetSectorCellsQuery,
  useLazyGetCellVillagesQuery,
} from '../../states/api/apiSlice'
import { useSelector } from 'react-redux'

function normalizePayload(payload) {
  const root = payload?.data ?? payload
  if (Array.isArray(root)) return root
  if (Array.isArray(root?.rows)) return root.rows
  if (Array.isArray(root?.services)) return root.services
  if (Array.isArray(root?.data)) return root.data
  return []
}

function getDepartmentServiceId(item) {
  return (
    item?.department_service_id ??
    item?.department_service?.id ??
    item?.id ??
    item?.ID
  )
}

function getServiceLabel(item) {
  // Handle direct title on item (new structure)
  if (item?.title) return item.title

  const service = item?.department_service?.service ?? item?.service ?? item
  return (
    service?.title ??
    service?.title_english ??
    service?.title_french ??
    service?.name ??
    `Service #${getDepartmentServiceId(item)}`
  )
}

function getServiceTitleEnglish(item) {
  if (item?.title_english) return item.title_english

  const service = item?.department_service?.service ?? item?.service ?? item
  return service?.title_english ?? ''
}

function getServiceTitleFrench(item) {
  if (item?.title_french) return item.title_french

  const service = item?.department_service?.service ?? item?.service ?? item
  return service?.title_french ?? ''
}
function normalizeAllServicesPayload(payload) {
  // Supports common shapes for /api/v2/services:
  // - { data: [...] }
  // - { data: { rows: [...] } }
  // - { rows: [...] }
  // - [...]
  const root = payload?.data ?? payload

  if (Array.isArray(root)) return root
  if (Array.isArray(root?.rows)) return root.rows
  if (Array.isArray(root?.services)) return root.services
  if (Array.isArray(root?.data)) return root.data

  return []
}

export default function HouseholdServicesManager({
  householdId,
  ubudehe,
  status='ACTIVE',
  onChanged,
}) {
  const { user } = useSelector((state) => state.auth)
  const [selectedDepartmentServiceId, setSelectedDepartmentServiceId] =
    useState('')
  const [ubudeheInput, setUbudeheInput] = useState(ubudehe || '')
  const [householdType, setHouseholdType] = useState('Residence')

  // Location states
  const [selectedProvince, setSelectedProvince] = useState(null)
  const [selectedDistrict, setSelectedDistrict] = useState(null)
  const [selectedSector, setSelectedSector] = useState(null)
  const [selectedCell, setSelectedCell] = useState(null)
  const [selectedVillage, setSelectedVillage] = useState(null)

  // Location data states
  const [districts, setDistricts] = useState([])
  const [sectors, setSectors] = useState([])
  const [cells, setCells] = useState([])
  const [villages, setVillages] = useState([])

  const userLevelId = user?.departments?.level_id
  const userDepartmentId = user?.departments?.id

  // Get user's department sector ID based on level
  const getUserDepartmentSectorId = () => {
    switch (userLevelId) {
      case 6: // Agent
        return user?.departments?.parent?.parent?.id
      case 4: // Cell
        return user?.departments?.parent?.id
      case 3: // Sector
        return userDepartmentId
      case 2: // District
        return null // Will need to select sector
      case 1: // Province
        return null // Will need to select sector
      case 5: // Country
        return null // Will need to select sector
      default:
        return user?.myAddress?.sector?.id
    }
  }

  // Determine which sector_id to use: selectedSector or user's department sector
  const sectorIdForServices = selectedSector || getUserDepartmentSectorId()

  // Initialize location IDs based on user's department level
  useEffect(() => {
    if (!user?.departments) return

    switch (userLevelId) {
      case 6: // Agent - use user's village
        setSelectedVillage(userDepartmentId)
        setSelectedCell(user?.departments?.parent?.id)
        setSelectedSector(user?.departments?.parent?.parent?.id)
        setSelectedDistrict(user?.departments?.parent?.parent?.parent?.id)
        setSelectedProvince(
          user?.departments?.parent?.parent?.parent?.parent?.id
        )
        break
      case 4: // Cell - use user's cell
        setSelectedCell(userDepartmentId)
        setSelectedSector(user?.departments?.parent?.id)
        setSelectedDistrict(user?.departments?.parent?.parent?.id)
        setSelectedProvince(user?.departments?.parent?.parent?.parent?.id)
        break
      case 3: // Sector - use user's sector
        setSelectedSector(userDepartmentId)
        setSelectedDistrict(user?.departments?.parent?.id)
        setSelectedProvince(user?.departments?.parent?.parent?.id)
        break
      case 2: // District - use user's district
        setSelectedDistrict(userDepartmentId)
        setSelectedProvince(user?.departments?.parent?.id)
        break
      case 1: // Province - use user's province
        setSelectedProvince(userDepartmentId)
        break
      default:
        break
    }
  }, [user?.departments, userLevelId, userDepartmentId])

  // Fetch services based on selected sector or user's department sector
  const {
    data: allServicesData,
    isLoading: isLoadingAllServices,
    isFetching: isFetchingAllServices,
    isError: isAllServicesError,
  } = useGetDepartmentServicesQuery(
    { id: sectorIdForServices },
    { skip: !sectorIdForServices }
  )

  const allServices = useMemo(
    () => normalizeAllServicesPayload(allServicesData),
    [allServicesData]
  )

  useEffect(() => {
    if (ubudehe) {
      setUbudeheInput(ubudehe)
    }
  }, [ubudehe])

  // Lazy queries for location data
  const [
    getCountryDistricts,
    { data: countryDistrictsData, isLoading: countryDistrictsLoading },
  ] = useLazyGetCountryDistrictsQuery()

  const [
    getDistrictSectors,
    { data: districtSectorsData, isLoading: districtSectorsLoading },
  ] = useLazyGetDistrictSectorsQuery()

  const [
    getSectorCells,
    { data: sectorCellsData, isLoading: sectorCellsLoading },
  ] = useLazyGetSectorCellsQuery()

  const [
    getCellVillages,
    { data: cellVillagesData, isLoading: cellVillagesLoading },
  ] = useLazyGetCellVillagesQuery()

  // Fetch districts when province changes (for country level)
  useEffect(() => {
    if (userLevelId === 5 && selectedProvince) {
      getCountryDistricts({ id: selectedProvince })
    } else {
      setDistricts([])
    }
  }, [selectedProvince, userLevelId, getCountryDistricts])

  useEffect(() => {
    if (countryDistrictsData) {
      setDistricts(countryDistrictsData?.data?.rows || [])
    }
  }, [countryDistrictsData])

  // Fetch sectors when district changes
  useEffect(() => {
    if ((userLevelId === 5 || userLevelId === 2) && selectedDistrict) {
      getDistrictSectors({ id: selectedDistrict })
    } else {
      setSectors([])
    }
  }, [selectedDistrict, userLevelId, getDistrictSectors])

  useEffect(() => {
    if (districtSectorsData) {
      setSectors(districtSectorsData?.data?.rows || [])
    }
  }, [districtSectorsData])

  // Fetch cells when sector changes
  useEffect(() => {
    if (
      (userLevelId === 5 || userLevelId === 2 || userLevelId === 3) &&
      selectedSector
    ) {
      getSectorCells({ id: selectedSector })
    } else {
      setCells([])
    }
  }, [selectedSector, userLevelId, getSectorCells])

  useEffect(() => {
    if (sectorCellsData) {
      setCells(sectorCellsData?.data?.rows || [])
    }
  }, [sectorCellsData])

  // Fetch villages when cell changes
  useEffect(() => {
    if (
      (userLevelId === 5 ||
        userLevelId === 2 ||
        userLevelId === 3 ||
        userLevelId === 4) &&
      selectedCell
    ) {
      getCellVillages({ id: selectedCell })
    } else {
      setVillages([])
    }
  }, [selectedCell, userLevelId, getCellVillages])

  useEffect(() => {
    if (cellVillagesData) {
      setVillages(cellVillagesData?.data?.rows || [])
    }
  }, [cellVillagesData])

  // Reset child selections when parent changes
  useEffect(() => {
    if (userLevelId === 5) {
      setSelectedDistrict(null)
      setSelectedSector(null)
      setSelectedCell(null)
      setSelectedVillage(null)
    }
  }, [selectedProvince, userLevelId])

  useEffect(() => {
    if (userLevelId === 5 || userLevelId === 2) {
      setSelectedSector(null)
      setSelectedCell(null)
      setSelectedVillage(null)
    }
  }, [selectedDistrict, userLevelId])

  useEffect(() => {
    if (userLevelId === 5 || userLevelId === 2 || userLevelId === 3) {
      setSelectedCell(null)
      setSelectedVillage(null)
    }
  }, [selectedSector, userLevelId])

  useEffect(() => {
    if (
      userLevelId === 5 ||
      userLevelId === 2 ||
      userLevelId === 3 ||
      userLevelId === 4
    ) {
      setSelectedVillage(null)
    }
  }, [selectedCell, userLevelId])

  const {
    data: assignedData,
    isFetching: isFetchingAssigned,
    isLoading: isLoadingAssigned,
    isError: isAssignedError,
    refetch: refetchAssigned,
  } = useGetHouseholdDepartmentServicesQuery(
    { householdId },
    { skip: !householdId }
  )

  const {
    data: departmentServicesData,
    isLoading: isLoadingDepartmentServices,
    isFetching: isFetchingDepartmentServices,
    isError: isDepartmentServicesError,
  } = useGetDepartmentServicesQuery(
    { id: sectorIdForServices },
    { skip: !sectorIdForServices }
  )

  const [assignService, { isLoading: isAdding }] =
    useAssignHouseholdDepartmentServiceMutation()
  const [removeService, { isLoading: isRemoving }] =
    useRemoveHouseholdDepartmentServiceMutation()
  const [updateServiceStatus, { isLoading: isUpdatingStatus }] =
    useUpdateHouseholdDepartmentServiceStatusMutation()

  const allAssignedServices = useMemo(
    () => normalizePayload(assignedData),
    [assignedData]
  )

  // Filter services based on user's department level
  const assignedServices = useMemo(() => {
    if (!allAssignedServices || allAssignedServices.length === 0) {
      return []
    }

    const userLevelId = user?.departments?.level_id
    const userDepartmentId = user?.departments?.id

    // If country level (5), show all services
    if (userLevelId === 5) {
      return allAssignedServices
    }

    // Filter based on department level
    return allAssignedServices.filter((service) => {
      switch (userLevelId) {
        case 6: // Agent - filter by village_id
          return service?.village_id === userDepartmentId
        case 4: // Cell - filter by cell_id
          return service?.cell_id === userDepartmentId
        case 2: // District - filter by district_id
          return service?.district_id === userDepartmentId
        default:
          // For other levels or if no match, show all
          return true
      }
    })
  }, [allAssignedServices, user?.departments?.level_id, user?.departments?.id])

  const departmentServices = useMemo(
    () => normalizePayload(departmentServicesData),
    [departmentServicesData]
  )

  const onAssign = async () => {
    const trimmed = String(selectedDepartmentServiceId).trim()
    if (!trimmed) {
      toast.error('Please select a department service')
      return
    }

    const ubudeheValue = String(ubudeheInput).trim()
    if (!ubudeheValue) {
      toast.error('Ubudehe is required to assign service')
      return
    }

    // Validate location selections based on user level
    if (userLevelId === 5 && !selectedProvince) {
      toast.error('Please select a province')
      return
    }
    if ((userLevelId === 5 || userLevelId === 2) && !selectedDistrict) {
      toast.error('Please select a district')
      return
    }
    if (
      (userLevelId === 5 || userLevelId === 2 || userLevelId === 3) &&
      !selectedSector
    ) {
      toast.error('Please select a sector')
      return
    }
    if (
      (userLevelId === 5 ||
        userLevelId === 2 ||
        userLevelId === 3 ||
        userLevelId === 4) &&
      !selectedCell
    ) {
      toast.error('Please select a cell')
      return
    }
    if (
      (userLevelId === 5 ||
        userLevelId === 2 ||
        userLevelId === 3 ||
        userLevelId === 4) &&
      !selectedVillage
    ) {
      toast.error('Please select a village')
      return
    }

    // Get location IDs based on user level
    let provinceId = null
    let districtId = null
    let sectorId = null
    let cellId = null
    let villageId = null

    switch (userLevelId) {
      case 6: // Agent - use user's department IDs
        villageId = userDepartmentId
        cellId = user?.departments?.parent?.id
        sectorId = user?.departments?.parent?.parent?.id
        districtId = user?.departments?.parent?.parent?.parent?.id
        provinceId = user?.departments?.parent?.parent?.parent?.parent?.id
        break
      case 4: // Cell - use user's cell, allow village selection
        villageId = selectedVillage
        cellId = userDepartmentId
        sectorId = user?.departments?.parent?.id
        districtId = user?.departments?.parent?.parent?.id
        provinceId = user?.departments?.parent?.parent?.parent?.id
        break
      case 3: // Sector - use user's sector, allow cell and village selection
        villageId = selectedVillage
        cellId = selectedCell
        sectorId = userDepartmentId
        districtId = user?.departments?.parent?.id
        provinceId = user?.departments?.parent?.parent?.id
        break
      case 2: // District - use user's district, allow sector, cell, and village selection
        villageId = selectedVillage
        cellId = selectedCell
        sectorId = selectedSector
        districtId = userDepartmentId
        provinceId = user?.departments?.parent?.id
        break
      case 5: // Country - allow all selections
        villageId = selectedVillage
        cellId = selectedCell
        sectorId = selectedSector
        districtId = selectedDistrict
        provinceId = selectedProvince
        break
      default:
        break
    }

    try {
      await assignService({
        household_id: householdId,
        department_service_id: trimmed,
        ubudehe: ubudeheValue,
        householdType: householdType,
        province_id: provinceId,
        district_id: districtId,
        sector_id: sectorId,
        cell_id: cellId,
        village_id: villageId,
      }).unwrap()
      toast.success('Service assigned successfully')
      setSelectedDepartmentServiceId('')
      setUbudeheInput(ubudehe || '')
      setHouseholdType('Residence')
      // Reset location selections if needed
      if (userLevelId === 5) {
        setSelectedProvince(null)
        setSelectedDistrict(null)
        setSelectedSector(null)
        setSelectedCell(null)
        setSelectedVillage(null)
      } else if (userLevelId === 2) {
        setSelectedSector(null)
        setSelectedCell(null)
        setSelectedVillage(null)
      } else if (userLevelId === 3) {
        setSelectedCell(null)
        setSelectedVillage(null)
      } else if (userLevelId === 4) {
        setSelectedVillage(null)
      }
      onChanged && onChanged()
    } catch (e) {
      if (!e?.data?.message) toast.error('Failed to assign service')
    }
  }

  const onRemove = async (item) => {
    const id = item?.id ?? item?.ID
    if (!id) return

    try {
      await removeService({ id }).unwrap()
      toast.success('Service removed successfully')
      onChanged && onChanged()
    } catch (e) {
      if (!e?.data?.message) toast.error('Failed to remove service')
    }
  }

  const onUpdateStatus = async (item, newStatus) => {
    const id = item?.id ?? item?.ID
    if (!id) return

    try {
      await updateServiceStatus({
        id,
        status: newStatus,
        household_id: householdId,
      }).unwrap()
      toast.success(
        `Service ${
          newStatus === 'Active' ? 'activated' : 'deactivated'
        } successfully`
      )
      onChanged && onChanged()
    } catch (e) {
      if (!e?.data?.message) toast.error('Failed to update service status')
    }
  }

  return (
    <div className="space-y-4 mt-4">
      {parseInt(user?.staff_role) === 1 && status==='ACTIVE' && ( 
      <div className="rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col gap-3">
          {/* Location Dropdowns based on user department level */}
          {userLevelId !== 6 && (
            <div className="flex flex-col md:flex-row md:items-end gap-3">
              {/* Province - Only for Country level */}
              {userLevelId === 5 && (
                <div className="flex-1">
                  <label className="block mb-2 text-sm font-medium text-black">
                    Province <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedProvince || ''}
                    onChange={(e) =>
                      setSelectedProvince(Number(e.target.value))
                    }
                    className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4 bg-white"
                    disabled={isAdding || !householdId}
                  >
                    <option value="">Select Province</option>
                    <option value={31}>Kigali City</option>
                    <option value={1540}>Western Province</option>
                    <option value={1678}>Northern Province</option>
                    <option value={1836}>Eastern Province</option>
                    <option value={1986}>Southern Province</option>
                  </select>
                </div>
              )}

              {/* District - For Country and District levels */}
              {(userLevelId === 5 || userLevelId === 2) && (
                <div className="flex-1">
                  <label className="block mb-2 text-sm font-medium text-black">
                    District <span className="text-red-500">*</span>
                    {countryDistrictsLoading && ' Loading...'}
                  </label>
                  <select
                    value={selectedDistrict || ''}
                    onChange={(e) =>
                      setSelectedDistrict(Number(e.target.value))
                    }
                    className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4 bg-white"
                    disabled={
                      isAdding ||
                      !householdId ||
                      !selectedProvince ||
                      countryDistrictsLoading
                    }
                  >
                    <option value="">Select District</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sector - For Country, District, and Sector levels */}
              {(userLevelId === 5 ||
                userLevelId === 2 ||
                userLevelId === 3) && (
                <div className="flex-1">
                  <label className="block mb-2 text-sm font-medium text-black">
                    Sector <span className="text-red-500">*</span>
                    {districtSectorsLoading && ' Loading...'}
                  </label>
                  <select
                    value={selectedSector || ''}
                    onChange={(e) => setSelectedSector(Number(e.target.value))}
                    className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4 bg-white"
                    disabled={
                      isAdding ||
                      !householdId ||
                      !selectedDistrict ||
                      districtSectorsLoading
                    }
                  >
                    <option value="">Select Sector</option>
                    {sectors.map((sector) => (
                      <option key={sector.id} value={sector.id}>
                        {sector.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Cell - For Country, District, Sector, and Cell levels */}
              {(userLevelId === 5 ||
                userLevelId === 2 ||
                userLevelId === 3 ||
                userLevelId === 4) && (
                <div className="flex-1">
                  <label className="block mb-2 text-sm font-medium text-black">
                    Cell <span className="text-red-500">*</span>
                    {sectorCellsLoading && ' Loading...'}
                  </label>
                  <select
                    value={selectedCell || ''}
                    onChange={(e) => setSelectedCell(Number(e.target.value))}
                    className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4 bg-white"
                    disabled={
                      isAdding ||
                      !householdId ||
                      !selectedSector ||
                      sectorCellsLoading
                    }
                  >
                    <option value="">Select Cell</option>
                    {cells.map((cell) => (
                      <option key={cell.id} value={cell.id}>
                        {cell.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Village - For Country, District, Sector, and Cell levels */}
              {(userLevelId === 5 ||
                userLevelId === 2 ||
                userLevelId === 3 ||
                userLevelId === 4) && (
                <div className="flex-1">
                  <label className="block mb-2 text-sm font-medium text-black">
                    Village <span className="text-red-500">*</span>
                    {cellVillagesLoading && ' Loading...'}
                  </label>
                  <select
                    value={selectedVillage || ''}
                    onChange={(e) => setSelectedVillage(Number(e.target.value))}
                    className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4 bg-white"
                    disabled={
                      isAdding ||
                      !householdId ||
                      !selectedCell ||
                      cellVillagesLoading
                    }
                  >
                    <option value="">Select Village</option>
                    {villages.map((village) => (
                      <option key={village.id} value={village.id}>
                        {village.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
          <div className="flex flex-col md:flex-row md:items-end gap-3">
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium text-black">
                Assign service
              </label>
              <select
                value={selectedDepartmentServiceId}
                onChange={(e) => setSelectedDepartmentServiceId(e.target.value)}
                className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4 bg-white"
                disabled={
                  isAdding ||
                  !householdId ||
                  !sectorIdForServices ||
                  isLoadingAllServices ||
                  isFetchingAllServices
                }
              >
                <option value="">
                  {isLoadingAllServices || isFetchingAllServices
                    ? 'Loading services...'
                    : 'Select a service'}
                </option>
                {allServices.map((ds) => {
                  const service = ds?.service ?? {}
                  return (
                    <option
                      key={ds?.id ?? JSON.stringify(ds)}
                      value={ds?.id ?? ''}
                    >
                      {service?.title ??
                        service?.title_english ??
                        service?.title_french ??
                        `Service #${ds?.id ?? ''}`}
                    </option>
                  )
                })}
              </select>
              {isAllServicesError && (
                <p className="text-xs text-red-600 mt-2">
                  Failed to load services list.
                </p>
              )}
            </div>
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium text-black">
                Ubudehe <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={ubudeheInput}
                onChange={(e) => setUbudeheInput(e.target.value)}
                placeholder="Enter ubudehe"
                className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                disabled={isAdding || !householdId}
              />
              {/* {ubudehe && (
                <p className="text-xs text-gray-500 mt-2">
                  Default: {ubudehe} (from household)
                </p>
              )} */}
            </div>
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium text-black">
                Household Type
              </label>
              <select
                value={householdType}
                onChange={(e) => setHouseholdType(e.target.value)}
                className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4 bg-white"
                disabled={isAdding || !householdId}
              >
                <option value="Residence">Residence</option>
                <option value="Business">Business</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end gap-3">
            <div className="md:w-48">
              <Button
                type="button"
                submit
                disabled={
                  isAdding ||
                  !householdId ||
                  !selectedDepartmentServiceId ||
                  !ubudeheInput ||
                  isLoadingDepartmentServices ||
                  isFetchingDepartmentServices
                }
                value={isAdding ? <Loading /> : 'Assign'}
                onClick={onAssign}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
       )} 

      <div className="rounded-lg border border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="font-medium text-gray-900">Assigned services</div>
          <button
            type="button"
            onClick={() => refetchAssigned()}
            disabled={isFetchingAssigned || isLoadingAssigned}
            className="text-sm text-primary hover:underline disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        <div className="p-4">
          {(isLoadingAssigned || isFetchingAssigned) && (
            <div className="flex justify-center py-6">
              <Loading />
            </div>
          )}

          {!isLoadingAssigned && !isFetchingAssigned && isAssignedError && (
            <div className="text-sm text-red-600">
              Failed to load assigned services. Please try again.
            </div>
          )}

          {!isLoadingAssigned &&
            !isFetchingAssigned &&
            !isAssignedError &&
            assignedServices.length === 0 && (
              <div className="text-sm text-gray-600">
                No services assigned to this household.
              </div>
            )}

          {!isLoadingAssigned &&
            !isFetchingAssigned &&
            !isAssignedError &&
            assignedServices.length > 0 && (
              <ul className="space-y-2">
                {assignedServices.map((item) => {
                  const titleEnglish = getServiceTitleEnglish(item)
                  const titleFrench = getServiceTitleFrench(item)

                  return (
                    <li
                      key={item?.id ?? JSON.stringify(item)}
                      className={`flex items-start justify-between gap-3 rounded-md border px-3 py-2 ${
                        item?.status === 'Inactive' ||
                        item?.status === 'inactive'
                          ? 'border-gray-300 bg-gray-50 opacity-75'
                          : 'border-gray-100'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {getServiceLabel(item)}
                        </div>
                        {(titleEnglish || titleFrench) && (
                          <div className="text-xs text-gray-500 truncate">
                            {titleEnglish ? `EN: ${titleEnglish}` : ''}
                            {titleEnglish && titleFrench ? ' • ' : ''}
                            {titleFrench ? `FR: ${titleFrench}` : ''}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-3 mt-2">
                          {item?.ubudehe && (
                            <div className="text-xs text-gray-500">
                              <span className="font-medium">Amount:</span>{' '}
                              {item.ubudehe}
                            </div>
                          )}
                          {item?.householdType && (
                            <div className="text-xs text-gray-500">
                              <span className="font-medium">Type:</span>{' '}
                              <span
                                className={`font-medium ${
                                  item.householdType === 'Residence'
                                    ? 'text-blue-600'
                                    : 'text-orange-600'
                                }`}
                              >
                                {item.householdType}
                              </span>
                            </div>
                          )}
                          {item?.status && (
                            <div className="text-xs text-gray-500">
                              <span className="font-medium">Status:</span>{' '}
                              <span
                                className={`font-medium ${
                                  item.status === 'Active'
                                    ? 'text-green-600'
                                    : 'text-gray-600'
                                }`}
                              >
                                {item.status}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Location Information */}
                        {(item?.village ||
                          item?.cell ||
                          item?.sector ||
                          item?.district ||
                          item?.province) && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="text-xs text-gray-500 font-medium mb-1">
                              Location:
                            </div>
                            <div className="text-xs text-gray-600 flex flex-wrap gap-2">
                              {item?.village && (
                                <span>
                                  Village:{' '}
                                  <span className="font-medium">
                                    {item.village}
                                  </span>
                                </span>
                              )}
                              {item?.cell && (
                                <span>
                                  Cell:{' '}
                                  <span className="font-medium">
                                    {item.cell}
                                  </span>
                                </span>
                              )}
                              {item?.sector && (
                                <span>
                                  Sector:{' '}
                                  <span className="font-medium">
                                    {item.sector}
                                  </span>
                                </span>
                              )}
                              {item?.district && (
                                <span>
                                  District:{' '}
                                  <span className="font-medium">
                                    {item.district}
                                  </span>
                                </span>
                              )}
                              {item?.province && (
                                <span>
                                  Province:{' '}
                                  <span className="font-medium">
                                    {item.province}
                                  </span>
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Dates */}
                        {(item?.created_at || item?.updated_at) && (
                          <div className="mt-1 text-xs text-gray-400">
                            {item?.created_at && (
                              <span>
                                Created:{' '}
                                {new Date(item.created_at).toLocaleDateString()}
                              </span>
                            )}
                            {item?.created_at && item?.updated_at && ' • '}
                            {item?.updated_at && (
                              <span>
                                Updated:{' '}
                                {new Date(item.updated_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {status==='ACTIVE' && (
                      <div className="flex gap-2 items-center flex-shrink-0">
                        {/* {parseInt(user?.staff_role) === 1 && ( */}
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateStatus(
                              item,
                              item?.status === 'Active' ||
                                item?.status === 'active'
                                ? 'Inactive'
                                : 'Active'
                            )
                          }
                          disabled={isUpdatingStatus}
                          className={`text-sm hover:underline disabled:opacity-50 ${
                            item?.status === 'Active' ||
                            item?.status === 'active'
                              ? 'text-orange-600'
                              : 'text-green-600'
                          }`}
                          title={
                            item?.status === 'Active' ||
                            item?.status === 'active'
                              ? 'Deactivate service'
                              : 'Activate service'
                          }
                        >
                          {item?.status === 'Active' ||
                          item?.status === 'active'
                            ? 'Deactivate'
                            : 'Activate'}
                        </button>
                        {/* )} */}
                        {(item?.status === 'Active' ||
                          item?.status === 'active') && (
                            <button
                              type="button"
                              onClick={() => onRemove(item)}
                              disabled={isRemoving}
                              className="text-sm text-red-600 hover:underline disabled:opacity-50"
                            >
                              Remove
                            </button>
                          )}
                      </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
        </div>
      </div>
    </div>
  )
}

HouseholdServicesManager.propTypes = {
  householdId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  ubudehe: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChanged: PropTypes.func,
}
