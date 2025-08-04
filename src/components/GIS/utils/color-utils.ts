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