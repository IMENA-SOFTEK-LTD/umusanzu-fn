import { useState } from 'react'
import PropTypes from 'prop-types'
import Modal from './Modal'
import Button from '../Button'
import { toast } from 'react-toastify'

const HouseholdConflictModal = ({
  isOpen,
  onClose,
  conflictData,
  onResubmit,
  isSubmitting = false,
}) => {
  const [confirmations, setConfirmations] = useState({
    confirmHousehold: false,
    confirmServices: false,
  })

  // Single checkbox to confirm merging existing and new household data
  const [confirmMerge, setConfirmMerge] = useState(false)

  if (!conflictData || !conflictData.requestParams || !conflictData.data) {
    return null
  }

  const { requestParams } = conflictData
  const { householdDetail, serviceDetail } = conflictData.data

  const handleCheckboxChange = (key) => {
    setConfirmations((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleMergeConfirmationChange = (checked) => {
    setConfirmMerge(checked)
  }

  const handleResubmit = () => {
    if (!confirmations.confirmHousehold || !confirmations.confirmServices) {
      toast.error('Please confirm both household and services before resubmitting')
      return
    }

    // Helper function to merge field values: if merge confirmed, use new values, otherwise keep existing values
    const getMergedFieldValue = (requestVal, existingVal) => {
      // If merge is confirmed, use new values (replace existing with new data)
      if (confirmMerge) {
        return requestVal
      }
      // If merge not confirmed, keep existing values (use existing where available)
      if (existingVal !== null && existingVal !== undefined && existingVal !== '') {
        return existingVal
      }
      return requestVal
    }

    // Create new payload with disableCheckConflict: true
    // Apply merge logic: if confirmMerge is true, use new values (replace existing), otherwise keep existing values
    const resubmitPayload = {
      ...requestParams,
      disableCheckConflict: true,
      // Merge logic: if confirmMerge is true, use new values, otherwise use existing values where available
      name: getMergedFieldValue(requestParams.name, householdDetail?.name),
      phone1: getMergedFieldValue(requestParams.phone1, householdDetail?.phone1),
      phone2: getMergedFieldValue(requestParams.phone2, householdDetail?.phone2),
      email: getMergedFieldValue(requestParams.email, householdDetail?.email),
      type: getMergedFieldValue(requestParams.type, householdDetail?.type),
      ubudehe: getMergedFieldValue(requestParams.ubudehe, householdDetail?.ubudehe),
      // Address fields also follow merge logic
      province: getMergedFieldValue(requestParams.province, householdDetail?.province),
      district: getMergedFieldValue(requestParams.district, householdDetail?.district),
      sector: getMergedFieldValue(requestParams.sector, householdDetail?.sector),
      cell: getMergedFieldValue(requestParams.cell, householdDetail?.cell),
      village: getMergedFieldValue(requestParams.village, householdDetail?.village),
      confirmMerge: confirmMerge,
    }

    // Reset confirmations
    setConfirmations({
      confirmHousehold: false,
      confirmServices: false,
    })
    setConfirmMerge(false)

    onResubmit(resubmitPayload)
  }

  const handleClose = () => {
    // Reset confirmations when closing
    setConfirmations({
      confirmHousehold: false,
      confirmServices: false,
    })
    setConfirmMerge(false)
    onClose()
  }

  // Helper function to get location name by ID
  const getLocationName = (locationType, locationId, isRequested = false) => {
    if (!locationId) return 'N/A'

    // Try to find location name from serviceDetail by matching the location ID
    const foundService = serviceDetail?.find((s) => {
      switch (locationType) {
        case 'province':
          return String(s.province_id) === String(locationId)
        case 'district':
          return String(s.district_id) === String(locationId)
        case 'sector':
          return String(s.sector_id) === String(locationId)
        case 'cell':
          return String(s.cell_id) === String(locationId)
        case 'village':
          return String(s.village_id) === String(locationId)
        default:
          return false
      }
    })

    if (foundService) {
      switch (locationType) {
        case 'province':
          return foundService.province?.name || locationId
        case 'district':
          return foundService.district?.name || locationId
        case 'sector':
          return foundService.sector?.name || locationId
        case 'cell':
          return foundService.cell?.name || locationId
        case 'village':
          return foundService.village?.name || locationId
        default:
          return locationId
      }
    }

    // Fallback: Try to find any service with the same village_id and use its location names
    // This works if the household has the same village
    const householdVillageId = householdDetail?.village
    if (householdVillageId) {
      const serviceWithVillage = serviceDetail?.find(
        (s) => String(s.village_id) === String(householdVillageId)
      )

      if (serviceWithVillage) {
        switch (locationType) {
          case 'province':
            if (String(serviceWithVillage.province_id) === String(locationId)) {
              return serviceWithVillage.province?.name || locationId
            }
            break
          case 'district':
            if (String(serviceWithVillage.district_id) === String(locationId)) {
              return serviceWithVillage.district?.name || locationId
            }
            break
          case 'sector':
            if (String(serviceWithVillage.sector_id) === String(locationId)) {
              return serviceWithVillage.sector?.name || locationId
            }
            break
          case 'cell':
            if (String(serviceWithVillage.cell_id) === String(locationId)) {
              return serviceWithVillage.cell?.name || locationId
            }
            break
          case 'village':
            if (String(serviceWithVillage.village_id) === String(locationId)) {
              return serviceWithVillage.village?.name || locationId
            }
            break
        }
      }
    }

    // For requested values, try to find from requestParams services
    if (isRequested && requestParams?.services) {
      const matchingService = requestParams.services.find((s) => {
        switch (locationType) {
          case 'province':
            return String(s.province_id) === String(locationId)
          case 'district':
            return String(s.district_id) === String(locationId)
          case 'sector':
            return String(s.sector_id) === String(locationId)
          case 'cell':
            return String(s.cell_id) === String(locationId)
          case 'village':
            return String(s.village_id) === String(locationId)
          default:
            return false
        }
      })

      if (matchingService) {
        // Find a service in serviceDetail with matching location
        const serviceWithLocation = serviceDetail?.find(
          (s) =>
            String(s.province_id) === String(matchingService.province_id) &&
            String(s.district_id) === String(matchingService.district_id) &&
            String(s.sector_id) === String(matchingService.sector_id) &&
            String(s.cell_id) === String(matchingService.cell_id) &&
            String(s.village_id) === String(matchingService.village_id)
        )

        if (serviceWithLocation) {
          switch (locationType) {
            case 'province':
              return serviceWithLocation.province?.name || locationId
            case 'district':
              return serviceWithLocation.district?.name || locationId
            case 'sector':
              return serviceWithLocation.sector?.name || locationId
            case 'cell':
              return serviceWithLocation.cell?.name || locationId
            case 'village':
              return serviceWithLocation.village?.name || locationId
          }
        }
      }
    }

    return locationId
  }

  const compareValue = (newVal, oldVal, label, locationType = null, isTypeField = false) => {
    const isDifferent = String(newVal) !== String(oldVal)

    // If locationType is provided, get names instead of IDs
    let oldDisplayVal = oldVal || 'N/A'
    let newDisplayVal = newVal || 'N/A'

    if (locationType) {
      oldDisplayVal = getLocationName(locationType, oldVal, false)
      newDisplayVal = getLocationName(locationType, newVal, true)
    }

    // Special color for Type field
    const labelColor = isTypeField 
      ? 'text-purple-600 font-semibold' 
      : isDifferent 
        ? 'text-orange-600' 
        : 'text-gray-700'

    return (
      <div className="flex items-center gap-2">
        <span className={`text-sm ${labelColor}`}>
          {label.replace(' ID', '')}:
        </span>
        <span className={`text-sm font-medium ${isDifferent ? 'text-red-600' : 'text-gray-900'}`}>
          {oldDisplayVal}
        </span>
        {isDifferent && (
          <>
            <span className="text-sm text-gray-400">→</span>
            <span className={`text-sm font-medium ${isTypeField ? 'text-purple-600' : 'text-green-600'}`}>
              {newDisplayVal}
            </span>
          </>
        )}
      </div>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} showCloseButton={false}>
      <div className="flex flex-col gap-4 w-full max-w-6xl max-h-[90vh] overflow-y-auto p-2">
        <div className="flex items-center justify-between border-b pb-3  bg-white z-10">
          <h2 className="text-xl font-bold text-red-600">Household Conflict Detected</h2>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800 font-medium">
            {conflictData.message || 'A household with similar information already exists.'}
          </p>
        </div>

        {/* Household Details Comparison */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Household Details Comparison
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2 text-xs text-gray-500 mb-2">
              <span className="text-red-600">Red</span> = Existing |{' '}
              <span className="text-green-600">Green</span> = New Request |{' '}
              <span className="text-blue-600">Checkbox</span> = Replace with new value
            </div>
            {compareValue(requestParams.name, householdDetail?.name, 'Name')}
            {compareValue(requestParams.phone1, householdDetail?.phone1, 'Phone 1')}
            {compareValue(requestParams.phone2, householdDetail?.phone2, 'Phone 2')}
            {compareValue(requestParams.email, householdDetail?.email, 'Email')}
            {compareValue(requestParams.type, householdDetail?.type, 'Type', null, true)}
            {/* {compareValue(requestParams.ubudehe, householdDetail?.ubudehe, 'Ubudehe')} */}
            
            {/* Address Fields */}
            {compareValue(requestParams.province, householdDetail?.province, 'Province', 'province')}
            {compareValue(requestParams.district, householdDetail?.district, 'District', 'district')}
            {compareValue(requestParams.sector, householdDetail?.sector, 'Sector', 'sector')}
            {compareValue(requestParams.cell, householdDetail?.cell, 'Cell', 'cell')}
            {compareValue(requestParams.village, householdDetail?.village, 'Village', 'village')}
          </div>
          
          {/* Single merge confirmation checkbox */}
          {(() => {
            const hasAnyDifference = 
              String(requestParams.name) !== String(householdDetail?.name) ||
              String(requestParams.phone1) !== String(householdDetail?.phone1) ||
              String(requestParams.phone2) !== String(householdDetail?.phone2) ||
              String(requestParams.email) !== String(householdDetail?.email) ||
              String(requestParams.type) !== String(householdDetail?.type) ||
              String(requestParams.province) !== String(householdDetail?.province) ||
              String(requestParams.district) !== String(householdDetail?.district) ||
              String(requestParams.sector) !== String(householdDetail?.sector) ||
              String(requestParams.cell) !== String(householdDetail?.cell) ||
              String(requestParams.village) !== String(householdDetail?.village)
            
            if (hasAnyDifference) {
              return (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmMerge}
                      onChange={(e) => handleMergeConfirmationChange(e.target.checked)}
                      className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">
                        Confirm to merge existing household data with new data
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        When unchecked: Keep existing data.
                        When checked: Use all new values (replace existing with new data).
                      </p>
                    </div>
                  </label>
                </div>
              )
            }
            return null
          })()}
        </div>

        {/* Services Comparison */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Services Comparison
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {/* Helper function to check if a requested service matches an existing service */}
            {(() => {
              const checkServiceMatch = (requestedService, existingService) => {
                // Match based on village_id, department_service_id (service), and householdType
                return (
                  String(requestedService.village_id) === String(existingService.village_id) &&
                  String(requestedService.service) === String(existingService.department_service_id) &&
                  String(requestedService.householdType).toLowerCase() === String(existingService.householdType).toLowerCase()
                )
              }

              // Check which existing services match requested services
              const matchedServiceIds = new Set()
              requestParams?.services?.forEach((reqService) => {
                serviceDetail?.forEach((existService) => {
                  if (checkServiceMatch(reqService, existService)) {
                    matchedServiceIds.add(existService.id)
                  }
                })
              })

              // Helper function to get service name by service ID
              const getServiceName = (serviceId) => {
                const foundService = serviceDetail?.find(
                  (s) => String(s.department_service_id) === String(serviceId)
                )
                return (
                  foundService?.department_service?.service?.title ||
                  foundService?.department_service?.service?.title_english ||
                  foundService?.department_service?.service?.title_french ||
                  `Service ${serviceId}`
                )
              }

              // Helper function to get location names from serviceDetail
              const getLocationNames = (provinceId, districtId, sectorId, cellId, villageId) => {
                // Try to find an existing service with matching location IDs to get names
                const foundService = serviceDetail?.find(
                  (s) =>
                    String(s.province_id) === String(provinceId) &&
                    String(s.district_id) === String(districtId) &&
                    String(s.sector_id) === String(sectorId) &&
                    String(s.cell_id) === String(cellId) &&
                    String(s.village_id) === String(villageId)
                )

                if (foundService) {
                  return {
                    province: foundService.province?.name || provinceId,
                    district: foundService.district?.name || districtId,
                    sector: foundService.sector?.name || sectorId,
                    cell: foundService.cell?.name || cellId,
                    village: foundService.village?.name || villageId,
                  }
                }

                // Fallback: try to find any service with matching village_id and use its location names
                const villageMatch = serviceDetail?.find(
                  (s) => String(s.village_id) === String(villageId)
                )

                if (villageMatch) {
                  return {
                    province: villageMatch.province?.name || provinceId,
                    district: villageMatch.district?.name || districtId,
                    sector: villageMatch.sector?.name || sectorId,
                    cell: villageMatch.cell?.name || cellId,
                    village: villageMatch.village?.name || villageId,
                  }
                }

                // If no match found, return IDs
                return {
                  province: provinceId,
                  district: districtId,
                  sector: sectorId,
                  cell: cellId,
                  village: villageId,
                }
              }

              return (
                <div className="space-y-2">
                  {/* Show Requested Services */}
                  {requestParams?.services?.map((service, index) => {
                    const serviceName = getServiceName(service.service)
                    const locationNames = getLocationNames(
                      service.province_id,
                      service.district_id,
                      service.sector_id,
                      service.cell_id,
                      service.village_id
                    )
                    return (
                      <div
                        key={`req-${index}`}
                        className="bg-green-50 border border-green-200 rounded p-3 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-green-800">Requested:</span>
                          <span className="font-medium text-green-800">{serviceName}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-gray-600">Type:</span>
                          <span
                            className={`text-xs font-semibold px-2 py-0 rounded ${
                              String(service.householdType).toLowerCase() === 'residence'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {service.householdType || 'N/A'}
                          </span>
                          <span className="text-gray-600">| Amount: {service.amount}</span>
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          Location: Province {locationNames.province}, District{' '}
                          {locationNames.district}, Sector {locationNames.sector}, Cell{' '}
                          {locationNames.cell}, Village {locationNames.village}
                        </div>
                      </div>
                    )
                  })}

                  {/* Show Existing Services with match indicators */}
                  {serviceDetail?.map((service, index) => {
                    const serviceName =
                      service?.department_service?.service?.title ||
                      service?.department_service?.service?.title_english ||
                      `Service ${index + 1}`
                    const isMatched = matchedServiceIds.has(service.id)
                    return (
                      <div
                        key={service.id || index}
                        className={`border rounded p-3 text-sm ${
                          isMatched
                            ? 'bg-yellow-50 border-yellow-400 border-2'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${isMatched ? 'text-yellow-800' : 'text-blue-800'}`}>
                            Existing:
                          </span>
                          <span className={`font-medium ${isMatched ? 'text-yellow-800' : 'text-blue-800'}`}>
                            {serviceName}
                          </span>
                          {isMatched && (
                            <span className="ml-auto bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-1 rounded">
                              ✓ MATCHES REQUESTED
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Type:</span>
                          <span
                            className={`text-xs font-semibold px-2 py-0 rounded ${
                              String(service.householdType).toLowerCase() === 'residence'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {service.householdType || 'N/A'}
                          </span>
                          <span className="text-gray-600">| Amount: {service.ubudehe}</span>
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          Location: {service.province?.name || service.province_id},{' '}
                          {service.district?.name || service.district_id},{' '}
                          {service.sector?.name || service.sector_id},{' '}
                          {service.cell?.name || service.cell_id},{' '}
                          {service.village?.name || service.village_id}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        </div>

        {/* Confirmation Checkboxes */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Confirm Before Resubmitting
          </h3>
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmations.confirmHousehold}
                onChange={() => handleCheckboxChange('confirmHousehold')}
                className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">
                  I confirm the household information is correct
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  The household details above match what I want to create
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmations.confirmServices}
                onChange={() => handleCheckboxChange('confirmServices')}
                className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">
                  I confirm the services information is correct
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  The services above are the ones I want to assign to this household
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t sticky bottom-0 bg-white">
          <Button
            value="Cancel"
            onClick={handleClose}
            className="bg-gray-500 hover:bg-gray-600"
            disabled={isSubmitting}
          />
          <Button
            value={isSubmitting ? 'Submitting...' : 'Resubmit (Skip Conflict Check)'}
            onClick={handleResubmit}
            disabled={
              isSubmitting ||
              !confirmations.confirmHousehold ||
              !confirmations.confirmServices
            }
            className="bg-primary hover:bg-primary-dark"
          />
        </div>
      </div>
    </Modal>
  )
}

HouseholdConflictModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  conflictData: PropTypes.shape({
    conflict: PropTypes.bool,
    message: PropTypes.string,
    requestParams: PropTypes.object,
    data: PropTypes.shape({
      householdDetail: PropTypes.object,
      serviceDetail: PropTypes.array,
    }),
  }),
  onResubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
}

export default HouseholdConflictModal

