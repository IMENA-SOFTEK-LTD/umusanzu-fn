import { forwardRef } from 'react'
import PropTypes from 'prop-types'

const Input = forwardRef(
  (
    {
      type,
      className,
      label,
      onChange,
      value,
      name,
      required = false,
      color,
      placeholder,
      labelClassName,
      readonly
    },
    ref
  ) => {
    return (
      <article className="relative w-[90%]">
        <p
          className={
            labelClassName ||
            `bg-${
              color || 'white'
            } pt-0 pr-2 pb-0 pl-2 -mt-3 mr-0 mb-0 ml-2 text-[15px] font-medium text-gray-600 absolute`
          }
        >
          {label}
        </p>
        <input
          type={type || 'text'}
          name={name}
          required={required}
          defaultValue={value}
          readOnly={readonly ? 'readOnly' : null}
          placeholder={placeholder}
          onChange={onChange}
          ref={ref}
          className={`text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4 ${className}`}
        />
      </article>
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
  readonly: PropTypes.bool
}

export default Input
