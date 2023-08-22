import { useState } from 'react'
import { AiFillPlusCircle } from 'react-icons/ai'
import { useForm, Controller } from 'react-hook-form'
import Button from '../Button'

function RecordPaymentModel() {
  const [showModal, setShowModal] = useState(false)
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const openModal = () => {
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const onSubmit = (data) => {
    closeModal()
  }

  return (
    <div className="relative">
      <button
        onClick={openModal}
        className="flex items-center absolute right-6 top-4 justify-center px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg shadow-md ease-in-out duration-300 hover:scale-[]"
        type="button"
      >
        <AiFillPlusCircle className="mr-2 text-lg" />
        Record Payment
      </button>

      {showModal && (
        <div
          tabIndex={-1}
          aria-hidden="true"
          className="fixed top-0 left-0 right-0 z-50 w-full h-screen p-4 flex items-center justify-center bg-gray-800 bg-opacity-60"
        >
          <div className="relative bg-white rounded-lg shadow max-w-[600px]">
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
              <h3 className="mb-4 text-xl text-center font-medium text-white">
                Record Payment
              </h3>
            </div>
            <div className="px-6 py-6 lg:px-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label
                      htmlFor="month_paid"
                      className="block mb-2 text-sm font-medium text-black"
                    >
                      Choose month to be paid
                    </label>
                    <Controller
                      name="month_paid"
                      control={control}
                      rules={{ required: 'month_paid is required' }}
                      render={({ field }) => (
                        <input
                          type="date"
                          {...field}
                          className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                        />
                      )}
                    />
                    {errors.month_paid && (
                      <span className="text-red-500">
                        {errors.month_paid.message}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="amount"
                      className="block mb-2 text-sm font-medium text-black"
                    >
                      Amount Paid
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-2 flex items-center text-black">
                        RWF
                      </span>
                      <Controller
                        name="Amount"
                        control={control}
                        rules={{ required: 'Amount is required' }}
                        render={({ field }) => (
                          <input
                            type="number"
                            {...field}
                            placeholder="1000"
                            className="pl-11 text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                          />
                        )}
                      />
                    </div>
                    {errors.Amount && (
                      <span className="text-red-500">
                        {errors.Amount.message}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="Numero"
                    className="block mb-2 text-sm font-medium text-black"
                  >
                    Numero y'Umuturage yakira Message
                  </label>
                  <Controller
                    name="Numero"
                    control={control}
                    rules={{ required: 'Numero is required' }}
                    render={({ field }) => (
                      <input
                        type="text"
                        {...field}
                        placeholder="0785767647"
                        className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                      />
                    )}
                  />
                  {errors.phone2 && (
                    <span className="text-red-500">
                      {errors.Numero.message}
                    </span>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="payment"
                    className="block mb-2 text-sm font-medium text-black"
                  >
                    Choose payment option
                  </label>
                  <Controller
                    name="payment"
                    control={control}
                    rules={{
                      required: 'Payment option is required',
                    }}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                      >
                        <option value="MTN">Choose payment</option>
                        <option value="bank">Bank Transfer</option>
                      </select>
                    )}
                  />
                  {errors.payment && (
                    <span className="text-red-500">
                      {errors.payment.message}
                    </span>
                  )}
                </div>

                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label
                      htmlFor="phone2"
                      className="block mb-2 text-sm font-medium text-black"
                    >
                      Andikamo Numero ya Mobile Money Iriho Amafaranga
                    </label>
                    <Controller
                      name="phone2"
                      control={control}
                      rules={{ required: 'Phone  No. is required' }}
                      render={({ field }) => (
                        <input
                          type="text"
                          {...field}
                          placeholder="0785767647"
                          className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                        />
                      )}
                    />
                    {errors.phone2 && (
                      <span className="text-red-500">
                        {errors.phone2.message}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="SMS"
                    className="block mb-2 text-sm font-medium text-black"
                  >
                    Choose SMS Language
                  </label>
                  <Controller
                    name="SMS"
                    control={control}
                    rules={{
                      required: 'Payment option is required',
                    }}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                      >
                        <option value="English">English</option>
                        <option value="Kinyarwanda">Kinyarwanda</option>
                        <option value="Français">Français</option>
                      </select>
                    )}
                  />
                  {errors.SMS && (
                    <span className="text-red-500">{errors.SMS.message}</span>
                  )}
                </div>
                <Controller
                  name="submit"
                  control={control}
                  render={({ field }) => {
                    return <Button submit value="Pay now" />
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

export default RecordPaymentModel
