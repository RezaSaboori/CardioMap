/**
 * GeodataEnricher Component
 * Handles the enrichment of GeoJSON data with geodata information
 */

import React, { useMemo } from 'react';
import { 
  enrichGeoJsonData, 
  getColorMode, 
  GeodataRow, 
  GeodataEnrichmentResult 
} from '../utils/geodata-utils';

interface GeodataEnricherProps {
  geoJsonData: any;
  geodata: GeodataRow[];
  selectedGeodata: string;
  children: (enrichmentResult: GeodataEnrichmentResult) => React.ReactNode;
}

/**
 * GeodataEnricher: Processes and enriches GeoJSON data with geodata information
 * 
 * This component separates the data enrichment logic from the visualization logic,
 * making the code more modular and easier to test.
 * 
 * Props:
 * - geoJsonData: Raw GeoJSON data
 * - geodata: Array of geodata objects (from CSV)
 * - selectedGeodata: Which geodata column to use for visualization
 * - children: Render function that receives the enrichment result
 */
const GeodataEnricher: React.FC<GeodataEnricherProps> = ({
  geoJsonData,
  geodata,
  selectedGeodata,
  children
}) => {
  const enrichmentResult = useMemo(() => {
    return enrichGeoJsonData(geoJsonData, geodata);
  }, [geoJsonData, geodata]);

  const colorMode = useMemo(() => {
    return getColorMode(selectedGeodata, geodata);
  }, [selectedGeodata, geodata]);

  const result: GeodataEnrichmentResult = {
    ...enrichmentResult,
    colorScheme: colorMode
  };

  return <>{children(result)}</>;
};

export default GeodataEnricher; 