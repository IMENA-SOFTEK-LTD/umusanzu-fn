import { forwardRef } from 'react'
import PropTypes from 'prop-types'

const Select = forwardRef(
  (
    { options = [], onChange, className, defaultValue, defaultLabel = null },
    ref
  ) => {
    return (
      <select
        onChange={onChange}
        ref={ref}
        className={`px-3 p-2 outline-none border-[1px] rounded-md border-primary w-full focus:border-[1.5px] ease-in-out duration-150 ${className}`}
      >
        {[
          { text: `Select ${defaultLabel || ''}`},
          ...options,
        ].map((option, index) => (
          <option
            disabled={option?.disabled}
            key={index}
            defaultValue={defaultValue === option.value}
            value={option.value}
          >
            {option.text}
          </option>
        ))}
      </select>
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
  defaultLabel: PropTypes.string,
}

export default Select
