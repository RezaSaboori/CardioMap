/**
 * Parses an rgb color string into an object.
 * @param color - The rgb string, e.g., "rgb(255, 100, 0)".
 * @returns An object with r, g, b properties, or null if parsing fails.
 */
export function parseRgb(color: string): { r: number; g: number; b: number } | null {
    const match = color.match(/rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)/);
    if (!match) return null;
    return {
        r: parseInt(match[1], 10),
        g: parseInt(match[2], 10),
        b: parseInt(match[3], 10),
    };
}

/**
 * Blends an array of rgb color strings using the "multiply" blend mode.
 * @param colors - An array of rgb color strings.
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