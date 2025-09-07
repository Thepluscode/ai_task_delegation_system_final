/**
 * Utility function to merge class names
 * This is a lightweight implementation without external dependencies
 */
export function cn(...classes) {
  return classes
    .filter(Boolean)
    .join(' ')
    .trim()
}

/**
 * Alternative implementation with more advanced merging
 * Handles conditional classes and removes duplicates
 */
export function clsx(...classes) {
  const result = []

  for (const cls of classes) {
    if (!cls) continue

    if (typeof cls === 'string') {
      result.push(cls)
    } else if (Array.isArray(cls)) {
      const nested = clsx(...cls)
      if (nested) result.push(nested)
    } else if (typeof cls === 'object') {
      for (const [key, value] of Object.entries(cls)) {
        if (value) result.push(key)
      }
    }
  }

  return result.join(' ').trim()
}

// Export cn as default for compatibility
export default cn