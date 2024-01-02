import { forwardRef } from 'react'
import PropTypes from 'prop-types'

const Input = ({
  type,
  className,
  onChange,
  value = null,
  name,
  required = false,
  placeholder,
  readonly,
  defaultValue = null,
  label = null,
  labelClassName = null,
}) => {
  return (
    <label className={`flex flex-col items-start gap-[6px] w-full ${labelClassName}`}>
      <p className={`${label ? 'flex' : 'null'} flex text-[15px] text-lightBlack`}>
        {label}
        {' '}
        <span className={required ? 'text-red-600' : 'hidden'}>*</span>
      </p>
    <input
      type={type || 'text'}
      name={name}
      required={required}
      defaultValue={defaultValue || value}
      readOnly={readonly ? 'readOnly' : null}
      placeholder={placeholder}
      onChange={onChange}
      className={`text-sm border-[1.3px] mx-auto focus:outline-primary border-primary rounded-lg block w-full p-2 px-4 ${className}`}
    />
    </label>
  )
}

Input.propTypes = {
  type: PropTypes.string,
  className: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
  name: PropTypes.string,
  required: PropTypes.bool,
  color: PropTypes.string,
  placeholder: PropTypes.string,
  readonly: PropTypes.bool,
  defaultValue: PropTypes.string,
  label: PropTypes.string,
  labelClassName: PropTypes.string,
}

export default Input
