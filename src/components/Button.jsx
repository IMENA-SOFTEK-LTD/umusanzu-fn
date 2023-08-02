import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

const Button = ({ value, submit = false, type, className, route, onClick }) => {
  if (submit) {
    return (
      <button
        type={type || 'submit'}
        className={
          className ||
          'w-full py-2 px-6 flex items-center justify-center bg-primaryBlue text-[15px] text-white rounded-md ease-in-out duration-200 hover:scale-[.99]'
        }
      >
        {value}
      </button>
    )
  }
  return (
    <Link
      to={route}
      onClick={onClick}
      className={
        className ||
        'w-full py-2 px-6 flex items-center justify-center bg-primaryBlue cursor-pointer text-[15px] text-white rounded-md ease-in-out duration-200 hover:scale-[.98]'
      }
    >
      {value}
    </Link>
  )
}

Button.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.shape({}),
  ]).isRequired,
  type: PropTypes.string,
  className: PropTypes.string,
  route: PropTypes.string,
  submit: PropTypes.bool,
  onClick: PropTypes.func,
}

Button.defaultProps = {
  type: 'submit',
}

export default Button
