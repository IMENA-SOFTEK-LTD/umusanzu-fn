
function WaitingForPayment({ onCancel }) {
  const handleCancel = () => {
    if (onCancel) {
      window.history.back()
    } else {
      // fallback: go back in browser history
      window.history.back()
    }
  }
  return (
    <div className="flex flex-col items-center justify-center  bg-gray-100 p-4">
      {/* Spinner */}
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-b-4 border-gray-300 mb-6"></div>

      {/* Message */}
      <h1 className="text-xl font-semibold text-gray-800 text-center mb-2">
        Gusaba Kwishyura Byemejwe!
      </h1>
      <p className="text-gray-600 text-center mb-6">
        Kuri MTN Mobile Money Kanda *182*7*1# Kuri Telefoni ya Mobile Money Wanditse Wemeze Kwishyura. 
        <br />
         Kuri Airtel Money Kanda *500*7*1#
      </p>

      {/* Cancel Button */}
      <button
        onClick={handleCancel}
        className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        Cancel / Go Back
      </button>
    </div>
  )
}

export default WaitingForPayment