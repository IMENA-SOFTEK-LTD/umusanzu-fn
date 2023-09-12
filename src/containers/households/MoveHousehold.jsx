import PropTypes from 'prop-types'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Loading from '../../components/Loading'
import {
  setConfirmMoveHouseholdModal,
  setExistingHouseholdId,
  setHouseholdConflict,
  setMoveHouseholdModal,
  setSelectedCell,
  setSelectedDistrict,
  setSelectedSector,
  setSelectedVillage,
} from '../../states/features/modals/householdSlice'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faX } from '@fortawesome/free-solid-svg-icons'
import {
  useCreateDuplicateHouseHoldMutation,
  useMoveHouseholdMutation,
} from '../../states/api/apiSlice'
import { useEffect, useState } from 'react'

const MoveHousehold = ({ isOpen, className }) => {
  const dispatch = useDispatch()

  const {
    districts,
    sectors,
    selectedDistrict,
    selectedSector,
    cells,
    selectedCell,
    villages,
    selectedVillage,
    householdConflict,
    confirmMoveHouseholdModal,
    existingHouseholdId,
    existingHousehold,
  } = useSelector((state) => state.household)

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      phone1: existingHousehold.phone1,
      province: 31,
      name: existingHousehold.name,
    },
  })

  const [householdData, setHouseholdData] = useState(existingHousehold)

  useEffect(() => {
    setHouseholdData(existingHousehold)
    setValue('name', existingHousehold?.name)
    setValue('nid', existingHousehold?.nid)
    setValue('phone1', existingHousehold?.phone1)
    setValue('phone2', existingHousehold?.phone2)
    setValue('ubudehe', existingHousehold?.ubudehe)
    setValue('type', existingHousehold?.type)
    setValue('province', 31)
    setValue('district', existingHousehold?.district)
    setValue('sector', existingHousehold?.sector)
    setValue('cell', existingHousehold?.cell)
    setValue('village', existingHousehold?.village)
  }, [isOpen, existingHousehold])

  // MOVE HOUSEHOLD
  const [
    moveHousehold,
    {
      data: moveHouseholdData,
      isLoading: moveHouseholdLoading,
      isSuccess: moveHouseholdSuccess,
      isError: moveHouseholdError,
    },
  ] = useMoveHouseholdMutation()

  // CREATE DUPLICATE HOUSEHOLD
  const [
    createDuplicateHousehold,
    {
      data: createDuplicateHouseholdData,
      isLoading: createDuplicateHouseholdLoading,
      isSuccess: createDuplicateHouseholdSuccess,
      isError: createDuplicateHouseholdError,
    },
  ] = useCreateDuplicateHouseHoldMutation()

  const onSubmit = (data) => {
    if (existingHouseholdId) {
      moveHousehold({
        name: data.name,
        nid: data.nid,
        province: data.province,
        district: data.district,
        sector: data.sector,
        cell: data.cell,
        phone1: data.phone1,
        phone2: data.phone2,
        ubudehe: data.ubudehe,
        type: data.type,
        village: data.village,
        existingHouseholdId,
      })
    } else {
      createDuplicateHousehold({
        name: data.name,
        nid: data.nid,
        province: data.province,
        district: data.district,
        sector: data.sector,
        cell: data.cell,
        phone1: data.phone1,
        phone2: data.phone2,
        ubudehe: data.ubudehe,
        type: data.type,
        village: data.village,
      })
    }
  }

  return (
    <main
      className={`${
        isOpen ? 'flex flex-col' : 'hidden'
      } absolute flex h-screen flex-col py-2 items-center gap-6 rounded-sm bg-opacity-90 bg-gray-800 shadow-md top-0 left-0 right-0 bottom-0 z-[999] w-[100%] mx-auto ${className}`}
    >
      <section className={`bg-white w-[90%] mx-auto py-4 rounded-sm`}>
        <Button
          className="absolute top-12 right-20 !p-[12px] !px-[14px] !rounded-[50%]"
          value={<FontAwesomeIcon icon={faX} />}
          onClick={() => {
            dispatch(setMoveHouseholdModal(false))
            dispatch(setHouseholdConflict(false))
          }}
        />
        <h1 className="text-[25px] font-bold text-primary text-center uppercase">
          Move household
        </h1>
        {/* MOVE HOUSEHOLD FORM */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-8 items-center w-[70%] h-fit py-8 mx-auto"
        >
          <section className="flex items-center gap-4 w-full flex-wrap">
            <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col gap-2">
              <p>
                Full Name <span className="text-red-500">*</span>
              </p>
              <Controller
                control={control}
                defaultValue={householdData?.name}
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
                defaultValue={householdData?.nid}
                name="nid"
                render={({ field }) => {
                  return (
                    <Input {...field} placeholder="1 1989 8 0133256 7 89" />
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
                defaultValue={householdData?.phone1}
                rules={{ required: 'Please add the primary phone number' }}
                render={({ field }) => {
                  return <Input readOnly {...field} placeholder="0788 000 000" />
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
                defaultValue={householdData?.phone2}
                name="phone2"
                render={({ field }) => {
                  return <Input {...field} placeholder="0788 111 111" />
                }}
              />
            </label>
            <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col gap-2">
              <p>
                Amount <span className="text-red-500">*</span>
              </p>
              <Controller
                control={control}
                name="ubudehe"
                defaultValue={householdData?.ubudehe}
                rules={{ required: 'Please add the ubudehe amount' }}
                render={({ field }) => {
                  return <Input {...field} placeholder="5000" />
                }}
              />
              {errors.ubudehe && (
                <span className="text-red-500 text-[12px]">
                  {errors.ubudehe.message}
                </span>
              )}
            </label>
            <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
              Household type
              <Controller
                control={control}
                name="type"
                defaultValue={householdData?.type}
                render={({ field }) => {
                  return (
                    <select
                      {...field}
                      className="p-2 outline-none border-[1px] rounded-md w-[90%] border-primary focus:border-[1.5px] ease-in-out duration-150"
                    >
                      <option disabled value="">
                        Select household type
                      </option>
                      <option value={1}>Residence</option>
                      <option value={2}>Business</option>
                    </select>
                  )
                }}
              />
            </label>
          </section>
          <section className="flex items-center gap-4 w-full flex-wrap">
            <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
              <p>
                Province <span className="text-red-500">*</span>
              </p>
              <Controller
                control={control}
                name="province"
                defaultValue={householdData?.province}
                rules={{ required: 'Please select the province' }}
                render={({ field }) => {
                  return (
                    <select
                      {...field}
                      className="p-2 outline-none border-[1px] rounded-md border-primary w-[90%] focus:border-[1.5px] ease-in-out duration-150"
                    >
                      <option disabled value="">
                        Select province
                      </option>
                      <option value={31}>Kigali</option>
                    </select>
                  )
                }}
              />
              {errors.province && (
                <span className="text-red-500 text-[12px]">
                  {errors.province.message}
                </span>
              )}
            </label>
            <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
              <p>
                District <span className="text-red-500">*</span>
              </p>
              <Controller
                control={control}
                name="district"
                defaultValue={householdData?.district}
                rules={{ required: 'Please select the district' }}
                render={({ field }) => {
                  return (
                    <select
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        dispatch(setSelectedDistrict(e.target.value))
                      }}
                      className="p-2 outline-none border-[1px] rounded-md border-primary w-[90%] focus:border-[1.5px] ease-in-out duration-150"
                    >
                      <option disabled value="">
                        Select a district
                      </option>
                      {districts?.map((district) => {
                        return (
                          <option key={district.id} value={district.id}>
                            {district.name}
                          </option>
                        )
                      })}
                    </select>
                  )
                }}
              />
              {errors.district && (
                <span className="text-red-500 text-[12px]">
                  {errors.district.message}
                </span>
              )}
            </label>
            <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
              <p>
                Sector <span className="text-red-500">*</span>
              </p>
              <Controller
                control={control}
                name="sector"
                defaultValue={householdData?.sector}
                rules={{ required: 'Please select the sector' }}
                render={({ field }) => {
                  return (
                    <select
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        dispatch(setSelectedSector(e.target.value))
                      }}
                      className="p-2 outline-none border-[1px] rounded-md border-primary w-[90%] focus:border-[1.5px] ease-in-out duration-150"
                    >
                      <option disabled value="">
                        Select a sector
                      </option>
                      {sectors?.map((sector) => {
                        return (
                          <option key={sector.id} value={sector.id}>
                            {sector.name || 'Sector'}
                          </option>
                        )
                      })}
                    </select>
                  )
                }}
              />
              {errors.sector && (
                <span className="text-red-500 text-[12px]">
                  {errors.sector.message}
                </span>
              )}
            </label>
            <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
              <p>
                Cell <span className="text-red-500">*</span>
              </p>
              <Controller
                control={control}
                name="cell"
                defaultValue={householdData?.cell}
                defa
                rules={{ required: 'Please select the cell' }}
                render={({ field }) => {
                  return (
                    <select
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        dispatch(setSelectedCell(e.target.value))
                      }}
                      className="p-2 outline-none border-[1px] rounded-md border-primary w-[90%] focus:border-[1.5px] ease-in-out duration-150"
                    >
                      <option disabled value="">
                        Select a cell
                      </option>
                      {cells?.map((cell) => {
                        return (
                          <option key={cell.id} value={cell.id}>
                            {cell.name}
                          </option>
                        )
                      })}
                    </select>
                  )
                }}
              />
              {errors.cell && (
                <span className="text-red-500 text-[12px]">
                  {errors.cell.message}
                </span>
              )}
            </label>
            <label className="text-[15px] w-full flex-1 basis-[40%] max-w-[48%] flex flex-col items-start gap-2">
              <p>
                Village <span className="text-red-500">*</span>
              </p>
              <Controller
                control={control}
                name="village"
                defaultValue={householdData?.village}
                rules={{ required: 'Please select the village' }}
                render={({ field }) => {
                  return (
                    <select
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        dispatch(setSelectedVillage(e.target.value))
                      }}
                      className="p-2 outline-none border-[1px] rounded-md border-primary w-[90%] focus:border-[1.5px] ease-in-out duration-150"
                    >
                      <option disabled value="">
                        Select a village
                      </option>
                      {villages?.map((village) => {
                        return (
                          <option key={village.id} value={village.id}>
                            {village.name}
                          </option>
                        )
                      })}
                    </select>
                  )
                }}
              />
              {errors.village && (
                <span className="text-red-500 text-[12px]">
                  {errors.village.message}
                </span>
              )}
            </label>
          </section>
          {/**
           *  CONFIRM MOVE HOUSEHOLD MODAL
           */}
          <section
            className={`${
              confirmMoveHouseholdModal ? 'flex' : 'hidden'
            } absolute top-0 right-0 left-0 bottom-0 bg-transparent bg-opacity-50 w-full mx-auto flex items-center justify-center`}
          >
            <section className="flex flex-col gap-6 items-center justify-center absolute top-0 left-0 right-0 bottom-0 bg-gray-800 bg-opacity-60 shadow-md w-fit">
              <article className="flex flex-col items-center justify-center gap-8 bg-white py-16 w-fit">
                <p className="text-center max-w-[50%]">
                  Are you sure you want to move this household to this village.
                  This will remove {householdData?.name} from their existing
                  location and mark them as MOVED.
                </p>
                <section
                  className={`${
                    moveHouseholdError || moveHouseholdSuccess
                      ? 'flex w-[50%]'
                      : 'hidden'
                  }`}
                >
                  <p
                    className={`${
                      moveHouseholdError ? 'text-red-500' : 'hidden'
                    }`}
                  >
                    The household could not be moved successfully. Please
                    refresh and try again
                  </p>
                  <p
                    className={`${
                      moveHouseholdSuccess ? 'text-green-500' : 'hidden'
                    }`}
                  >
                    Household moved successfully
                  </p>
                </section>
                <span className={'flex items-center gap-4'}>
                  <Controller
                    name="submit"
                    control={control}
                    render={({ field }) => {
                      return (
                        <Button
                          submit
                          {...field}
                          value={`${
                            moveHouseholdLoading ? 'Moving...' : 'Confirm'
                          }`}
                          className="w-fit max-w-[50%] px-6 mx-auto"
                        />
                      )
                    }}
                  />
                  <Button
                    value="Cancel"
                    onClick={(e) => {
                      e.preventDefault()
                      dispatch(setConfirmMoveHouseholdModal(false))
                    }}
                  />
                </span>
              </article>
            </section>
          </section>
          <section
            className={`${
              createDuplicateHouseholdSuccess || createDuplicateHouseholdError
                ? 'flex'
                : 'hidden'
            }`}
          >
            <p
              className={`${
                createDuplicateHouseholdError ? 'text-red-500' : 'hidden'
              }`}
            >
              The household could not be created successfully. Please refresh
              and try again
            </p>
            <p
              className={`${
                createDuplicateHouseholdSuccess ? 'text-green-500' : 'hidden'
              }`}
            >
              Household created successfully
            </p>
          </section>
          <article className="flex items-center gap-6 w-full">
            <Button
              value={'Move Household'}
              className="w-full px-6 mx-auto"
              onClick={(e) => {
                e.preventDefault()
                dispatch(setConfirmMoveHouseholdModal(true))
                dispatch(setExistingHouseholdId(existingHousehold?.id))
              }}
            />
            <Controller
              name="submit"
              control={control}
              render={({ field }) => {
                return (
                  <Button
                    submit
                    {...field}
                    value={`${
                      createDuplicateHouseholdLoading
                        ? 'Creating...'
                        : 'Create another branch'
                    }`}
                    className="w-full px-6 mx-auto"
                  />
                )
              }}
            />
          </article>
        </form>
      </section>
    </main>
  )
}

MoveHousehold.propTypes = {
  isOpen: PropTypes.bool,
  className: PropTypes.string,
}

MoveHousehold.defaultProps = {
  isOpen: true,
  className: '',
}

export default MoveHousehold
