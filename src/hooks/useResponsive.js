import { useState, useEffect, useCallback } from 'react'

// Breakpoint definitions (matching Tailwind CSS)
const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

/**
 * Hook for responsive design utilities
 * @returns {Object} Responsive utilities and current breakpoint info
 */
export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  const [currentBreakpoint, setCurrentBreakpoint] = useState('xs')

  // Debounced resize handler
  const handleResize = useCallback(() => {
    const width = window.innerWidth
    const height = window.innerHeight

    setWindowSize({ width, height })

    // Determine current breakpoint
    let breakpoint = 'xs'
    Object.entries(breakpoints).forEach(([key, value]) => {
      if (width >= value) {
        breakpoint = key
      }
    })
    setCurrentBreakpoint(breakpoint)
  }, [])

  useEffect(() => {
    // Set initial values
    handleResize()

    // Debounced resize listener
    let timeoutId = null
    const debouncedResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleResize, 100)
    }

    window.addEventListener('resize', debouncedResize)
    return () => {
      window.removeEventListener('resize', debouncedResize)
      clearTimeout(timeoutId)
    }
  }, [handleResize])

  // Utility functions
  const isMobile = windowSize.width < breakpoints.md
  const isTablet = windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg
  const isDesktop = windowSize.width >= breakpoints.lg
  const isLargeScreen = windowSize.width >= breakpoints.xl

  // Breakpoint checkers
  const isBreakpoint = useCallback((breakpoint) => {
    return windowSize.width >= breakpoints[breakpoint]
  }, [windowSize.width])

  const isBetweenBreakpoints = useCallback((min, max) => {
    return windowSize.width >= breakpoints[min] && windowSize.width < breakpoints[max]
  }, [windowSize.width])

  // Responsive value selector
  const getResponsiveValue = useCallback((values) => {
    if (typeof values !== 'object') return values

    const sortedBreakpoints = Object.keys(breakpoints).sort((a, b) => breakpoints[b] - breakpoints[a])
    
    for (const bp of sortedBreakpoints) {
      if (values[bp] !== undefined && windowSize.width >= breakpoints[bp]) {
        return values[bp]
      }
    }

    // Return default value or first available value
    return values.default || values[Object.keys(values)[0]]
  }, [windowSize.width])

  return {
    windowSize,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
    isBreakpoint,
    isBetweenBreakpoints,
    getResponsiveValue,
    breakpoints,
  }
}

/**
 * Hook for media queries
 * @param {string} query - CSS media query
 * @returns {boolean} Whether the media query matches
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handler = (event) => setMatches(event.matches)
    mediaQuery.addEventListener('change', handler)

    return () => mediaQuery.removeEventListener('change', handler)
  }, [query])

  return matches
}

/**
 * Hook for detecting device orientation
 * @returns {Object} Orientation info
 */
export const useOrientation = () => {
  const [orientation, setOrientation] = useState({
    isPortrait: typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : true,
    isLandscape: typeof window !== 'undefined' ? window.innerWidth > window.innerHeight : false,
  })

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation({
        isPortrait: window.innerHeight > window.innerWidth,
        isLandscape: window.innerWidth > window.innerHeight,
      })
    }

    window.addEventListener('resize', handleOrientationChange)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleOrientationChange)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  return orientation
}

export default useResponsive

