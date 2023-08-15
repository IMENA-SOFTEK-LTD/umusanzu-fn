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
          placeholder={placeholder}
          onChange={onChange}
          ref={ref}
          className={
            className ||
            'border placeholder-gray-400 focus:outline-none focus:border-gray-300 w-full h-[45px] pt-[14px] pr-[14px] pb-[14px] pl-[14px] mt-2 mr-0 mb-0 ml-0 text-[15px] text-base block bg-white border-gray-300 rounded-md'
          }
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
}

export default Input
