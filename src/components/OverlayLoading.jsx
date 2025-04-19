import PropTypes from 'prop-types'

const OverlayLoading = ({ color = 'blue', isLoading = false }) => {
  return (
    <div
      className={`absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10 ${
        isLoading ? '' : 'hidden'
      }`}
    >
      <div
        className={`w-12 h-12 border-4 border-${color}-500 border-t-transparent border-solid rounded-full animate-spin`}
      ></div>
    </div>
  )
}

OverlayLoading.propTypes = {
  color: PropTypes.string,
  isLoading: PropTypes.bool,
}

export default OverlayLoading
