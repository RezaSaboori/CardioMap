import React, { useState } from 'react';
import GeoJsonMap from './geo-json-map.tsx';
import PointLayer from './PointLayer';
import FlowLayer from './FlowLayer';

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
 */
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

const GeoMapContainer: React.FC<GeoMapContainerProps> = ({
  geoJsonData,
  geodata,
  points = [],
  flows = [],
  popupInfo,
  fillColor,
  borderColor,
  beforeOpacity = 0.2,
  afterOpacity = 0.5,
  coloredDataOpacity = 0.6,
  selectedGeodata = 'pop',
  colorMode = 'continuous',
  defaultColors,
  categoricalSchemes,
  continuousSchemes,
  colorMap = {},
  categoryLabels = {},
  children,
  onRegionClick,
  onPointClick,
  onFlowClick,
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
      selectedGeodata={selectedGeodata}
      colorMode={colorMode}
      defaultColors={defaultColors}
      categoricalSchemes={categoricalSchemes}
      continuousSchemes={continuousSchemes}
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
      {flows.length > 0 && (
        <FlowLayer
          flows={flows}
          colorMap={colorMap}
          onFlowHover={handlePointHover}
          onFlowClick={handleFlowClick}
          categoryLabels={categoryLabels}
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