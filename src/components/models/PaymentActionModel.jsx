import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'

function PaymentActionModal({
  action,
  householdName,
  showModal,
  setShowModal,
}) {
  useEffect(() => {}, [])

  const renderContent = () => {
    if (action === 'PAID') {
      return (
        <div className="flex flex-col items-center justify-center bg-gray-100 p-6 rounded-lg">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-2xl font-semibold text-gray-800 text-center mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 text-center mb-4">
            Thank you {householdName}, your payment has been successfully
            processed.
          </p>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => setShowModal(false)}
          >
            Close
          </button>
        </div>
      )
    } else if (action === 'FAILED') {
      return (
        <div className="flex flex-col items-center justify-center bg-gray-100 p-6 rounded-lg">
          <XCircleIcon className="h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-semibold text-gray-800 text-center mb-2">
            Payment Failed
          </h1>
          <p className="text-gray-600 text-center mb-4">
            Sorry {householdName}, your payment could not be processed. Please
            try again.
          </p>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => setShowModal(false)}
          >
            Close
          </button>
        </div>
      )
    } else {
      // Default spinner/message
      return (
        <div className="flex flex-col items-center justify-center bg-gray-100 p-6 rounded-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-b-4 border-gray-300 mb-6"></div>
          <h1 className="text-xl font-semibold text-gray-800 text-center mb-2">
            Thank you for initiating a new Payment.
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Check your pending transactions on <strong>182*7*1#</strong> to
            confirm.
          </p>
        </div>
      )
    }
  }

  return (
    <main className="relative">
      {showModal && (
        <section
          tabIndex={-1}
          aria-hidden="true"
          className="fixed top-0 left-0 right-0 z-50 w-full h-screen p-4 flex items-center justify-center bg-gray-800 bg-opacity-60"
        >
          <div className="relative bg-white rounded-lg w-[500px] shadow md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] mx-auto">
            {renderContent()}
          </div>
        </section>
      )}
    </main>
  )
}

PaymentActionModal.propTypes = {
  householdName: PropTypes.string,
  action: PropTypes.string,
  showModal: PropTypes.bool,
  setShowModal: PropTypes.func,
}

export default PaymentActionModal
