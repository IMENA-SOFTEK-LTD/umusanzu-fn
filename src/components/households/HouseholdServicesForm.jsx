import { useMemo, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { toast } from 'react-toastify'
import Loading from '../Loading'
import Button from '../Button'
import {
  useGetDepartmentServicesQuery,
  useLazyGetCountryDistrictsQuery,
  useLazyGetDistrictSectorsQuery,
  useLazyGetSectorCellsQuery,
  useLazyGetCellVillagesQuery,
} from '../../states/api/apiSlice'
import { useSelector } from 'react-redux'

function normalizeAllServicesPayload(payload) {
  const root = payload?.data ?? payload

  if (Array.isArray(root)) return root
  if (Array.isArray(root?.rows)) return root.rows
  if (Array.isArray(root?.services)) return root.services
  if (Array.isArray(root?.data)) return root.data

  return []
}

function getServiceIdFromDepartmentService(item) {
  return (
    item?.service?.id ??
    item?.service_id ??
    item?.serviceId ??
    item?.service?.ID ??
    item?.service?.id
  )
}

function getServiceIdFromServiceItem(item) {
  const service = item?.service ?? item
  return (
    service?.service?.id ??
    service?.service_id ??
    service?.serviceId ??
    service?.id ??
    service?.ID
  )
}

export default function HouseholdServicesForm({ onServicesChange }) {
  const { user } = useSelector((state) => state.auth)
  const [selectedDepartmentServiceId, setSelectedDepartmentServiceId] =
    useState('')
  const [ubudeheInput, setUbudeheInput] = useState('')
  const [householdType, setHouseholdType] = useState('Residence')
  const [services, setServices] = useState([])
  const [editingIndex, setEditingIndex] = useState(null)

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
        return selectedSector || null
      case 1: // Province
        return selectedSector || null
      case 5: // Country
        return selectedSector || null
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
      case 6: // Agent - auto-fill all from user's department
        setSelectedVillage(userDepartmentId)
        setSelectedCell(user?.departments?.parent?.id)
        setSelectedSector(user?.departments?.parent?.parent?.id)
        setSelectedDistrict(user?.departments?.parent?.parent?.parent?.id)
        setSelectedProvince(
          user?.departments?.parent?.parent?.parent?.parent?.id
        )
        break
      case 4: // Cell - auto-fill province, district, sector, cell; user selects village
        setSelectedCell(userDepartmentId)
        setSelectedSector(user?.departments?.parent?.id)
        setSelectedDistrict(user?.departments?.parent?.parent?.id)
        setSelectedProvince(user?.departments?.parent?.parent?.parent?.id)
        break
      case 3: // Sector - auto-fill province, district, sector; user selects cell and village
        setSelectedSector(userDepartmentId)
        setSelectedDistrict(user?.departments?.parent?.id)
        setSelectedProvince(user?.departments?.parent?.parent?.id)
        break
      case 2: // District - auto-fill province and district; user selects sector, cell, village
        setSelectedDistrict(userDepartmentId)
        setSelectedProvince(user?.departments?.parent?.id)
        break
      case 1: // Province - auto-fill province; user selects district, sector, cell, village
        setSelectedProvince(userDepartmentId)
        break
      default:
        break
    }
  }, [user?.departments, userLevelId, userDepartmentId])

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

  // Fetch districts when province changes (for province level)
  useEffect(() => {
    if (userLevelId === 1 && selectedProvince) {
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

  // Fetch sectors when district changes (for province and district levels)
  useEffect(() => {
    if ((userLevelId === 1 || userLevelId === 2) && selectedDistrict) {
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

  // Fetch cells when sector changes (for province, district, and sector levels)
  useEffect(() => {
    if (
      (userLevelId === 1 || userLevelId === 2 || userLevelId === 3) &&
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

  // Fetch villages when cell changes (for province, district, sector, and cell levels)
  useEffect(() => {
    if (
      (userLevelId === 1 ||
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
    if (userLevelId === 1) {
      setSelectedDistrict(null)
      setSelectedSector(null)
      setSelectedCell(null)
      setSelectedVillage(null)
    }
  }, [selectedProvince, userLevelId])

  useEffect(() => {
    if (userLevelId === 1 || userLevelId === 2) {
      setSelectedSector(null)
      setSelectedCell(null)
      setSelectedVillage(null)
    }
  }, [selectedDistrict, userLevelId])

  useEffect(() => {
    if (userLevelId === 1 || userLevelId === 2 || userLevelId === 3) {
      setSelectedCell(null)
      setSelectedVillage(null)
    }
  }, [selectedSector, userLevelId])

  useEffect(() => {
    if (
      userLevelId === 1 ||
      userLevelId === 2 ||
      userLevelId === 3 ||
      userLevelId === 4
    ) {
      setSelectedVillage(null)
    }
  }, [selectedCell, userLevelId])

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
  const filteredServices = useMemo(() => {
    const numericLevelId = Number(userLevelId)
    if (numericLevelId === 6 || numericLevelId === 4) {
      return allServices.filter(
        (ds) => getServiceIdFromDepartmentService(ds) !== 2
      )
    }
    return allServices
  }, [allServices, userLevelId])

  const selectedDepartmentService = useMemo(
    () =>
      allServices.find(
        (ds) => String(ds?.id) === String(selectedDepartmentServiceId)
      ),
    [allServices, selectedDepartmentServiceId]
  )
  const isPsfSelected = useMemo(() => {
    const serviceId = getServiceIdFromDepartmentService(selectedDepartmentService)
    return serviceId === 2
  }, [selectedDepartmentService])

  useEffect(() => {
    if (isPsfSelected) {
      setHouseholdType('Business')
    }
  }, [isPsfSelected])

  // Helper function to get location names
  const getLocationNames = (provinceId, districtId, sectorId, cellId, villageId) => {
    const provinceNames = {
      31: 'Kigali City',
      1540: 'Western Province',
      1678: 'Northern Province',
      1836: 'Eastern Province',
      1986: 'Southern Province',
    }

    // Get names from arrays first (for selected items from dropdowns)
    let provinceName = provinceId ? (provinceNames[provinceId] || null) : null
    let districtName = districtId ? (districts.find(d => d.id === districtId)?.name || null) : null
    let sectorName = sectorId ? (sectors.find(s => s.id === sectorId)?.name || null) : null
    let cellName = cellId ? (cells.find(c => c.id === cellId)?.name || null) : null
    let villageName = villageId ? (villages.find(v => v.id === villageId)?.name || null) : null

    // If names not found in arrays, try getting from selected values (for auto-filled from user department)
    // This handles cases where the location is from user's department and may not be in our loaded arrays
    
    // Try getting from currently selected values if they match
    if (!villageName && villageId === selectedVillage && villages.length > 0) {
      villageName = villages.find(v => v.id === villageId)?.name || null
    }
    if (!cellName && cellId === selectedCell && cells.length > 0) {
      cellName = cells.find(c => c.id === cellId)?.name || null
    }
    if (!sectorName && sectorId === selectedSector && sectors.length > 0) {
      sectorName = sectors.find(s => s.id === sectorId)?.name || null
    }
    if (!districtName && districtId === selectedDistrict && districts.length > 0) {
      districtName = districts.find(d => d.id === districtId)?.name || null
    }

    // Try getting from user department structure for auto-filled locations
    if (!villageName && villageId) {
      // Check if this village is from user's department
      if (userLevelId === 6 && villageId === userDepartmentId) {
        villageName = user?.departments?.name || null
      } else if (userLevelId === 4 && villageId === selectedVillage) {
        // Village is selected, should be in villages array
        villageName = villages.find(v => v.id === villageId)?.name || null
      }
    }

    if (!cellName && cellId) {
      if ((userLevelId === 6 && cellId === user?.departments?.parent?.id) ||
          (userLevelId === 4 && cellId === userDepartmentId)) {
        cellName = user?.departments?.parent?.name || 
                   (userLevelId === 4 ? user?.departments?.name : null) || null
      }
    }

    if (!sectorName && sectorId) {
      if ((userLevelId === 6 && sectorId === user?.departments?.parent?.parent?.id) ||
          (userLevelId === 4 && sectorId === user?.departments?.parent?.id) ||
          (userLevelId === 3 && sectorId === userDepartmentId)) {
        sectorName = user?.departments?.parent?.parent?.name ||
                     (userLevelId === 4 ? user?.departments?.parent?.name : null) ||
                     (userLevelId === 3 ? user?.departments?.name : null) || null
      }
    }

    if (!districtName && districtId) {
      if ((userLevelId === 6 && districtId === user?.departments?.parent?.parent?.parent?.id) ||
          (userLevelId === 4 && districtId === user?.departments?.parent?.parent?.id) ||
          (userLevelId === 3 && districtId === user?.departments?.parent?.id) ||
          (userLevelId === 2 && districtId === userDepartmentId)) {
        districtName = user?.departments?.parent?.parent?.parent?.name ||
                       (userLevelId === 4 ? user?.departments?.parent?.parent?.name : null) ||
                       (userLevelId === 3 ? user?.departments?.parent?.name : null) ||
                       (userLevelId === 2 ? user?.departments?.name : null) || null
      }
    }

    if (!provinceName && provinceId) {
      // Province names are hardcoded, so just use the mapping
      provinceName = provinceNames[provinceId] || null
    }

    // Return names (will be null if not found, but we'll handle that in display)
    return {
      province_name: provinceName,
      district_name: districtName,
      sector_name: sectorName,
      cell_name: cellName,
      village_name: villageName,
    }
  }

  const handleAddService = () => {
    const trimmedServiceId = String(selectedDepartmentServiceId).trim()
    if (!trimmedServiceId) {
      toast.error('Please select a service')
      return
    }

    const trimmedUbudehe = String(ubudeheInput).trim()
    if (!trimmedUbudehe) {
      toast.error('Amount is required')
      return
    }

    // Validate location selections based on user level
    if (userLevelId === 1 && !selectedDistrict) {
      toast.error('Please select a district')
      return
    }
    if ((userLevelId === 1 || userLevelId === 2) && !selectedSector) {
      toast.error('Please select a sector')
      return
    }
    if (
      (userLevelId === 1 ||
        userLevelId === 2 ||
        userLevelId === 3) &&
      !selectedCell
    ) {
      toast.error('Please select a cell')
      return
    }
    if (
      (userLevelId === 1 ||
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
      case 1: // Province - use user's province, allow district, sector, cell, and village selection
        villageId = selectedVillage
        cellId = selectedCell
        sectorId = selectedSector
        districtId = selectedDistrict
        provinceId = userDepartmentId
        break
      default:
        break
    }

    // Get location names
    const locationNames = getLocationNames(provinceId, districtId, sectorId, cellId, villageId)

    // If editing, update the existing service
    if (editingIndex !== null) {
      // Check if service with the same household type and location already exists (excluding current editing item)
      const serviceExists = services.some(
        (s, idx) =>
          idx !== editingIndex &&
          s.department_service_id === trimmedServiceId &&
          s.householdType === householdType &&
          s.province_id === provinceId &&
          s.district_id === districtId &&
          s.sector_id === sectorId &&
          s.cell_id === cellId &&
          s.village_id === villageId
      )

      if (serviceExists) {
        toast.error(
          `This service is already added for ${householdType === 'Residence' ? 'Residence' : 'Business'} household type at this location`
        )
        return
      }

      // Find the service details
      const selectedService = allServices.find(
        (s) => String(s?.id) === trimmedServiceId
      )

      const updatedServices = [...services]
      updatedServices[editingIndex] = {
        department_service_id: trimmedServiceId,
        ubudehe: trimmedUbudehe,
        householdType: householdType,
        service: selectedService,
        province_id: provinceId,
        district_id: districtId,
        sector_id: sectorId,
        cell_id: cellId,
        village_id: villageId,
        province_name: locationNames.province_name,
        district_name: locationNames.district_name,
        sector_name: locationNames.sector_name,
        cell_name: locationNames.cell_name,
        village_name: locationNames.village_name,
      }

      setServices(updatedServices)
      onServicesChange && onServicesChange(updatedServices)

      // Reset form and editing state
      setSelectedDepartmentServiceId('')
      setUbudeheInput('')
      setHouseholdType('Residence')
      setEditingIndex(null)

      toast.success('Service updated successfully')
      return
    }

    // Check if service with the same household type and location already exists
    const serviceExists = services.some(
      (s) =>
        s.department_service_id === trimmedServiceId &&
        s.householdType === householdType &&
        s.province_id === provinceId &&
        s.district_id === districtId &&
        s.sector_id === sectorId &&
        s.cell_id === cellId &&
        s.village_id === villageId
    )

    if (serviceExists) {
      toast.error(
        `This service is already added for ${householdType === 'Residence' ? 'Residence' : 'Business'} household type at this location`
      )
      return
    }

    // Find the service details
    const selectedService = allServices.find(
      (s) => String(s?.id) === trimmedServiceId
    )

    const newService = {
      department_service_id: trimmedServiceId,
      ubudehe: trimmedUbudehe,
      householdType: householdType,
      service: selectedService, // Store service details for display
      province_id: provinceId,
      district_id: districtId,
      sector_id: sectorId,
      cell_id: cellId,
      village_id: villageId,
      province_name: locationNames.province_name,
      district_name: locationNames.district_name,
      sector_name: locationNames.sector_name,
      cell_name: locationNames.cell_name,
      village_name: locationNames.village_name,
    }

    const updatedServices = [...services, newService]
    setServices(updatedServices)
    onServicesChange && onServicesChange(updatedServices)

    // Reset form (but keep location selections)
    setSelectedDepartmentServiceId('')
    setUbudeheInput('')
    setHouseholdType('Residence')

    toast.success('Service added successfully')
  }

  const handleEditService = (index) => {
    const serviceToEdit = services[index]
    setSelectedDepartmentServiceId(serviceToEdit.department_service_id)
    setUbudeheInput(serviceToEdit.ubudehe)
    setHouseholdType(serviceToEdit.householdType)
    setEditingIndex(index)
    
    // Restore location selections if they exist
    if (serviceToEdit.province_id) setSelectedProvince(serviceToEdit.province_id)
    if (serviceToEdit.district_id) setSelectedDistrict(serviceToEdit.district_id)
    if (serviceToEdit.sector_id) setSelectedSector(serviceToEdit.sector_id)
    if (serviceToEdit.cell_id) setSelectedCell(serviceToEdit.cell_id)
    if (serviceToEdit.village_id) setSelectedVillage(serviceToEdit.village_id)
    
    // Scroll to form
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const handleCancelEdit = () => {
    setSelectedDepartmentServiceId('')
    setUbudeheInput('')
    setHouseholdType('Residence')
    setEditingIndex(null)
    
    // Reset location selections based on user level
    if (userLevelId === 1) {
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
  }

  const handleRemoveService = (index) => {
    const numericLevelId = Number(userLevelId)
    const serviceId = getServiceIdFromServiceItem(services[index])
    if ((numericLevelId === 6 || numericLevelId === 4) && serviceId === 2) {
      return
    }
    const updatedServices = services.filter((_, i) => i !== index)
    setServices(updatedServices)
    onServicesChange && onServicesChange(updatedServices)
    toast.success('Service removed successfully')
  }

  const getServiceLabel = (service) => {
    const s = service?.service ?? service
    return (
      s?.service?.title ??
      s?.service?.title_english ??
      s?.service?.title_french ??
      s?.service?.name ??
      `Service #${service?.department_service_id ?? ''}`
    )
  }

  return (
    <div className="space-y-0 mt-0 w-full">
      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-primary mb-4">
          Household Services <span className="text-red-500">*</span>
        </h3>
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
                    disabled={editingIndex !== null}
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

              {/* District - Only for Province level (district level users already have district set) */}
              {userLevelId === 1 && (
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
                      editingIndex !== null ||
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

              {/* Sector - For Province and District levels only */}
              {(userLevelId === 1 || userLevelId === 2) && (
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
                      editingIndex !== null ||
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

              {/* Cell - For Province, District, and Sector levels (cell level users already have cell set) */}
              {(userLevelId === 1 ||
                userLevelId === 2 ||
                userLevelId === 3) && (
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
                      editingIndex !== null ||
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

              {/* Village - For Province, District, Sector, and Cell levels */}
              {(userLevelId === 1 ||
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
                      editingIndex !== null ||
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
                Service <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedDepartmentServiceId}
                onChange={(e) => setSelectedDepartmentServiceId(e.target.value)}
                className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4 bg-white"
                disabled={
                  isLoadingAllServices ||
                  isFetchingAllServices ||
                  !sectorIdForServices
                }
              >
                <option value="">
                  {isLoadingAllServices || isFetchingAllServices
                    ? 'Loading services...'
                    : 'Select a service'}
                </option>
                {filteredServices.map((ds) => {
                  const service = ds?.service ?? {}
                  return (
                    <option
                      key={ds?.id ?? JSON.stringify(ds)}
                      value={ds?.id ?? ''}
                    >
                      {service?.title ??
                        service?.title_english ??
                        service?.title_french ??
                        service?.name ??
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
                Household Type <span className="text-red-500">*</span>
              </label>
              <select
                value={householdType}
                onChange={(e) => setHouseholdType(e.target.value)}
                className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4 bg-white"
                disabled={isPsfSelected}
              >
                <option value="Residence">Residence</option>
                <option value="Business">Business</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium text-black">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={ubudeheInput}
                onChange={(e) => setUbudeheInput(e.target.value)}
                placeholder="Enter amount"
                className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-end gap-3">
            <div className="md:w-48">
              <Button
                type="button"
                disabled={
                  !selectedDepartmentServiceId ||
                  !ubudeheInput ||
                  isLoadingAllServices ||
                  isFetchingAllServices ||
                  !sectorIdForServices ||
                  (userLevelId === 1 && !selectedDistrict) ||
                  ((userLevelId === 1 || userLevelId === 2) && !selectedSector) ||
                  ((userLevelId === 1 ||
                    userLevelId === 2 ||
                    userLevelId === 3) &&
                    !selectedCell) ||
                  ((userLevelId === 1 ||
                    userLevelId === 2 ||
                    userLevelId === 3 ||
                    userLevelId === 4) &&
                    !selectedVillage)
                }
                value={editingIndex !== null ? 'Update Service' : 'Add Service'}
                onClick={handleAddService}
                className="w-full"
              />
            </div>
            {editingIndex !== null && (
              <div className="md:w-48">
                <Button
                  type="button"
                  value="Cancel"
                  onClick={handleCancelEdit}
                  className="w-full bg-gray-500 hover:bg-gray-600"
                />
              </div>
            )}
          </div>
          {editingIndex !== null && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Editing:</span> You are currently editing a service. Update the fields above and click "Update Service" to save changes, or "Cancel" to discard.
              </p>
            </div>
          )}
        </div>
      </div>

      {services.length === 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            <span className="font-medium">Note:</span> At least one household department service is required to create a household. Please add a service above.
          </p>
        </div>
      )}

      {services.length > 0 && (
        <div className="rounded-lg border border-gray-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="font-medium text-gray-900">
              Added Services ({services.length})
            </div>
          </div>

          <div className="p-4">
            <ul className="space-y-2">
              {services.map((item, index) => {
                const service = item?.service ?? {}
                const numericLevelId = Number(userLevelId)
                const serviceId = getServiceIdFromServiceItem(item)
                if ((numericLevelId === 6 || numericLevelId === 4) && serviceId === 2) {
                  return null
                }

                return (
                  <li
                    key={`${item.department_service_id}-${item.householdType}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-md border border-gray-100 px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {getServiceLabel(item)}
                      </div>
                      {(service?.service?.title_english ||
                        service?.service?.title_french) && (
                        <div className="text-xs text-gray-500 truncate">
                          {service?.service?.title_english
                            ? `EN: ${service.service.title_english}`
                            : ''}
                          {service?.service?.title_english &&
                          service?.service?.title_french
                            ? ' • '
                            : ''}
                          {service?.service?.title_french
                            ? `FR: ${service.service.title_french}`
                            : ''}
                        </div>
                      )}
                      <div className="flex gap-4 mt-1">
                        <div className="text-xs text-gray-500">
                          Amount: <span className="font-medium">{item.ubudehe}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Type:{' '}
                          <span
                            className={`font-medium ${
                              item.householdType === 'Residence'
                                ? 'text-blue-600'
                                : 'text-orange-600'
                            }`}
                          >
                            {item.householdType === 'Residence'
                              ? 'Residence'
                              : 'Business'}
                          </span>
                        </div>
                      </div>
                      {/* Location Information */}
                      {(item?.village_id ||
                        item?.cell_id ||
                        item?.sector_id ||
                        item?.district_id ||
                        item?.province_id) && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <div className="text-xs text-gray-500 font-medium mb-1">
                            Location:
                          </div>
                          <div className="text-xs text-gray-600 flex flex-wrap gap-2">
                            {item?.province_id && (
                              <span>
                                Province:{' '}
                                <span className="font-medium">
                                  {item.province_name || `ID: ${item.province_id}`}
                                </span>
                              </span>
                            )}
                            {item?.district_id && (
                              <span>
                                District:{' '}
                                <span className="font-medium">
                                  {item.district_name || `ID: ${item.district_id}`}
                                </span>
                              </span>
                            )}
                            {item?.sector_id && (
                              <span>
                                Sector:{' '}
                                <span className="font-medium">
                                  {item.sector_name || `ID: ${item.sector_id}`}
                                </span>
                              </span>
                            )}
                            {item?.cell_id && (
                              <span>
                                Cell:{' '}
                                <span className="font-medium">
                                  {item.cell_name || `ID: ${item.cell_id}`}
                                </span>
                              </span>
                            )}
                            {item?.village_id && (
                              <span>
                                Village:{' '}
                                <span className="font-medium">
                                  {item.village_name || `ID: ${item.village_id}`}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditService(index)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveService(index)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

HouseholdServicesForm.propTypes = {
  onServicesChange: PropTypes.func,
}

