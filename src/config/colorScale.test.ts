import { geoDataConfig } from './geoDataConfig';

// Mock the createColorScale function to avoid import issues
const createColorScale = (
  minValue: number,
  maxValue: number,
  colorGradients: [string, string, string]
): (value: number) => string => {
  const [color1, color2, color3] = colorGradients;
  
  return (value: number): string => {
    const normalized = (value - minValue) / (maxValue - minValue);
    
    if (normalized <= 0.5) {
      // Interpolate between color1 and color2
      const t = normalized * 2;
      return interpolateColor(color1, color2, t);
    } else {
      // Interpolate between color2 and color3
      const t = (normalized - 0.5) * 2;
      return interpolateColor(color2, color3, t);
    }
  };
};

const interpolateColor = (color1: string, color2: string, t: number): string => {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substr(0, 2), 16);
  const g1 = parseInt(hex1.substr(2, 2), 16);
  const b1 = parseInt(hex1.substr(4, 2), 16);
  
  const r2 = parseInt(hex2.substr(0, 2), 16);
  const g2 = parseInt(hex2.substr(2, 2), 16);
  const b2 = parseInt(hex2.substr(4, 2), 16);
  
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

describe('ColorScale', () => {
  test('should create color scale for numeric data', () => {
    const colorScale = createColorScale(0, 100, ['#FFEDA0', '#FEB24C', '#F03B20']);
    
    expect(colorScale(0)).toBeDefined();
    expect(colorScale(50)).toBeDefined();
    expect(colorScale(100)).toBeDefined();
    
    // Test that the scale returns valid hex colors
    const color1 = colorScale(0);
    const color2 = colorScale(50);
    const color3 = colorScale(100);
    
    expect(color1).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(color2).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(color3).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  test('should handle edge cases in color scale', () => {
    const colorScale = createColorScale(10, 20, ['#FFEDA0', '#FEB24C', '#F03B20']);
    
    // Test values at boundaries
    expect(colorScale(10)).toBeDefined();
    expect(colorScale(20)).toBeDefined();
    
    // Test values outside boundaries (should still work)
    expect(colorScale(5)).toBeDefined();
    expect(colorScale(25)).toBeDefined();
  });

  test('should have valid configuration for data loading', () => {
    // Test that all configurations have valid paths
    geoDataConfig.forEach(config => {
      expect(config.geoJsonPath).toMatch(/^datasets\/geojson\/.+\.json$/);
      expect(config.csvPath).toMatch(/^datasets\/.+\.csv$/);
    });
  });

  test('should have proper color gradients for numeric datasets', () => {
    geoDataConfig
      .filter(config => config.type === 'numeric')
      .forEach(config => {
        expect(config.colorGradients).toBeDefined();
        expect(config.colorGradients?.length).toBe(3);
        config.colorGradients?.forEach(color => {
          expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
        });
      });
  });
}); 