import { GeoDatasetConfig } from '../../../config/geoDataConfig';
import { loadCsvData } from '../utils/csv-loader';

export interface MergedGeoJsonData {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    properties: Record<string, any>;
    geometry: any;
  }>;
}

export interface DatasetData {
  geoJson: MergedGeoJsonData;
  csvData: Record<string, any>[];
  minValue?: number;
  maxValue?: number;
  categories?: string[];
}

/**
 * Loads and merges GeoJSON and CSV data based on the dataset configuration
 */
export const loadDatasetData = async (config: GeoDatasetConfig): Promise<DatasetData> => {
  try {
    // Load GeoJSON data - use dynamic import with proper path resolution
    let geoJsonData;
    // Fix the path to be relative to src/ directory, not src/config/
    const geoJsonPath = config.geoJsonPath.startsWith('./') 
      ? config.geoJsonPath.replace('./', '../../../') 
      : `../../../${config.geoJsonPath}`;
    
    try {
      const geoJsonModule = await import(/* @vite-ignore */ geoJsonPath);
      geoJsonData = geoJsonModule.default;
    } catch (importError) {
      console.error(`Failed to load GeoJSON from ${geoJsonPath}:`, importError);
      throw new Error(`Could not load GeoJSON data for dataset ${config.name}`);
    }

    // Load CSV data
    console.log(`Loading CSV from path: ${config.csvPath}`);
    let csvData: Record<string, any>[];
    try {
      csvData = await loadCsvData(config.csvPath);
      console.log(`Loaded CSV data for ${config.name}:`, csvData.length, 'rows');
      
      if (csvData.length === 0) {
        console.error('No CSV data loaded!');
        throw new Error(`No CSV data loaded from ${config.csvPath}`);
      }
      
      console.log('CSV columns:', Object.keys(csvData[0] || {}));
      console.log('First few rows:', csvData.slice(0, 3));
      
      // Check if the expected column exists
      if (!csvData[0] || !csvData[0][config.csvJoinColumn]) {
        console.error(`CSV missing expected column '${config.csvJoinColumn}'`);
        console.error('Available columns:', Object.keys(csvData[0] || {}));
        throw new Error(`CSV missing expected column '${config.csvJoinColumn}'`);
      }
    } catch (error) {
      console.error(`Failed to load CSV from ${config.csvPath}:`, error);
      throw error;
    }

    // Helper function to get nested property value
    const getNestedProperty = (obj: any, path: string): any => {
      return path.split('.').reduce((current, key) => current?.[key], obj);
    };

    // Helper function to normalize region names (remove " Province" and spaces)
    const normalizeRegionName = (name: string | undefined | null): string => {
      if (!name) return '';
      
      // Simply remove " Province" suffix and spaces to match CSV format
      return name.replace(' Province', '').replace(/ /g, '');
    };

    // Merge CSV data into GeoJSON features
    const mergedFeatures = geoJsonData.features.map((feature: any) => {
      // Get the region name from the nested property
      const regionName = getNestedProperty(feature.properties, config.joinProperty);
      
      if (!regionName) {
        console.warn(`No region name found for feature with properties:`, feature.properties);
        return feature;
      }

      // Normalize the region name to match CSV format
      const normalizedRegionName = normalizeRegionName(regionName);

      // Find matching CSV row
      const matchingCsvRow = csvData.find((row: any) => {
        const csvRegionName = row[config.csvJoinColumn];
        
        // Debug logging to understand the data
        if (!csvRegionName) {
          console.warn(`CSV row missing ${config.csvJoinColumn} column:`, row);
          return false;
        }
        
        // Normalize the CSV region name for comparison
        const normalizedCsvRegionName = normalizeRegionName(csvRegionName);
        
        // Debug logging for name matching
        
        return normalizedCsvRegionName === normalizedRegionName;
      });

      if (matchingCsvRow) {
        return {
          ...feature,
          properties: {
            ...feature.properties,
            ...matchingCsvRow,
            // Store the normalized name for consistent lookup
            normalizedName: normalizedRegionName
          }
        };
      }

      console.warn(`No matching CSV data found for region: ${regionName} (normalized: ${normalizedRegionName})`);
      return feature;
    });

    const mergedGeoJson: MergedGeoJsonData = {
      type: 'FeatureCollection',
      features: mergedFeatures
    };

    // Calculate min/max values for numeric data
    let minValue: number | undefined;
    let maxValue: number | undefined;
    let categories: string[] | undefined;

    if (config.type === 'numeric') {
      const values = csvData
        .map((row: Record<string, any>) => parseFloat(row[config.dataColumn]))
        .filter((value: number) => !isNaN(value));
      
      if (values.length > 0) {
        minValue = Math.min(...values);
        maxValue = Math.max(...values);
      }
    } else if (config.type === 'categorical') {
      const uniqueCategories = [...new Set(csvData.map((row: Record<string, any>) => row[config.dataColumn]))];
      categories = uniqueCategories.filter((cat: any) => cat && cat !== '') as string[];
    }

    return {
      geoJson: mergedGeoJson,
      csvData,
      minValue,
      maxValue,
      categories
    };
  } catch (error) {
    console.error(`Error loading dataset ${config.name}:`, error);
    throw error;
  }
};

/**
 * Creates a color scale for numeric data
 */
export const createColorScale = (
  minValue: number,
  maxValue: number,
  colorGradients: [string, string, string]
): (value: number) => string => {
  const [color1, color2, color3] = colorGradients;
  
  return (value: number): string => {
    const normalized = (value - minValue) / (maxValue - minValue);
    
    if (normalized <= 0.5) {
      // Interpolate between color1 and color2
      const t = normalized * 2;
      return interpolateColor(color1, color2, t);
    } else {
      // Interpolate between color2 and color3
      const t = (normalized - 0.5) * 2;
      return interpolateColor(color2, color3, t);
    }
  };
};

/**
 * Simple color interpolation function
 */
const interpolateColor = (color1: string, color2: string, t: number): string => {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substr(0, 2), 16);
  const g1 = parseInt(hex1.substr(2, 2), 16);
  const b1 = parseInt(hex1.substr(4, 2), 16);
  
  const r2 = parseInt(hex2.substr(0, 2), 16);
  const g2 = parseInt(hex2.substr(2, 2), 16);
  const b2 = parseInt(hex2.substr(4, 2), 16);
  
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}; 