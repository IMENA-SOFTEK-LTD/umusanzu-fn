import PropTypes from 'prop-types'
import Modal from '../../components/models/Modal'
import { useDispatch, useSelector } from 'react-redux'
import {
  setOfflinePaymentModal,
  setPayment,
} from '../../states/features/transactions/paymentSlice'
import { Controller, useForm, useWatch } from 'react-hook-form'
import moment from 'moment'
import Button from '../../components/Button'
import Loading from '../../components/Loading'
import { useEffect, useState, useMemo } from 'react'
import {
  useRecordOfflinePaymentMutation,
  useGetHouseholdDepartmentServicesQuery,
} from '../../states/api/apiSlice'
import { toast } from 'react-toastify'
import {
  getProvinces,
  getDistricts,
  getSectors,
  getCells,
  getVillages,
  filterServicesByLocation,
} from '../../utils/Locations'
import Input from '../../components/Input'

function normalizePayload(payload) {
  const root = payload?.data ?? payload
  if (Array.isArray(root)) return root
  if (Array.isArray(root?.rows)) return root.rows
  if (Array.isArray(root?.services)) return root.services
  if (Array.isArray(root?.data)) return root.data
  return []
}

function getServiceLabel(item) {
  const service = item?.department_service?.service ?? item?.service ?? item
  return (
    service?.title ??
    service?.title_english ??
    service?.title_french ??
    service?.name ??
    `Service #${item?.id ?? ''}`
  )
}

