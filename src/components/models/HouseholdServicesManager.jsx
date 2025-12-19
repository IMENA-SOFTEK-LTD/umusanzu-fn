import { useMemo, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { toast } from 'react-toastify'
import Loading from '../Loading'
import Button from '../Button'
import {
  useGetHouseholdDepartmentServicesQuery,
  useAssignHouseholdDepartmentServiceMutation,
  useRemoveHouseholdDepartmentServiceMutation,
  useGetDepartmentServicesQuery,
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
  const service = item?.department_service?.service ?? item?.service ?? item
  return (
    service?.title ??
    service?.title_english ??
    service?.title_french ??
    service?.name ??
    `Service #${getDepartmentServiceId(item)}`
  )
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
  onChanged,
}) {
  const { user } = useSelector((state) => state.auth)
  const [selectedDepartmentServiceId, setSelectedDepartmentServiceId] =
    useState('')
  const [ubudeheInput, setUbudeheInput] = useState(ubudehe || '')
  const departmentId = user?.myAddress?.sector?.id
  // console.log(user)
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

  useEffect(() => {
    if (ubudehe) {
      setUbudeheInput(ubudehe)
    }
  }, [ubudehe])

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
    { id: departmentId },
    { skip: !departmentId }
  )

  const [assignService, { isLoading: isAdding }] =
    useAssignHouseholdDepartmentServiceMutation()
  const [removeService, { isLoading: isRemoving }] =
    useRemoveHouseholdDepartmentServiceMutation()

  const assignedServices = useMemo(
    () => normalizePayload(assignedData),
    [assignedData]
  )
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

    try {
      await assignService({
        household_id: householdId,
        department_service_id: trimmed,
        ubudehe: ubudeheValue,
      }).unwrap()
      toast.success('Service assigned successfully')
      setSelectedDepartmentServiceId('')
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

  return (
    <div className="space-y-4 mt-4">
     {parseInt(user?.staff_role) === 1 && ( 
      <div className="rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col gap-3">
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
                  !departmentId ||
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
                  const service =
                    item?.department_service?.service ?? item?.service ?? item
                  return (
                    <li
                      key={item?.id ?? JSON.stringify(item)}
                      className="flex items-center justify-between gap-3 rounded-md border border-gray-100 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {getServiceLabel(item)}
                        </div>
                        {(service?.title_english || service?.title_french) && (
                          <div className="text-xs text-gray-500 truncate">
                            {service?.title_english
                              ? `EN: ${service.title_english}`
                              : ''}
                            {service?.title_english && service?.title_french
                              ? ' • '
                              : ''}
                            {service?.title_french
                              ? `FR: ${service.title_french}`
                              : ''}
                          </div>
                        )}
                        {item?.ubudehe && (
                          <div className="text-xs text-gray-500">
                            Ubudehe: {item.ubudehe}
                          </div>
                        )}
                      </div>
                      {parseInt(user?.staff_role) === 1 && (
                      <button
                        type="button"
                        onClick={() => onRemove(item)}
                        disabled={isRemoving}
                        className="text-sm text-red-600 hover:underline disabled:opacity-50"
                      >
                        Remove
                      </button>
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
