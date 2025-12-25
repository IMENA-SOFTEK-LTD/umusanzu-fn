/**
 * Utility functions to extract location data from household services array
 */

/**
 * Extract unique provinces from household services
 * @param {Array} services - Array of household services
 * @returns {Array} Array of provinces with {id, name}
 */
export const getProvinces = (services) => {
  if (!Array.isArray(services) || services.length === 0) return []
  
  const provinceMap = new Map()
  
  services.forEach((service) => {
    if (service?.province_id && service?.province) {
      if (!provinceMap.has(service.province_id)) {
        provinceMap.set(service.province_id, {
          id: service.province_id,
          name: service.province,
        })
      }
    }
  })
  
  return Array.from(provinceMap.values())
}

/**
 * Extract unique districts from household services
 * @param {Array} services - Array of household services
 * @param {Number} provinceId - Optional province ID to filter districts
 * @returns {Array} Array of districts with {id, name, province_id}
 */
export const getDistricts = (services, provinceId = null) => {
  if (!Array.isArray(services) || services.length === 0) return []
  
  const districtMap = new Map()
  
  services.forEach((service) => {
    if (service?.district_id && service?.district) {
      // Filter by province if provided
      if (provinceId && service.province_id !== provinceId) return
      
      if (!districtMap.has(service.district_id)) {
        districtMap.set(service.district_id, {
          id: service.district_id,
          name: service.district,
          province_id: service.province_id,
        })
      }
    }
  })
  
  return Array.from(districtMap.values())
}

/**
 * Extract unique sectors from household services
 * @param {Array} services - Array of household services
 * @param {Number} districtId - Optional district ID to filter sectors
 * @returns {Array} Array of sectors with {id, name, district_id}
 */
export const getSectors = (services, districtId = null) => {
  if (!Array.isArray(services) || services.length === 0) return []
  
  const sectorMap = new Map()
  
  services.forEach((service) => {
    if (service?.sector_id && service?.sector) {
      // Filter by district if provided
      if (districtId && service.district_id !== districtId) return
      
      if (!sectorMap.has(service.sector_id)) {
        sectorMap.set(service.sector_id, {
          id: service.sector_id,
          name: service.sector,
          district_id: service.district_id,
        })
      }
    }
  })
  
  return Array.from(sectorMap.values())
}

/**
 * Extract unique cells from household services
 * @param {Array} services - Array of household services
 * @param {Number} sectorId - Optional sector ID to filter cells
 * @returns {Array} Array of cells with {id, name, sector_id}
 */
export const getCells = (services, sectorId = null) => {
  if (!Array.isArray(services) || services.length === 0) return []
  
  const cellMap = new Map()
  
  services.forEach((service) => {
    if (service?.cell_id && service?.cell) {
      // Filter by sector if provided
      if (sectorId && service.sector_id !== sectorId) return
      
      if (!cellMap.has(service.cell_id)) {
        cellMap.set(service.cell_id, {
          id: service.cell_id,
          name: service.cell,
          sector_id: service.sector_id,
        })
      }
    }
  })
  
  return Array.from(cellMap.values())
}

/**
 * Extract unique villages from household services
 * @param {Array} services - Array of household services
 * @param {Number} cellId - Optional cell ID to filter villages
 * @returns {Array} Array of villages with {id, name, cell_id}
 */
export const getVillages = (services, cellId = null) => {
  if (!Array.isArray(services) || services.length === 0) return []
  
  const villageMap = new Map()
  
  services.forEach((service) => {
    if (service?.village_id && service?.village) {
      // Filter by cell if provided
      if (cellId && service.cell_id !== cellId) return
      
      if (!villageMap.has(service.village_id)) {
        villageMap.set(service.village_id, {
          id: service.village_id,
          name: service.village,
          cell_id: service.cell_id,
        })
      }
    }
  })
  
  return Array.from(villageMap.values())
}

/**
 * Filter services by location based on user department level and selections
 * @param {Array} services - Array of household services
 * @param {Number} userLevelId - User's department level ID
 * @param {Number} userDepartmentId - User's department ID
 * @param {Object} selections - Object with selected location IDs {provinceId, districtId, sectorId, cellId, villageId}
 * @returns {Array} Filtered array of services
 */
export const filterServicesByLocation = (
  services,
  userLevelId,
  userDepartmentId,
  selections = {}
) => {
  if (!Array.isArray(services) || services.length === 0) return []
  
  const { provinceId, districtId, sectorId, cellId, villageId } = selections
  
  switch (userLevelId) {
    case 6: // Agent - filter by village_id
      return services.filter(
        (service) => service?.village_id === userDepartmentId
      )
    
    case 4: // Cell - filter by cell_id, allow village filtering
      if (villageId) {
        return services.filter(
          (service) => service?.village_id === villageId
        )
      }
      return services.filter(
        (service) => service?.cell_id === userDepartmentId
      )
    
    case 3: // Sector - filter by sector_id, allow cell and village filtering
      if (villageId) {
        return services.filter(
          (service) => service?.village_id === villageId
        )
      }
      if (cellId) {
        return services.filter(
          (service) => service?.cell_id === cellId
        )
      }
      return services.filter(
        (service) => service?.sector_id === userDepartmentId
      )
    
    case 2: // District - filter by selected sector, cell, and village
      if (villageId) {
        return services.filter(
          (service) => service?.village_id === villageId
        )
      }
      if (cellId) {
        return services.filter(
          (service) => service?.cell_id === cellId
        )
      }
      if (sectorId) {
        return services.filter(
          (service) => service?.sector_id === sectorId
        )
      }
      return services.filter(
        (service) => service?.district_id === userDepartmentId
      )
    
    case 1: // Province - filter by province_id, allow village filtering
      if (villageId) {
        return services.filter(
          (service) => service?.village_id === villageId
        )
      }
      return services.filter(
        (service) => service?.province_id === userDepartmentId
      )
    
    case 5: // Country - filter by selected locations
    default:
      if (villageId) {
        return services.filter(
          (service) => service?.village_id === villageId
        )
      }
      if (cellId) {
        return services.filter(
          (service) => service?.cell_id === cellId
        )
      }
      if (sectorId) {
        return services.filter(
          (service) => service?.sector_id === sectorId
        )
      }
      if (districtId) {
        return services.filter(
          (service) => service?.district_id === districtId
        )
      }
      if (provinceId) {
        return services.filter(
          (service) => service?.province_id === provinceId
        )
      }
      // No filters - return all services
      return services
  }
}

