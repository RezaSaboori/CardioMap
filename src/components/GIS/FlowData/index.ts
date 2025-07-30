// Flow data related components and utilities
export { default as FlowLayer } from './FlowLayer';

// Export interfaces
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

export interface ColorMap {
    [key: string]: string;
} 