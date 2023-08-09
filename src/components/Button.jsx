import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

const Button = ({ value, submit = false, type, className, route, onClick }) => {
  if (submit) {
    return (
      <button
        type={type || 'submit'}
        className={
          className ||
          'w-full py-2 px-6 flex items-center justify-center rounded-md bg-primary text-[15px] text-white ease-in-out duration-200 hover:scale-[.99]'
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
        'w-fit py-2 px-6 flex items-center justify-center bg-primary cursor-pointer text-[15px] text-white rounded-sm ease-in-out duration-200 hover:scale-[.98]'
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

export function PageButton({ children, className, ...rest }) {
  return (
    <button
      type="button"
      className={
        className ||
        `relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50`
      }
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button
