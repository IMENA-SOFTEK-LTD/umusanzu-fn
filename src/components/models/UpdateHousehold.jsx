import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import Button from '../Button'
import { Controller, useForm } from 'react-hook-form'
import Input from '../Input'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { setUpdateHouseholdModal } from '../../states/features/modals/householdSlice'
import { faX } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import { useUpdateHouseholdMutation } from '../../states/api/apiSlice'
import Loading from '../Loading'

const isValidPhoneNumber = (value) => {
  const digitsOnly = value.replace(/\D/g, '')
  const patternMobileMoney = /^07[89]\d{7}$/
  const patternAirtelMoney = /^07[23]\d{7}$/
  return patternMobileMoney.test(digitsOnly) || patternAirtelMoney.test(digitsOnly)
}

const UpdateHousehold = ({ household }) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm()

  const [
    updateHousehold,
    {
      data: updateHouseholdData,
      isLoading: updateHouseholdLoading,
      isSuccess: updateHouseholdSuccess,
      isError: updateHouseholdError,
      error: updateHouseholdErrorData,
    },
  ] = useUpdateHouseholdMutation()

  const dispatch = useDispatch()
  const { updateHouseholdModal } = useSelector((state) => state.household)

  useEffect(() => {
    setValue('name', household?.name)
    setValue('nid', household?.nid)
    setValue('phone1', household?.phone1)
    setValue('phone2', household?.phone2)
    setValue('ubudehe', household?.ubudehe)
    setValue('type', household?.type)
    setValue('email', household?.email)
  }, [updateHouseholdModal])

  const onSubmit = (data) => {
    updateHousehold({
      id: household?.id,
      name: data?.name,
      nid: data?.nid,
      phone1: data?.phone1,
      phone2: data?.phone2,
      // ubudehe: data?.ubudehe,
      // type: data?.type,
      email: data?.email,
    })
  }

  useEffect(() => {
    if (updateHouseholdSuccess) {
      setTimeout(() => {
        window.location.reload()
      }, 800)
    }
  }, [updateHouseholdData, updateHouseholdSuccess, updateHouseholdError])

  return (
    <main
      className={`${
        updateHouseholdModal ? 'flex' : 'hidden'
      } fixed top-0 left-0 right-0 z-50 w-full h-screen p-4 flex items-center justify-center bg-gray-800 bg-opacity-60`}
    >
      <section className="bg-white w-fit relative max-w-[50%] flex flex-col gap-6">
        <article className="bg-primary relative flex flex-row-reverse items-center justify-center py-4 px-4">
          <Button
            onClick={(e) => {
              e.preventDefault()
              dispatch(setUpdateHouseholdModal(false))
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
            Edit Household
          </h4>
        </article>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-8 items-center w-fit mx-auto bg-white p-8"
        >
          <section className="flex items-center gap-4 w-full flex-wrap">
            <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col gap-2">
              <p>
                Full Name <span className="text-red-500">*</span>
              </p>
              <Controller
                control={control}
                defaultValue={household?.name}
                rules={{ required: "Please add the head's full names" }}
                name="name"
                render={({ field }) => {
                  return <Input {...field} placeholder="Full Name" />
                }}
              />
              {errors.name && (
                <span className="text-red-500 text-[12px]">
                  {errors.name.message}
                </span>
              )}
            </label>
            <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col gap-2">
              National ID
              <Controller
                control={control}
                name="nid"
                defaultValue={household?.nid}
                rules={{
                  validate: (value) => {
                    if (!value) return true
                    const digitsOnly = value.replace(/\s/g, '')
                    if (value.length !== 21) {
                      return 'National ID must be exactly 21 characters (including spaces)'
                    }
                    if (digitsOnly.length !== 16) {
                      return 'National ID must contain exactly 16 digits'
                    }
                    if (!/^\d{16}$/.test(digitsOnly)) {
                      return 'National ID must contain only numbers'
                    }
                    return true
                  },
                }}
                render={({ field: { value, onChange, ...fieldProps } }) => {
                  const formatNationalId = (inputValue) => {
                    if (!inputValue) return ''
                    const digitsOnly = inputValue.replace(/\D/g, '')
                    const limitedDigits = digitsOnly.slice(0, 16)
                    if (limitedDigits.length === 0) return ''

                    let formatted = limitedDigits[0]
                    if (limitedDigits.length > 1) {
                      formatted += ' ' + limitedDigits.slice(1, 5)
                    }
                    if (limitedDigits.length > 5) {
                      formatted += ' ' + limitedDigits[5]
                    }
                    if (limitedDigits.length > 6) {
                      formatted += ' ' + limitedDigits.slice(6, 13)
                    }
                    if (limitedDigits.length > 13) {
                      formatted += ' ' + limitedDigits[13]
                    }
                    if (limitedDigits.length > 14) {
                      formatted += ' ' + limitedDigits.slice(14, 16)
                    }
                    return formatted
                  }

                  const handleChange = (e) => {
                    const formattedValue = formatNationalId(e.target.value)
                    onChange(formattedValue)
                  }

                  return (
                    <>
                      <Input
                        {...fieldProps}
                        value={formatNationalId(value || '')}
                        onChange={handleChange}
                        placeholder="eg. 1 1979 8 0044189 1 35"
                        maxLength={21}
                      />
                      {errors.nid && (
                        <span className="text-red-500 text-[12px]">
                          {errors.nid.message}
                        </span>
                      )}
                    </>
                  )
                }}
              />
            </label>
            <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col gap-2">
              <p>
                Primary Phone <span className="text-red-500">*</span>
              </p>
              <Controller
                control={control}
                name="phone1"
                defaultValue={household?.phone1}
                rules={{
                  required: 'Please add the primary phone number',
                  validate: (value) =>
                    isValidPhoneNumber(value || '')
                      ? true
                      : 'Phone number must be valid (MTN: 078/079, Airtel: 072/073)',
                }}
                render={({ field }) => {
                  return <Input {...field} placeholder="07XX XXX XXX" />
                }}
              />
              {errors.phone1 && (
                <span className="text-red-500 text-[12px]">
                  {errors.phone1.message}
                </span>
              )}
            </label>
            <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col gap-2">
              Secondary phone
              <Controller
                control={control}
                name="phone2"
                defaultValue={household?.phone2}
                rules={{
                  validate: (value) => {
                    if (!value) return true
                    return isValidPhoneNumber(value)
                      ? true
                      : 'Phone number must be valid (MTN: 078/079, Airtel: 072/073)'
                  },
                }}
                render={({ field }) => {
                  return <Input {...field} placeholder="07XX XXX XXX" />
                }}
              />
              {errors.phone2 && (
                <span className="text-red-500 text-[12px]">
                  {errors.phone2.message}
                </span>
              )}
            </label>
            <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col gap-2">
              Email
              <Controller
                control={control}
                name="email"
                defaultValue={household?.email}
                render={({ field }) => {
                  return <Input {...field} placeholder="info@example.com" />
                }}
              />
            </label>
            {/* <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col gap-2">
              <p>
                Amount <span className="text-red-500">*</span>
              </p>
              <Controller
                control={control}
                name="ubudehe"
                defaultValue={household?.ubudehe}
                rules={{ required: 'Please add the ubudehe amount' }}
                render={({ field }) => {
                  return <Input {...field} placeholder="5000" />
                }}
              />
              {errors.amount && (
                <span className="text-red-500 text-[12px]">
                  {errors.amount.message}
                </span>
              )}
            </label> */}
            {/* <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
              Household type
              <Controller
                control={control}
                name="type"
                defaultValue={household?.type}
                render={({ field }) => {
                  return (
                    <select
                      {...field}
                      className="p-2 outline-none border-[1px] rounded-md w-[90%] border-primary focus:border-[1.5px] ease-in-out duration-150"
                    >
                      <option disabled value="">
                        Select household type
                      </option>
                      <option value={'residence'}>Residence</option>
                      <option value={'business'}>Business</option>
                    </select>
                  )
                }}
              />
            </label> */}
          </section>
          <section
            className={
              updateHouseholdSuccess || updateHouseholdError
                ? 'flex text-center mx-auto'
                : 'hidden'
            }
          >
            <p
              className={
                updateHouseholdSuccess ? 'text-green-600 text-center' : 'hidden'
              }
            >
              Household updated successfully
            </p>
            <p
              className={
                updateHouseholdError ? 'text-red-600 text-center' : 'hidden'
              }
            >
              {updateHouseholdErrorData?.data?.message ||
                updateHouseholdErrorData?.error ||
                'Could not update household. Please refresh and try again'}
            </p>
          </section>
          <Controller
            name="submit"
            control={control}
            render={({ field }) => {
              return (
                <Button
                  submit
                  {...field}
                  value={updateHouseholdLoading ? <Loading /> : 'Update'}
                  className={`w-fit max-w-[30%] min-w-[30%] px-6 mx-auto`}
                />
              )
            }}
          />
        </form>
      </section>
    </main>
  )
}

UpdateHousehold.propTypes = {
  household: PropTypes.oneOfType([PropTypes.shape({}), PropTypes.string]),
}

UpdateHousehold.defaultProps = {
  household: {},
}

export default UpdateHousehold
