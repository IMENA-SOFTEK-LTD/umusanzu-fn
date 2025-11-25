
function WaitingForPayment({ onCancel, details }) {
  const handleCancel = () => {
    if (typeof onCancel === 'function') {
      onCancel()
      return
    }
    window.history.back()
  }

  const message =
    details?.message ||
    'Gusaba Kwishyura Byemejwe! Please confirm the payment on your phone.'

  const instructions = [
    'Kuri MTN Mobile Money Kanda *182*7*1# kuri telefoni ya Mobile Money wanditse wemeze kwishyura.',
    'Kuri Airtel Money Kanda *500*7*1#',
  ]

  const detailData = details?.data ?? {}
  const skippedPending = Array.isArray(detailData?.skipped_pending_months)
    ? detailData?.skipped_pending_months
    : null
  const skippedExisting = Array.isArray(detailData?.skipped_existing_months)
    ? detailData?.skipped_existing_months
    : null
  const hasSkippedInfo =
    (skippedPending?.length ?? 0) > 0 || (skippedExisting?.length ?? 0) > 0

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 p-4 gap-4 w-full">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-b-4 border-gray-300 mb-2"></div>

      <h1 className="text-xl font-semibold text-gray-800 text-center">{message}</h1>

      <div className="text-gray-600 text-center space-y-2">
        {instructions.map((instruction, idx) => (
          <p key={idx}>{instruction}</p>
        ))}
      </div>

      {hasSkippedInfo && (
        <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-md p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-700 mb-3 text-left">
            Payment Details
          </h2>
          <div className="text-sm text-left space-y-2">
            {(skippedPending?.length ?? 0) > 0 && (
              <div>
                <p className="font-medium">skipped_pending_months:</p>
                <pre className="bg-gray-50 border border-gray-200 rounded p-2 whitespace-pre-wrap break-words">
                  {JSON.stringify(skippedPending, null, 2)}
                </pre>
              </div>
            )}
            {(skippedExisting?.length ?? 0) > 0 && (
              <div>
                <p className="font-medium">skipped_existing_months:</p>
                <pre className="bg-gray-50 border border-gray-200 rounded p-2 whitespace-pre-wrap break-words">
                  {JSON.stringify(skippedExisting, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

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