import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import Button from '../Button'
import { setUpdateHouseholdStatusModal } from '../../states/features/modals/householdSlice'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faX } from '@fortawesome/free-solid-svg-icons'
import { Controller, useForm } from 'react-hook-form'
import { useUpdateHouseholdStatusMutation } from '../../states/api/apiSlice'
import { useEffect } from 'react'
import Loading from '../Loading'

const UpdateHouseholdStatus = ({ household }) => {
  const { updateHouseholdStatusModal } = useSelector((state) => state.household)
  const dispatch = useDispatch()


  const [updateHouseholdStatus, {
    data: updateHouseholdStatusData,
    isLoading: updateHouseholdStatusLoading,
    isSuccess: updateHouseholdStatusSuccess,
    isError: updateHouseholdStatusError,
  }] = useUpdateHouseholdStatusMutation()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = (data) => {
    updateHouseholdStatus({
      id: household?.id,
      status: data?.status || "active",
    })
  }

  useEffect(() => {
    if (updateHouseholdStatusSuccess) {
      setTimeout(() => {
        window.location.reload()
      }, 500);
    }
  }, [updateHouseholdStatusData])


  return (
    <main
      className={`${
        updateHouseholdStatusModal ? 'flex' : 'hidden'
      } fixed top-0 left-0 right-0 z-50 w-full h-screen p-4 flex items-center justify-center bg-gray-800 bg-opacity-60`}
    >
      <section className="bg-white w-fit relative max-w-[50%] min-w-[30rem] flex flex-col gap-6">
        <article className="bg-primary relative flex flex-row-reverse items-center justify-center py-4 px-4">
          <Button
            onClick={(e) => {
              e.preventDefault()
              dispatch(setUpdateHouseholdStatusModal(false))
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
            Edit Household Status
          </h4>
        </article>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-8 w-full max-w-[20rem] items-center mx-auto bg-white p-8"
        >
          <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-center gap-2">
            Household Status
            <Controller
              name="status"
              control={control}
              defaultValue={"active"}
              render={({ field }) => {
                return (
                  <select
                    {...field}
                    className="p-2 outline-none border-[1px] rounded-md w-[90%] border-primary focus:border-[1.5px] ease-in-out duration-150"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                )
              }}
            />
          </label>
          <section className={updateHouseholdStatusSuccess || updateHouseholdStatusError ? 'flex text-center mx-auto' : 'hidden'}>
            <p className={updateHouseholdStatusSuccess ? 'text-green-600 text-center' : 'hidden'}>Household status updated successfully</p>
            <p className={updateHouseholdStatusError ? 'text-red-600 text-center' : 'hidden'}>Could not update household status. Please refresh and try again</p>
          </section>
          <Controller
            name="submit"
            control={control}
            render={({ field }) => {
              return <Button {...field} submit value={`${updateHouseholdStatusLoading ? '...': 'Update'}`} />
            }}
          />
        </form>
      </section>
    </main>
  )
}

export default UpdateHouseholdStatus
