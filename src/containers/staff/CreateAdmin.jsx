import { useDispatch, useSelector } from 'react-redux'
import Modal from '../../components/models/Modal'
import { setCreateAdminModal } from '../../states/features/departments/staffSlice'
import { Controller, useForm } from 'react-hook-form'
import Input from '../../components/Input'
import { useEffect, useState } from 'react'
import Select from '../../components/Select'
import {
  useCreateStaffAdminMutation,
  useLazyListDepartmentsQuery,
} from '../../states/api/apiSlice'
import { setDepartmentsList } from '../../states/features/departments/departmentSlice'
import { toast } from 'react-toastify'
import Button from '../../components/Button'
import { useNavigate } from 'react-router-dom'
import Loading from '../../components/Loading'

const CreateAdmin = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm()

  // NAVIGATE
  const navigate = useNavigate()

  // STATE VARIABLES
  const dispatch = useDispatch()
  const { createAdminModal } = useSelector((state) => state.staff)
  const { departmentsList } = useSelector((state) => state.departments)
  const { user } = useSelector((state) => state.auth)
  const [submitButton, setSubmitButton] = useState('Create Admin')

  // INITIATE GET DEPARTMENTS REQUEST
  const [
    listDepartments,
    {
      data: listDepartmentsData,
      isLoading: listDepartmentsIsLoading,
      isError: listDepartmentsIsError,
      isSuccess: listDepartmentsIsSuccess,
      reset: resetListDepartments,
    },
  ] = useLazyListDepartmentsQuery()

  // INITIALIZE CREATE STAFF ADMIN MUTATION
  const [
    createStaffAdmin,
    {
      data: createStaffAdminData,
      isLoading: createStaffAdminIsLoading,
      isError: createStaffAdminIsError,
      // Error: createStaffAdminError,
      isSuccess: createStaffAdminIsSuccess,
    },
  ] = useCreateStaffAdminMutation()

  // LIST DEPARTMENT LEVELS ON LEVEL CHANGE
  useEffect(() => {
    if (watch('level_id') === 6) {
      setSubmitButton('Create Agent')
    } else if (watch('level_id') && watch('level_id') !== 5) {
      listDepartments({
        level_id: watch('level_id'),
      })
    }
  }, [watch('level_id')])

  // HANDLE DEPARTMENT LEVELS RESPONSE
  useEffect(() => {
    if (listDepartmentsIsSuccess) {
      dispatch(setDepartmentsList(listDepartmentsData?.data?.rows))
    } else if (listDepartmentsIsError) {
      toast.error('Failed to load departments. Please try again later.')
    }
  }, [listDepartmentsData, listDepartmentsIsSuccess, listDepartmentsIsError])

  useEffect(() => {
    setValue('username', watch('names')?.split(' ').join('').toLowerCase())
  }, [watch('names')])

  // HANDLE FORM SUBMISSION
  const onSubmit = (data) => {
    const departmentId = data?.level_id === 5 ? 1 : data?.department_id
    createStaffAdmin({
      names: data?.names,
      username: data?.username,
      password: data?.password,
      department_id: departmentId,
      email: data?.email,
      phone1: data?.phone1,
      phone2: data?.phone2,
      staff_role: data?.staff_role,
    })
  }

  // ADMIN LEVELS OPTIONS
  const adminLevels = [
    {
      text: 'Province',
      value: 1,
    },
    {
      text: 'District',
      value: 2,
    },
    {
      text: 'Sector',
      value: 3,
    },
    {
      text: 'Cell',
      value: 4,
    },
    {
      text: 'Country',
      value: 5,
    },
    {
      text: 'Village',
      value: 6,
    },
  ]

  // HANDLE CREATE ADMIN RESPONSE
  useEffect(() => {
    if (createStaffAdminIsSuccess) {
      toast.success('Admin created successfully')
      navigate(`/admins/${createStaffAdminData?.data?.department_id}`)
      dispatch(setCreateAdminModal(false))
    }
  }, [createStaffAdminIsSuccess, createStaffAdminIsError])

  return (
    <Modal
      isOpen={createAdminModal}
      onClose={() => {
        dispatch(setCreateAdminModal(false))
      }}
    >
      <h1 className="text-primary uppercase font-semibold px-4">
        Create Admin
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="px-4 flex flex-col gap-4 w-full"
      >
        <span className="w-full flex items-start gap-4">
          <Controller
            name="names"
            control={control}
            rules={{ required: 'Names are required' }}
            render={({ field }) => {
              return (
                <label className="flex flex-col gap-1 items-start w-full">
                  <Input
                    placeholder="Full Name"
                    label="Admin Names"
                    onChange={(e) => {
                      field.onChange(e)
                    }}
                    {...field}
                  />
                  {errors?.names && (
                    <span className="text-red-600 text-sm">
                      {errors?.names?.message}
                    </span>
                  )}
                </label>
              )
            }}
          />
          <Controller
            name="username"
            control={control}
            defaultValue={watch('username')}
            rules={{ required: 'Username is required' }}
            render={({ field }) => {
              return (
                <label className="flex flex-col gap-1 items-start w-full">
                  <Input
                    placeholder="Username"
                    label="Admin Username"
                    defaultValue={watch('username')}
                    {...field}
                  />
                  {errors?.username && (
                    <span className="text-red-600 text-sm">
                      {errors?.username?.message}
                    </span>
                  )}
                </label>
              )
            }}
          />
        </span>
        <span className="w-full flex items-start gap-4">
          <Controller
            name="phone1"
            control={control}
            rules={{ required: 'Phone is required' }}
            render={({ field }) => {
              return (
                <label className="flex flex-col gap-1 items-start w-full">
                  <Input
                    placeholder="07XX XXX XXX"
                    label="Primary Phone"
                    {...field}
                  />
                  {errors?.phone1 && (
                    <span className="text-red-600 text-sm">
                      {errors?.phone1?.message}
                    </span>
                  )}
                </label>
              )
            }}
          />
          <Controller
            name="phone2"
            control={control}
            render={({ field }) => {
              return (
                <label className="flex flex-col gap-1 items-start w-full">
                  <Input
                    placeholder="07XX XXX XXX"
                    label="Secondary Phone (Optional)"
                    {...field}
                  />
                </label>
              )
            }}
          />
        </span>
        <span className="w-full flex items-start gap-4">
          <Controller
              name="email"
              control={control}
              render={({ field }) => {
                return (
                  <label className="flex flex-col gap-1 items-start w-full">
                    <Input placeholder="Email" label="Email Address" {...field} />
                  </label>
                )
              }}
          />
        </span>
        <span className="flex items-start gap-4 w-full">
          <Controller
            name="level_id"
            rules={{ required: 'Select level for the admin' }}
            control={control}
            render={({ field }) => {
              return (
                <Select
                  options={adminLevels?.map((level) => {
                    return {
                      ...level,
                      disabled: level?.value <= user?.departments?.level_id && level?.value === 5 && user?.departments?.level_id !== 5,
                    }
                  })}
                  label="Administration Level"
                  defaultLabel="Level"
                  {...field}
                />
              )
            }}
          />
          <Controller
            name="department_id"
            rules={{ required: 'Select department for the admin' }}
            control={control}
            render={({ field }) => {
              return (
                <label className="flex flex-col gap-1 items-start w-full">
                  <Select
                    options={departmentsList?.map((department) => {
                      return {
                        text: department?.name,
                        value: department?.id,
                        disabled:
                          department?.level_id <= user?.departments?.level_id && user?.departments?.level_id !== 5,
                      }
                    })}
                    label="Administration Department"
                    defaultLabel="Department"
                    {...field}
                  />
                  {errors?.department_id && (
                    <span className="text-red-600 text-sm">
                      {errors?.department_id?.message}
                    </span>
                  )}
                </label>
              )
            }}
          />
        </span>
        <span className="w-full flex items-start gap-4">
          <Controller
            name="password"
            control={control}
            rules={{ required: 'Password is required' }}
            render={({ field }) => {
              return (
                <label className="flex flex-col gap-1 items-start w-full">
                  <Input
                    placeholder="********"
                    type={'password'}
                    label="Password"
                    {...field}
                  />
                  {errors?.password && (
                    <span className="text-red-600 text-sm">
                      {errors?.password?.message}
                    </span>
                  )}
                </label>
              )
            }}
          />
          <Controller
            name="confirmPassword"
            rules={{
              required: 'Confirm password',
              validate: (value) =>
                value === watch('password') || 'Passwords do not match',
            }}
            control={control}
            render={({ field }) => {
              return (
                <label className="flex flex-col gap-1 items-start w-full">
                  <Input
                    placeholder="********"
                    type={'password'}
                    label="Confirm Password"
                    {...field}
                  />
                  {errors?.confirmPassword && (
                    <span className="text-red-600 text-sm">
                      {errors?.confirmPassword?.message}
                    </span>
                  )}
                </label>
              )
            }}
          />
        </span>
        <Controller
          name="staff_role"
          rules={{ required: 'Role is required' }}
          control={control}
          render={({ field }) => {
            return (
              <label className="flex flex-col gap-1 items-start w-full">
                <Select
                  label="Staff Role"
                  defaultLabel="Role"
                  options={[
                    { value: 1, text: 'Admin' },
                    { value: 0, text: 'Viewer' },
                  ]}
                  {...field}
                />
                {errors?.staff_role && (
                  <span className="text-red-600 text-sm">
                    {errors?.staff_role?.message}
                  </span>
                )}
              </label>
            )
          }}
        />
        <Button
          value={createStaffAdminIsLoading ? <Loading /> : `${submitButton}`}
          submit
          className="!w-full"
        />
      </form>
    </Modal>
  )
}

export default CreateAdmin
