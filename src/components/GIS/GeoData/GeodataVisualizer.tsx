/**
 * GeodataVisualizer Component
 * Handles the visualization logic for geodata on maps
 */

import React, { useMemo } from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec';
import { 
  createGeodataFillLayer,
  GeodataEnrichmentResult,
  ColorScheme
} from '../utils/geodata-utils';
import { getColorPalette } from '../utils/theme';

interface GeodataVisualizerProps {
  enrichmentResult: GeodataEnrichmentResult;
  selectedGeodata: string;
  colorMode: 'continuous' | 'categorical' | 'default';
  categoricalSchemes?: ColorScheme['categorical'][];
  continuousSchemes?: ColorScheme['continuous'][];
  beforeOpacity?: number;
  afterOpacity?: number;
  coloredDataOpacity?: number;
  borderColor?: string;
  themeDefaultColor?: string;
}

/**
 * GeodataVisualizer: Handles the visualization of geodata on maps
 * 
 * This component separates the visualization logic from the map rendering logic,
 * making it easier to test and modify visualization behavior.
 * 
 * Props:
 * - enrichmentResult: Result from GeodataEnricher
 * - selectedGeodata: Which geodata column to visualize
 * - colorMode: Type of color visualization
 * - categoricalSchemes/continuousSchemes: Color schemes for visualization
 * - opacity controls: Various opacity settings
 * - borderColor: Color for region borders
 * - themeDefaultColor: Default color when no geodata is selected
 */
const GeodataVisualizer: React.FC<GeodataVisualizerProps> = ({
  enrichmentResult,
  selectedGeodata,
  colorMode,
  categoricalSchemes = [],
  continuousSchemes = [],
  beforeOpacity = 0.2,
  afterOpacity = 0.5,
  coloredDataOpacity = 0.6,
  borderColor,
  themeDefaultColor
}) => {
  const { enrichedGeoJsonData } = enrichmentResult;
  
  // Get color schemes for the selected geodata
  const categoricalScheme = categoricalSchemes.find(s => s.column === selectedGeodata);
  const continuousScheme = continuousSchemes.find(s => s.column === selectedGeodata);
  
  // Get theme colors
  const colorPalette = getColorPalette();
  const finalBorderColor = borderColor || colorPalette.mapBorder;
  const finalThemeDefaultColor = themeDefaultColor || colorPalette.mapForeground;

  // Create fill layer for geodata visualization
  const fillLayer = useMemo(() => {
    return createGeodataFillLayer(
      selectedGeodata,
      colorMode,
      categoricalScheme,
      continuousScheme,
      beforeOpacity,
      afterOpacity,
      coloredDataOpacity,
      finalThemeDefaultColor
    );
  }, [
    selectedGeodata,
    colorMode,
    categoricalScheme,
    continuousScheme,
    beforeOpacity,
    afterOpacity,
    coloredDataOpacity,
    finalThemeDefaultColor
  ]);

  // Create border layer
  const lineLayer: LayerSpecification = useMemo(() => ({
    id: 'data-line',
    type: 'line',
    source: 'my-data',
    paint: {
      'line-color': finalBorderColor,
      'line-width': 2,
      'line-opacity': 0.1
    }
  }), [finalBorderColor]);

  if (!enrichedGeoJsonData) {
    return null;
  }

  return (
    <Source id="my-data" type="geojson" data={enrichedGeoJsonData} generateId={true}>
      <Layer {...fillLayer} key="data-fill" />
      <Layer {...lineLayer} key="data-line" />
    </Source>
  );
};

export default GeodataVisualizer; 