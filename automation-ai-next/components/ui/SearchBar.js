'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

export function SearchBar({ 
  placeholder = "Search...", 
  value = "", 
  onChange, 
  onClear,
  className = "",
  size = "md"
}) {
  const [isFocused, setIsFocused] = useState(false)

  const handleClear = () => {
    if (onClear) {
      onClear()
    } else if (onChange) {
      onChange("")
    }
  }

  const sizeClasses = {
    sm: "h-8 text-sm",
    md: "h-10 text-base",
    lg: "h-12 text-lg"
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
      </div>
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={`
          block w-full pl-10 pr-10 border border-gray-300 rounded-lg
          bg-white dark:bg-gray-800 
          text-gray-900 dark:text-white
          placeholder-gray-500 dark:placeholder-gray-400
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          dark:border-gray-600 dark:focus:border-blue-500
          transition-colors duration-200
          ${sizeClasses[size]}
          ${isFocused ? 'ring-2 ring-blue-500 border-blue-500' : ''}
        `}
      />
      
      {value && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}

export default SearchBar
