import { forwardRef } from 'react'
import PropTypes from 'prop-types'

const Select = forwardRef(
  (
    {
      options = [],
      onChange,
      className,
      defaultValue,
      value,
      defaultLabel = null,
      label = null,
      labelClassName = null,
      required = false,
      ...rest
    },
    ref
  ) => {
    return (
      <label className={`w-full flex flex-col gap-2 ${labelClassName}`}>
        <p className={`${label ? 'flex' : 'hidden'} flex text-[14px]`}>
          {label}
          <span className={required ? 'text-red-600' : 'hidden'}>*</span>
        </p>
        <select
          onChange={onChange}
          ref={ref}
          value={value || defaultValue || ''}
          className={`px-3 p-2 outline-none border-[1px] rounded-md border-primary w-full focus:border-[1.5px] ease-in-out duration-150 ${className}`}
          {...rest}
        >
          {[{ text: `Select ${defaultLabel || ''}`, value: '' }, ...options].map(
            (option, index) => (
              <option
                disabled={option?.disabled}
                key={index}
                value={option.value}
                className="text-[14px]"
              >
                {option.text}
              </option>
            )
          )}
        </select>
      </label>
    )
  }
)

Select.displayName = 'Select'

Select.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({})),
  onChange: PropTypes.func,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  defaultLabel: PropTypes.string,
  label: PropTypes.string,
  labelClassName: PropTypes.string,
  required: PropTypes.bool,
}

export default Select
