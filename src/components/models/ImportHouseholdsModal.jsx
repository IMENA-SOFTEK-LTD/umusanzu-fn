import { useState, useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import * as XLSX from 'xlsx'
import Modal from './Modal'
import Button from '../Button'
import { 
  useImportHouseholdsMutation,
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

// Phone number validation function
const checkPhoneMoneyProvider = (phoneNumber) => {
  if (!phoneNumber) return false
  const patternMobileMoney = /^07[89]\d{7}$/
  const patternAirtelMoney = /^07[23]\d{7}$/

  if (patternMobileMoney.test(phoneNumber)) {
    return true
  }
  if (patternAirtelMoney.test(phoneNumber)) {
    return true
  }
  return false
}

const ImportHouseholdsModal = ({ isOpen, onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileData, setFileData] = useState([])
  const [importFilters, setImportFilters] = useState({
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
  })
  const [districts, setDistricts] = useState([])
  const [sectors, setSectors] = useState([])
  const [cells, setCells] = useState([])
  const [villages, setVillages] = useState([])
  const [importResult, setImportResult] = useState(null)
  const [showResultModal, setShowResultModal] = useState(false)

  const [
    importHouseholds,
    { isLoading: isImporting }
  ] = useImportHouseholdsMutation()

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
    if (importFilters.province) {
      getCountryDistricts({ id: importFilters.province })
    } else {
      setDistricts([])
    }
  }, [importFilters.province, getCountryDistricts])

  // Update districts state
  useEffect(() => {
    if (countryDistrictsData) {
      setDistricts(countryDistrictsData?.data?.rows || [])
    }
  }, [countryDistrictsData])

  // Fetch sectors when district changes
  useEffect(() => {
    if (importFilters.district) {
      getDistrictSectors({ id: importFilters.district })
    } else {
      setSectors([])
    }
  }, [importFilters.district, getDistrictSectors])

  // Update sectors state
  useEffect(() => {
    if (districtSectorsData) {
      setSectors(districtSectorsData?.data?.rows || [])
    }
  }, [districtSectorsData])

  // Fetch cells when sector changes
  useEffect(() => {
    if (importFilters.sector) {
      getSectorCells({ id: importFilters.sector })
    } else {
      setCells([])
    }
  }, [importFilters.sector, getSectorCells])

  // Update cells state
  useEffect(() => {
    if (sectorCellsData) {
      setCells(sectorCellsData?.data?.rows || [])
    }
  }, [sectorCellsData])

  // Fetch villages when cell changes
  useEffect(() => {
    if (importFilters.cell) {
      getCellVillages({ id: importFilters.cell })
    } else {
      setVillages([])
    }
  }, [importFilters.cell, getCellVillages])

  // Update villages state
  useEffect(() => {
    if (cellVillagesData) {
      setVillages(cellVillagesData?.data?.rows || [])
    }
  }, [cellVillagesData])

  // Download Excel template
  const downloadTemplate = useCallback(() => {
    const templateData = [
      {
        name: 'John Doe', // Required
        nid: '1199887766554433', // Required
        phone1: '0781234567', // Required
        phone2: '', // Optional (column required, value optional)
        ubudehe: 3000, // Required
        tin: '', // Optional (column required, value optional)
        email: '', // Optional (column required, value optional)
        type: 'residence', // Required (residence or business)
      },
    ]

    const worksheet = XLSX.utils.json_to_sheet(templateData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Households')

    // Write and download
    XLSX.writeFile(workbook, 'household_import_template.xlsx')
    toast.success('Template downloaded successfully')
  }, [])

  // Handle file selection and validation
  const handleFileChange = useCallback((event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Reset previous file data
    setFileData([])
    setSelectedFile(file)

    // Validate file extension
    const validExtensions = ['.xlsx', '.xls', '.csv']
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
    
    if (!validExtensions.includes(fileExtension)) {
      toast.error('Please upload a valid Excel file (.xlsx, .xls, .csv)')
      setSelectedFile(null)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // Assume first sheet
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        
        // Get column headers from the worksheet (first row)
        // This ensures we detect all columns even if they have empty values
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
        const headers = []
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C })
          const cell = worksheet[cellAddress]
          if (cell) {
            headers.push(cell.v.toString().toLowerCase().trim())
          }
        }

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        // Validate columns
        const requiredColumns = ['name', 'nid', 'phone1', 'phone2', 'ubudehe', 'tin', 'email', 'type']
        
        // Check if file has any data rows
        if (jsonData.length === 0) {
          toast.error('File has no data rows')
          setSelectedFile(null)
          return
        }

        // Check for missing columns (case-insensitive comparison)
        const missingColumns = requiredColumns.filter(col => !headers.includes(col))
        if (missingColumns.length > 0) {
          toast.error(`Missing required columns: ${missingColumns.join(', ')}`)
          setSelectedFile(null)
          setFileData([])
          return
        }

        // Clean and normalize the data
        const cleanedData = jsonData.map((row, index) => ({
          name: row.name?.toString().trim() || null,
          nid: row.nid?.toString().trim() || null,
          phone1: row.phone1?.toString().trim() || null,
          phone2: row.phone2?.toString().trim() || null,
          ubudehe: row.ubudehe || null,
          tin: row.tin?.toString().trim() || null,
          email: row.email?.toString().trim() || null,
          type: row.type?.toString().toLowerCase().trim() || null,
        }))

        // Validate data types (only name, phone1, ubudehe, and type are required values)
        const invalidRows = []
        const phoneErrors = []
        
        cleanedData.forEach((row, index) => {
          let hasError = false
          const rowNum = index + 2 // +2 because Excel is 1-indexed and we skip header
          
          // Check required fields
          if (!row.name || !row.phone1 || !row.ubudehe) {
            hasError = true
          }
          
          // Validate phone1 format (required field)
          if (row.phone1 && !checkPhoneMoneyProvider(row.phone1)) {
            hasError = true
            phoneErrors.push(`Row ${rowNum}: phone1 "${row.phone1}" is not a valid mobile number (MTN: 078/079, Airtel: 072/073)`)
          }
          
          // Validate phone2 format (if provided and not empty)
          if (!!row.phone2 && !checkPhoneMoneyProvider(row.phone2)) {
            hasError = true
            phoneErrors.push(`Row ${rowNum}: phone2 "${row.phone2}" is not a valid mobile number (MTN: 078/079, Airtel: 072/073)`)
          }
          
          // Validate type
          if (row.type && !['residence', 'business'].includes(row.type)) {
            hasError = true
          }
          
          if (hasError) {
            invalidRows.push(rowNum)
          }
          // Note: tin and email columns are required but values are optional (can be null)
        })

        if (invalidRows.length > 0) {
          // If there are phone validation errors, show them specifically
          if (phoneErrors.length > 0) {
            toast.error(`Invalid phone numbers found. Please fix these errors:\n${phoneErrors.join('\n')}`, {
              autoClose: 10000,
            })
          } else {
            toast.warning(`Invalid data in rows: ${invalidRows.join(', ')}`)
          }
          
          // Clear file data to prevent import
          setSelectedFile(null)
          setFileData([])
          return
        }

        setFileData(cleanedData)
        toast.success(`${cleanedData.length} households found in file`)
      } catch (error) {
        toast.error('Error reading file: ' + error.message)
        setSelectedFile(null)
        setFileData([])
      }
    }
    
    reader.readAsArrayBuffer(file)
  }, [])

  // Handle import confirmation
  const handleConfirmImport = useCallback(async () => {
    if (fileData.length === 0) {
      toast.error('Please upload a valid file with data')
      return
    }

    if (!importFilters.province || !importFilters.district || !importFilters.sector || 
        !importFilters.cell || !importFilters.village) {
      toast.error('Please select all location filters (Province, District, Sector, Cell, Village)')
      return
    }

    try {
      const response = await importHouseholds({
        households: fileData,
        filters: importFilters,
      }).unwrap()
      
      // Store the response
      setImportResult(response)
      setShowResultModal(true)
      
      // Show success message
      if (response?.data?.failed?.length > 0) {
        toast.warning(
          `Imported ${response?.data?.summary?.successful || 0} of ${response?.data?.summary?.total || 0} households`
        )
      } else {
        toast.success(
          `Successfully imported ${response?.data?.summary?.successful || 0} households`
        )
      }
      
      // Don't close the modal, let user see the result
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to import households')
    }
  }, [fileData, importFilters, importHouseholds, onClose, onSuccess])

  const handleClose = () => {
    onClose()
    setSelectedFile(null)
    setFileData([])
    setImportFilters({
      province: '',
      district: '',
      sector: '',
      cell: '',
      village: '',
    })
    setImportResult(null)
    setShowResultModal(false)
  }

  const handleCloseResultModal = () => {
    setShowResultModal(false)
    handleClose()
    
    // Call onSuccess if provided
    if (onSuccess) {
      onSuccess()
    }
  }

  return (
    <>
      {/* Import Modal */}
      <Modal isOpen={isOpen && !showResultModal} onClose={handleClose}>
        <div className="flex flex-col gap-4 w-full max-w-2xl">
          <h2 className="text-xl font-bold text-primary">Import Households</h2>
        
        {/* Download Template Button */}
        <div className="flex justify-between items-center">
          <p className="text-gray-600 text-sm">
            Download the template to ensure correct format
          </p>
          <Button
            value={
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faDownload} />
                Download Template
              </span>
            }
            onClick={downloadTemplate}
            className="!bg-blue-600 !w-fit"
          />
        </div>

        {/* File Upload */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Select File (.xlsx, .xls, .csv)
          </label>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            key={`file-input-${selectedFile?.name || 'empty'}`}
            onChange={(e) => {
              handleFileChange(e)
              // Reset input to allow re-uploading the same file
              e.target.value = ''
            }}
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {selectedFile && (
            <p className="text-sm text-green-600">
              Selected: {selectedFile.name} ({fileData.length} households)
            </p>
          )}
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
                value={importFilters.province}
                onChange={(e) => setImportFilters({...importFilters, province: e.target.value, district: '', sector: '', cell: '', village: ''})}
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
                value={importFilters.district}
                onChange={(e) => setImportFilters({...importFilters, district: e.target.value, sector: '', cell: '', village: ''})}
                disabled={!importFilters.province || countryDistrictsLoading}
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
                value={importFilters.sector}
                onChange={(e) => setImportFilters({...importFilters, sector: e.target.value, cell: '', village: ''})}
                disabled={!importFilters.district || districtSectorsLoading}
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
                value={importFilters.cell}
                onChange={(e) => setImportFilters({...importFilters, cell: e.target.value, village: ''})}
                disabled={!importFilters.sector || sectorCellsLoading}
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

            <div>
              <label className="text-xs text-gray-600 mb-1 block">Village</label>
              <select
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                value={importFilters.village}
                onChange={(e) => setImportFilters({...importFilters, village: e.target.value})}
                disabled={!importFilters.cell || cellVillagesLoading}
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
            value={isImporting ? 'Importing...' : 'Import'}
            onClick={handleConfirmImport}
            className="!bg-green-600"
            disabled={isImporting || !selectedFile || fileData.length === 0}
          />
        </div>
        </div>
      </Modal>

      {/* Result Modal */}
      <Modal isOpen={showResultModal} onClose={handleCloseResultModal}>
        <div className="flex flex-col gap-4 w-full max-w-3xl">
          <h2 className="text-xl font-bold text-primary">Import Results</h2>
          
          {importResult && (
            <>
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">
                      {importResult?.data?.summary?.total || 0}
                    </p>
                    <p className="text-sm text-gray-600">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {importResult?.data?.summary?.successful || 0}
                    </p>
                    <p className="text-sm text-gray-600">Successful</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {importResult?.data?.summary?.failed || 0}
                    </p>
                    <p className="text-sm text-gray-600">Failed</p>
                  </div>
                </div>
              </div>

              {/* Failed Items */}
              {importResult?.data?.failed?.length > 0 && (
                <div className="border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-700 mb-3">
                    Failed Imports ({importResult.data.failed.length})
                  </h3>
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-red-50">
                        <tr>
                          <th className="text-left p-2 font-medium">Name</th>
                          <th className="text-left p-2 font-medium">Phone</th>
                          <th className="text-left p-2 font-medium">Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importResult.data.failed.map((item, index) => (
                          <tr key={index} className="border-b border-red-100">
                            <td className="p-2">{item.name || item.household?.name || '-'}</td>
                            <td className="p-2">{item.phone1 || item.household?.phone1 || '-'}</td>
                            <td className="p-2 text-red-600">
                              {item.error || item.message || 'Unknown error'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Successful Items Info */}
              {importResult?.data?.successful?.length > 0 && (
                <div className="text-sm text-gray-600">
                  ✓ {importResult.data.successful.length} households imported successfully
                </div>
              )}
            </>
          )}

          {/* Footer Button */}
          <div className="flex gap-3 justify-end pt-2">
            <Button
              value="Close"
              onClick={handleCloseResultModal}
              className="!bg-green-600"
            />
          </div>
        </div>
      </Modal>
    </>
  )
}

ImportHouseholdsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
}

export default ImportHouseholdsModal