const RecordOfflinePayment = ({ household }) => {
  // STATE VARIABLES
  const dispatch = useDispatch()
  const { offlinePaymentModal } = useSelector((state) => state.payment)
  const { user } = useSelector((state) => state.auth)

  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [householdType, setHouseholdType] = useState('Residence')

  // Location states for filtering
  const [selectedProvince, setSelectedProvince] = useState(null)
  const [selectedDistrict, setSelectedDistrict] = useState(null)
  const [selectedSector, setSelectedSector] = useState(null)
  const [selectedCell, setSelectedCell] = useState(null)
  const [selectedVillage, setSelectedVillage] = useState(null)
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [sectors, setSectors] = useState([])
  const [cells, setCells] = useState([])
  const [villages, setVillages] = useState([])

  const userLevelId = user?.departments?.level_id
  const userDepartmentId = user?.departments?.id

  // Initialize location based on user department level
  useEffect(() => {
    if (!user?.departments) return

    switch (userLevelId) {
      case 6: // Agent - use user's village
        setSelectedVillage(userDepartmentId)
        break
      case 4: // Cell - use user's cell, allow village filtering
        // Will fetch villages when needed
        break
      case 3: // Sector - use user's sector, allow cell and village filtering
        // Will fetch cells when needed
        break
      case 2: // District - use user's district, allow filtering
        // Will fetch sectors when needed
        break
      case 1: // Province - allow village filtering
        // Will fetch villages when needed
        break
      default:
        break
    }
  }, [user?.departments, userLevelId, userDepartmentId])

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
    if (userLevelId === 5 || userLevelId === 1) {
      setSelectedSector(null)
      setSelectedCell(null)
      setSelectedVillage(null)
    }
  }, [selectedDistrict, userLevelId])

  useEffect(() => {
    if (userLevelId === 5 || userLevelId === 1 || userLevelId === 2) {
      setSelectedCell(null)
      setSelectedVillage(null)
    }
  }, [selectedSector, userLevelId])

  useEffect(() => {
    if (
      userLevelId === 5 ||
      userLevelId === 1 ||
      userLevelId === 2 ||
      userLevelId === 3
    ) {
      setSelectedVillage(null)
    }
  }, [selectedCell, userLevelId])

  // REACT HOOK FORM
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm()

  // Load household services
  const { data: householdServicesData, isLoading: isLoadingServices } =
    useGetHouseholdDepartmentServicesQuery(
      { householdId: household?.id },
      { skip: !household?.id || !offlinePaymentModal }
    )

  const householdServices = useMemo(
    () => normalizePayload(householdServicesData),
    [householdServicesData]
  )

  // Filter only active services
  const activeServices = useMemo(() => {
    return householdServices.filter((service) => service?.status === 'Active')
  }, [householdServices])

  // Extract unique locations from active services based on user department level
  useEffect(() => {
    if (activeServices.length === 0) {
      setProvinces([])
      setDistricts([])
      setSectors([])
      setCells([])
      setVillages([])
      return
    }

    switch (userLevelId) {
      case 6: // Agent - no dropdowns needed, services filtered by village_id
        setProvinces([])
        setDistricts([])
        setSectors([])
        setCells([])
        setVillages([])
        break
      case 4: // Cell - show villages from user's cell
        setVillages(
          getVillages(
            activeServices.filter((s) => s.cell_id === userDepartmentId)
          )
        )
        setProvinces([])
        setDistricts([])
        setSectors([])
        setCells([])
        break
      case 3: // Sector - show cells and villages from user's sector
        const sectorServices = activeServices.filter(
          (s) => s.sector_id === userDepartmentId
        )
        setCells(getCells(sectorServices))
        setVillages(
          selectedCell
            ? getVillages(sectorServices, selectedCell)
            : getVillages(sectorServices)
        )
        setProvinces([])
        setDistricts([])
        setSectors([])
        break
      case 2: // District - show sectors, cells, and villages from user's district
        const districtServices = activeServices.filter(
          (s) => s.district_id === userDepartmentId
        )
        setSectors(getSectors(districtServices))
        setCells(
          selectedSector
            ? getCells(districtServices, selectedSector)
            : getCells(districtServices)
        )
        setVillages(
          selectedCell
            ? getVillages(districtServices, selectedCell)
            : selectedSector
            ? getVillages(
                districtServices.filter((s) => s.sector_id === selectedSector)
              )
            : getVillages(districtServices)
        )
        setProvinces([])
        setDistricts([])
        break
      case 1: // Province - show districts, sectors, cells, and villages from user's province
        const provinceServices = activeServices.filter(
          (s) => s.province_id === userDepartmentId
        )
        setDistricts(getDistricts(provinceServices))
        setSectors(
          selectedDistrict
            ? getSectors(provinceServices, selectedDistrict)
            : getSectors(provinceServices)
        )
        setCells(
          selectedSector
            ? getCells(provinceServices, selectedSector)
            : selectedDistrict
            ? getCells(
                provinceServices.filter(
                  (s) => s.district_id === selectedDistrict
                )
              )
            : getCells(provinceServices)
        )
        setVillages(
          selectedCell
            ? getVillages(provinceServices, selectedCell)
            : selectedSector
            ? getVillages(
                provinceServices.filter((s) => s.sector_id === selectedSector)
              )
            : selectedDistrict
            ? getVillages(
                provinceServices.filter(
                  (s) => s.district_id === selectedDistrict
                )
              )
            : getVillages(provinceServices)
        )
        setProvinces([])
        break
      case 5: // Country - show all locations
      default:
        setProvinces(getProvinces(activeServices))
        setDistricts(
          selectedProvince
            ? getDistricts(activeServices, selectedProvince)
            : getDistricts(activeServices)
        )
        setSectors(
          selectedDistrict
            ? getSectors(activeServices, selectedDistrict)
            : selectedProvince
            ? getSectors(
                activeServices.filter((s) => s.province_id === selectedProvince)
              )
            : getSectors(activeServices)
        )
        setCells(
          selectedSector
            ? getCells(activeServices, selectedSector)
            : selectedDistrict
            ? getCells(
                activeServices.filter((s) => s.district_id === selectedDistrict)
              )
            : selectedProvince
            ? getCells(
                activeServices.filter((s) => s.province_id === selectedProvince)
              )
            : getCells(activeServices)
        )
        setVillages(
          selectedCell
            ? getVillages(activeServices, selectedCell)
            : selectedSector
            ? getVillages(
                activeServices.filter((s) => s.sector_id === selectedSector)
              )
            : selectedDistrict
            ? getVillages(
                activeServices.filter((s) => s.district_id === selectedDistrict)
              )
            : selectedProvince
            ? getVillages(
                activeServices.filter((s) => s.province_id === selectedProvince)
              )
            : getVillages(activeServices)
        )
        break
    }
  }, [
    activeServices,
    userLevelId,
    userDepartmentId,
    selectedProvince,
    selectedDistrict,
    selectedSector,
    selectedCell,
  ])

  // Filter services by location first (without household type filtering)
  const locationFilteredServices = useMemo(() => {
    return filterServicesByLocation(
      activeServices,
      userLevelId,
      userDepartmentId,
      {
        provinceId: selectedProvince,
        districtId: selectedDistrict,
        sectorId: selectedSector,
        cellId: selectedCell,
        villageId: selectedVillage,
      }
    )
  }, [
    activeServices,
    userLevelId,
    userDepartmentId,
    selectedProvince,
    selectedDistrict,
    selectedSector,
    selectedCell,
    selectedVillage,
  ])

  // Extract unique household types from location-filtered services
  const availableHouseholdTypes = useMemo(() => {
    const types = new Set()
    locationFilteredServices.forEach((service) => {
      if (service?.householdType) {
        types.add(service.householdType)
      }
    })
    return Array.from(types).sort()
  }, [locationFilteredServices])

  // Reset householdType if current selection is not available
  useEffect(() => {
    if (
      availableHouseholdTypes.length > 0 &&
      !availableHouseholdTypes.includes(householdType)
    ) {
      setHouseholdType(availableHouseholdTypes[0])
      setValue('householdType', availableHouseholdTypes[0])
    }
  }, [availableHouseholdTypes, householdType, setValue])

  // Filter services by householdType and location based on user department level
  const filteredServices = useMemo(() => {
    let services = locationFilteredServices

    // Filter by householdType
    if (householdType) {
      services = services.filter(
        (service) => service?.householdType === householdType
      )
    }

    return services
  }, [locationFilteredServices, householdType])

  // Get services filtered by household type
  const getServicesByHouseholdType = () => {
    if (householdType) {
      return filteredServices.filter(
        (service) => service?.householdType === householdType
      )
    }
    return filteredServices
  }

  // Get selected service's ubudehe for validation
  const selectedService = useMemo(() => {
    if (!selectedServiceId) return null
    return filteredServices.find(
      (s) =>
        s?.id?.toString() === selectedServiceId ||
        s?.ID?.toString() === selectedServiceId
    )
  }, [selectedServiceId, filteredServices])

  // Reset selected service when householdType or location changes
  useEffect(() => {
    setSelectedServiceId('')
    setValue('service', '')
  }, [
    householdType,
    selectedProvince,
    selectedDistrict,
    selectedSector,
    selectedCell,
    selectedVillage,
    setValue,
  ])

  // Auto-select service if there's only one after filtering
  useEffect(() => {
    if (filteredServices.length === 1 && !selectedServiceId) {
      const singleService = filteredServices[0]
      const serviceId = singleService?.id ?? singleService?.ID
      if (serviceId) {
        setSelectedServiceId(serviceId.toString())
        setValue('service', serviceId.toString())
        if (singleService?.ubudehe) {
          setValue('amount', singleService.ubudehe)
        }
      }
    }
  }, [filteredServices, selectedServiceId, setValue])

  // INITIATE RECORD OFFLINE PAYMENT
  const [
    recordOfflinePayment,
    {
      isLoading: recordOfflinePaymentLoading,
      isSuccess: recordOfflinePaymentSuccess,
      isError: recordOfflinePaymentError,
      data: recordOfflinePaymentData,
    },
  ] = useRecordOfflinePaymentMutation()

  // Watch the amount field
  // const amount = useWatch({
  //   control,
  //   name: 'amount',
  //   defaultValue: household?.ubudehe || 0,
  // })

  // UPDATE DEFAULT VALUES
  useEffect(() => {
    setValue('phone1', household?.phone1)
    setValue('sms_phone', household?.phone1)
    if (!selectedService?.ubudehe) {
      setValue('amount', household?.ubudehe)
    }
  }, [household, selectedService])

  // Handle service selection
  const handleServiceChange = (e) => {
    const serviceId = e.target.value
    setSelectedServiceId(serviceId)
    setValue('service', serviceId)

    if (serviceId) {
      const selectedService = filteredServices.find(
        (s) =>
          s?.id?.toString() === serviceId || s?.ID?.toString() === serviceId
      )
      if (selectedService?.ubudehe) {
        setValue('amount', selectedService.ubudehe)
      }
    } else {
      // Reset to household ubudehe if no service selected
      setValue('amount', household?.ubudehe || 0)
    }
  }

  // HANDLE SUBMIT
  const onSubmit = (data) => {
    recordOfflinePayment({
      service: selectedService?.serviceId || selectedServiceId || null,
      amount: data?.amount,
      household_id: household?.guid,
      month_paid: data?.month_paid,
      sms_phone: data?.sms_phone,
      agent: user?.id,
      phone1: data?.phone1,
      ubudehe: selectedService?.ubudehe,
      lang: data?.lang,
      householdType: householdType,
    })
  }

  // HANDLE RECORD OFFLINE PAYMENT
  useEffect(() => {
    if (recordOfflinePaymentSuccess) {
      dispatch(setOfflinePaymentModal(false))
      toast.success('Payment recorded successfully.')
      dispatch(setPayment(recordOfflinePaymentData?.data?.offlinePayment))
      window.location.reload()
    } else if (recordOfflinePaymentError) {
      toast.error('Could not record payment. Please try again later.')
    }
  }, [recordOfflinePaymentSuccess, recordOfflinePaymentData])

  return (
    <Modal
      isOpen={offlinePaymentModal}
      onClose={() => {
        dispatch(setOfflinePaymentModal(false))
      }}
    >
      <h1 className="text-lg px-4 uppercase text-primary font-semibold">
        Record Cash Payment
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 items-center w-full p-4"
      >
        <div className="w-full flex flex-col gap-2 items-center">
          <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
            Select month paid
            <Controller
              name="month_paid"
              control={control}
              defaultValue={moment().format('YYYY-MM')}
              rules={{ required: 'Paid month is required' }}
              render={({ field }) => <Input type="month" {...field} />}
            />
            {errors.month_paid && (
              <span className="text-red-500">{errors.month_paid.message}</span>
            )}
          </label>
        </div>
        <div className="flex items-start gap-4 w-full">
          {/* Location filters for Country level users */}
          {userLevelId === 5 && activeServices.length > 0 && (
            <div className="flex items-start gap-4 w-full flex-wrap">
              <div className="flex-1 w-full">
                <label className="block mb-2 text-sm font-medium text-black">
                  Province
                </label>
                <select
                  value={selectedProvince || ''}
                  onChange={(e) =>
                    setSelectedProvince(Number(e.target.value) || null)
                  }
                  className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                  disabled={false}
                >
                  <option value="">All Provinces</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 w-full">
                <label className="block mb-2 text-sm font-medium text-black">
                  District
                </label>
                <select
                  value={selectedDistrict || ''}
                  onChange={(e) =>
                    setSelectedDistrict(Number(e.target.value) || null)
                  }
                  className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                  disabled={!selectedProvince}
                >
                  <option value="">All Districts</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 w-full">
                <label className="block mb-2 text-sm font-medium text-black">
                  Sector
                </label>
                <select
                  value={selectedSector || ''}
                  onChange={(e) =>
                    setSelectedSector(Number(e.target.value) || null)
                  }
                  className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                  disabled={!selectedDistrict}
                >
                  <option value="">All Sectors</option>
                  {sectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      {sector.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 w-full">
                <label className="block mb-2 text-sm font-medium text-black">
                  Cell
                </label>
                <select
                  value={selectedCell || ''}
                  onChange={(e) =>
                    setSelectedCell(Number(e.target.value) || null)
                  }
                  className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                  disabled={!selectedSector}
                >
                  <option value="">All Cells</option>
                  {cells.map((cell) => (
                    <option key={cell.id} value={cell.id}>
                      {cell.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 w-full">
                <label className="block mb-2 text-sm font-medium text-black">
                  Village
                </label>
                <select
                  value={selectedVillage || ''}
                  onChange={(e) =>
                    setSelectedVillage(Number(e.target.value) || null)
                  }
                  className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                  disabled={!selectedCell}
                >
                  <option value="">All Villages</option>
                  {villages.map((village) => (
                    <option key={village.id} value={village.id}>
                      {village.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Location filters for Province level users */}
          {userLevelId === 1 && activeServices.length > 0 && (
            <div className="flex items-start gap-4 w-full flex-wrap">
              <div className="flex-1 w-full">
                <label className="block mb-2 text-sm font-medium text-black">
                  District
                </label>
                <select
                  value={selectedDistrict || ''}
                  onChange={(e) =>
                    setSelectedDistrict(Number(e.target.value) || null)
                  }
                  className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                  disabled={false}
                >
                  <option value="">All Districts</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 w-full">
                <label className="block mb-2 text-sm font-medium text-black">
                  Sector
                </label>
                <select
                  value={selectedSector || ''}
                  onChange={(e) =>
                    setSelectedSector(Number(e.target.value) || null)
                  }
                  className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                  disabled={!selectedDistrict}
                >
                  <option value="">All Sectors</option>
                  {sectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      {sector.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 w-full">
                <label className="block mb-2 text-sm font-medium text-black">
                  Cell
                </label>
                <select
                  value={selectedCell || ''}
                  onChange={(e) =>
                    setSelectedCell(Number(e.target.value) || null)
                  }
                  className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                  disabled={!selectedSector}
                >
                  <option value="">All Cells</option>
                  {cells.map((cell) => (
                    <option key={cell.id} value={cell.id}>
                      {cell.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 w-full">
                <label className="block mb-2 text-sm font-medium text-black">
                  Village
                </label>
                <select
                  value={selectedVillage || ''}
                  onChange={(e) =>
                    setSelectedVillage(Number(e.target.value) || null)
                  }
                  className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                  disabled={!selectedCell}
                >
                  <option value="">All Villages</option>
                  {villages.map((village) => (
                    <option key={village.id} value={village.id}>
                      {village.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Location filters for District level users */}
          {userLevelId === 2 && activeServices.length > 0 && (
            <div className="flex items-start gap-4 w-full">
              <div className="flex-1 w-full">
                <label className="block mb-2 text-sm font-medium text-black">
                  Sector
                </label>
                <select
                  value={selectedSector || ''}
                  onChange={(e) =>
                    setSelectedSector(Number(e.target.value) || null)
                  }
                  className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                  disabled={false}
                >
                  <option value="">All Sectors</option>
                  {sectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      {sector.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 w-full">
                <label className="block mb-2 text-sm font-medium text-black">
                  Cell
                </label>
                <select
                  value={selectedCell || ''}
                  onChange={(e) =>
                    setSelectedCell(Number(e.target.value) || null)
                  }
                  className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                  disabled={!selectedSector}
                >
                  <option value="">All Cells</option>
                  {cells.map((cell) => (
                    <option key={cell.id} value={cell.id}>
                      {cell.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 w-full">
                <label className="block mb-2 text-sm font-medium text-black">
                  Village
                </label>
                <select
                  value={selectedVillage || ''}
                  onChange={(e) =>
                    setSelectedVillage(Number(e.target.value) || null)
                  }
                  className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                  disabled={!selectedCell}
                >
                  <option value="">All Villages</option>
                  {villages.map((village) => (
                    <option key={village.id} value={village.id}>
                      {village.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Location filters for Sector level users - Cell and Village */}
          {userLevelId === 3 && activeServices.length > 0 && (
            <div className="flex items-start gap-4 w-full">
              <div className="flex-1 w-full">
                <label className="block mb-2 text-sm font-medium text-black">
                  Cell
                </label>
                <select
                  value={selectedCell || ''}
                  onChange={(e) =>
                    setSelectedCell(Number(e.target.value) || null)
                  }
                  className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                  disabled={false}
                >
                  <option value="">All Cells</option>
                  {cells.map((cell) => (
                    <option key={cell.id} value={cell.id}>
                      {cell.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 w-full">
                <label className="block mb-2 text-sm font-medium text-black">
                  Village
                </label>
                <select
                  value={selectedVillage || ''}
                  onChange={(e) =>
                    setSelectedVillage(Number(e.target.value) || null)
                  }
                  className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                  disabled={!selectedCell}
                >
                  <option value="">All Villages</option>
                  {villages.map((village) => (
                    <option key={village.id} value={village.id}>
                      {village.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Location filters for Cell level users - Village only */}
          {userLevelId === 4 && activeServices.length > 0 && (
            <div className="flex items-start gap-4 w-full">
              <div className="flex-1 w-full">
                <label className="block mb-2 text-sm font-medium text-black">
                  Village
                </label>
                <select
                  value={selectedVillage || ''}
                  onChange={(e) =>
                    setSelectedVillage(Number(e.target.value) || null)
                  }
                  className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                  disabled={false}
                >
                  <option value="">All Villages</option>
                  {villages.map((village) => (
                    <option key={village.id} value={village.id}>
                      {village.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-start gap-6 w-full">
          {activeServices.length > 0 && availableHouseholdTypes.length > 0 && (
            <div className="flex-1 w-full">
              <label
                htmlFor="householdType"
                className="block mb-2 text-sm font-medium text-black"
              >
                Household Type
              </label>
              <Controller
                name="householdType"
                control={control}
                defaultValue={availableHouseholdTypes[0] || 'Residence'}
                render={({ field }) => (
                  <select
                    {...field}
                    value={householdType}
                    onChange={(e) => {
                      field.onChange(e)
                      setHouseholdType(e.target.value)
                    }}
                    className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                  >
                    {availableHouseholdTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
          )}
          {activeServices.length > 0 && (
            <div className="flex-1 w-full">
              <label
                htmlFor="service"
                className="block mb-2 text-sm font-medium text-black"
              >
                Service
              </label>
              <Controller
                name="service"
                control={control}
                rules={{
                  required:
                    getServicesByHouseholdType().length > 0
                      ? 'Service selection is required'
                      : false,
                }}
                render={({ field }) => (
                  <select
                    {...field}
                    value={selectedServiceId}
                    onChange={(e) => {
                      field.onChange(e)
                      handleServiceChange(e)
                    }}
                    className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                    disabled={
                      isLoadingServices ||
                      getServicesByHouseholdType().length === 0 ||
                      getServicesByHouseholdType().length === 1
                    }
                  >
                    <option value="">
                      {isLoadingServices
                        ? 'Loading services...'
                        : getServicesByHouseholdType().length === 0
                        ? 'No services available for this household type'
                        : getServicesByHouseholdType().length === 1
                        ? 'Auto-selected'
                        : 'Select a service'}
                    </option>
                    {getServicesByHouseholdType().map((service) => {
                      const serviceId = service?.id ?? service?.ID

                      return (
                        <option
                          key={serviceId ?? JSON.stringify(service)}
                          value={serviceId?.toString() ?? ''}
                        >
                          {getServiceLabel(service)} - Ubudehe:{' '}
                          {service?.ubudehe || 'N/A'}
                        </option>
                      )
                    })}
                  </select>
                )}
              />
              {errors.service && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.service.message}
                </span>
              )}
              {selectedService?.ubudehe && (
                <p className="text-xs text-gray-500 mt-1">
                  Service ubudehe: {selectedService.ubudehe} RWF
                </p>
              )}
            </div>
          )}
        </div>
        <div className="w-full">
          <label
            htmlFor="amount"
            className="block mb-2 text-sm font-medium text-black"
          >
            Amount
          </label>
          <Controller
            name="amount"
            control={control}
            defaultValue={household?.ubudehe}
            rules={{
              required: 'Amount is required',
              validate: (value) => {
                const amountValue = parseFloat(value) || 0

                // Check if amount is less than or equal to zero
                if (amountValue <= 0) {
                  return 'Amount must be greater than zero'
                }

                // Check if amount exceeds service ubudehe
                if (selectedService?.ubudehe) {
                  const serviceUbudehe =
                    parseFloat(selectedService.ubudehe) || 0
                  if (amountValue > serviceUbudehe) {
                    return `Amount cannot exceed service ubudehe (${serviceUbudehe})`
                  }
                }

                return true
              },
            }}
            render={({ field }) => (
              <input
                {...field}
                type="number"
                className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
              />
            )}
          />
          {errors.amount && (
            <span className="text-red-500 text-sm mt-1">
              {errors.amount.message}
            </span>
          )}
          {selectedService?.ubudehe && (
            <p className="text-xs text-gray-500 mt-1">
              Service ubudehe: {selectedService.ubudehe} RWF
            </p>
          )}
        </div>

        <div className="flex items-start gap-4 w-full">
          <div className="flex-1 w-full">
            <label
              htmlFor="phone"
              className="block mb-2 text-sm font-medium text-black"
            >
              Phone Number
            </label>
            <Controller
              name="phone1"
              control={control}
              rules={{ required: 'Please enter phone number' }}
              defaultValue={household?.phone1}
              render={({ field }) => (
                <input
                  {...field}
                  type="tel"
                  placeholder="07XX XXX XXX"
                  className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                />
              )}
            />
          </div>
          <div className="flex-1 w-full">
            <label
              htmlFor="phone"
              className="block mb-2 text-sm font-medium text-black"
            >
              SMS Phone
            </label>
            <Controller
              name="sms_phone"
              control={control}
              defaultValue={household?.phone1}
              render={({ field }) => (
                <input
                  {...field}
                  type="tel"
                  readOnly
                  placeholder="07XX XXX XXX"
                  className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                />
              )}
            />
          </div>
        </div>
        <div className="w-full">
          <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
            Choose SMS Language
            <Controller
              name="lang"
              control={control}
              defaultValue={'rw'}
              render={({ field }) => (
                <select
                  {...field}
                  className="p-2 outline-none border-[1px] rounded-md border-primary w-full focus:border-[1.5px] ease-in-out duration-150"
                >
                  <option value="rw">Kinyarwanda</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              )}
            />
          </label>
        </div>
        <Controller
          name="submit"
          control={control}
          render={() => {
            return (
              <Button
                submit
                value={
                  recordOfflinePaymentLoading ? (
                    <>
                      <Loading /> Pay
                    </>
                  ) : (
                    'Pay now'
                  )
                }
              />
            )
          }}
        />
      </form>
    </Modal>
  )
}

RecordOfflinePayment.propTypes = {
  household: PropTypes.shape({}),
}

export default RecordOfflinePayment
