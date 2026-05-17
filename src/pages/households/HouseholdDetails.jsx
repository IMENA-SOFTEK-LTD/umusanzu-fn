import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import HouseholdInfo from '../../containers/households/HouseholdInfo'
import HouseholdServicesManager from '../../components/models/HouseholdServicesManager'
import { useLazyGetHouseHoldDetailsQuery } from '../../states/api/apiSlice'
import { useEffect, useRef, useState } from 'react'
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
  const [paymentMethod, setPaymentMethod] = useState('Mobile_Money')

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

  // Keep a ref so the message handler always reads the latest household guid
  // without needing to re-establish the WebSocket connection on every render.
  const householdGuidRef = useRef(household?.guid)
  useEffect(() => {
    householdGuidRef.current = household?.guid
  }, [household?.guid])

  useEffect(() => {
    const WS_URL = import.meta.env.VITE_WS_URL
    let ws
    let reconnectTimer
    let attempts = 0

    const connect = () => {
      ws = new WebSocket(WS_URL)

      ws.onopen = () => {
        attempts = 0
      }

      ws.onmessage = (event) => {
        try {
          const { type, household_id, amount } = JSON.parse(event.data)

          // Ignore events for other households
          if (household_id !== householdGuidRef.current) return

          if (type === 'PAYMENT_SUCCESS') {
            setPaymentFeedbackStatus('PAID')
            setShowPaymentFeedbackMsgModal(true)
            setRecordPaymentModal(false)
            dispatch(setCompletePaymentModal(false))
            getHouseholdDetails({ id })
            toast.success(`Payment of ${amount ?? ''} received successfully`)
          } else if (type === 'PAYMENT_FAILED') {
            setPaymentFeedbackStatus('FAILED')
            setShowPaymentFeedbackMsgModal(true)
            setRecordPaymentModal(false)
            dispatch(setCompletePaymentModal(false))
            toast.error('Payment failed or was cancelled. Please try again.')
          }
        } catch (_) {
          // ignore malformed frames
        }
      }

      ws.onerror = () => ws.close()

      ws.onclose = () => {
        // Exponential backoff: 1s, 2s, 4s … capped at 30s
        const delay = Math.min(1000 * 2 ** attempts, 30_000)
        attempts += 1
        reconnectTimer = setTimeout(connect, delay)
      }
    }

    connect()

    return () => {
      clearTimeout(reconnectTimer)
      ws?.close()
    }
  }, [id])


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
  const [activeTab, setActiveTab] = useState('transactions')

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
                payment_method={paymentMethod}
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

            {[1,2].includes(parseInt(user?.staff_role)) && (
            <>
            <button
              className="bg-green-600 text-white rounded-full text-center shadow-lg hover:bg-primary/80 py-2"
              onClick={(e) => {
                e.preventDefault()
                setPaymentMethod('Mobile_Money')
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
                setPaymentMethod('Cash')
                setRecordPaymentModal(true)
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
                } rounded-full text-center shadow-lg flex flex-col gap-2 z-[10000000] absolute top-12 shadow-lg bg-white w-full rounded-md`}
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
            {/* Tabs */}
            <div className="mb-4 border-b border-gray-200">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('transactions')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-md ${
                    activeTab === 'transactions'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Transactions
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('information')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-md ${
                    activeTab === 'information'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Household Information
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('services')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-md ${
                    activeTab === 'services'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Household Services
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="w-full">
              {activeTab === 'transactions' && (
                <div>
                  {household && household?.hasOwnProperty('payments') ? (
                    <HouseholdPayments household={household} />
                  ) : (
                    <div className="py-[20%] text-center font-semibold text-lg min-w-full">
                      <p className="mx-auto py-8 px-4 w-[60%] rounded-lg shadow-lg">
                        This household has not made any transactions yet!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'information' && (
                <div>
                  <HouseholdInfo household={household} />
                </div>
              )}

              {activeTab === 'services' && household?.id && (
                <div className="bg-white rounded-lg shadow-lg ring-1 ring-gray-200 p-4">
                  <HouseholdServicesManager
                    householdId={household.id}
                    status={household?.status}
                    ubudehe={household?.ubudehe}
                    onChanged={() => {
                      // Optionally refresh household data if needed
                      getHouseholdDetails({ id })
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <RecordMultipleMonths />
          <GenerateReceipts title={title} />
        </>
      )}
    </main>
  )
}

export default HouseholdDetails
