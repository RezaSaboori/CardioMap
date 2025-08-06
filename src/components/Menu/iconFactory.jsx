import React from 'react';

/**
 * Icon Factory System for Modular Menu Component
 * 
 * This utility provides a centralized way to manage and create icons
 * from string identifiers, making the Menu component completely modular.
 */

/**
 * Creates an icon factory function that maps string identifiers to icon components
 * @param {Object} iconMap - Object mapping icon names to icon components
 * @returns {Function} - Factory function that creates icons from string identifiers
 */
export const createIconFactory = (iconMap) => {
  return (iconName) => {
    const IconComponent = iconMap[iconName];
    if (!IconComponent) {
      console.warn(`Icon "${iconName}" not found in icon factory. Available icons: ${Object.keys(iconMap).join(', ')}`);
      return null;
    }
    return <IconComponent />;
  };
};

/**
 * Creates an icon factory with error handling and fallback support
 * @param {Object} iconMap - Object mapping icon names to icon components
 * @param {React.Component} fallbackIcon - Fallback icon component for missing icons
 * @returns {Function} - Factory function with fallback support
 */
export const createIconFactoryWithFallback = (iconMap, fallbackIcon = null) => {
  return (iconName) => {
    const IconComponent = iconMap[iconName];
    if (!IconComponent) {
      console.warn(`Icon "${iconName}" not found in icon factory. Available icons: ${Object.keys(iconMap).join(', ')}`);
      return fallbackIcon ? <fallbackIcon /> : null;
    }
    return <IconComponent />;
  };
};

/**
 * Validates icon map for common issues
 * @param {Object} iconMap - Object mapping icon names to icon components
 * @returns {Object} - Validation result with warnings and errors
 */
export const validateIconMap = (iconMap) => {
  const result = {
    valid: true,
    warnings: [],
    errors: []
  };

  if (!iconMap || typeof iconMap !== 'object') {
    result.valid = false;
    result.errors.push('Icon map must be an object');
    return result;
  }

  const iconNames = Object.keys(iconMap);
  
  if (iconNames.length === 0) {
    result.warnings.push('Icon map is empty');
  }

  iconNames.forEach(name => {
    const icon = iconMap[name];
    
    if (!icon) {
      result.warnings.push(`Icon "${name}" is null or undefined`);
    } else if (typeof icon !== 'function') {
      result.errors.push(`Icon "${name}" is not a valid React component`);
      result.valid = false;
    }
  });

  return result;
};

/**
 * Creates a development-friendly icon factory with validation
 * @param {Object} iconMap - Object mapping icon names to icon components
 * @returns {Function} - Factory function with development validation
 */
export const createDevIconFactory = (iconMap) => {
  // Validate icon map in development
  if (process.env.NODE_ENV === 'development') {
    const validation = validateIconMap(iconMap);
    if (!validation.valid) {
      console.error('Icon factory validation failed:', validation.errors);
    }
    if (validation.warnings.length > 0) {
      console.warn('Icon factory warnings:', validation.warnings);
    }
  }

  return createIconFactory(iconMap);
};

/**
 * Example usage and common icon patterns
 */
export const IconFactoryExamples = {
  // Basic usage
  basic: () => {
    const iconFactory = createIconFactory({
      home: HomeIcon,
      profile: ProfileIcon,
      settings: SettingsIcon
    });
    return iconFactory;
  },

  // With fallback
  withFallback: () => {
    const iconFactory = createIconFactoryWithFallback({
      home: HomeIcon,
      profile: ProfileIcon
    }, DefaultIcon);
    return iconFactory;
  },

  // Development version
  development: () => {
    const iconFactory = createDevIconFactory({
      home: HomeIcon,
      profile: ProfileIcon,
      settings: SettingsIcon
    });
    return iconFactory;
  }
};

/**
 * Common icon patterns for reference
 */
export const IconPatterns = {
  // Duo-color icon pattern
  duoColor: `
const IconName = ({ className = '' }) => (
  <svg 
    viewBox="0 0 40 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ width: '100%', height: '100%' }}
  >
    {/* Primary color path */}
    <path d="..." fill="var(--color-gray12)"/>
    
    {/* Secondary color path */}
    <path d="..." fill="var(--color-gray1)"/>
    
    {/* Background/container path */}
    <path fillRule="evenodd" clipRule="evenodd" d="..." fill="var(--color-gray12)"/>
  </svg>
);`,

  // Single color icon pattern
  singleColor: `
const IconName = ({ className = '' }) => (
  <svg 
    viewBox="0 0 40 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ width: '100%', height: '100%' }}
  >
    <path d="..." fill="currentColor"/>
  </svg>
);`
};

export default {
  createIconFactory,
  createIconFactoryWithFallback,
  createDevIconFactory,
  validateIconMap,
  IconFactoryExamples,
  IconPatterns
}; 
