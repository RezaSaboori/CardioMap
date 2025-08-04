// src/utils/pointDataLoader.ts

import Papa from 'papaparse';
import { Point } from '../types';
import { PointDataConfig } from '../config/pointDataConfig';

export interface ProcessedPointData {
  config: PointDataConfig;
  data: Point[];
}

/**
 * Loads and processes point data from CSV based on configuration
 * @param config - PointDataConfig object defining the dataset
 * @returns Promise<ProcessedPointData> containing config and processed data
 */
export const loadPointData = async (config: PointDataConfig): Promise<ProcessedPointData> => {
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
    
    // Process each row into a Point object
    const processedData: Point[] = rawData
      .map((row, index) => {
        // Validate required fields
        const lat = parseFloat(row[config.coordinates[0]]);
        const lon = parseFloat(row[config.coordinates[1]]);
        const name = row[config.nameColumn];
        const category = row[config.categoriesColumn];
        
        if (isNaN(lat) || isNaN(lon) || !name || !category) {
          console.warn(`Skipping row ${index}: missing required fields`);
          return null;
        }
        
        // Generate ID
        const id = config.idColumn 
          ? row[config.idColumn] 
          : `${name.replace(/\s/g, '')}-${index}`;
        
        // Calculate normalized size (0.0 to 1.0)
        const rawSize = parseFloat(row[config.sizeColumn]) || 0;
        const sizeNormal = sizeRange > 0 
          ? (rawSize - minSize) / sizeRange 
          : 0.5; // Default to 0.5 if all values are the same
        
        // Get category display name and color
        const categoryConfig = config.categoriesValues[category];
        const categoryFa = categoryConfig ? categoryConfig[0] : category;
        
        return {
          id,
          name,
          category,
          categoryFa,
          coordinates: [lon, lat] as [number, number],
          sizeValue: sizeNormal, // Use normalized size
          originalData: row as Record<string, any>, // Store original CSV data for card display
        } as Point;
      })
      .filter((point): point is Point => point !== null);
    
    return {
      config,
      data: processedData
    };
    
  } catch (error) {
    console.error('Error loading point data:', error);
    return {
      config,
      data: []
    };
  }
};

/**
 * Loads multiple point datasets based on their configurations
 * @param configs - Array of PointDataConfig objects
 * @returns Promise<ProcessedPointData[]> array of processed datasets
 */
export const loadMultiplePointDatasets = async (configs: PointDataConfig[]): Promise<ProcessedPointData[]> => {
  const promises = configs.map(config => loadPointData(config));
  return Promise.all(promises);
};

/**
 * Loads all point datasets defined in the configuration
 * @returns Promise<ProcessedPointData[]> array of all processed datasets
 */
export const loadAllPointDatasets = async (): Promise<ProcessedPointData[]> => {
  const { POINT_DATA_CONFIGS } = await import('../config/pointDataConfig');
  return loadMultiplePointDatasets(POINT_DATA_CONFIGS);
}; 