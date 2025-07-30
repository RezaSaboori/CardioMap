/**
 * Theme utilities for accessing CSS variables in JavaScript/TypeScript
 * This allows theme.css variables to be used in MapLibre GL and other JS contexts
 */

/**
 * Gets the computed value of a CSS variable
 */
function getCSSVariable(variable: string): string {
  if (typeof window === 'undefined') return '';
  
  const computedStyle = getComputedStyle(document.documentElement); // always <html>
  return computedStyle.getPropertyValue(variable).trim();
}

/**
 * Gets all theme variables and caches them
 */
function getThemeVariables(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {};
  }
  return {
    // Colors
    colorRed: getCSSVariable('--color-red'),
    colorOrange: getCSSVariable('--color-orange'),
    colorYellow: getCSSVariable('--color-yellow'),
    colorGreen: getCSSVariable('--color-green'),
    colorMint: getCSSVariable('--color-mint'),
    colorTeal: getCSSVariable('--color-teal'),
    colorCyan: getCSSVariable('--color-cyan'),
    colorBlue: getCSSVariable('--color-blue'),
    colorIndigo: getCSSVariable('--color-indigo'),
    colorPurple: getCSSVariable('--color-purple'),
    colorPink: getCSSVariable('--color-pink'),
    colorBrown: getCSSVariable('--color-brown'),
    
    colorGray1: getCSSVariable('--color-gray1'),
    colorGray2: getCSSVariable('--color-gray2'),
    colorGray3: getCSSVariable('--color-gray3'),
    colorGray4: getCSSVariable('--color-gray4'),
    colorGray5: getCSSVariable('--color-gray5'),
    colorGray6: getCSSVariable('--color-gray6'),
    colorGray7: getCSSVariable('--color-gray7'),
    colorGray8: getCSSVariable('--color-gray8'),
    colorGray9: getCSSVariable('--color-gray9'),
    colorGray10: getCSSVariable('--color-gray10'),
    colorGray11: getCSSVariable('--color-gray11'),
    colorGray12: getCSSVariable('--color-gray12'),
    
    // Spacing
    spacingXs: getCSSVariable('--spacing-xs'),
    spacingSm: getCSSVariable('--spacing-sm'),
    spacingMd: getCSSVariable('--spacing-md'),
    spacingLg: getCSSVariable('--spacing-lg'),
    spacingXl: getCSSVariable('--spacing-xl'),
    spacing2xl: getCSSVariable('--spacing-2xl'),
    spacing3xl: getCSSVariable('--spacing-3xl'),
    spacing4xl: getCSSVariable('--spacing-4xl'),
    spacing5xl: getCSSVariable('--spacing-5xl'),
    
    // Typography
    fontSizeXs: getCSSVariable('--font-size-xs'),
    fontSizeSm: getCSSVariable('--font-size-sm'),
    fontSizeBase: getCSSVariable('--font-size-base'),
    fontSizeLg: getCSSVariable('--font-size-lg'),
    fontSizeXl: getCSSVariable('--font-size-xl'),
    fontSize2xl: getCSSVariable('--font-size-2xl'),
    fontSize3xl: getCSSVariable('--font-size-3xl'),
    fontSize4xl: getCSSVariable('--font-size-4xl'),
    
    // Border Radius
    borderRadiusItemXs: getCSSVariable('--border-radius-item-xs'),
    borderRadiusItemSm: getCSSVariable('--border-radius-item-sm'),
    borderRadiusItemMd: getCSSVariable('--border-radius-item-md'),
    borderRadiusItemLg: getCSSVariable('--border-radius-item-lg'),
    borderRadiusItemXl: getCSSVariable('--border-radius-item-xl'),
    borderRadiusContainerXs: getCSSVariable('--border-radius-container-xs'),
    borderRadiusContainerSm: getCSSVariable('--border-radius-container-sm'),
    borderRadiusContainerMd: getCSSVariable('--border-radius-container-md'),
    borderRadiusContainerLg: getCSSVariable('--border-radius-container-lg'),
    borderRadiusContainerXl: getCSSVariable('--border-radius-container-xl'),
    borderRadiusPill: getCSSVariable('--border-radius-pill'),
    
    // Glass Effects
    glassBackdropBlur: getCSSVariable('--glass-backdrop-blur'),
    glassOpacityLight: getCSSVariable('--glass-opacity-light'),
    glassOpacityMedium: getCSSVariable('--glass-opacity-medium'),
    glassOpacityHeavy: getCSSVariable('--glass-opacity-heavy'),
    glassBorderOpacity: getCSSVariable('--glass-border-opacity'),
    
    // Motion
    motionDurationFast: getCSSVariable('--motion-duration-fast'),
    motionDurationNormal: getCSSVariable('--motion-duration-normal'),
    motionDurationSlow: getCSSVariable('--motion-duration-slow'),
  };
}

/**
 * Hook to use theme variables in React components
 * Automatically updates when theme changes (e.g., dark mode toggle)
 */
export function useTheme() {
  return getThemeVariables();
}

/**
 * Get theme variables without React hook (for utility functions)
 */
export function getTheme() {
  return getThemeVariables();
}

/**
 * Convert theme spacing to pixel number
 */
export function spacingToPx(spacing: string): number {
  return parseInt(spacing.replace('px', '')) || 0;
}

/**
 * Convert rgba string with CSS variable opacity to final rgba
 */
export function withOpacity(color: string, opacity: string): string {
  // Parse opacity value (remove any units)
  const opacityValue = parseFloat(opacity);
  
  // If color is already rgba, replace the alpha
  if (color.startsWith('rgba(')) {
    return color.replace(/,\s*[\d.]+\)$/g, `, ${opacityValue})`);
  }
  
  // If color is rgb, convert to rgba
  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${opacityValue})`);
  }
  
  return color;
}

/**
 * Pre-defined color palette using theme variables
 * This ensures consistency across the app and updates with theme changes
 */
export function getColorPalette() {
    const theme = getTheme();
    return {
        primary: theme.colorBlue,
        secondary: theme.colorGray6,
        success: theme.colorGreen,
        warning: theme.colorYellow,
        error: theme.colorRed,
        info: theme.colorCyan,
        mapBackground: theme.colorGray3,
        mapForeground: theme.colorGray12, // dynamic: black in light, white in dark
        mapBorder: theme.colorGray6,      // dynamic: mid-gray, always visible
        hospital: theme.colorBlue,
        researchCenter: theme.colorYellow,
        researchFacility: theme.colorGreen,
    };
}