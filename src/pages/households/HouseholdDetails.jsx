import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import HouseholdInfo from '../../containers/households/HouseholdInfo'
import { useLazyGetHouseHoldDetailsQuery } from '../../states/api/apiSlice'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import {
  setCompletePaymentModal,
  setHousehold,
} from '../../states/features/modals/householdSlice'
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
  const ws = new WebSocket('ws://142.93.185.21:9090');

  ws.onopen = () => console.log('Connected to WebSocket server');

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (
      data?.payment?.status === 'PAID' &&
      household?.guid === data?.payment?.household_id
    ) {
      setPaymentFeedbackStatus(data.payment.status);
      setShowPaymentFeedbackMsgModal(true);
      setRecordPaymentModal(false);
      dispatch(setCompletePaymentModal(false));
      getHouseholdDetails({ id });
      toast.success('Payment made successfully');
    }
  };

  ws.onclose = () => console.log('WebSocket disconnected');

  // cleanup on unmount
  return () => ws.close();
  // 👇 only run on mount, not on every id/household change
}, []); // <— no [id, household] here


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
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    if (showInfo) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  }, [showInfo])
  return (
    <main className="flex flex-col gap-10 w-full max-w-7xl mx-auto px-6 py-6">
      {householdDetailsLoading && (
        <span className="flex items-center justify-center min-h-[100vh]">
          <Loading />
        </span>
      )}
      {householdDetailsSuccess && household && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
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

            {parseInt(user?.staff_role) === 1 && (
            <>
            <button
              className="bg-green-600 text-white rounded-full text-center shadow-lg hover:bg-primary/80 py-2"
              onClick={(e) => {
                e.preventDefault()
                setRecordPaymentModal(true)
              }}
            >
              <span className="text-center text-white">
                <FontAwesomeIcon icon={faMoneyBill} />
                <span className="text-white ml-2">Record Month</span>
              </span>
            </button>

            <button
              className="bg-yellow-600 text-white rounded-full text-center shadow-lg hover:bg-primary/80 py-2"
              onClick={(e) => {
                e.preventDefault()
                dispatch(setOfflinePaymentModal(true))
              }}
            >
              <span className="text-center text-white">
                <FontAwesomeIcon icon={faMoneyBill} />
                <span className="text-white ml-2">Cash payment</span>
              </span>
            </button>

            <button
              className="bg-blue-600 text-white rounded-full text-center shadow-lg hover:bg-primary/80 py-2"
              onClick={(e) => {
                e.preventDefault()
                dispatch(setMultiplePaymentModal(true))
              }}
            >
              <span className="text-center text-white">
                <FontAwesomeIcon icon={faMoneyBill} />
                <span className="text-white ml-2">Pay advance</span>
              </span>
            </button>

            <span className="relative flex flex-col gap-3">
              <Button
              className="rounded-full text-center shadow-lg hover:bg-primary/80 py-2"
                value={
                  <span className="text-md flex items-center gap-1">
                    {capitalizeWords(title)}
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
            </>
            )}
            
          </div>

          <div className="relative w-full">
            {/* Desktop layout */}
            <div className="hidden md:flex w-full gap-6 items-start">
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
            </div>

            {/* Mobile layout */}
            <div className="flex flex-col md:hidden w-full">
              {household && household?.hasOwnProperty('payments') ? (
                <HouseholdPayments household={household} />
              ) : (
                <div className="py-[20%] text-center font-semibold text-lg min-w-full">
                  <p className="mx-auto py-8 px-4 w-[90%] rounded-lg shadow-lg">
                    This household has not made any transactions yet!
                  </p>
                </div>
              )}

              {/* Button to toggle info */}
              <button
                className="fixed bottom-15 -right-4 z-30 bg-zinc-500 text-white px-5 py-2 rounded-full shadow-lg hover:bg-primary/80"
                onClick={() => setShowInfo(true)}
              >
                View info
              </button>

              {/* Right side overlay */}
              {showInfo && (
                <div className="fixed inset-0 z-40">
                  {/* dark backdrop */}
                  <div
                    className="absolute inset-0 bg-black/40"
                    onClick={() => setShowInfo(false)}
                  ></div>

                  {/* sliding panel */}
                  <div className="absolute top-0 right-0 w-4/5 sm:w-2/3 h-full bg-white shadow-xl transform transition-transform translate-x-0">
                    <div className="p-4 flex justify-between items-center border-b">
                      <h2 className="text-lg font-semibold">Household Info</h2>
                      <button
                        className="text-red-600 font-bold"
                        onClick={() => setShowInfo(false)}
                      >
                        Close ✕
                      </button>
                    </div>
                    <div className="overflow-y-auto h-[calc(100%-3rem)] p-4">
                      <HouseholdInfo household={household} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <RecordOfflinePayment household={household} />
          <RecordMultipleMonths />
          <GenerateReceipts title={title} />
        </>
      )}
    </main>
  )
}

export default HouseholdDetails
