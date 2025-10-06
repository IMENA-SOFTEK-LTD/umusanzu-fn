import { forwardRef, memo, useCallback, useState } from 'react'
import PropTypes from 'prop-types'

const Input = memo(forwardRef(({
  type = 'text',
  className = '',
  onChange,
  value,
  name,
  required = false,
  placeholder,
  readonly = false,
  defaultValue,
  label,
  labelClassName = '',
  error,
  helperText,
  disabled = false,
  autoComplete,
  'aria-label': ariaLabel,
  'data-testid': testId,
  onFocus,
  onBlur,
  maxLength,
  minLength,
  pattern,
  min,
  max,
  step,
}, ref) => {
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = useCallback((e) => {
    setIsFocused(true)
    onFocus?.(e)
  }, [onFocus])

  const handleBlur = useCallback((e) => {
    setIsFocused(false)
    onBlur?.(e)
  }, [onBlur])

  const handleChange = useCallback((e) => {
    onChange?.(e)
  }, [onChange])

  // Base input classes with responsive design
  const baseInputClasses = `
    w-full px-3 py-2 text-sm border rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    placeholder:text-gray-400
    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : 'border-gray-300'}
    ${isFocused ? 'ring-2 ring-primary/20' : ''}
    ${readonly ? 'bg-gray-50 cursor-default' : ''}
    ${className}
  `.trim()

  const labelClasses = `
    flex items-center text-sm font-medium text-gray-700 mb-1
    ${labelClassName}
  `.trim()
  return (
    <div className="flex flex-col w-full">
      {label && (
        <label htmlFor={name} className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        ref={ref}
        id={name}
        type={type}
        name={name}
        value={value}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
        readOnly={readonly}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        minLength={minLength}
        pattern={pattern}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={baseInputClasses}
        aria-label={ariaLabel || label}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : helperText ? `${name}-helper` : undefined}
        data-testid={testId}
      />
      
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p id={`${name}-helper`} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  )
}))

Input.displayName = 'Input'

Input.propTypes = {
  type: PropTypes.string,
  className: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string,
  required: PropTypes.bool,
  placeholder: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  readonly: PropTypes.bool,
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.string,
  labelClassName: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  autoComplete: PropTypes.string,
  'aria-label': PropTypes.string,
  'data-testid': PropTypes.string,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  maxLength: PropTypes.number,
  minLength: PropTypes.number,
  pattern: PropTypes.string,
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

export default Input
