import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { toast } from 'react-toastify'
import Loading from '../Loading'
import Button from '../Button'
import {
  useAddDepartmentServiceMutation,
  useGetDepartmentServicesQuery,
  useGetServicesV2Query,
  useRemoveDepartmentServiceMutation,
} from '../../states/api/apiSlice'
import { useSelector } from 'react-redux'

function normalizeServicesPayload(payload) {
  // Supports a few common response shapes:
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

function getServiceId(service) {
  // supports either a direct service object or a join row:
  // - { id, title, ... }
  // - { id, service_id, service: { id, title, ... } }
  return (
    service?.service?.id ??
    service?.service_id ??
    service?.serviceId ??
    service?.id ??
    service?.ID
  )
}

function getServiceLabel(service) {
  const s = service?.service ?? service
  return (
    s?.name ??
    s?.service_name ??
    s?.title ??
    s?.code ??
    `Service #${getServiceId(service) ?? ''}`
  )
}

export default function DepartmentServicesManager({ departmentId, onChanged }) {
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const { user } = useSelector((state) => state.auth)
  const { data, isFetching, isLoading, isError, refetch } =
    useGetDepartmentServicesQuery({ id: departmentId }, { skip: !departmentId })

  const [addService, { isLoading: isAdding }] =
    useAddDepartmentServiceMutation()
  const [removeService, { isLoading: isRemoving }] =
    useRemoveDepartmentServiceMutation()

  const {
    data: allServicesData,
    isLoading: isLoadingServices,
    isFetching: isFetchingServices,
    isError: isServicesError,
  } = useGetServicesV2Query()

  const services = useMemo(() => normalizeServicesPayload(data), [data])
  const allServices = useMemo(
    () => normalizeAllServicesPayload(allServicesData),
    [allServicesData]
  )

  const onAssign = async () => {
    const trimmed = String(selectedServiceId).trim()
    if (!trimmed) {
      toast.error('Please select a service')
      return
    }

    try {
      await addService({ id: departmentId, serviceId: trimmed }).unwrap()
      toast.success('Service assigned successfully')
      setSelectedServiceId('')
      onChanged && onChanged()
    } catch (e) {
      // error toast is handled globally, but keep a friendly fallback
      if (!e?.data?.message) toast.error('Failed to assign service')
    }
  }

  const onRemove = async (service) => {
    const sid = getServiceId(service)
    if (!sid) return

    try {
      await removeService({ id: departmentId, serviceId: sid }).unwrap()
      toast.success('Service removed successfully')
      onChanged && onChanged()
    } catch (e) {
      if (!e?.data?.message) toast.error('Failed to remove service')
    }
  }

  return (
    <div className="space-y-4">
      {parseInt(user?.staff_role) === 1 && (
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row md:items-end gap-3">
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium text-black">
                Assign service
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4 bg-white"
                disabled={
                  isAdding ||
                  !departmentId ||
                  isLoadingServices ||
                  isFetchingServices
                }
              >
                <option value="">
                  {isLoadingServices || isFetchingServices
                    ? 'Loading services...'
                    : 'Select a service'}
                </option>
                {allServices.map((s) => (
                  <option key={s?.id ?? JSON.stringify(s)} value={s?.id ?? ''}>
                    {s?.title ??
                      s?.title_english ??
                      s?.title_french ??
                      `Service #${s?.id ?? ''}`}
                  </option>
                ))}
              </select>
              {isServicesError && (
                <p className="text-xs text-red-600 mt-2">
                  Failed to load services list.
                </p>
              )}
            </div>
            <div className="md:w-48">
              <Button
                type="button"
                submit
                disabled={
                  isAdding ||
                  !departmentId ||
                  !selectedServiceId ||
                  isLoadingServices ||
                  isFetchingServices
                }
                value={isAdding ? <Loading /> : 'Assign'}
                onClick={onAssign}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="font-medium text-gray-900">Assigned services</div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching || isLoading}
            className="text-sm text-primary hover:underline disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        <div className="p-4">
          {(isLoading || isFetching) && (
            <div className="flex justify-center py-6">
              <Loading />
            </div>
          )}

          {!isLoading && !isFetching && isError && (
            <div className="text-sm text-red-600">
              Failed to load services. Please try again.
            </div>
          )}

          {!isLoading && !isFetching && !isError && services.length === 0 && (
            <div className="text-sm text-gray-600">No services assigned.</div>
          )}

          {!isLoading && !isFetching && !isError && services.length > 0 && (
            <ul className="space-y-2">
              {services.map((service) => {
                const sid = getServiceId(service)
                const s = service?.service ?? service
                return (
                  <li
                    key={service?.id ?? sid ?? JSON.stringify(service)}
                    className="flex items-center justify-between gap-3 rounded-md border border-gray-100 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {getServiceLabel(service)}
                      </div>
                      {(s?.title_english || s?.title_french) && (
                        <div className="text-xs text-gray-500 truncate">
                          {s?.title_english ? `EN: ${s.title_english}` : ''}
                          {s?.title_english && s?.title_french ? ' • ' : ''}
                          {s?.title_french ? `FR: ${s.title_french}` : ''}
                        </div>
                      )}
                      {sid && (
                        <div className="text-xs text-gray-500">ID: {sid}</div>
                      )}
                    </div>
                    {parseInt(user?.staff_role) === 1 && (
                    <button
                      type="button"
                      onClick={() => onRemove(service)}
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

DepartmentServicesManager.propTypes = {
  departmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChanged: PropTypes.func,
}
