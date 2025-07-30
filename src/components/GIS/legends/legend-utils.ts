import { ColorMap } from '../../../types';

export interface GradientStop {
    value: number | string;
    color: string;
    label?: string;
}

export interface LegendConfig {
    colorMap?: ColorMap;
    categoryLabels?: { [key: string]: string };
    gradient?: GradientStop[];
    gradientLabels?: { left: string; right: string };
}

/**
 * Create a gradient legend configuration from a color scale
 */
export const createGradientLegend = (
    colors: string[],
    values?: number[],
    labels?: { left: string; right: string }
): LegendConfig => {
    const gradient: GradientStop[] = colors.map((color, index) => ({
        value: values?.[index] ?? index,
        color,
        label: values?.[index]?.toString()
    }));

    return {
        gradient,
        gradientLabels: labels || { left: 'Low', right: 'High' }
    };
};

/**
 * Create a categorical legend configuration from a color map
 */
export const createCategoricalLegend = (
    colorMap: ColorMap,
    categoryLabels?: { [key: string]: string }
): LegendConfig => {
    return {
        colorMap,
        categoryLabels
    };
};

/**
 * Generate a color scale for continuous data
 */
export const generateColorScale = (
    min: number,
    max: number,
    colors: string[] = ['#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695']
): GradientStop[] => {
    const steps = colors.length;
    const stepSize = (max - min) / (steps - 1);
    
    return colors.map((color, index) => ({
        value: min + (index * stepSize),
        color,
        label: Math.round(min + (index * stepSize)).toString()
    }));
};

/**
 * Validate legend configuration
 */
export const validateLegendConfig = (config: LegendConfig): boolean => {
    if (config.gradient) {
        return config.gradient.length >= 2;
    }
    if (config.colorMap) {
        return Object.keys(config.colorMap).length > 0;
    }
    return false;
};

/**
 * Get legend type from configuration
 */
export const getLegendType = (config: LegendConfig): 'gradient' | 'categorical' | 'none' => {
    if (config.gradient && config.gradient.length >= 2) {
        return 'gradient';
    }
    if (config.colorMap && Object.keys(config.colorMap).length > 0) {
        return 'categorical';
    }
    return 'none';
}; 