import { useState } from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { useForm, Controller } from 'react-hook-form'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Button from '../Button'
import Loading from '../Loading'
import { useParams } from 'react-router-dom'
import { useUpdateAdminStatusMutation } from '../../states/api/apiSlice'

const UpdateAdminStatusModel = ({ user }) => {
  const { user: stateUser } = useSelector((state) => state.auth)
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [updateAdminStatus] = useUpdateAdminStatusMutation()

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
    handleSubmit,
    formState: { errors }
  } = useForm()

  const openModal = () => {
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const onSubmit = async (values) => {
    console.log(values, department)
    setIsLoading(true)

    try {
      await updateAdminStatus({
        id,
        route: department,
        status: values.status.toUpperCase()
      })
        .unwrap()
        .then(() => {
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
          setIsLoading(false)
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
        className="p-2 w-fit py-[5px] ease-in-out duration-300 text-[14px] rounded-md text-white bg-red-600 hover:scale-[0.98]"
        type="button"
      >
        delete
      </button>

      {showModal && (
        <div
          tabIndex={-1}
          aria-hidden="true"
          className="fixed top-0 left-0 right-0 z-50 w-full h-screen p-4 flex items-center justify-center bg-gray-800 bg-opacity-60"
        >
          <div className="relative bg-white rounded-lg shadow">
            <button
              onClick={closeModal}
              type="button"
              className="absolute top-3 right-2.5 text-primary bg-transparent hover:bg-primary hover:text-primary rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-primary dark:hover:text-white"
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
            <div className="px-6 py-6 lg:px-8">
              <h3 className="mb-4 text-xl text-center font-medium text-black">
                Admin Status
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

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
                            className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-3 px-4"
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
                <Controller
                  name="submit"
                  control={control}
                  render={() => {
                    return (
                      <Button
                        submit
                        className={'w-full p-2 py-3 px-4 flex items-center justify-center bg-amber-500 cursor-pointer text-[15px] text-white rounded-sm ease-in-out duration-200 hover:scale-[.98]'}
                        value={isLoading ? <Loading /> : 'Update Status'}
                      />
                    )
                  }}
                />
                <Controller
                  name="submit"
                  control={control}
                  render={() => {
                    return (
                      <Button
                        className={'w-full p-2 py-3 px-4 flex items-center justify-center bg-red-600 cursor-pointer text-[15px] text-white rounded-sm ease-in-out duration-200 hover:scale-[.98]'}
                        submit
                        value={
                          'Or delete Admin'
                        }
                      />
                    )
                  }}
                />
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
    status: PropTypes.string
  })
}
export default UpdateAdminStatusModel
