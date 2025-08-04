import React, { useState } from 'react';
import GeoJsonMap from './GeoJsonMap';
import PointLayer from '../PointData/PointLayer';
import FlowData from '../FlowData/FlowData';
import { GeoDatasetConfig } from '../../../config/geoDataConfig';
import { DatasetData, createColorScale } from '../GeoData/dataLoader';
import { GeodataRow } from '../utils/geodata-utils';
import { FlowDataConfig } from '../../../config/flowDataConfig';

/**
 * GeoMapContainer: Self-contained, reusable map component.
 *
 * Props:
 * - geoJsonData: GeoJSON object for map regions (required)
 * - geodata: Array of objects (e.g., from CSV) for region enrichment (required)
 * - points: Array of point objects for markers (optional)
 * - popupInfo: Info for map popups (optional)
 * - fillColor, borderColor: Map colors (optional)
 * - beforeOpacity, afterOpacity, coloredDataOpacity: Opacity controls (optional)
 * - selectedGeodata: Which geodata column to visualize (optional)
 * - colorMode: 'continuous' | 'categorical' | 'default' (optional)
 * - defaultColors: { light, dark } (optional)
 * - categoricalSchemes, continuousSchemes: Color schemes (optional)
 * - colorMap, categoryLabels: For points/legend (optional)
 * - children: React children (optional)
 * - currentDatasetConfig: Current dataset configuration (optional)
 * - datasetData: Current dataset data (optional)
 */
export interface GeoMapContainerProps {
  geoJsonData: any;
  geodata: GeodataRow[];
  points?: any[];
  flows?: any[];
  flowConfig?: FlowDataConfig | null;
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
  hoverTag?: string; // Tag for hover display (e.g., 'name:fa', 'name:en')
  children?: React.ReactNode;
  onRegionClick?: (regionData: Record<string, any>, regionName: string) => void;
  onPointClick?: (point: any) => void;
  onFlowClick?: (flow: any) => void;
  currentDatasetConfig?: GeoDatasetConfig | null;
  datasetData?: DatasetData | null;
}

const GeoMapContainer: React.FC<GeoMapContainerProps> = ({
  geoJsonData,
  geodata,
  points = [],
  flows = [],
  flowConfig = null,
  popupInfo,
  fillColor,
  borderColor,
  beforeOpacity = 0.2,
  afterOpacity = 0.5,
  coloredDataOpacity = 0.6,
  selectedGeodata,
  colorMode = 'continuous',
  defaultColors,
  categoricalSchemes,
  continuousSchemes,
  colorMap = {},
  categoryLabels = {},
  hoverTag = "name:en", // Default hover tag
  children,
  onRegionClick,
  onPointClick,
  onFlowClick,
  currentDatasetConfig,
  datasetData,
}) => {
  const [pointPopupInfo, setPointPopupInfo] = useState<{ longitude: number; latitude: number; featureName: string } | null>(null);

  const handlePointHover = (hoverInfo: { longitude: number; latitude: number; featureName: string } | null) => {
    setPointPopupInfo(hoverInfo);
  };

  const handlePointClick = (point: any) => {
    // Handle point click if needed
    console.log('Point clicked:', point);
    if (onPointClick) {
      onPointClick(point);
    }
  };

  const handleFlowClick = (flow: any) => {
    // Handle flow click if needed
    console.log('Flow clicked:', flow);
    if (onFlowClick) {
      onFlowClick(flow);
    }
  };

  // Generate color schemes based on dataset configuration
  const getColorSchemes = () => {
    if (!currentDatasetConfig || !datasetData) {
      return { categoricalSchemes, continuousSchemes };
    }

    if (currentDatasetConfig.type === 'numeric' && datasetData.minValue !== undefined && datasetData.maxValue !== undefined) {
      const colorScale = createColorScale(datasetData.minValue, datasetData.maxValue, currentDatasetConfig.colorGradients!);
      const gradient = [
        { value: datasetData.minValue, color: currentDatasetConfig.colorGradients![0] },
        { value: datasetData.minValue + (datasetData.maxValue - datasetData.minValue) * 0.5, color: currentDatasetConfig.colorGradients![1] },
        { value: datasetData.maxValue, color: currentDatasetConfig.colorGradients![2] },
      ];
      
      return {
        categoricalSchemes: [],
        continuousSchemes: [{ column: currentDatasetConfig.dataColumn, gradient }]
      };
    } else if (currentDatasetConfig.type === 'categorical' && datasetData.categories) {
      // Use the colorMap from dataset configuration, don't hardcode fallback colors
      const colorMap = currentDatasetConfig.colorMap;
      
      if (!colorMap) {
        console.warn('No colorMap provided in dataset configuration for categorical data');
        return { categoricalSchemes: [], continuousSchemes: [] };
      }
      
      return {
        categoricalSchemes: [{ column: currentDatasetConfig.dataColumn, colorMap }],
        continuousSchemes: []
      };
    }

    return { categoricalSchemes, continuousSchemes };
  };

  const { categoricalSchemes: newCategoricalSchemes, continuousSchemes: newContinuousSchemes } = getColorSchemes();

  // Determine appropriate selectedGeodata based on dataset configuration
  const effectiveSelectedGeodata = selectedGeodata || (currentDatasetConfig?.dataColumn || 'pop');

  return (
      <GeoJsonMap
      geoJsonData={geoJsonData}
      geodata={geodata}
      popupInfo={popupInfo || pointPopupInfo}
      fillColor={fillColor}
      borderColor={borderColor}
      beforeOpacity={beforeOpacity}
      afterOpacity={afterOpacity}
      coloredDataOpacity={coloredDataOpacity}
      selectedGeodata={effectiveSelectedGeodata}
      colorMode={colorMode}
      defaultColors={defaultColors}
      categoricalSchemes={newCategoricalSchemes}
      continuousSchemes={newContinuousSchemes}
      hoverTag={hoverTag}
      onRegionClick={onRegionClick}
    >
      {points.length > 0 && (
        <PointLayer
          points={points}
          colorMap={colorMap}
          onPointHover={handlePointHover}
          onPointClick={handlePointClick}
          categoryLabels={categoryLabels}
          geoJsonData={geoJsonData}
          blurAmount={10}
          enablePulsing={true}
        />
      )}
      {flowConfig && (
        <FlowData
          config={flowConfig}
          onFlowClick={handleFlowClick}
          onFlowHover={handlePointHover}
          minSize={2}
          maxSize={12}
          enableAnimation={true}
        />
      )}
      {children}
    </GeoJsonMap>
  );
};

export default GeoMapContainer; 