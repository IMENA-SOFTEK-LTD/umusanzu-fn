import { useDispatch } from 'react-redux'
import { Controller, useForm } from 'react-hook-form'
import Input from '../../components/Input'
import { useEffect, useState } from 'react'
import Select from '../../components/Select'
import { useCreateStaffAdminMutation } from '../../states/api/apiSlice'
import Button from '../../components/Button'
import { Alert } from '@material-tailwind/react'

const CreateAdmin = (props) => {
  const { departmentId, onCreateAdmin, type } = props
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm()
  const [isCreatingLoading, setIsCreatingLoading] = useState(false)
  const [submitButton, setSubmitButton] = useState('Create ' + type)
  const [errorMessage, setErrorMessage] = useState('')
  // INITIALIZE CREATE STAFF ADMIN MUTATION
  const [createStaffAdmin] = useCreateStaffAdminMutation()

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
    setValue('username', watch('names')?.split(' ').join('').toLowerCase())
  }, [watch('names')])

  // HANDLE FORM SUBMISSION
  const onSubmit = async (data) => {
    setIsCreatingLoading(true)
    setErrorMessage('')
    try {
      await createStaffAdmin({
        names: data?.names,
        username: data?.username.toLowerCase(),
        password: data?.password,
        department_id: departmentId,
        email: data?.email,
        phone1: data?.phone1,
        phone2: data?.phone2,
        staff_role: data?.staff_role || 1,
      })
        .unwrap()
        .then((res) => {
          onCreateAdmin({
            isSuccess: true,
            data: res?.data,
            message: type + ' created successfully',
          })
        })
        .catch((error) => {
          // console.error(error)
          if (error.data && error.data.message) {
            setErrorMessage(error.data.message)
            onCreateAdmin({
              isSuccess: false,
              data: null,
              message: error.data.message,
            })
          } else {
            const message =
              'An error occurred while updating the '+type+' Status. Please try again'
            setErrorMessage(message)
            onCreateAdmin({
              isSuccess: false,
              data: null,
              message: message,
            })
          }
        })
        .finally(() => {
          setIsCreatingLoading(false)
        })
    } catch (error) {
      return error
    }
  }

  return (
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
                  label={type + ' Names'}
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
                  label={type + ' Username'}
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
   

      <Alert
        color="red"
        open={errorMessage}
        onClose={() => setErrorMessage('')}
      >
        {errorMessage}
      </Alert>

      <Button
        loading={isCreatingLoading}
        value={`${submitButton}`}
        submit
        className="!w-full"
        material
      />
    </form>
  )
}

export default CreateAdmin
