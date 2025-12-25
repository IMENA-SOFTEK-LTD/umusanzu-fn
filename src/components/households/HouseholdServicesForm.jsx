import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { toast } from 'react-toastify'
import Loading from '../Loading'
import Button from '../Button'
import {
  useGetDepartmentServicesQuery,
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

export default function HouseholdServicesForm({ onServicesChange }) {
  const { user } = useSelector((state) => state.auth)
  const [selectedDepartmentServiceId, setSelectedDepartmentServiceId] =
    useState('')
  const [ubudeheInput, setUbudeheInput] = useState('')
  const [householdType, setHouseholdType] = useState('residence')
  const [services, setServices] = useState([])
  const [editingIndex, setEditingIndex] = useState(null)

  const departmentId = user?.myAddress?.sector?.id

  const {
    data: allServicesData,
    isLoading: isLoadingAllServices,
    isFetching: isFetchingAllServices,
    isError: isAllServicesError,
  } = useGetDepartmentServicesQuery(
    { id: departmentId },
    { skip: !departmentId }
  )

  const allServices = useMemo(
    () => normalizeAllServicesPayload(allServicesData),
    [allServicesData]
  )

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

    // If editing, update the existing service
    if (editingIndex !== null) {
      // Check if service with the same household type already exists (excluding current editing item)
      const serviceExists = services.some(
        (s, idx) =>
          idx !== editingIndex &&
          s.department_service_id === trimmedServiceId &&
          s.householdType === householdType
      )

      if (serviceExists) {
        toast.error(
          `This service is already added for ${householdType === 'residence' ? 'Residence' : 'Business'} household type`
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
      }

      setServices(updatedServices)
      onServicesChange && onServicesChange(updatedServices)

      // Reset form and editing state
      setSelectedDepartmentServiceId('')
      setUbudeheInput('')
      setHouseholdType('residence')
      setEditingIndex(null)

      toast.success('Service updated successfully')
      return
    }

    // Check if service with the same household type already exists
    const serviceExists = services.some(
      (s) =>
        s.department_service_id === trimmedServiceId &&
        s.householdType === householdType
    )

    if (serviceExists) {
      toast.error(
        `This service is already added for ${householdType === 'residence' ? 'Residence' : 'Business'} household type`
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
    }

    const updatedServices = [...services, newService]
    setServices(updatedServices)
    onServicesChange && onServicesChange(updatedServices)

    // Reset form
    setSelectedDepartmentServiceId('')
    setUbudeheInput('')
    setHouseholdType('residence')

    toast.success('Service added successfully')
  }

  const handleEditService = (index) => {
    const serviceToEdit = services[index]
    setSelectedDepartmentServiceId(serviceToEdit.department_service_id)
    setUbudeheInput(serviceToEdit.ubudehe)
    setHouseholdType(serviceToEdit.householdType)
    setEditingIndex(index)
    
    // Scroll to form
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const handleCancelEdit = () => {
    setSelectedDepartmentServiceId('')
    setUbudeheInput('')
    setHouseholdType('residence')
    setEditingIndex(null)
  }

  const handleRemoveService = (index) => {
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
                  isLoadingAllServices || isFetchingAllServices || !departmentId
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
              >
                <option value="residence">Residence</option>
                <option value="business">Business</option>
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
                  isFetchingAllServices
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
                              item.householdType === 'residence'
                                ? 'text-blue-600'
                                : 'text-orange-600'
                            }`}
                          >
                            {item.householdType === 'residence'
                              ? 'Residence'
                              : 'Business'}
                          </span>
                        </div>
                      </div>
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

