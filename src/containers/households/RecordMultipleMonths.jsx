import { useDispatch, useSelector } from 'react-redux'
import Modal from '../../components/models/Modal'
import { setMultiplePaymentModal } from '../../states/features/transactions/paymentSlice'
import { Controller, useForm } from 'react-hook-form'
import Input from '../../components/Input'
import { useEffect, useMemo, useState } from 'react'
import { monthsBetween } from '../../utils/Dates'
import Button from '../../components/Button'
import {
  useRecordMultiplePaymentsMutation,
  useGetHouseholdDepartmentServicesQuery,
} from '../../states/api/apiSlice'
import { toast } from 'react-toastify'
import Loading from '../../components/Loading'
import moment from 'moment'
import WaitingForPayment from '../../components/models/WaitingForPayment'
import {
  getProvinces,
  getDistricts,
  getSectors,
  getCells,
  getVillages,
  filterServicesByLocation,
} from '../../utils/Locations'

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

const RecordMultipleMonths = () => {
  // STATE VARIABLES
  const dispatch = useDispatch()
  const { multiplePaymentModal } = useSelector((state) => state.payment)
  const { household } = useSelector((state) => state.household)
  const { user } = useSelector((state) => state.auth)
  const [isWaitingCompletePayment, setIWaitingCompletePayment] = useState(false)
  const [waitingDetails, setWaitingDetails] = useState(null)
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [lastPaymentType, setLastPaymentType] = useState(null)
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
        // Will extract villages from services
        break
      default:
        break
    }
  }, [user?.departments, userLevelId, userDepartmentId])

  // Location data is now extracted from services - no API calls needed

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

  const startWaiting = () => {
    setIWaitingCompletePayment(true)
  }

  const stopWaiting = () => {
    setIWaitingCompletePayment(false)
    setWaitingDetails(null)
  }
  // INITIATE RECORD MULTIPLE MONTHS FORM
  const [
    recordMultiplePayments,
    {
      data: recordMultiplePaymentsData,
      isLoading: recordMultiplePaymentsLoading,
      isSuccess: recordMultiplePaymentsSuccess,
      isError: recordMultiplePaymentsError,
    },
  ] = useRecordMultiplePaymentsMutation()

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm()

  // Load household services
  const { data: householdServicesData, isLoading: isLoadingServices } =
    useGetHouseholdDepartmentServicesQuery(
      { householdId: household?.id },
      { skip: !household?.id || !multiplePaymentModal }
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
    setValue('selected_service_id', '')
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
        setValue('selected_service_id', serviceId.toString())
      }
    }
  }, [filteredServices, selectedServiceId, setValue])

  // Calculate minimum allowed month (first day of next month)
  const minMonth = useMemo(() => {
    return moment().add(1, 'month').startOf('month').format('YYYY-MM')
  }, [])

  // Validation function to ensure month is in the future
  const validateFutureMonth = (value) => {
    if (!value) return 'Month is required'
    const selectedDate = moment(value, 'YYYY-MM')
    const nextMonth = moment().add(1, 'month').startOf('month')
    if (selectedDate.isBefore(nextMonth, 'month')) {
      return 'Only future months are allowed'
    }
    return true
  }

  // Validation function for end month to ensure it's not before start month
  const validateEndMonth = (value, formValues) => {
    const startMonth = formValues.start_month
    if (!startMonth) return true // Will be caught by required validation

    const startDate = moment(startMonth, 'YYYY-MM')
    const endDate = moment(value, 'YYYY-MM')

    if (endDate.isBefore(startDate, 'month')) {
      return 'End month must be after or equal to start month'
    }
    return validateFutureMonth(value)
  }

  // Handle service selection
  const handleServiceChange = (e) => {
    const serviceId = e.target.value
    setSelectedServiceId(serviceId)
    setValue('selected_service_id', serviceId)
  }

  // CALCULATE TOTAL AMOUNT
  useEffect(() => {
    const months = monthsBetween(watch('start_month'), watch('end_month'))
    const ubudehe = selectedService?.ubudehe || household?.ubudehe || 0
    setValue('total_month_paid', months?.length * ubudehe)
  }, [
    watch('start_month'),
    watch('end_month'),
    selectedService,
    household,
    setValue,
  ])

  const onSubmit = (data, type = 'ishyura') => {
    setLastPaymentType(type)
    recordMultiplePayments({
      household_id: household?.guid,
      start_month: data?.start_month,
      end_month: data?.end_month,
      payment_phone: data?.payment_phone,
      agent: user?.id,
      phone1: data?.phone1,
      lang: data?.lang,
      type: type === 'emeza' ? 'emeza' : 'ishyura',
      service_id: data?.selected_service_id || selectedServiceId || null,
      ubudehe: selectedService?.ubudehe || household?.ubudehe || null,
      householdType: householdType,
    })
  }

  const handleConfirm = () => {
    const totalAmount = watch('total_month_paid') || 0
    if (
      window.confirm(
        `Are you sure you want to initiate payment of ${totalAmount} RWF?`
      )
    ) {
      handleSubmit((data) => onSubmit(data, 'emeza'))()
    }
  }

  const handleIshyura = (e) => {
    e.preventDefault()
    const totalAmount = watch('total_month_paid') || 0
    if (
      window.confirm(
        `Are you sure you want to continue with payment of ${totalAmount} RWF?`
      )
    ) {
      handleSubmit((data) => onSubmit(data, 'ishyura'))()
    }
  }

  // HANDLE RECORD MULTIPLE MONTHS PAYMENT
  useEffect(() => {
    if (recordMultiplePaymentsSuccess) {
      toast.success('Multiple months recorded successfully.')

      if (lastPaymentType === 'emeza') {
        // Reload the page for emeza
        window.location.reload()
      } else {
        // Start waiting for ishyura
        startWaiting()
        setWaitingDetails(recordMultiplePaymentsData)
      }
    } else if (recordMultiplePaymentsError) {
      stopWaiting()
      toast.error('Could not record multiple months. Please try again later.')
    }
  }, [
    recordMultiplePaymentsSuccess,
    recordMultiplePaymentsError,
    recordMultiplePaymentsData,
    lastPaymentType,
  ])

  return (
    <Modal
      isOpen={multiplePaymentModal}
      onClose={() => {
        dispatch(setMultiplePaymentModal(false))
      }}
    >
      <h1 className="flex text-lg uppercase font-semibold text-primary px-4">
        Pay Advance
      </h1>
      {isWaitingCompletePayment ? (
        <>
          <WaitingForPayment onCancel={stopWaiting} details={waitingDetails} />
        </>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 items-center w-full p-4"
        >
           <span className="flex items-start gap-6 w-full">
            <Controller
              rules={{
                required: 'Start month is required',
                validate: validateFutureMonth,
              }}
              name="start_month"
              control={control}
              render={({ field }) => {
                return (
                  <label className="flex flex-col gap-1 items-start w-full">
                    <p>
                      Start Month <span className="text-red-600">*</span>
                    </p>
                    <Input type="month" min={minMonth} {...field} />
                    {errors.start_month && (
                      <span className="text-red-500">
                        {errors.start_month.message}
                      </span>
                    )}
                  </label>
                )
              }}
            />
            <Controller
              rules={{
                required: 'End month is required',
                validate: (value) => {
                  const startMonth = watch('start_month')
                  return validateEndMonth(value, { start_month: startMonth })
                },
              }}
              name="end_month"
              control={control}
              render={({ field }) => {
                return (
                  <label className="flex flex-col gap-1 items-start w-full">
                    <p>
                      End Month <span className="text-red-600">*</span>
                    </p>
                    <Input type="month" min={minMonth} {...field} />
                    {errors.end_month && (
                      <span className="text-red-500">
                        {errors.end_month.message}
                      </span>
                    )}
                  </label>
                )
              }}
            />
          </span>
          {/* Location filters for Country level users */}
          {userLevelId === 5 && activeServices.length > 0 && (
            <div className="flex items-start gap-6 w-full flex-wrap">
              <label className="text-[15px] flex-1 flex flex-col items-start gap-2">
                Province
                <select
                  value={selectedProvince || ''}
                  onChange={(e) =>
                    setSelectedProvince(Number(e.target.value) || null)
                  }
                  className="p-2 outline-none border-[1px] rounded-md border-primary w-full focus:border-[1.5px] ease-in-out duration-150"
                  disabled={false}
                >
                  <option value="">All Provinces</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[15px] flex-1 flex flex-col items-start gap-2">
                District
                <select
                  value={selectedDistrict || ''}
                  onChange={(e) =>
                    setSelectedDistrict(Number(e.target.value) || null)
                  }
                  className="p-2 outline-none border-[1px] rounded-md border-primary w-full focus:border-[1.5px] ease-in-out duration-150"
                  disabled={!selectedProvince}
                >
                  <option value="">All Districts</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[15px] flex-1 flex flex-col items-start gap-2">
                Sector
                <select
                  value={selectedSector || ''}
                  onChange={(e) =>
                    setSelectedSector(Number(e.target.value) || null)
                  }
                  className="p-2 outline-none border-[1px] rounded-md border-primary w-full focus:border-[1.5px] ease-in-out duration-150"
                  disabled={!selectedDistrict}
                >
                  <option value="">All Sectors</option>
                  {sectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      {sector.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[15px] flex-1 flex flex-col items-start gap-2">
                Cell
                <select
                  value={selectedCell || ''}
                  onChange={(e) =>
                    setSelectedCell(Number(e.target.value) || null)
                  }
                  className="p-2 outline-none border-[1px] rounded-md border-primary w-full focus:border-[1.5px] ease-in-out duration-150"
                  disabled={!selectedSector}
                >
                  <option value="">All Cells</option>
                  {cells.map((cell) => (
                    <option key={cell.id} value={cell.id}>
                      {cell.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[15px] flex-1 flex flex-col items-start gap-2">
                Village
                <select
                  value={selectedVillage || ''}
                  onChange={(e) =>
                    setSelectedVillage(Number(e.target.value) || null)
                  }
                  className="p-2 outline-none border-[1px] rounded-md border-primary w-full focus:border-[1.5px] ease-in-out duration-150"
                  disabled={!selectedCell}
                >
                  <option value="">All Villages</option>
                  {villages.map((village) => (
                    <option key={village.id} value={village.id}>
                      {village.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {/* Location filters for Province level users */}
          {userLevelId === 1 && activeServices.length > 0 && (
            <div className="flex items-start gap-6 w-full flex-wrap">
              <label className="text-[15px] flex-1 flex flex-col items-start gap-2">
                District
                <select
                  value={selectedDistrict || ''}
                  onChange={(e) =>
                    setSelectedDistrict(Number(e.target.value) || null)
                  }
                  className="p-2 outline-none border-[1px] rounded-md border-primary w-full focus:border-[1.5px] ease-in-out duration-150"
                  disabled={false}
                >
                  <option value="">All Districts</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[15px] flex-1 flex flex-col items-start gap-2">
                Sector
                <select
                  value={selectedSector || ''}
                  onChange={(e) =>
                    setSelectedSector(Number(e.target.value) || null)
                  }
                  className="p-2 outline-none border-[1px] rounded-md border-primary w-full focus:border-[1.5px] ease-in-out duration-150"
                  disabled={!selectedDistrict}
                >
                  <option value="">All Sectors</option>
                  {sectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      {sector.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[15px] flex-1 flex flex-col items-start gap-2">
                Cell
                <select
                  value={selectedCell || ''}
                  onChange={(e) =>
                    setSelectedCell(Number(e.target.value) || null)
                  }
                  className="p-2 outline-none border-[1px] rounded-md border-primary w-full focus:border-[1.5px] ease-in-out duration-150"
                  disabled={!selectedSector}
                >
                  <option value="">All Cells</option>
                  {cells.map((cell) => (
                    <option key={cell.id} value={cell.id}>
                      {cell.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[15px] flex-1 flex flex-col items-start gap-2">
                Village
                <select
                  value={selectedVillage || ''}
                  onChange={(e) =>
                    setSelectedVillage(Number(e.target.value) || null)
                  }
                  className="p-2 outline-none border-[1px] rounded-md border-primary w-full focus:border-[1.5px] ease-in-out duration-150"
                  disabled={!selectedCell}
                >
                  <option value="">All Villages</option>
                  {villages.map((village) => (
                    <option key={village.id} value={village.id}>
                      {village.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {/* Location filters for District level users */}
          {userLevelId === 2 && activeServices.length > 0 && (
            <div className="flex items-start gap-6 w-full">
              <label className="text-[15px] flex-1 flex flex-col items-start gap-2">
                Sector
                <select
                  value={selectedSector || ''}
                  onChange={(e) =>
                    setSelectedSector(Number(e.target.value) || null)
                  }
                  className="p-2 outline-none border-[1px] rounded-md border-primary w-full focus:border-[1.5px] ease-in-out duration-150"
                  disabled={false}
                >
                  <option value="">All Sectors</option>
                  {sectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      {sector.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[15px] flex-1 flex flex-col items-start gap-2">
                Cell
                <select
                  value={selectedCell || ''}
                  onChange={(e) =>
                    setSelectedCell(Number(e.target.value) || null)
                  }
                  className="p-2 outline-none border-[1px] rounded-md border-primary w-full focus:border-[1.5px] ease-in-out duration-150"
                  disabled={!selectedSector}
                >
                  <option value="">All Cells</option>
                  {cells.map((cell) => (
                    <option key={cell.id} value={cell.id}>
                      {cell.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[15px] flex-1 flex flex-col items-start gap-2">
                Village
                <select
                  value={selectedVillage || ''}
                  onChange={(e) =>
                    setSelectedVillage(Number(e.target.value) || null)
                  }
                  className="p-2 outline-none border-[1px] rounded-md border-primary w-full focus:border-[1.5px] ease-in-out duration-150"
                  disabled={!selectedCell}
                >
                  <option value="">All Villages</option>
                  {villages.map((village) => (
                    <option key={village.id} value={village.id}>
                      {village.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {/* Location filters for Sector level users - Cell and Village */}
          {userLevelId === 3 && activeServices.length > 0 && (
            <div className="flex items-start gap-6 w-full">
              <label className="text-[15px] flex-1 flex flex-col items-start gap-2">
                Cell
                <select
                  value={selectedCell || ''}
                  onChange={(e) =>
                    setSelectedCell(Number(e.target.value) || null)
                  }
                  className="p-2 outline-none border-[1px] rounded-md border-primary w-full focus:border-[1.5px] ease-in-out duration-150"
                  disabled={false}
                >
                  <option value="">All Cells</option>
                  {cells.map((cell) => (
                    <option key={cell.id} value={cell.id}>
                      {cell.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[15px] flex-1 flex flex-col items-start gap-2">
                Village
                <select
                  value={selectedVillage || ''}
                  onChange={(e) =>
                    setSelectedVillage(Number(e.target.value) || null)
                  }
                  className="p-2 outline-none border-[1px] rounded-md border-primary w-full focus:border-[1.5px] ease-in-out duration-150"
                  disabled={!selectedCell}
                >
                  <option value="">All Villages</option>
                  {villages.map((village) => (
                    <option key={village.id} value={village.id}>
                      {village.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {/* Location filters for Cell level users - Village only */}
          {userLevelId === 4 && activeServices.length > 0 && (
            <div className="flex items-start gap-6 w-full">
              <label className="text-[15px] flex-1 flex flex-col items-start gap-2">
                Village
                <select
                  value={selectedVillage || ''}
                  onChange={(e) =>
                    setSelectedVillage(Number(e.target.value) || null)
                  }
                  className="p-2 outline-none border-[1px] rounded-md border-primary w-full focus:border-[1.5px] ease-in-out duration-150"
                  disabled={false}
                >
                  <option value="">All Villages</option>
                  {villages.map((village) => (
                    <option key={village.id} value={village.id}>
                      {village.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {activeServices.length > 0 && availableHouseholdTypes.length > 0 && (
            <div className="flex items-start gap-6 w-full">
              <label className="text-[15px] flex-1 flex flex-col items-start gap-2">
                Household Type
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
                      className="p-2 outline-none border-[1px] rounded-md border-primary w-full focus:border-[1.5px] ease-in-out duration-150"
                    >
                      {availableHouseholdTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </label>
              <label className="text-[15px] flex-1 flex flex-col items-start gap-2">
                Select Service
                <Controller
                  name="selected_service_id"
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
                      className="p-2 outline-none border-[1px] rounded-md border-primary w-full focus:border-[1.5px] ease-in-out duration-150"
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
                {errors.selected_service_id && (
                  <span className="text-red-500">
                    {errors.selected_service_id.message}
                  </span>
                )}
                {selectedService?.ubudehe && (
                  <p className="text-xs text-gray-500 mt-1">
                    Service ubudehe: {selectedService.ubudehe} RWF
                  </p>
                )}
              </label>
            </div>
          )}

         

          <div className="flex items-start gap-6 w-full">
            <label className="text-[15px] flex-1 flex flex-col items-start gap-2">
              Numero iriho amafaranga
              <Controller
                name="payment_phone"
                control={control}
                defaultValue={household?.phone1}
                rules={{ required: 'Phone number required' }}
                render={({ field }) => (
                  <Input
                    type="text"
                    {...field}
                    defaultValue={household?.phone1}
                    placeholder={household?.phone1}
                  />
                )}
              />
              {errors.payment_phone && (
                <span className="text-red-500">
                  {errors.payment_phone.message}
                </span>
              )}
            </label>
            <label className="text-[15px] flex-1 flex flex-col items-start gap-2">
              Numero yakira message(SMS)
              <Controller
                name="phone1"
                control={control}
                defaultValue={household?.phone1}
                render={({ field }) => (
                  <Input
                    readonly
                    type="text"
                    {...field}
                    placeholder="07XX XXX XXX"
                  />
                )}
              />
              {errors.phone1 && (
                <span className="text-red-500">{errors.phone1.message}</span>
              )}
            </label>
          </div>
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

          <Controller
            control={control}
            name="total_month_paid"
            defaultValue={watch('total_month_paid')}
            render={({ field }) => {
              return (
                <label className="flex flex-col gap-1 items-start w-full">
                  <p>
                    Amount paid <span className="text-red-600">*</span>
                  </p>
                  <Input
                    readonly
                    defaultValue={watch('total_month_paid')}
                    type="number"
                    {...field}
                  />
                </label>
              )
            }}
          />
          <div className="flex gap-4 w-full mt-2">
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={recordMultiplePaymentsLoading}
              className="!w-full !bg-blue-600 hover:!bg-blue-700 !text-white"
              value={
                recordMultiplePaymentsLoading ? (
                  <Loading />
                ) : (
                  `Emeza ${watch('total_month_paid') || 0} RWF`
                )
              }
            />
            <Button
              type="button"
              onClick={handleIshyura}
              disabled={recordMultiplePaymentsLoading}
              className="!w-full !bg-green-600 hover:!bg-green-700 !text-white"
              value={
                recordMultiplePaymentsLoading ? (
                  <Loading />
                ) : (
                  `Ishyura ${watch('total_month_paid') || 0} RWF`
                )
              }
            />
          </div>
        </form>
      )}
    </Modal>
  )
}

export default RecordMultipleMonths
