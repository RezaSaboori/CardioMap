// Point data related components and utilities
export { default as PointLayer } from './PointLayer';

// Export interfaces
export interface Point {
    id: string;
    category: string;
    categoryFa: string;
    coordinates: [number, number];
    sizeValue: number;
    name: string;
}

export interface ColorMap {
    [key: string]: string;
}

export interface PointLayerProps {
    points: Point[];
    colorMap: ColorMap;
    onPointHover: (hoverInfo: { longitude: number; latitude: number; featureName: string; } | null) => void;
    onPointClick: (point: Point) => void;
    categoryLabels: { [key: string]: string };
    geoJsonData?: any; // GeoJSON data for hierarchical masking
    blurAmount?: number; // Blur amount in pixels
    enablePulsing?: boolean; // Enable natural light pulsing animation
}

export interface ResearchCenterCsvRow {
    'ID': string;
    'name:en': string;
    'name:fa': string;
    'Category:en': string;
    'Category:fa': string;
    'Province': string;
    'City': string;
    'Latitude': string;
    'Longitude': string;
    'SizeMetric': string;
    'Map': string;
    'Part': string;
} 