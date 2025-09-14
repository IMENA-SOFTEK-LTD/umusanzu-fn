import PropTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'
import Loading from '../components/Loading'
import UserProfileUpdateForm from '../components/UserProfileUpdateForm'
import UpdatePasswordModel from '../components/models/UpdatePasswordModel'
import { useLazyGetApproversQuery } from '../states/api/apiSlice'
import EditSectorInfoModel from '../components/models/EditSectorInfoModel'
import UploadSectorStamp from '../components/models/UploadSectorStamp'
import { getUserDepartmentsInfoByLevelId } from '../utils/userByLevelId'
import { setCreateAdminModal } from '../states/features/departments/staffSlice'
import Button from '../components/Button'
import { toast } from 'react-toastify'
import API_URL from '../constants'
import axios from 'axios'

function Approvers() {
  const dispatch = useDispatch()
  const { user: stateUser } = useSelector((state) => state.auth)
  const [approvers, setApprovers] = useState([])
  const [getApprovers, { data: approversData, isLoading, isError, isSuccess }] =
    useLazyGetApproversQuery()
  const [editApprover, setEditApprover] = useState({
    key: '',
    value: '',
    id: 0,
  })
  const [isSaving, setIsSaving] = useState(false)
  useEffect(() => {
    getApprovers()
  }, [getApprovers])

  useEffect(() => {
    if (isSuccess) {
      setApprovers(approversData?.data?.rows || [])
    }
  }, [approversData, isSuccess])

  const updateApprover = async () => {
    try {
      setIsSaving(true)

      const { data } = await axios.put(
        `${API_URL}/userProfile/approvers/${editApprover?.id}`,
        {
          ...editApprover,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      const tmpApprovers = [...approvers]
      const index = tmpApprovers.findIndex(({ id }) => id === data?.id)

      if (index !== -1) {
        // Ensure the index is found
        tmpApprovers[index] = { ...data }

        setApprovers([...tmpApprovers]) // Update state with the new array
        setEditApprover({
          key: '',
          value: '',
          id: 0,
        })
        toast.success('Approver updated successfully!')
      }

      setIsSaving(false)
    } catch (error) {
      console.log(error)
      setIsSaving(false)
      toast.error(error?.response?.data?.message || 'Try again')
    }
  }

  return (
   <main className="flex flex-col gap-10 mb-10 px-4 sm:px-6 lg:px-10">
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
        {isLoading && <Loading />}
        {stateUser?.staff_role === 1 &&
          [5].includes(stateUser?.departments?.level_id) && (
            <>
              {approvers.map((approver) => (
                <div
                  key={approver.id}
                  className="bg-white overflow-hidden p-2 shadow rounded-lg border mt-3"
                >
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {approver.role}
                    </h3>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-3 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                      <div className="py-3 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Name
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {editApprover &&
                          editApprover?.key === 'name' &&
                          editApprover?.id === approver.id ? (
                            <>
                              <input
                                style={{ width: '100%' }}
                                name={editApprover.key}
                                defaultValue={editApprover.value}
                                className="border-[2px] rounded-[2px] border-[#155E75] outline-[#155E75] w-2/3 text-xs"
                                onChange={(e) => {
                                  e.preventDefault()

                                  const value = e.target.value
                                  if (!value) {
                                    toast.error('name is required')
                                  }

                                  setEditApprover({
                                    key: 'name',
                                    value: value,
                                    id: approver.id,
                                  })
                                }}
                              />

                              <button
                                disabled={isSaving}
                                className="bg-[#e5e7eb] hover:bg-[#d1d5db] text-black py-1 px-2 ml-1 text-xs font-semibold rounded-md"
                                onClick={updateApprover}
                              >
                                {isSaving ? 'Wait..' : 'Save'}
                              </button>
                            </>
                          ) : (
                            <>
                              {approver.name}
                              <button
                                className="bg-[#e5e7eb] hover:bg-[#d1d5db] text-black py-1 px-2 ml-2 text-xs font-semibold rounded-md"
                                onClick={(e) => {
                                  e.preventDefault()
                                  setEditApprover({
                                    key: 'name',
                                    value: approver.name,
                                    id: approver.id,
                                  })
                                }}
                              >
                                Edit
                              </button>
                            </>
                          )}
                        </dd>
                      </div>
                      <div className="py-3 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Position
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {editApprover &&
                          editApprover?.key === 'position' &&
                          editApprover?.id === approver.id ? (
                            <>
                              <input
                                style={{ width: '100%' }}
                                name={editApprover.key}
                                defaultValue={editApprover.value}
                                className="border-[2px] rounded-[2px] border-[#155E75] outline-[#155E75] w-2/3 text-xs"
                                onChange={(e) => {
                                  e.preventDefault()
                                  const value = e.target.value
                                  if (!value) {
                                    toast.error('position is required')
                                  }

                                  setEditApprover({
                                    key: 'position',
                                    value: value,
                                    id: approver.id,
                                  })
                                }}
                              />

                              <button
                                disabled={isSaving}
                                className="bg-[#e5e7eb] hover:bg-[#d1d5db] text-black py-1 px-2 ml-1 text-xs font-semibold rounded-md"
                                onClick={updateApprover}
                              >
                                {isSaving ? 'Wait..' : 'Save'}
                              </button>
                            </>
                          ) : (
                            <>
                              {approver.position}
                              <button
                                className="bg-[#e5e7eb] hover:bg-[#d1d5db] text-black py-1 px-2 ml-2 text-xs font-semibold rounded-md"
                                onClick={(e) => {
                                  e.preventDefault()
                                  setEditApprover({
                                    key: 'position',
                                    value: approver.position,
                                    id: approver.id,
                                  })
                                }}
                              >
                                Edit
                              </button>
                            </>
                          )}
                        </dd>
                      </div>
                      <div className="py-3 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Signature & Stamp
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {editApprover &&
                          editApprover?.key === 'signature' &&
                          editApprover?.id === approver.id ? (
                            <>
                              <input
                                type="file"
                                accept="image/*"
                                style={{ width: '100%' }}
                                name={editApprover.key}
                                onChange={(event) => {
                                  event.preventDefault()
                                  const file = event.target.files[0]
                                  if (file) {
                                    if (file.size > 1024000) {
                                      toast.error(
                                        'File size should not exceed 1MB'
                                      )
                                      return
                                    }
                                    const reader = new FileReader()
                                    reader.readAsDataURL(file)
                                    reader.onload = () => {
                                      setEditApprover({
                                        key: 'signature',
                                        value: reader.result,
                                        id: approver.id,
                                      })
                                    }
                                  }
                                }}
                                className="border-[2px] rounded-[2px] border-[#155E75] outline-[#155E75] w-2/3 text-xs"
                              />
                              {editApprover.value && (
                                <div className="mt-4">
                                  <h3>Preview:</h3>
                                  <img
                                    src={editApprover.value}
                                    alt="Preview"
                                    className="w-48 h-48 object-cover"
                                    style={{ height: '100px' }}
                                  />
                                </div>
                              )}

                              <button
                                disabled={isSaving}
                                className="bg-[#e5e7eb] hover:bg-[#d1d5db] text-black py-1 px-2 ml-1 text-xs font-semibold rounded-md"
                                onClick={updateApprover}
                              >
                                {isSaving ? 'Wait..' : 'Save'}
                              </button>
                            </>
                          ) : (
                            <>
                              {approver.signature && (
                                <div className="mt-4">
                                  <img
                                    src={`data:${approver.mimeType};base64,${approver.signature}`}
                                    alt="Preview"
                                    className="w-48 h-48 object-cover"
                                    style={{ height: '100px' }}
                                  />
                                </div>
                              )}
                              <button
                                className="bg-[#e5e7eb] hover:bg-[#d1d5db] text-black py-1 px-2 ml-2 text-xs font-semibold rounded-md"
                                onClick={(e) => {
                                  e.preventDefault()
                                  setEditApprover({
                                    key: 'signature',
                                    value: `data:${approver.mimeType};base64,${approver.signature}`,
                                    id: approver.id,
                                  })
                                }}
                              >
                                Upload
                              </button>
                            </>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              ))}
            </>
          )}
      </div>
    </main>
  )
}

export default Approvers
