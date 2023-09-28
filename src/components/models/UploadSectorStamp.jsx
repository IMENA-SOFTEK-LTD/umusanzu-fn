import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import Button from '../Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUpload } from '@fortawesome/free-solid-svg-icons'
import { getBase64 } from '../../utils/Uploads'
import { useUploadDepartmentInfoStampMutation } from '../../states/api/apiSlice'
import { toast } from 'react-toastify'
import Input from '../Input'

function UploadSectorStamp({ department }) {
  const [showModal, setShowModal] = useState(false)
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const [
    uploadDepartmentInfoStamp,
    {
      data: uploadDepartmentInfoStampData,
      isLoading: uploadDepartmentInfoStampLoading,
      isError: uploadDepartmentInfoStampError,
    },
  ] = useUploadDepartmentInfoStampMutation()

  const [image, setImage] = useState(null)

  const openModal = () => {
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const onSubmit = async (data) => {
    uploadDepartmentInfoStamp({
      image: image || data?.file,
      department: {
        id: department?.id,
        name: department?.name,
      },
    })
  }

  useEffect(() => {
    if (uploadDepartmentInfoStampData) {
      toast.success('Stamp Uploaded Successfully')
      setTimeout(() => {
        closeModal()
      }, 1500)
    }
    if (uploadDepartmentInfoStampError) {
      toast.error('Stamp Upload Failed')
    }
  }, [
    uploadDepartmentInfoStampData,
    uploadDepartmentInfoStampLoading,
    uploadDepartmentInfoStampError,
  ])

  return (
    <div className="relative">
      <Button
        value={
          <span className="flex items-center gap-2">
            <FontAwesomeIcon icon={faUpload} />
            Upload Stamp
          </span>
        }
        onClick={openModal}
      />
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
                Upload Sector's Stamp
              </h3>
            </div>
            <div className="px-6 py-6 lg:px-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label
                      htmlFor="adminName"
                      className="block mb-2 text-sm font-medium text-black"
                    >
                      Choose Image N.B: Stamp must be in center and image must
                      have sizes of Width:308 pixels x Height:141 pixels.
                    </label>
                    <Controller
                      name="file"
                      control={control}
                      rules={{ required: 'File is required' }}
                      render={({ field }) => (
                        <Input
                          type="file"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            getBase64(e.target.files[0], (result) => {
                              setImage(result)
                            })
                          }}
                          className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                        />
                      )}
                    />
                    {errors.file && (
                      <span className="text-red-500">
                        {errors.file.message}
                      </span>
                    )}
                  </div>
                </div>
                <Controller
                  name="submit"
                  control={control}
                  render={({ field }) => {
                    return (
                      <Button
                        submit
                        value={
                          uploadDepartmentInfoStampLoading
                            ? '...'
                            : 'Upload Stamp'
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

export default UploadSectorStamp
