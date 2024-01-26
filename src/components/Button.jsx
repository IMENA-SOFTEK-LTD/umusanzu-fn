import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

const Button = ({
  value,
  submit = false,
  type,
  className,
  route,
  onClick,
  disabled = false,
  background = true,
}) => {
  if (submit) {
    return (
      <button
        type={type || 'submit'}
        className={`w-fit py-2 px-6 flex items-center justify-center rounded-md bg-primary text-[15px] text-white ease-in-out duration-200 hover:scale-[.99] ${
          background === false
            ? 'bg-transparent !h-fit !min-h-fit !text-black !border-none hover:!text-primary hover:bg-transparent hover:underline'
            : null
        } ${
          disabled
            ? '!bg-slate-200 text-white cursor-default hover:scale-[1] bg-opacity-25 hover:bg-accent border-none'
            : null
        } ${className}`}
      >
        {value}
      </button>
    )
  }
  return (
    <Link
      to={route}
      onClick={onClick}
      className={`w-fit py-2 px-6 flex items-center justify-center bg-primary cursor-pointer text-[15px] text-white rounded-[5px] ease-in-out duration-200 hover:scale-[.98] ${
        background === false
          ? 'bg-transparent !h-fit !min-h-fit !text-black !border-none hover:!text-primary hover:bg-transparent hover:underline'
          : null
      } ${
        disabled
          ? '!bg-slate-200 text-white cursor-default hover:scale-[1] bg-opacity-25 hover:bg-accent border-none'
          : null
      } ${className}`}
    >
      {value}
    </Link>
  )
}

export function PageButton({ children, className, ...rest }) {
  return (
    <button
      type="button"
      className={
        className ||
        'relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50'
      }
      {...rest}
    >
      {children}
    </button>
  )
}

PageButton.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.shape({}),
  ]).isRequired,
  className: PropTypes.string,
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
  background: PropTypes.bool,
  disabled: PropTypes.bool,
}

export default Button
