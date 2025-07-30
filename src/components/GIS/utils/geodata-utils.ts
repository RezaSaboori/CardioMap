/**
 * Geodata Utilities
 * Handles geodata processing, enrichment, and color assignment logic
 */

import { getColorPalette } from './theme';

export interface GeodataRow {
  name: string;
  pop?: number;
  health_status?: string;
  [key: string]: any;
}

export interface GeodataEnrichmentResult {
  enrichedGeoJsonData: any;
  regionDataMap: Record<string, GeodataRow>;
  colorScheme: 'continuous' | 'categorical' | 'default';
}

export interface ColorScheme {
  continuous?: {
    column: string;
    gradient: Array<{ value: number; color: string }>;
  };
  categorical?: {
    column: string;
    colorMap: Record<string, string>;
  };
}

/**
 * Builds a lookup map from geodata for region enrichment
 */
export const buildRegionDataMap = (geodata: GeodataRow[]): Record<string, GeodataRow> => {
  const map: Record<string, GeodataRow> = {};
  geodata.forEach((row: GeodataRow) => {
    if (row.name) {
      let normName = row.name.replace(' Province', '').replace(/ /g, '');
      map[normName] = row;
    }
  });
  return map;
};

/**
 * Enriches GeoJSON data with geodata information
 */
export const enrichGeoJsonData = (
  geoJsonData: any,
  geodata: GeodataRow[]
): GeodataEnrichmentResult => {
  if (!geoJsonData) return { enrichedGeoJsonData: null, regionDataMap: {}, colorScheme: 'default' };
  if (!geoJsonData.features) return { enrichedGeoJsonData: geoJsonData, regionDataMap: {}, colorScheme: 'default' };

  const regionDataMap = buildRegionDataMap(geodata);

  const enrichedGeoJsonData = {
    ...geoJsonData,
    features: geoJsonData.features.map((feature: any) => {
      const regionName = feature.properties?.tags?.['name:en']?.replace(' Province', '').replace(/ /g, '') ||
                        feature.properties?.name?.replace(' Province', '').replace(/ /g, '') ||
                        feature.properties?.NAME?.replace(' Province', '').replace(/ /g, '');
      
      const regionData = regionDataMap[regionName];
      
      if (regionData) {
        return {
          ...feature,
          properties: {
            ...feature.properties,
            ...regionData  // Flatten the geodata into properties
          }
        };
      }
      
      return feature;
    })
  };

  return {
    enrichedGeoJsonData,
    regionDataMap,
    colorScheme: geodata.length > 0 ? 'continuous' : 'default'
  };
};

/**
 * Determines the color mode based on selected geodata and available data
 */
export const getColorMode = (
  selectedGeodata: string,
  geodata: GeodataRow[]
): 'continuous' | 'categorical' | 'default' => {
  if (!geodata.length || selectedGeodata === 'nothing') return 'default';
  
  if (selectedGeodata === 'pop') return 'continuous';
  if (selectedGeodata === 'health_status') return 'categorical';
  
  return 'default';
};

/**
 * Gets population color based on value and color scale
 */
export const getPopulationColor = (pop: number, colorScale: Array<{ value: number; color: string }>): string => {
  for (let i = colorScale.length - 1; i >= 0; i--) {
    if (pop >= colorScale[i].value) return colorScale[i].value;
  }
  return colorScale[0].color;
};

/**
 * Gets region color based on geodata and selected visualization type
 */
export const getRegionColor = (
  regionName: string,
  regionDataMap: Record<string, GeodataRow>,
  selectedGeodata: string,
  colorPalette: any,
  healthStatusColors: Record<string, string>
): string => {
  const data = regionDataMap[regionName];
  if (!data) return colorPalette.mapForeground;
  
  if (selectedGeodata === 'pop' && data.pop !== undefined) {
    // For population, we'll use a simple color scale
    const colorScale = [
      { value: 0, color: '#f7fafc' },
      { value: 1000000, color: '#bee3f8' },
      { value: 5000000, color: '#3182ce' },
      { value: 10000000, color: '#1a365d' }
    ];
    return getPopulationColor(data.pop, colorScale);
  } else if (selectedGeodata === 'health_status' && data.health_status) {
    return healthStatusColors[data.health_status] || '#ccc';
  }
  
  return colorPalette.mapForeground;
};

/**
 * Creates fill layer paint configuration for geodata visualization
 */
export const createGeodataFillLayer = (
  selectedGeodata: string,
  colorMode: 'continuous' | 'categorical' | 'default',
  categoricalScheme?: ColorScheme['categorical'],
  continuousScheme?: ColorScheme['continuous'],
  beforeOpacity: number = 0.2,
  afterOpacity: number = 0.5,
  coloredDataOpacity: number = 0.6,
  themeDefaultColor: string = '#ccc'
): any => {
  let fillColor: any = themeDefaultColor;
  let fillOpacity = beforeOpacity;
  
  if ((colorMode === 'continuous' && continuousScheme) || (colorMode === 'categorical' && categoricalScheme)) {
    fillOpacity = coloredDataOpacity;
  }
  
  if (colorMode === 'continuous' && continuousScheme) {
    // Build interpolate expression from gradient
    const stops: any[] = [];
    continuousScheme.gradient.forEach(g => {
      stops.push(g.value, g.color);
    });
    fillColor = [
      'interpolate', ['linear'],
      ['to-number', ['get', selectedGeodata]],
      ...stops
    ];
  } else if (colorMode === 'categorical' && categoricalScheme) {
    // Build match expression from colorMap
    const matchArr: any[] = [];
    Object.entries(categoricalScheme.colorMap).forEach(([key, color]) => {
      matchArr.push(key, color);
    });
    matchArr.push('#ccc'); // fallback
    fillColor = [
      'match', ['get', selectedGeodata],
      ...matchArr
    ];
  }
  
  return {
    id: 'data-fill',
    type: 'fill',
    source: 'my-data',
    paint: {
      'fill-color': fillColor,
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        afterOpacity,
        fillOpacity
      ]
    }
  };
}; 