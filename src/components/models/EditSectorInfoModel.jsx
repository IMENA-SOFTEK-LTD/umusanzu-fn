import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import Button from '../Button'
import { FaPenNib } from 'react-icons/fa'
import { BiSolidEditAlt } from 'react-icons/bi'

function EditSectorInfoModel() {

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
                className="flex items-center  justify-center px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg shadow-md ease-in-out duration-300 hover:scale-[]"
                type="button"
            >
                <FaPenNib className="mr-2 text-lg" />
                Edit
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
                            <div className="flex items-center justify-center gap-5">
                                <span className="text-3xl">
                                    <BiSolidEditAlt className='
                                    text-white
                                    
                                    '/>
                                </span>
                                <h3 className="mb-4 mt-2 text-xl text-center font-medium text-white">
                                    Edit Sector Info
                                </h3>
                            </div>

                        </div>
                        <div className="px-6 py-6 lg:px-8">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="flex space-x-4">
                                    <div className="flex-1">
                                        <label
                                            htmlFor="adminName"
                                            className="block mb-2 text-sm font-medium text-black"
                                        >
                                            Service
                                        </label>
                                        <Controller
                                            name="service"
                                            control={control}
                                            rules={{ required: 'Service is required' }}
                                            render={({ field }) => (
                                                <input
                                                    type="text"
                                                    {...field}
                                                    placeholder="Umutekano"
                                                    className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                                                />
                                            )}
                                        />
                                        {errors.service && (
                                            <span className="text-red-500">
                                                {errors.service.message}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <label
                                            htmlFor="adminUsername"
                                            className="block mb-2 text-sm font-medium text-black"
                                        >
                                            Representative Names
                                        </label>
                                        <Controller
                                            name="repNames"
                                            control={control}
                                            rules={{ required: 'Representative Names is required' }}
                                            render={({ field }) => (
                                                <input
                                                    type="text"
                                                    {...field}
                                                    placeholder="Representative Names"
                                                    className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                                                />
                                            )}
                                        />
                                        {errors.repNames && (
                                            <span className="text-red-500">
                                                {errors.repNames.message}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label
                                        htmlFor="nid"
                                        className="block mb-2 text-sm font-medium text-black"
                                    >
                                        Representative Position
                                    </label>
                                    <Controller
                                        name="repPosition"
                                        control={control}
                                        rules={{ required: 'Representative Position is required' }}
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                {...field}
                                                placeholder="Representative Position"
                                                className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                                            />
                                        )}
                                    />
                                    {errors.repPosition && (
                                        <span className="text-red-500">{errors.repPosition.message}</span>
                                    )}
                                </div>
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block mb-2 text-sm font-medium text-black"
                                    >
                                        Email Address
                                    </label>
                                    <Controller
                                        name="email"
                                        control={control}
                                        rules={{
                                            required: 'Email Address is required',
                                            pattern: {
                                                value: /^\S+@\S+$/i,
                                                message: 'Invalid email address',
                                            },
                                        }}
                                        render={({ field }) => (
                                            <input
                                                type="email"
                                                {...field}
                                                placeholder="Email Address"
                                                className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                                            />
                                        )}
                                    />
                                    {errors.email && (
                                        <span className="text-red-500">{errors.email.message}</span>
                                    )}
                                </div>
                                <div className="flex space-x-4">
                                    <div className="flex-1">
                                        <label
                                            htmlFor="phone1"
                                            className="block mb-2 text-sm font-medium text-black"
                                        >
                                            Phone 1 No.
                                        </label>
                                        <Controller
                                            name="phone1"
                                            control={control}
                                            rules={{ required: 'Phone 1 No. is required' }}
                                            render={({ field }) => (
                                                <input
                                                    type="text"
                                                    {...field}
                                                    placeholder="Phone Number"
                                                    className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                                                />
                                            )}
                                        />
                                        {errors.phone1 && (
                                            <span className="text-red-500">
                                                {errors.phone1.message}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <label
                                            htmlFor="phone2"
                                            className="block mb-2 text-sm font-medium text-black"
                                        >
                                            Phone 2 No.
                                        </label>
                                        <Controller
                                            name="phone2"
                                            control={control}
                                            rules={{ required: 'Phone 2 No. is required' }}
                                            render={({ field }) => (
                                                <input
                                                    type="text"
                                                    {...field}
                                                    placeholder="Phone Number"
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
                                <div className="flex space-x-4">
                                    <div className="flex-1">
                                        <label
                                            htmlFor="Bank Account Number"
                                            className="block mb-2 text-sm font-medium text-black"
                                        >
                                            Bank Account Number
                                        </label>
                                        <Controller
                                            name="baAcNumber"
                                            control={control}
                                            rules={{ required: 'Bank Account Number is required' }}
                                            render={({ field }) => (
                                                <input
                                                    type="text"
                                                    {...field}
                                                    placeholder="Bank Account Number"
                                                    className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                                                />
                                            )}
                                        />
                                        {errors.baAcNumber && (
                                            <span className="text-red-500">
                                                {errors.baAcNumber.message}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <label
                                            htmlFor="Bank Account Name"
                                            className="block mb-2 text-sm font-medium text-black"
                                        >
                                            Bank Account Name
                                        </label>
                                        <Controller
                                            name="bAName"
                                            control={control}
                                            render={({ field }) => (
                                                <input
                                                    type="text"
                                                    {...field}
                                                    placeholder="Bank Account Name"
                                                    className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                                                />
                                            )}
                                        />
                                        {errors.bAName && (
                                            <span className="text-red-500">
                                                {errors.bAName.message}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Controller
                                    name="submit"
                                    control={control}
                                    render={({ field }) => {
                                        return <Button submit value="Save changes" />
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

export default EditSectorInfoModel