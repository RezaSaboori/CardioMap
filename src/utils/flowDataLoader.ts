// src/utils/flowDataLoader.ts

import Papa from 'papaparse';
import { FlowData } from '../components/GIS/FlowData';
import { FlowDataConfig } from '../config/flowDataConfig';

export interface ProcessedFlowData {
  config: FlowDataConfig;
  data: FlowData[];
}

/**
 * Helper function to parse coordinate strings like "26.904523, 58.283603"
 */
const parseCoordinates = (coordString: string): [number, number] | null => {
  if (!coordString) return null;
  
  try {
    // Remove quotes and split by comma
    const cleanString = coordString.replace(/"/g, '').trim();
    const parts = cleanString.split(',').map(part => part.trim());
    
    if (parts.length !== 2) return null;
    
    const lat = parseFloat(parts[0]);
    const lon = parseFloat(parts[1]);
    
    if (isNaN(lat) || isNaN(lon)) return null;
    
    return [lon, lat]; // Return as [longitude, latitude] for consistency
  } catch (error) {
    console.warn('Failed to parse coordinates:', coordString);
    return null;
  }
};

/**
 * Loads and processes flow data from CSV based on configuration
 * @param config - FlowDataConfig object defining the dataset
 * @returns Promise<ProcessedFlowData> containing config and processed data
 */
export const loadFlowData = async (config: FlowDataConfig): Promise<ProcessedFlowData> => {
  try {
    // Fetch and parse CSV data
    const response = await fetch(config.csvPath);
    const csvText = await response.text();
    const result = Papa.parse(csvText, { 
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim()
    });
    
    const rawData = result.data as Record<string, any>[];
    
    // Extract size values for normalization
    const sizeValues = rawData
      .map(row => {
        const value = row[config.sizeColumn];
        return value ? parseFloat(value) : 0;
      })
      .filter(value => !isNaN(value));
    
    // Calculate min and max for normalization
    const minSize = Math.min(...sizeValues);
    const maxSize = Math.max(...sizeValues);
    const sizeRange = maxSize - minSize;
    
    // Process each row into a FlowData object
    const processedData: FlowData[] = rawData
      .map((row, index) => {
        // Parse origin coordinates
        const originCoords = parseCoordinates(row[config.startColumn]);
        if (!originCoords) {
          console.warn(`Skipping row ${index}: invalid origin coordinates for column ${config.startColumn}, value: ${row[config.startColumn]}`);
          return null;
        }

        // Parse destination coordinates
        const destCoords = parseCoordinates(row[config.endColumn]);
        if (!destCoords) {
          console.warn(`Skipping row ${index}: invalid destination coordinates for column ${config.endColumn}, value: ${row[config.endColumn]}`);
          return null;
        }

        // Validate required fields
        const category = row[config.categoriesColumn];
        if (!category) {
          console.warn(`Skipping row ${index}: missing category field`);
          return null;
        }
        
        // Generate ID
        const id = config.idColumn 
          ? row[config.idColumn] 
          : `flow-${index}`;
        
        // Calculate normalized size (0.0 to 1.0)
        const rawSize = parseFloat(row[config.sizeColumn]) || 0;
        const sizeNormal = sizeRange > 0 
          ? (rawSize - minSize) / sizeRange 
          : 0.5; // Default to 0.5 if all values are the same
        
        // Get category display name
        const categoryConfig = config.categoriesValues[category];
        const categoryFa = categoryConfig ? categoryConfig[0] : category;
        
        const flowData = {
          id,
          origin: originCoords,
          destination: destCoords,
          category,
          categoryFa,
          sizeValue: sizeNormal, // Use normalized size
          name: category, // Use category as name for display
          originalData: row as Record<string, any>, // Store original CSV data for card display
        } as FlowData;
        
        console.log(`Created flow ${index}:`, { id, category, sizeValue: sizeNormal });
        
        return flowData;
      })
      .filter((flow): flow is FlowData => flow !== null);
    
    return {
      config,
      data: processedData
    };
    
  } catch (error) {
    console.error('Error loading flow data:', error);
    return {
      config,
      data: []
    };
  }
};

/**
 * Loads multiple flow datasets based on their configurations
 * @param configs - Array of FlowDataConfig objects
 * @returns Promise<ProcessedFlowData[]> array of processed datasets
 */
export const loadMultipleFlowDatasets = async (configs: FlowDataConfig[]): Promise<ProcessedFlowData[]> => {
  const promises = configs.map(config => loadFlowData(config));
  return Promise.all(promises);
};

/**
 * Loads all flow datasets defined in the configuration
 * @returns Promise<ProcessedFlowData[]> array of all processed datasets
 */
export const loadAllFlowDatasets = async (): Promise<ProcessedFlowData[]> => {
  const { FLOW_DATA_CONFIGS } = await import('../config/flowDataConfig');
  return loadMultipleFlowDatasets(FLOW_DATA_CONFIGS);
}; 