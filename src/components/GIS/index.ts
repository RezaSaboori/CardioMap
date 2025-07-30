// Export main components
export { default as GeoMapContainer } from './GeoMapContainer';
export { default as CardsGrid } from './CardsGrid';

// Export utility functions
export { loadFlowsFromCsv, loadCsvData, loadResearchCentersData } from './utils/csv-loader';
export { getColorPalette } from './utils/theme';

// Export hooks
export { useThemeChange } from './hooks/useThemeChange';

// Export legend components and utilities
export { 
  Legend, 
  LegendGroup, 
  LegendRow, 
  LegendContainer,
  categoricalSchemes,
  continuousSchemes,
  getDefaultColors,
  getGeodataLegendConfig,
  getResearchCentersLegendConfig,
  getDynamicResearchCentersLegendConfig,
  getFlowDataLegendConfig,
  getDynamicFlowLegendConfig,
  flowDataColorMap,
  flowDataLabels
} from './legends';

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
  
  export interface FlowData {
    id: string;
    origin: [number, number];
    destination: [number, number];
    category: string;
    categoryFa?: string;
    sizeValue: number;
    name?: string;
    originalData?: Record<string, any>; // Store the original CSV row data
  }
  
  export interface FlowLayerProps {
    flows: FlowData[];
    colorMap: ColorMap;
    onFlowHover?: (hoverInfo: { longitude: number; latitude: number; featureName: string; } | null) => void;
    onFlowClick?: (flow: FlowData) => void;
    categoryLabels?: { [key: string]: string };
    minSize?: number;
    maxSize?: number;
    enableAnimation?: boolean;
    nameColumn?: string;
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