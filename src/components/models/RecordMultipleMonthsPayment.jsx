import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useForm, Controller, useWatch } from 'react-hook-form'
import Button from '../Button'
import Input from '../Input'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoneyBill, faX } from '@fortawesome/free-solid-svg-icons'
import { useCreatePaymentSessionMutation } from '../../states/api/apiSlice'
import Loading from '../Loading'

function RecordMultipleMonthsPayment({ household }) {
    const [showModal, setShowModal] = useState(false)
    const [startingMonth, setStartingMonth] = useState('2023-01');
    const [endingMonth, setEndingMonth] = useState('2023-01');
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm()

    const [
        createPaymentSession, {
            data: paymentSessionData,
            isLoading: paymentSessionIsLoading,
            isError: paymentSessionIsError,
            isSuccess: paymentSessionIsSuccess
        }
    ] = useCreatePaymentSessionMutation()
    const [date, setDate] = useState([
        { year: new Date().getFullYear(), month: 'January' },
    ]);
    const openModal = () => {
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
    }

    const onSubmit = (data) => {
         createPaymentSession({
            household_id: household?.guid,
            month_paid: data?.month_paid,
            total_month_paid: data?.total_month_paid,
            payment_method: data?.payment_method,
            payment_phone: data?.payment_phone,
            lang: data?.lang,
        })
    }

    useEffect(() => {
        if (paymentSessionIsSuccess) {
            closeModal()
        }
    }, [paymentSessionData])

    return (
        <main className="relative">
            <Button value={<span className='flex items-center gap-2'>
                <FontAwesomeIcon icon={faMoneyBill} />
                <span>Pay advance</span>
            </span>}
                onClick={(e) => {
                    e.preventDefault()
                    openModal()
                }}
            />

            {showModal && (
                <section
                    tabIndex={-1}
                    aria-hidden="true"
                    className="fixed top-0 left-0 right-0 z-50 w-full h-screen p-4 flex items-center justify-center bg-gray-800 bg-opacity-60"
                >
                    <div className="relative bg-white rounded-lg shadow md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] mx-auto ">
                        <article className="bg-primary relative rounded-sm flex flex-row-reverse items-center justify-center py-4 px-4">
                            <Button
                                onClick={(e) => {
                                    e.preventDefault()
                                    closeModal()
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
                                Pay multiple months
                            </h4>
                        </article>
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="flex flex-col gap-4 items-center w-full px-4 md:px-6 lg:px-10"
                        >
                            <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2 mt-2">
                                Select starting and ending month
                                <div className="flex items-center gap-2">
                                    <input
                                        type="month"
                                        className="p-2 outline-none border-[1px] rounded-md border-primary w-[45%] focus:border-[1.5px] ease-in-out duration-150"
                                        value={startingMonth}
                                        onChange={(e) => setStartingMonth(e.target.value)}
                                    />
                                    <input
                                        type="month"
                                        className="p-2 outline-none border-[1px] rounded-md border-primary w-[45%] focus:border-[1.5px] ease-in-out duration-150"
                                        value={endingMonth}
                                        onChange={(e) => setEndingMonth(e.target.value)}
                                    />
                                </div>
                            </label>
                            <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
                                Amount Paid
                                <Controller
                                    name="total_month_paid"
                                    control={control}
                                    defaultValue={household?.ubudehe}
                                    rules={{ required: 'Amount is required' }}
                                    render={({ field }) => (
                                        <Input type="number" {...field} placeholder="1000" />
                                    )}
                                />
                                {errors.total_month_paid && (
                                    <span className="text-red-500">
                                        {errors.total_month_paid.message}
                                    </span>
                                )}
                            </label>

                            <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
                                Numero iriho amafaranga
                                <Controller
                                    name="payment_phone"
                                    control={control}
                                    defaultValue={household?.phone1}
                                    rules={{ required: 'Please enter the phone number' }}
                                    render={({ field }) => (
                                        <Input type="text" {...field} placeholder="07XXXXXXXX" />
                                    )}
                                />
                                {errors.payment_phone && (
                                    <span className="text-red-500">
                                        {errors.payment_phone.message}
                                    </span>
                                )}
                            </label>
                            <div className='flex justify-between  w-full'>
                                <label className=" text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
                                    Choose payment option
                                    <Controller
                                        name="payment_method"
                                        control={control}
                                        rules={{
                                            required: 'Payment option is required',
                                        }}
                                        defaultValue={'MOMO'}
                                        render={({ field }) => (
                                            <select
                                                {...field}
                                                className="p-2 outline-none border-[1px] rounded-md border-primary w-[90%] focus:border-[1.5px] ease-in-out duration-150"
                                            >
                                                <option value="MTN">Choose payment</option>
                                                <option value="bank">Bank Transfer</option>
                                                <option value="MOMO">MTN Mobile Money</option>
                                                <option value="Airtel">Airtel Money</option>
                                            </select>
                                        )}
                                    />
                                    {errors.payment_method && (
                                        <span className="text-red-500">
                                            {errors.payment_method.message}
                                        </span>
                                    )}
                                </label>
                                <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
                                    Choose SMS Language
                                    <Controller
                                        name="lang"
                                        control={control}
                                        defaultValue={'rw'}
                                        render={({ field }) => (
                                            <select
                                                {...field}
                                                className="p-2 outline-none border-[1px] rounded-md border-primary w-[90%] focus:border-[1.5px] ease-in-out duration-150"
                                            >
                                                <option value="rw">Kinyarwanda</option>
                                                <option value="en">English</option>
                                                <option value="fr">Français</option>
                                            </select>
                                        )}
                                    />
                                </label>
                            </div>
                            <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
                                Numero yakira message
                                <Controller
                                    name="phone1"
                                    control={control}
                                    defaultValue={household?.phone1}
                                    render={({ field }) => (
                                        <Input type="text" {...field} placeholder="0785767647" />
                                    )}
                                />
                            </label>

                            <article
                                className={
                                    paymentSessionIsError || paymentSessionIsSuccess
                                        ? 'flex'
                                        : 'hidden'
                                }
                            >
                                <p className={paymentSessionIsSuccess ? 'flex text-teal-600' : 'hidden'}>
                                    Payment created successfully
                                </p>
                                <p className={paymentSessionIsError ? 'flex text-red-600' : 'hidden'}>
                                    Could not create payment. Please check if all information is
                                    correct
                                </p>
                            </article>
                            <Controller
                                name="submit"
                                control={control}
                                render={() => {
                                    return (
                                        <article className="m-2">
                                            <Button
                                                submit
                                                value={
                                                    paymentSessionIsLoading ? <Loading /> : 'Pay now'
                                                }
                                            />
                                        </article>
                                    )
                                }}
                            />
                        </form>
                    </div>
                </section>
            )}
        </main>
    )
}

RecordMultipleMonthsPayment.propTypes = {
    household: PropTypes.shape({}),
}

export default RecordMultipleMonthsPayment
