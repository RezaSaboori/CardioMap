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
    // Fix the path to be relative to dataLoader location (src/components/GIS/GeoData/)
    // config.geoJsonPath is like '../../datasets/geojson/Iran.json' (relative to src/components/GIS/)
    // dataLoader is in src/components/GIS/GeoData/, so we need to go up one more level
    // For disease datasets, the path might be '../../../datasets/geojson/Iran.json'
    let geoJsonPath = config.geoJsonPath;
    if (geoJsonPath.includes('../../datasets/geojson/')) {
      geoJsonPath = geoJsonPath.replace('../../datasets/geojson/', '../../../datasets/geojson/');
    }
    

    
    try {
      const geoJsonModule = await import(/* @vite-ignore */ geoJsonPath);
      geoJsonData = geoJsonModule.default;
    } catch (importError) {
      throw new Error(`Could not load GeoJSON data for dataset ${config.name}`);
      throw new Error(`Could not load GeoJSON data for dataset ${config.name}`);
    }

    // Load CSV data
    let csvData: Record<string, any>[];
    try {
      csvData = await loadCsvData(config.csvPath);
      
      // Preprocess: If the join column is 'Province', strip ' Province' from all values
      if (config.csvJoinColumn === 'Province') {
        csvData = csvData.map(row => ({
          ...row,
          Province: typeof row.Province === 'string' ? row.Province.replace(/\s*Province\s*$/, '').trim() : row.Province
        }));
      }
      
      if (csvData.length === 0) {
        throw new Error(`No CSV data loaded from ${config.csvPath}`);
      }
      
      
      
      // Check if the expected column exists
      if (!csvData[0] || !csvData[0][config.csvJoinColumn]) {
        throw new Error(`CSV missing expected column '${config.csvJoinColumn}'`);
      }
    } catch (error) {
      throw error;
    }

    // Helper function to get nested property value
    const getNestedProperty = (obj: any, path: string): any => {
      return path.split('.').reduce((current, key) => current?.[key], obj);
    };

    // Helper function to normalize region names (remove " Province" and spaces)
    const normalizeRegionName = (name: string | undefined | null): string => {
      if (!name) return '';
      
      // Remove " Province" suffix but preserve internal spaces
      // Also handle variations like " Province" and "Province"
      return name.replace(/\s*Province\s*$/, '').trim();
    };

    // Create a lookup map for efficient CSV data retrieval
    const csvLookupMap = new Map<string, Record<string, any>>();
    csvData.forEach((row: any) => {
      const csvRegionName = row[config.csvJoinColumn];
      if (csvRegionName) {
        const normalizedCsvRegionName = normalizeRegionName(csvRegionName);
        csvLookupMap.set(normalizedCsvRegionName, row);
      }
    });

    // Merge CSV data into GeoJSON features
    const mergedFeatures = geoJsonData.features.map((feature: any) => {
      // Get the region name from the nested property
      const regionName = getNestedProperty(feature.properties, config.joinProperty);
      
      if (!regionName) {
        return feature;
      }

      // Normalize the region name to match CSV format
      const normalizedRegionName = normalizeRegionName(regionName);

      // Find matching CSV row using efficient Map lookup
      const matchingCsvRow = csvLookupMap.get(normalizedRegionName);

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

      return feature;
    });

    const mergedGeoJson: MergedGeoJsonData = {
      type: 'FeatureCollection',
      features: mergedFeatures
    };

    // Calculate summary statistics for data processing
    const matchedCount = mergedFeatures.filter((f: any) => f.properties.normalizedName).length;
    const totalFeatures = mergedFeatures.length;

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