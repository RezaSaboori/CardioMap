// GeoJSON related components and utilities
export { default as GeoJsonMap } from './GeoJsonMap';
export { default as GeoMapContainer } from './GeoMapContainer';
export { default as RegionLabels } from './RegionLabels';

// Export interfaces
export interface HoverInfo {
    longitude: number;
    latitude: number;
    featureName: string;
}

export interface GeoJsonMapProps {
    geoJsonData: any;
    geodata: any[];
    children?: React.ReactNode;
    popupInfo?: HoverInfo | null;
    fillColor?: string;
    borderColor?: string;
    beforeOpacity?: number;
    afterOpacity?: number;
    coloredDataOpacity?: number;
    selectedGeodata?: string;
    colorMode?: 'continuous' | 'categorical' | 'default';
    defaultColors?: { light: string; dark: string };
    categoricalSchemes?: any[];
    continuousSchemes?: any[];
    onRegionClick?: (regionData: Record<string, any>, regionName: string) => void;
}

export interface GeoMapContainerProps {
  geoJsonData: any;
  geodata: Record<string, any>[];
  points?: any[];
  flows?: any[];
  popupInfo?: { longitude: number; latitude: number; featureName: string } | null;
  fillColor?: string;
  borderColor?: string;
  beforeOpacity?: number;
  afterOpacity?: number;
  coloredDataOpacity?: number;
  selectedGeodata?: string;
  colorMode?: 'continuous' | 'categorical' | 'default';
  defaultColors?: { light: string; dark: string };
  categoricalSchemes?: Array<{ column: string; colorMap: Record<string, string> }>;
  continuousSchemes?: Array<{ column: string; gradient: Array<{ value: number; color: string }> }>;
  colorMap?: Record<string, string>;
  categoryLabels?: Record<string, string>;
  children?: React.ReactNode;
  onRegionClick?: (regionData: Record<string, any>, regionName: string) => void;
  onPointClick?: (point: any) => void;
  onFlowClick?: (flow: any) => void;
} 