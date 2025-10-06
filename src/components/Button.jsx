import { memo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Button as MButton } from '@material-tailwind/react'

const Button = memo(({
  value,
  submit = false,
  type,
  className = '',
  route,
  onClick,
  disabled = false,
  background = true,
  material = false,
  size = 'md',
  variant = 'filled',
  color = 'blue',
  fullWidth = false,
  ripple = true,
  loading = false,
  'aria-label': ariaLabel,
  'data-testid': testId,
}) => {
  // Memoize click handler to prevent unnecessary re-renders
  const handleClick = useCallback((e) => {
    if (disabled || loading) {
      e.preventDefault()
      return
    }
    onClick?.(e)
  }, [onClick, disabled, loading])

  // Base classes for consistent styling
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-md transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${loading ? 'cursor-wait' : 'cursor-pointer'}
  `.trim()

  // Size variants
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  }

  // Color variants for custom buttons
  const colorClasses = {
    primary: 'bg-primary hover:bg-primary/90 text-white focus:ring-primary/50',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500/50',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500/50',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500/50',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500/50',
    info: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500/50'
  }

  // Custom button classes
  const customButtonClasses = `
    ${baseClasses}
    ${sizeClasses[size] || sizeClasses.md}
    ${background ? (colorClasses.primary) : 'bg-transparent text-gray-700 hover:text-primary hover:underline border-none'}
    ${disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : 'hover:scale-[0.98] active:scale-[0.96]'}
    ${className}
  `.trim()
  // Render submit button
  if (submit) {
    if (material) {
      return (
        <MButton
          type={type || 'submit'}
          variant={variant}
          color={color}
          fullWidth={fullWidth}
          ripple={ripple}
          className={className}
          loading={loading}
          size={size}
          disabled={disabled || loading}
          style={{ textTransform: "none" }}
          onClick={handleClick}
          aria-label={ariaLabel}
          data-testid={testId}
        >
          {value}
        </MButton>
      )
    }

    return (
      <button
        type={type || 'submit'}
        onClick={handleClick}
        disabled={disabled || loading}
        className={customButtonClasses}
        aria-label={ariaLabel}
        data-testid={testId}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {value}
      </button>
    )
  }

  // Render link button
  if (route) {
    return (
      <Link
        to={route}
        onClick={handleClick}
        className={customButtonClasses}
        aria-label={ariaLabel}
        data-testid={testId}
      >
        {value}
      </Link>
    )
  }

  // Render regular button
  return (
    <button
      type={type || 'button'}
      onClick={handleClick}
      disabled={disabled || loading}
      className={customButtonClasses}
      aria-label={ariaLabel}
      data-testid={testId}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {value}
    </button>
  )
})

export const PageButton = memo(({ children, className, disabled, ...rest }) => {
  return (
    <button
      type="button"
      disabled={disabled}
      className={
        className ||
        `relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 
         hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary
         disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`
      }
      {...rest}
    >
      {children}
    </button>
  )
})

PageButton.displayName = 'PageButton'

PageButton.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.node,
  ]).isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
}

Button.displayName = 'Button'

Button.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.node,
  ]).isRequired,
  type: PropTypes.string,
  className: PropTypes.string,
  route: PropTypes.string,
  submit: PropTypes.bool,
  onClick: PropTypes.func,
  background: PropTypes.bool,
  disabled: PropTypes.bool,
  material: PropTypes.bool,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  variant: PropTypes.string,
  color: PropTypes.string,
  fullWidth: PropTypes.bool,
  ripple: PropTypes.bool,
  loading: PropTypes.bool,
  'aria-label': PropTypes.string,
  'data-testid': PropTypes.string,
}

export default Button
