import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import HouseholdInfo from '../../containers/households/HouseholdInfo'
import { useLazyGetHouseHoldDetailsQuery } from '../../states/api/apiSlice'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { setCompletePaymentModal, setHousehold } from '../../states/features/modals/householdSlice'
import Loading from '../../components/Loading'
import HouseholdPayments from '../../containers/households/HouseholdPayments'
import RecordPaymentModel from '../../components/models/RecordPaymentModel'
import {
  setMultiplePaymentModal,
  setOfflinePaymentModal,
  setReceiptsModal,
} from '../../states/features/transactions/paymentSlice'
import Button from '../../components/Button'
import RecordOfflinePayment from '../../containers/payments/RecordOfflinePayment'
import RecordMultipleMonths from '../../containers/households/RecordMultipleMonths'
import GenerateReceipts from '../../containers/households/GenerateReceipts'
import { capitalizeWords } from '../../utils/Words'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCaretDown,
  faCaretUp,
  faMoneyBill,
} from '@fortawesome/free-solid-svg-icons'
import PaymentActionModal from '../../components/models/PaymentActionModel'

const HouseholdDetails = () => {
  // PARAMS
  const { id } = useParams()

  // STATE VARIABLES
  const { user } = useSelector((state) => state.auth)
  const { household } = useSelector((state) => state.household)
  const [showRecordPaymentModal, setRecordPaymentModal] = useState(false)
  const [showPaymentFeedbackMsgModal, setShowPaymentFeedbackMsgModal] =
    useState(false)
  const [paymentFeedbackStatus, setPaymentFeedbackStatus] = useState('')
  const dispatch = useDispatch()

  // GET HOUSEHOLD BY ID
  const [
    getHouseholdDetails,
    {
      data: householdDetails,
      isLoading: householdDetailsLoading,
      isSuccess: householdDetailsSuccess,
      isError: householdDetailsError,
    },
  ] = useLazyGetHouseHoldDetailsQuery()

  // GET HOUSEHOLD REQUEST
  useEffect(() => {
    getHouseholdDetails({ id })
  }, [id])

  useEffect(() => {
    const ws = new WebSocket('ws://142.93.185.21:9090')

    ws.onopen = () => console.log('Connected to WebSocket server')

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log(household, data?.payment?.household_id)
      if (
        data &&
        data.payment &&
        data.payment.status === 'PAID'
        &&
        household &&
        household.guid === data.payment.household_id
      ) {
        console.log('donessssssssssssssss')
        setPaymentFeedbackStatus(data.payment.status)
        setShowPaymentFeedbackMsgModal(true)
        setRecordPaymentModal(false)
        dispatch(setCompletePaymentModal(false))
        getHouseholdDetails({ id })

        toast.success('Payment made successfully')
      }
      console.log('Payment update:', data.payment)
      // setMessages((prev) => [...prev, data]);
    }

    ws.onclose = () => console.log('WebSocket disconnected')

    return () => ws.close()
  }, [id, household])

  // HANDLE GET HOUSEHOLD DETAILS
  useEffect(() => {
    if (householdDetailsSuccess) {
      dispatch(setHousehold(householdDetails?.data || []))
    } else if (householdDetailsError) {
      toast.error('Could not get household details. Please try again later.')
    }
  }, [householdDetailsSuccess, householdDetails])

  // TOGGLE RECEIPTS/INVOICES MODAL
  const [title, setTitle] = useState('receipts')
  const [showMenu, setShowMenu] = useState(false)

  return (
    <main className="p-4 flex flex-col w-full items-center">
      {householdDetailsLoading && (
        <span className="flex items-center justify-center min-h-[70vh]">
          <Loading />
        </span>
      )}
      {householdDetailsSuccess && household && (
        <section className="flex flex-col w-full gap-2">
          {/* {user?.departments.level_id > 5 && ( */}
          <section className="flex flex-col gap-2 md:flex-row items-center md:gap-2 px-4 mt-20 md:mt-0">
            {showRecordPaymentModal && (
              <RecordPaymentModel
                showModal={showRecordPaymentModal}
                setShowModal={setRecordPaymentModal}
                household={household}
                className="mb-2 md:mb-0"
              />
            )}
            {showPaymentFeedbackMsgModal && (
              <PaymentActionModal
                action={paymentFeedbackStatus}
                householdName={household.name}
                showModal={showPaymentFeedbackMsgModal}
                setShowModal={setShowPaymentFeedbackMsgModal}
              />
            )}

            <Button
              value={
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faMoneyBill} />
                  <span>Record Transaction</span>
                </span>
              }
              onClick={(e) => {
                e.preventDefault()
                setRecordPaymentModal(true)
              }}
            />

            <Button
              value="Record cash payment"
              onClick={(e) => {
                e.preventDefault()
                dispatch(setOfflinePaymentModal(true))
              }}
            />
            {/* <RecordMultipleMonthsPayment /> */}
            <Button
              value="Pay advance"
              onClick={(e) => {
                e.preventDefault()
                dispatch(setMultiplePaymentModal(true))
              }}
            />
            <span className="relative flex flex-col gap-3">
              <Button
                value={
                  <span className="text-md flex items-center gap-1">
                    Generate {capitalizeWords(title)}
                    <FontAwesomeIcon
                      icon={showMenu ? faCaretUp : faCaretDown}
                    />
                  </span>
                }
                onClick={(e) => {
                  e.preventDefault()
                  setShowMenu(!showMenu)
                }}
              />
              <menu
                className={`${
                  !showMenu && 'hidden'
                } flex flex-col gap-2 z-[10000000] absolute top-12 shadow-lg bg-white w-full rounded-md`}
              >
                <Link
                  className="w-full h-full p-3 flex items-center justify-center text-center hover:bg-primary hover:text-white"
                  onClick={(e) => {
                    e.preventDefault()
                    setTitle('receipts')
                    dispatch(setReceiptsModal(true))
                    setShowMenu(false)
                  }}
                >
                  Receipts
                </Link>
                <Link
                  className="w-full h-full p-3 flex items-center justify-center text-center hover:bg-primary hover:text-white"
                  onClick={(e) => {
                    e.preventDefault()
                    setTitle('invoices')
                    dispatch(setReceiptsModal(true))
                    setShowMenu(false)
                  }}
                >
                  Invoices
                </Link>
              </menu>
            </span>
          </section>
          {/* )} */}
          <span className="flex w-full gap-6 items-start">
            {household && household?.hasOwnProperty('payments') ? (
              <HouseholdPayments household={household} />
            ) : (
              <div className="py-[20%] text-center font-semibold text-lg min-w-[70%]">
                <p className="mx-auto py-8 px-4 w-[60%] rounded-lg shadow-lg">
                  This household has not made any transactions yet!
                </p>
              </div>
            )}

            <HouseholdInfo household={household} />
            <RecordOfflinePayment household={household} />
            <RecordMultipleMonths />
            <GenerateReceipts title={title} />
          </span>
        </section>
      )}
    </main>
  )
}

export default HouseholdDetails
