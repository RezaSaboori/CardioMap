/**
 * Parses an rgb color string or hex color into an object.
 * @param color - The color string, e.g., "rgb(255, 100, 0)" or "#ff6400".
 * @returns An object with r, g, b properties, or null if parsing fails.
 */
export function parseRgb(color: string): { r: number; g: number; b: number } | null {
    // Handle rgb() format
    const rgbMatch = color.match(/rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)/);
    if (rgbMatch) {
        return {
            r: parseInt(rgbMatch[1], 10),
            g: parseInt(rgbMatch[2], 10),
            b: parseInt(rgbMatch[3], 10),
        };
    }
    
    // Handle hex format (#RRGGBB or #RGB)
    const hexMatch = color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);
    if (hexMatch) {
        let hex = hexMatch[1];
        // Expand 3-digit hex to 6-digit
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }
        
        return {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16),
        };
    }
    
    return null;
}

/**
 * Blends an array of color strings (rgb or hex) using averaging.
 * @param colors - An array of color strings (rgb or hex).
 * @returns The resulting rgb color string.
 */
export function blendColors(colors: string[]): string {
    if (!colors || colors.length === 0) {
        return 'rgb(255, 255, 255)'; // Return white if no colors
    }

    const parsedColors = colors.map(parseRgb).filter(c => c !== null) as { r: number; g: number; b: number }[];

    if (parsedColors.length === 0) {
        return 'rgb(255, 255, 255)';
    }

    // Initialize with the first color
    let result = { ...parsedColors[0] };

    // Blend subsequent colors by averaging
    if (parsedColors.length > 1) {
        const total = parsedColors.reduce((acc, color) => {
            acc.r += color.r;
            acc.g += color.g;
            acc.b += color.b;
            return acc;
        }, { r: 0, g: 0, b: 0 });

        result = {
            r: Math.floor(total.r / parsedColors.length),
            g: Math.floor(total.g / parsedColors.length),
            b: Math.floor(total.b / parsedColors.length),
        };
    }

    return `rgb(${result.r}, ${result.g}, ${result.b})`;
} 

import { ColorCondition, DynamicColorConfig } from '../../config/geoDataConfig';

/**
 * Evaluates dynamic color conditions and returns the appropriate color
 * @param value - The value to evaluate
 * @param colorConfig - The dynamic color configuration
 * @param data - Optional additional data context
 * @returns The color to use for the card
 */
export const evaluateDynamicColor = (
  value: any,
  colorConfig: DynamicColorConfig,
  data?: any
): string => {
  if (!colorConfig || !colorConfig.conditions) {
    return colorConfig?.defaultColor || '#ffffff';
  }

  // Check each condition in order (first match wins)
  for (const condition of colorConfig.conditions) {
    let isMatch = false;

    switch (condition.type) {
      case 'threshold':
        if (condition.condition) {
          // Use custom condition function if provided
          isMatch = condition.condition(value, data);
        } else if (condition.value !== undefined) {
          // Default threshold comparison
          isMatch = value > condition.value;
        }
        break;

      case 'range':
        if (condition.minValue !== undefined && condition.maxValue !== undefined) {
          isMatch = value >= condition.minValue && value <= condition.maxValue;
        }
        break;

      case 'category':
        if (condition.value !== undefined) {
          isMatch = value === condition.value;
        }
        break;
    }

    if (isMatch) {
      return condition.color;
    }
  }

  // Return default color if no conditions match
  return colorConfig.defaultColor || '#ffffff';
};

/**
 * Determines if a value should trigger a warning color (e.g., red for low values)
 * @param value - The numeric value to check
 * @param threshold - The threshold value
 * @param comparison - The comparison type ('lt', 'lte', 'gt', 'gte', 'eq')
 * @returns True if the condition is met
 */
export const isWarningCondition = (
  value: number,
  threshold: number,
  comparison: 'lt' | 'lte' | 'gt' | 'gte' | 'eq' = 'lt'
): boolean => {
  switch (comparison) {
    case 'lt':
      return value < threshold;
    case 'lte':
      return value <= threshold;
    case 'gt':
      return value > threshold;
    case 'gte':
      return value >= threshold;
    case 'eq':
      return value === threshold;
    default:
      return false;
  }
};

/**
 * Creates a simple threshold-based color condition
 * @param threshold - The threshold value
 * @param warningColor - Color to use when threshold is exceeded
 * @param normalColor - Color to use when threshold is not exceeded
 * @param comparison - The comparison type
 * @returns A DynamicColorConfig object
 */
export const createThresholdColorConfig = (
  threshold: number,
  warningColor: string = '#ff6b6b',
  normalColor: string = '#ffffff',
  comparison: 'lt' | 'lte' | 'gt' | 'gte' = 'lt'
): DynamicColorConfig => {
  return {
    defaultColor: normalColor,
    conditions: [
      {
        type: 'threshold',
        value: threshold,
        color: warningColor,
        condition: (value: any) => isWarningCondition(value, threshold, comparison)
      }
    ]
  };
};

/**
 * Creates a category-based color condition
 * @param categoryColors - Object mapping category values to colors
 * @param defaultColor - Default color for unmatched categories
 * @returns A DynamicColorConfig object
 */
export const createCategoryColorConfig = (
  categoryColors: Record<string, string>,
  defaultColor: string = '#ffffff'
): DynamicColorConfig => {
  return {
    defaultColor,
    conditions: Object.entries(categoryColors).map(([category, color]) => ({
      type: 'category' as const,
      value: category,
      color
    }))
  };
}; 