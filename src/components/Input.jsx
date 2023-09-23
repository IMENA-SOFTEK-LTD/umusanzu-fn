import { forwardRef } from 'react'
import PropTypes from 'prop-types'

const Input = forwardRef(
  (
    {
      type,
      className,
      onChange,
      value,
      name,
      required = false,
      placeholder,
      readonly,
    },
    ref
  ) => {
    return (
      <input
        type={type || 'text'}
        name={name}
        required={required}
        defaultValue={value}
        readOnly={readonly ? 'readOnly' : null}
        placeholder={placeholder}
        onChange={onChange}
        ref={ref}
        className={`text-sm border-[1.3px] mx-auto focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4 !${className}`}
      />
    )
  }
)

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  labelClassName: PropTypes.string,
  className: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
  name: PropTypes.string,
  required: PropTypes.bool,
  color: PropTypes.string,
  placeholder: PropTypes.string,
  readonly: PropTypes.bool,
}

export default Input
