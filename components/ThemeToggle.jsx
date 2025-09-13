'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

const ThemeToggle = ({ 
  size = 'default', 
  showLabel = false, 
  className = '' 
}) => {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    // Return a placeholder to prevent hydration mismatch
    return (
      <div className={`
        ${size === 'small' ? 'w-8 h-8' : size === 'large' ? 'w-12 h-12' : 'w-10 h-10'}
        rounded-full bg-gray-200 animate-pulse ${className}
      `} />
    );
  }

  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-10 h-10', 
    large: 'w-12 h-12'
  };

  const iconSizeClasses = {
    small: 'w-4 h-4',
    default: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {theme === 'dark' ? 'Dark' : 'Light'}
        </span>
      )}
      
      <button
        onClick={toggleTheme}
        className={`
          ${sizeClasses[size]}
          relative rounded-full p-2
          bg-gray-200 dark:bg-gray-700
          border-2 border-transparent
          hover:border-orange-300 dark:hover:border-orange-600
          focus:outline-none focus:border-orange-500 dark:focus:border-orange-400
          transition-all duration-300 ease-in-out
          hover:scale-105 active:scale-95
          group
        `}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <div className="relative w-full h-full">
          {/* Sun Icon */}
          <div className={`
            absolute inset-0 flex items-center justify-center
            transition-all duration-500 ease-in-out
            ${theme === 'dark' 
              ? 'opacity-0 rotate-90 scale-75' 
              : 'opacity-100 rotate-0 scale-100'
            }
          `}>
            <svg 
              className={`${iconSizeClasses[size]} text-yellow-500 group-hover:text-yellow-600`}
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* Moon Icon */}
          <div className={`
            absolute inset-0 flex items-center justify-center
            transition-all duration-500 ease-in-out
            ${theme === 'dark' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-75'
            }
          `}>
            <svg 
              className={`${iconSizeClasses[size]} text-blue-400 group-hover:text-blue-300`}
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" 
              />
            </svg>
          </div>

          {/* Ripple Effect */}
          <div className={`
            absolute inset-0 rounded-full
            bg-gradient-to-r from-yellow-400 via-orange-400 to-blue-500
            opacity-0 group-hover:opacity-20 dark:group-hover:opacity-10
            transition-opacity duration-300
            pointer-events-none
          `} />
        </div>
      </button>
      
      {showLabel && (
        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
          Mode
        </span>
      )}
    </div>
  );
};

export default ThemeToggle;
