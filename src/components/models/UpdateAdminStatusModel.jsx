import { useState } from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { useForm, Controller } from 'react-hook-form'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Button from '../Button'
import Loading from '../Loading'
import { useParams } from 'react-router-dom'
import {
  useUpdateAdminStatusMutation,
  useDeleteAdminMutation,
} from '../../states/api/apiSlice'

const UpdateAdminStatusModel = ({ user }) => {
  const { user: stateUser } = useSelector((state) => state.auth)
  const [isUpdateLoading, setIsUpdateLoading] = useState(false)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [updateAdminStatus] = useUpdateAdminStatusMutation()
  const [deleteAdmin] = useDeleteAdminMutation()

  const { id } = useParams()

  let department = ''

  switch (user?.departments?.level_id || stateUser?.departments?.level_id) {
    case 1:
      department = 'province'
      break
    case 2:
      department = 'district'
      break
    case 3:
      department = 'sector'
      break
    case 4:
      department = 'cell'
      break
    case 5:
      department = 'country'
      break
    case 6:
      department = 'agent'
      break
    default:
      department = 'cell'
  }

  const {
    control,
    onClick,
    formState: { errors },
  } = useForm()

  const openModal = () => {
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const [newStatus, setNewStatus] = useState('')

  const handleUpdateStatus = async (values) => {
    setIsUpdateLoading(true)
    try {
      await updateAdminStatus({
        id,
        route: department,
        status: values.toUpperCase(),
      })
        .unwrap()
        .then((data) => {
          toast.success('Admin status updated successfully!')
          closeModal()
        })
        .catch((error) => {
          console.error(error)
          if (error.data && error.data.message) {
            toast.error(error.data.message)
          } else {
            toast.error(
              'An error occurred while updating the Admin Status. Please try again'
            )
          }
        })
        .finally(() => {
          setIsUpdateLoading(false)
        })
    } catch (error) {
      return error
    }
  }

  const handleDeleteAdmin = async () => {
    setIsDeleteLoading(true)
    try {
      await deleteAdmin({
        id,
        route: department,
      })
        .unwrap()
        .then(() => {
          toast.success('Admin Deleted successfully!')
          closeModal()
        })
        .catch((error) => {
          console.error(error)
          if (error.data && error.data.message) {
            toast.error(error.data.message)
          } else {
            toast.error(
              'An error occurred while deleting the Admin. Please try again'
            )
          }
        })
        .finally(() => {
          setIsDeleteLoading(false)
        })
    } catch (error) {
      return error
    }
  }

  return (
    <div className="relative">
      <ToastContainer />
      <button
        onClick={openModal}
        className="p-2 w-fit py-[5px] ease-in-out duration-300 text-[14px] rounded-md text-white bg-yellow-600 hover:scale-[0.98] max-w-xs overflow-hidden"
      >
        Change Status
      </button>

      {showModal && (
        <div
          tabIndex={-1}
          aria-hidden="true"
          className="fixed top-0 left-0 right-0 z-50 w-full h-screen p-4 flex items-center justify-center bg-gray-800 bg-opacity-60"
        >
          <div className="relative bg-white rounded-lg shadow">
            <div className="bg-primary rounded-t-lg p-3">
              <button
                onClick={closeModal}
                type="button"
                className="absolute top-3 right-2.5 text-white bg-transparent hover:bg-primary hover:text-primary rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-primary dark:hover:text-white"
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
              <h3 className="mb-4 mt-2 text-xl text-center font-medium text-white">
                Delete Admin
              </h3>
            </div>
            <div className="px-6 py-6 lg:px-42">
              <form className="space-y-8">
                <div className="flex justify-center items-center">
                  <div className="w-[300px] text-center text-md">
                    <p>
                      Dear<span> {user?.names},</span> before you delete Admin
                      consider disabling their account instead
                    </p>
                  </div>
                </div>

                <div className="flex-1">
                  <label
                    htmlFor="category"
                    className="block mb-2 text-sm font-medium text-black"
                  >
                    Category
                  </label>
                  {/* a select contoller to select from the retrieved categories */}
                  <Controller
                    name="status"
                    control={control}
                    defaultValue=""
                    rules={{ required: 'Please select a status' }}
                    render={({ field }) => (
                      <select
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          setNewStatus(e.target.value)
                        }}
                        className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 px-28"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    )}
                  />

                  {errors.status && (
                    <span className="text-red-500">
                      {errors.status.message}
                    </span>
                  )}
                </div>
                <div className="flex justify-between space-x-4">
                  <Controller
                    name="submitUpdateStatus"
                    control={control}
                    render={() => {
                      return (
                        <Button
                          onClick={() => {
                            handleUpdateStatus(newStatus)
                          }}
                          className={
                            'w-full p-2 flex items-center text-center justify-center bg-amber-500 cursor-pointer text-[15px] text-white rounded-sm ease-in-out duration-200 hover:scale-[.98]'
                          }
                          value={
                            isUpdateLoading ? <Loading /> : 'Update Status'
                          }
                        />
                      )
                    }}
                  />
                  <Controller
                    name="submitDeleteAdmin"
                    control={control}
                    render={() => {
                      return (
                        <Button
                          className={
                            'w-full p-2 flex items-center text-center justify-center bg-red-600 cursor-pointer text-[15px] text-white rounded-sm ease-in-out duration-200 hover:scale-[.98]'
                          }
                          onClick={() => {
                            handleDeleteAdmin()
                          }}
                          value={isDeleteLoading ? <Loading /> : 'Delete Admin'}
                        />
                      )
                    }}
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

UpdateAdminStatusModel.PropTypes = {
  user: PropTypes.shape({
    status: PropTypes.string,
    is_deleted: PropTypes.bool,
  }),
}
export default UpdateAdminStatusModel
