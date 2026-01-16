import { useEffect, useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { toast } from 'react-toastify'
import { useForm, Controller, useWatch } from 'react-hook-form'
import Button from '../Button'
import Input from '../Input'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoneyBill, faX } from '@fortawesome/free-solid-svg-icons'
import moment from 'moment'
import {
  useCreatePaymentSessionMutation,
  useGetHouseholdDepartmentServicesQuery,
} from '../../states/api/apiSlice'
import { useSelector } from 'react-redux'
import Loading from '../Loading'
import WaitingForPayment from './WaitingForPayment'
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

function getServiceIdFromItem(item) {
  return (
    item?.department_service?.service?.id ??
    item?.service?.id ??
    item?.service_id ??
    item?.serviceId ??
    item?.service?.ID ??
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
    `Service #${item?.id ?? ''}`
  )
}

function RecordPaymentModel({
  household,
  showModal,
  setShowModal,
  payment_method,
}) {
  const { user } = useSelector((state) => state.auth)
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm()

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

  // Load household services
  const { data: householdServicesData, isLoading: isLoadingServices } =
    useGetHouseholdDepartmentServicesQuery(
      { householdId: household?.id },
      { skip: !household?.id || !showModal }
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

    // Remove PSF for agent (6) and cell (4) levels
    const numericLevelId = Number(userLevelId)
    if (numericLevelId === 6 || numericLevelId === 4) {
      services = services.filter(
        (service) => getServiceIdFromItem(service) !== 2
      )
    }

    // Filter by householdType
    if (householdType) {
      services = services.filter(
        (service) => service?.householdType === householdType
      )
    }

    return services
  }, [locationFilteredServices, householdType, userLevelId])

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
        if (singleService?.ubudehe) {
          setValue('total_month_paid', singleService.ubudehe)
        }
      }
    }
  }, [filteredServices, selectedServiceId, setValue])

  // Watch the total_month_paid field to display it in the button
  const totalMonthPaid = useWatch({
    control,
    name: 'total_month_paid',
    defaultValue: household?.ubudehe || 0,
  })
  const monthPaidValue = useWatch({
    control,
    name: 'month_paid',
    defaultValue: moment().format('YYYY-MM'),
  })
  const paymentPhoneValue = useWatch({
    control,
    name: 'payment_phone',
    defaultValue: household?.phone1,
  })

  const availableServices = getServicesByHouseholdType()
  const requiresServiceSelection = availableServices.length > 0
  const isMissingRequired =
    !selectedVillage ||
    !monthPaidValue ||
    !paymentPhoneValue ||
    !totalMonthPaid ||
    availableServices.length === 0 ||
    (requiresServiceSelection && !selectedServiceId)

  // Get selected service's ubudehe for validation
  const selectedService = useMemo(() => {
    if (!selectedServiceId) return null
    return filteredServices.find(
      (s) =>
        s?.id?.toString() === selectedServiceId ||
        s?.ID?.toString() === selectedServiceId
    )
  }, [selectedServiceId, filteredServices])

  // Handle service selection
  const handleServiceChange = (e) => {
    const serviceId = e.target.value
    setSelectedServiceId(serviceId)
    setValue('selected_service_id', serviceId)

    if (serviceId) {
      const selectedService = filteredServices.find(
        (s) =>
          s?.id?.toString() === serviceId || s?.ID?.toString() === serviceId
      )

      if (selectedService?.ubudehe) {
        setValue('total_month_paid', selectedService.ubudehe)
      }
    } else {
      // Reset to household ubudehe if no service selected
      setValue('total_month_paid', household?.ubudehe || 0)
    }
  }

  const [
    createPaymentSession,
    {
      data: paymentSessionData,
      isLoading: paymentSessionIsLoading,
      isError: paymentSessionIsError,
      isSuccess: paymentSessionIsSuccess,
    },
  ] = useCreatePaymentSessionMutation()

  const [isWaitingCompletePayment, setIWaitingCompletePayment] = useState(false)
  const [lastPaymentType, setLastPaymentType] = useState(null)

  const startWaiting = () => {
    setIWaitingCompletePayment(true)
  }

  const stopWaiting = () => {
    setIWaitingCompletePayment(false)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const onSubmit = (data, type) => {
    setLastPaymentType(type)
    createPaymentSession({
      household_id: household?.guid,
      month_paid: data?.month_paid,
      total_month_paid: data?.total_month_paid,
      payment_phone: data?.payment_phone,
      lang: data?.lang,
      agent: household?.agents.id || 'N/A',
      phone1: data?.phone1,
      type: type,
      household_service_id: selectedService?.id || selectedServiceId || null,
      payment_method: payment_method,
    })
  }

  const handleConfirm = () => {
    if (isMissingRequired) {
      toast.error('Please fill all required fields before submitting')
      return
    }
    if (
      window.confirm(
        `Are you sure you want to initiate payment of ${
          totalMonthPaid || 0
        } RWF?`
      )
    ) {
      handleSubmit((data) => onSubmit(data, 'emeza'))()
    }
  }

  const handleIshyura = (e) => {
    e.preventDefault()
    if (isMissingRequired) {
      toast.error('Please fill all required fields before submitting')
      return
    }
    if (
      window.confirm(
        `Are you sure you want to continue with payment of ${
          totalMonthPaid || 0
        } RWF?`
      )
    ) {
      handleSubmit((data) => onSubmit(data, 'ishyura'))()
    }
  }

  useEffect(() => {
    if (paymentSessionIsSuccess) {
      toast.success(
        paymentSessionData.message || 'Payment created successfully'
      )

      if (lastPaymentType === 'emeza') {
        // Reload the page for emeza
        window.location.reload()
      } else {
        // Start waiting for ishyura
        startWaiting()
      }
    }
    if (paymentSessionIsError) {
      stopWaiting()
      toast.error(
        'Could not create payment. Please check if all information is correct'
      )
    }
  }, [paymentSessionData, lastPaymentType])

  function getServicesByHouseholdType() {
    if (householdType) {
      return filteredServices.filter(
        (service) => service?.householdType === householdType
      )
    }
    return filteredServices
  }
  return (
    <main className="relative">
      {showModal && (
        <section
          tabIndex={-1}
          aria-hidden="true"
          className="fixed top-0 left-0 right-0 z-50 w-full h-screen p-4 flex items-center justify-center bg-gray-800 bg-opacity-60"
        >
          <div className="relative bg-white rounded-lg w-[700px] shadow md:max-w-[700px] lg:max-w-[800px] xl:max-w-[1000px] mx-auto">
            <article className="bg-primary relative rounded-sm flex flex-row-reverse items-center justify-center py-4 px-4">
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  closeModal()
                }}
                className="absolute right-4 top-4 !px-0 !py-0"
                value={
                  <FontAwesomeIcon
                    icon={faX}
                    className="bg-white text-primary hover:bg-white hover:text-primary p-2 px-[10px] rounded-md"
                  />
                }
              />
              <h4 className="text-[20px] text-center font-medium uppercase text-white">
                {payment_method === 'Mobile_Money'
                  ? 'Record Monthly Transaction'
                  : 'Record Cash Transaction'}
              </h4>
            </article>
            {isWaitingCompletePayment ? (
              <>
                <WaitingForPayment onCancel={stopWaiting} />
              </>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4 items-center w-full p-4 md:px-6 lg:px-10"
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
                      <span className="text-red-500">
                        {errors.month_paid.message}
                      </span>
                    )}
                  </label>

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
                  {activeServices.length > 0 &&
                    availableHouseholdTypes.length > 0 && (
                      <div className="flex items-start gap-6 w-full">
                        <label className="text-[15px] flex-1 flex flex-col items-start gap-2">
                          Household Type
                          <Controller
                            name="householdType"
                            control={control}
                            defaultValue={
                              availableHouseholdTypes[0] || 'Residence'
                            }
                            render={({ field }) => (
                              <select
                                {...field}
                                value={householdType}
                                onChange={(e) => {
                                  field.onChange(e)
                                  setHouseholdType(e.target.value)
                                }}
                                className="p-2 outline-none border-[1px] rounded-md border-primary w-full focus:border-[1.5px] ease-in-out duration-150"
                                disabled={!selectedVillage}
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
                                  !selectedVillage ||
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
                        </label>
                      </div>
                    )}

                  <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
                    Amount Paid
                    <Controller
                      name="total_month_paid"
                      control={control}
                      defaultValue={household?.ubudehe}
                      rules={{
                        required: 'Amount is required',
                        validate: (value) => {
                          const amount = parseFloat(value) || 0

                          // Check if amount is less than or equal to zero
                          if (amount <= 0) {
                            return 'Amount must be greater than zero'
                          }

                          // Check if amount exceeds service ubudehe
                          if (selectedService?.ubudehe) {
                            const serviceUbudehe =
                              parseFloat(selectedService.ubudehe) || 0
                            if (amount > serviceUbudehe) {
                              return `Amount cannot exceed service ubudehe (${serviceUbudehe})`
                            }
                          }

                          return true
                        },
                      }}
                      render={({ field }) => (
                        <Input type="number" {...field} placeholder="1000" />
                      )}
                    />
                    {errors.total_month_paid && (
                      <span className="text-red-500">
                        {errors.total_month_paid.message}
                      </span>
                    )}
                    {selectedService?.ubudehe && (
                      <p className="text-xs text-gray-500 mt-1">
                        Service ubudehe: {selectedService.ubudehe} RWF
                      </p>
                    )}
                  </label>
                </div>
                <div className="flex items-start gap-6 w-full">
                  <label className="text-[15px] flex-1 flex flex-col items-start gap-2">
                  {payment_method === 'Mobile_Money' ? 'Numero iriho amafaranga' : 'Numero ya telephone'}
                    <Controller
                      name="payment_phone"
                      control={control}
                      defaultValue={household?.phone1}
                      rules={{ required: 'Please enter the phone number' }}
                      render={({ field }) => (
                        <Input
                          type="text"
                          {...field}
                          placeholder="07XXXXXXXX"
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
                <div className="flex gap-4 w-full mt-2">
                  {payment_method === 'Mobile_Money' && (
                    <>
                      <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={paymentSessionIsLoading || isMissingRequired}
                        className="!w-full !bg-blue-600 hover:!bg-blue-700 !text-white"
                        value={
                          paymentSessionIsLoading ? (
                            <>
                              <Loading /> Pay
                            </>
                          ) : (
                            `Emeza ${totalMonthPaid || 0} RWF`
                          )
                        }
                      />
                      <Button
                        type="button"
                        onClick={handleIshyura}
                        disabled={paymentSessionIsLoading || isMissingRequired}
                        className="!w-full !bg-green-600 hover:!bg-green-700 !text-white"
                        value={
                          paymentSessionIsLoading ? (
                            <>
                              <Loading /> Pay
                            </>
                          ) : (
                            `Ishyura ${totalMonthPaid || 0} RWF`
                          )
                        }
                      />
                    </>
                  )}
                  {payment_method === 'Cash' && (
                    <Button
                      type="button"
                      onClick={handleConfirm}
                      disabled={paymentSessionIsLoading || isMissingRequired}
                      className="!w-full !bg-blue-600 hover:!bg-blue-700 !text-white"
                      value={
                        paymentSessionIsLoading ? (
                          <>
                            <Loading /> Pay Cash
                          </>
                        ) : (
                          `Pay Cash ${totalMonthPaid || 0} RWF`
                        )
                      }
                    />
                  )}
                </div>
              </form>
            )}
          </div>
        </section>
      )}
    </main>
  )
}

RecordPaymentModel.propTypes = {
  household: PropTypes.shape({}),
  showModal: PropTypes.bool,
  setShowModal: PropTypes.func,
}

export default RecordPaymentModel
