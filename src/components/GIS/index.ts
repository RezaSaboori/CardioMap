// Export main components from organized subdirectories
export { default as GeoMapContainer } from './GeoJson/GeoMapContainer';
export { default as CardsGrid } from './CardsGrid';
export { default as ThemeToggle } from './ThemeToggle';
export { default as Controls } from './Controls';
export { default as GISDashboard } from './GISDashboard';

// Export GeoJSON components
export { default as GeoJsonMap } from './GeoJson/GeoJsonMap';
export { default as RegionLabels } from './GeoJson/RegionLabels';

// Export GeoData components
export { default as GeodataEnricher } from './GeoData/GeodataEnricher';
export { default as GeodataVisualizer } from './GeoData/GeodataVisualizer';

// Export PointData components
export { default as PointLayer } from './PointData/PointLayer';

// Export FlowData components
export { default as FlowLayer } from './FlowData/FlowLayer';

// Export interfaces from subdirectories
export type { 
  GeoJsonMapProps,
  GeoMapContainerProps,
  HoverInfo
} from './GeoJson';

export type { 
  Point,
  ColorMap as PointColorMap,
  PointLayerProps,
  ResearchCenterCsvRow
} from './PointData';

export type { 
  FlowData,
  FlowLayerProps,
  ColorMap as FlowColorMap
} from './FlowData';

// Export utility functions
export { loadFlowsFromCsv, loadCsvData, loadResearchCentersData } from './utils/csv-loader';
export { getColorPalette } from './utils/theme';

// Export geodata utilities
export { 
  enrichGeoJsonData,
  getColorMode,
  buildRegionDataMap,
  getRegionColor,
  createGeodataFillLayer,
  type GeodataRow,
  type GeodataEnrichmentResult,
  type ColorScheme
} from './utils/geodata-utils';

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
  getDatasetLegendConfig,
  flowDataColorMap,
  flowDataLabels
} from './legends'; 