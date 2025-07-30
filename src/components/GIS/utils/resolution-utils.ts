import React from 'react';

/**
 * Calculates optimal blur amount based on screen resolution
 * @param customBlur - Optional custom blur override
 * @returns Blur amount in pixels
 */
export const getOptimalBlur = (customBlur?: number): number => {
  if (customBlur !== undefined) {
    return customBlur;
  }
  
  const width = window.innerWidth;
  
  // 4K and above
  if (width >= 3840) {
    return 20;
  }
  
  // Full HD and above
  if (width >= 1920) {
    return 10;
  }
  
  // Standard HD
  if (width >= 1280) {
    return 5;
  }
  
  // Mobile and small screens
  return 1;
};

/**
 * React hook to get resolution-appropriate blur amount
 * @param customBlur - Optional custom blur override
 * @returns Current optimal blur amount
 */
export const useOptimalBlur = (customBlur?: number): number => {
  const [blur, setBlur] = React.useState(() => getOptimalBlur(customBlur));
  
  React.useEffect(() => {
    const handleResize = () => {
      setBlur(getOptimalBlur(customBlur));
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [customBlur]);
  
  return blur;
}; 