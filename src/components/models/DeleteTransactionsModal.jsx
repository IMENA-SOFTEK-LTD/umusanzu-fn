import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { toast } from 'react-toastify'
import Modal from './Modal'
import Button from '../Button'
import { 
  useDeleteAllTransactionsMutation,
  useLazyGetCountryDistrictsQuery,
  useLazyGetDistrictSectorsQuery,
  useLazyGetSectorCellsQuery,
  useLazyGetCellVillagesQuery,
} from '../../states/api/apiSlice'

const provinces = [
  { id: 31, name: 'Kigali City' },
  { id: 1540, name: 'Western Province' },
  { id: 1678, name: 'Northern Province' },
  { id: 1836, name: 'Eastern Province' },
  { id: 1986, name: 'Southern Province' },
]

const DeleteTransactionsModal = ({ isOpen, onClose, onSuccess }) => {
  const [deleteFilters, setDeleteFilters] = useState({
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
    month: '', // Format: YYYY-MM (e.g., 2025-09)
  })
  const [districts, setDistricts] = useState([])
  const [sectors, setSectors] = useState([])
  const [cells, setCells] = useState([])
  const [villages, setVillages] = useState([])

  const [
    deleteAllTransactions,
    { isLoading: isDeleting }
  ] = useDeleteAllTransactionsMutation()

  // GET DISTRICTS
  const [
    getCountryDistricts,
    {
      data: countryDistrictsData,
      isLoading: countryDistrictsLoading,
    },
  ] = useLazyGetCountryDistrictsQuery()

  // GET SECTORS
  const [
    getDistrictSectors,
    {
      data: districtSectorsData,
      isLoading: districtSectorsLoading,
    },
  ] = useLazyGetDistrictSectorsQuery()

  // GET CELLS
  const [
    getSectorCells,
    {
      data: sectorCellsData,
      isLoading: sectorCellsLoading,
    },
  ] = useLazyGetSectorCellsQuery()

  // GET VILLAGES
  const [
    getCellVillages,
    {
      data: cellVillagesData,
      isLoading: cellVillagesLoading,
    },
  ] = useLazyGetCellVillagesQuery()

  // Fetch districts when province changes
  useEffect(() => {
    if (deleteFilters.province) {
      getCountryDistricts({ id: deleteFilters.province })
    } else {
      setDistricts([])
    }
  }, [deleteFilters.province, getCountryDistricts])

  // Update districts state
  useEffect(() => {
    if (countryDistrictsData) {
      setDistricts(countryDistrictsData?.data?.rows || [])
    }
  }, [countryDistrictsData])

  // Fetch sectors when district changes
  useEffect(() => {
    if (deleteFilters.district) {
      getDistrictSectors({ id: deleteFilters.district })
    } else {
      setSectors([])
    }
  }, [deleteFilters.district, getDistrictSectors])

  // Update sectors state
  useEffect(() => {
    if (districtSectorsData) {
      setSectors(districtSectorsData?.data?.rows || [])
    }
  }, [districtSectorsData])

  // Fetch cells when sector changes
  useEffect(() => {
    if (deleteFilters.sector) {
      getSectorCells({ id: deleteFilters.sector })
    } else {
      setCells([])
    }
  }, [deleteFilters.sector, getSectorCells])

  // Update cells state
  useEffect(() => {
    if (sectorCellsData) {
      setCells(sectorCellsData?.data?.rows || [])
    }
  }, [sectorCellsData])

  // Fetch villages when cell changes
  useEffect(() => {
    if (deleteFilters.cell) {
      getCellVillages({ id: deleteFilters.cell })
    } else {
      setVillages([])
    }
  }, [deleteFilters.cell, getCellVillages])

  // Update villages state
  useEffect(() => {
    if (cellVillagesData) {
      setVillages(cellVillagesData?.data?.rows || [])
    }
  }, [cellVillagesData])

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!deleteFilters.province || !deleteFilters.district || !deleteFilters.sector || 
        !deleteFilters.cell || !deleteFilters.village || !deleteFilters.month) {
      toast.error('Please select all required filters (Province, District, Sector, Cell, Village, and Payment Month)')
      return
    }

    // Validate month format (YYYY-MM)
    const monthPattern = /^\d{4}-\d{2}$/
    if (!monthPattern.test(deleteFilters.month)) {
      toast.error('Please select a valid month in YYYY-MM format')
      return
    }

    try {
      await deleteAllTransactions(deleteFilters).unwrap()
      toast.success('All transactions deleted successfully')
      handleClose()
      
      // Call onSuccess if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete transactions')
    }
  }

  const handleClose = () => {
    onClose()
    setDeleteFilters({
      province: '',
      district: '',
      sector: '',
      cell: '',
      village: '',
      month: '',
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="flex flex-col gap-4 w-full max-w-2xl">
        <h2 className="text-xl font-bold text-red-600">Delete All Transactions</h2>
      
        {/* Warning Message */}
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800 mb-2">
            <strong>Warning:</strong> This will permanently delete all transaction records for the selected location and payment month.
          </p>
          <p className="text-sm text-red-800">
            This action cannot be undone. Please proceed with caution.
          </p>
        </div>

        {/* Payment Month */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-gray-700">
            Payment Month (Required)
          </label>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Select Month (YYYY-MM)</label>
            <input
              type="month"
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={deleteFilters.month}
              onChange={(e) => setDeleteFilters({...deleteFilters, month: e.target.value})}
              min="2000-01"
              max="2100-12"
            />
            {deleteFilters.month && (
              <p className="text-xs text-gray-500 mt-1">
                Selected: <span className="font-medium">{deleteFilters.month}</span>
              </p>
            )}
          </div>
        </div>

        {/* Location Filters */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-gray-700">
            Select Location (Required)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Province</label>
              <select
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                value={deleteFilters.province}
                onChange={(e) => setDeleteFilters({...deleteFilters, province: e.target.value, district: '', sector: '', cell: '', village: ''})}
              >
                <option value="">Select Province</option>
                {provinces.map((province) => (
                  <option key={province.id} value={province.id}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-xs text-gray-600 mb-1 block">District</label>
              <select
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                value={deleteFilters.district}
                onChange={(e) => setDeleteFilters({...deleteFilters, district: e.target.value, sector: '', cell: '', village: ''})}
                disabled={!deleteFilters.province || countryDistrictsLoading}
              >
                <option value="">
                  {countryDistrictsLoading ? 'Loading...' : 'Select District'}
                </option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-600 mb-1 block">Sector</label>
              <select
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                value={deleteFilters.sector}
                onChange={(e) => setDeleteFilters({...deleteFilters, sector: e.target.value, cell: '', village: ''})}
                disabled={!deleteFilters.district || districtSectorsLoading}
              >
                <option value="">
                  {districtSectorsLoading ? 'Loading...' : 'Select Sector'}
                </option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-600 mb-1 block">Cell</label>
              <select
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                value={deleteFilters.cell}
                onChange={(e) => setDeleteFilters({...deleteFilters, cell: e.target.value, village: ''})}
                disabled={!deleteFilters.sector || sectorCellsLoading}
              >
                <option value="">
                  {sectorCellsLoading ? 'Loading...' : 'Select Cell'}
                </option>
                {cells.map((cell) => (
                  <option key={cell.id} value={cell.id}>
                    {cell.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-xs text-gray-600 mb-1 block">Village</label>
              <select
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                value={deleteFilters.village}
                onChange={(e) => setDeleteFilters({...deleteFilters, village: e.target.value})}
                disabled={!deleteFilters.cell || cellVillagesLoading}
              >
                <option value="">
                  {cellVillagesLoading ? 'Loading...' : 'Select Village'}
                </option>
                {villages.map((village) => (
                  <option key={village.id} value={village.id}>
                    {village.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 justify-end pt-2">
          <Button
            value="Cancel"
            onClick={handleClose}
            className="!bg-gray-500"
          />
          <Button
            value={isDeleting ? 'Deleting...' : 'Delete All Transactions'}
            onClick={handleConfirmDelete}
            className="!bg-red-600"
            disabled={isDeleting}
          />
        </div>
      </div>
    </Modal>
  )
}

DeleteTransactionsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
}

export default DeleteTransactionsModal

