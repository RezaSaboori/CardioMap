import Papa from 'papaparse';
import { Point, ResearchCenterCsvRow, FlowData } from '../../../types';
import researchCenterCsvPath from '../../../datasets/ResearchCenter.csv?url';

/**
 * Configuration for mapping CSV columns to Point properties
 */
export interface PointMappingConfig {
  idColumn?: string;
  nameColumn: string;
  categoryColumn?: string;
  categoryFaColumn?: string;
  latColumn: string;
  lonColumn: string;
  sizeColumn?: string;
  sizeDivisor?: number;
  defaultSize?: number;
}

/**
 * Configuration for mapping CSV columns to FlowData properties
 */
export interface FlowMappingConfig {
  idColumn?: string;
  nameColumn?: string;
  categoryColumn: string;
  categoryFaColumn?: string;
  originLatColumn: string;
  originLonColumn: string;
  destLatColumn: string;
  destLonColumn: string;
  sizeColumn?: string;
  sizeDivisor?: number;
  defaultSize?: number;
}

/**
 * Generic function to load and transform CSV data into Point objects
 * 
 * @example
 * // For a simple points CSV with columns: name, lat, lng, population
 * const config: PointMappingConfig = {
 *   nameColumn: 'name',
 *   latColumn: 'lat', 
 *   lonColumn: 'lng',
 *   sizeColumn: 'population',
 *   defaultSize: 0.3
 * };
 * const points = await loadPointsFromCsv('/path/to/points.csv', config);
 * 
 * @example
 * // For hospitals CSV with columns: hospital_name, latitude, longitude, beds
 * const hospitalConfig: PointMappingConfig = {
 *   nameColumn: 'hospital_name',
 *   categoryColumn: 'type',
 *   latColumn: 'latitude',
 *   lonColumn: 'longitude', 
 *   sizeColumn: 'beds',
 *   sizeDivisor: 50,
 *   defaultSize: 0.4
 * };
 * const hospitals = await loadPointsFromCsv('/path/to/hospitals.csv', hospitalConfig);
 */
export const loadPointsFromCsv = async (
  csvPath: string,
  config: PointMappingConfig
): Promise<Point[]> => {
  try {
    const response = await fetch(csvPath);
    const csvText = await response.text();
    const result = Papa.parse(csvText, { header: true });
    const rawData = result.data as Record<string, any>[];

    const points: Point[] = rawData.map((row, index) => {
      // Validate required fields
      if (!row[config.latColumn] || !row[config.lonColumn] || !row[config.nameColumn]) {
        console.warn(`Skipping row ${index}: missing required fields`);
        return null;
      }

      const lat = parseFloat(row[config.latColumn]);
      const lon = parseFloat(row[config.lonColumn]);

      if (isNaN(lat) || isNaN(lon)) {
        console.warn(`Skipping row ${index}: invalid coordinates for ${row[config.nameColumn]}`);
        return null;
      }

      // Generate ID
      const id = config.idColumn 
        ? row[config.idColumn]
        : `${row[config.nameColumn].replace(/\s/g, '')}-${index}`;

      // Calculate size value
      let sizeValue = config.defaultSize || 0.5;
      if (config.sizeColumn && row[config.sizeColumn]) {
        const rawSize = parseFloat(row[config.sizeColumn]);
        if (!isNaN(rawSize)) {
          sizeValue = config.sizeDivisor ? rawSize / config.sizeDivisor : rawSize;
        }
      }

      return {
        id,
        name: row[config.nameColumn],
        category: config.categoryColumn ? row[config.categoryColumn] : 'default',
        categoryFa: config.categoryFaColumn ? row[config.categoryFaColumn] : '',
        coordinates: [lon, lat],
        sizeValue,
      };
    }).filter((p): p is Point => p !== null);

    return points;
  } catch (error) {
    console.error('Error loading or parsing CSV points:', error);
    return [];
  }
};

/**
 * Generic function to load and transform CSV data into FlowData objects
 * 
 * @example
 * // For a flow CSV with columns: Origin, Destination, Disease, pop
 * const config: FlowMappingConfig = {
 *   categoryColumn: 'Disease',
 *   originLatColumn: 'Origin',
 *   originLonColumn: 'Origin',
 *   destLatColumn: 'Destination',
 *   destLonColumn: 'Destination',
 *   sizeColumn: 'pop',
 *   defaultSize: 0.3
 * };
 * const flows = await loadFlowsFromCsv('/path/to/flows.csv', config);
 */
export const loadFlowsFromCsv = async (
  csvPath: string,
  config: FlowMappingConfig
): Promise<FlowData[]> => {
  try {
    const response = await fetch(csvPath);
    const csvText = await response.text();
    
    // Use Papa Parse for better CSV handling
    const result = Papa.parse(csvText, { 
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim()
    });
    const rawData = result.data as Record<string, any>[];

    const flows: FlowData[] = rawData.map((row, index) => {
      // Parse origin coordinates
      const originCoords = parseCoordinates(row[config.originLatColumn]);
      if (!originCoords) {
        console.warn(`Skipping row ${index}: invalid origin coordinates for column ${config.originLatColumn}, value: ${row[config.originLatColumn]}`);
        return null;
      }

      // Parse destination coordinates
      const destCoords = parseCoordinates(row[config.destLatColumn]);
      if (!destCoords) {
        console.warn(`Skipping row ${index}: invalid destination coordinates for column ${config.destLatColumn}, value: ${row[config.destLatColumn]}`);
        return null;
      }

      // Generate ID
      const id = config.idColumn 
        ? row[config.idColumn]
        : `flow-${index}`;

      // Calculate size value
      let sizeValue = config.defaultSize || 0.5;
      if (config.sizeColumn && row[config.sizeColumn]) {
        const rawSize = parseFloat(row[config.sizeColumn]);
        if (!isNaN(rawSize)) {
          sizeValue = config.sizeDivisor ? rawSize / config.sizeDivisor : rawSize;
        }
      }

      return {
        id,
        name: config.nameColumn ? row[config.nameColumn] : `Flow ${index}`,
        category: row[config.categoryColumn] || 'default',
        categoryFa: config.categoryFaColumn ? row[config.categoryFaColumn] : '',
        origin: originCoords,
        destination: destCoords,
        sizeValue,
        originalData: row, // Store the original CSV row data
      } as FlowData;
    }).filter((f): f is FlowData => f !== null);

    return flows;
  } catch (error) {
    console.error('Error loading or parsing CSV flows:', error);
    return [];
  }
};

/**
 * Helper function to parse coordinate strings like "26.904523, 58.283603"
 */
const parseCoordinates = (coordString: string): [number, number] | null => {
  if (!coordString) return null;
  
  // Remove quotes and extra whitespace
  const cleanString = coordString.replace(/"/g, '').trim();
  
  // Split by comma and parse numbers
  const parts = cleanString.split(',').map(part => part.trim());
  if (parts.length !== 2) {
    console.warn('Invalid coordinate format:', coordString);
    return null;
  }
  
  const lat = parseFloat(parts[0]);
  const lon = parseFloat(parts[1]);
  
  if (isNaN(lat) || isNaN(lon)) {
    console.warn('Invalid coordinate values:', coordString);
    return null;
  }
  
  return [lon, lat]; // Return as [longitude, latitude]
};

/**
 * Legacy function for backward compatibility - loads research centers data
 */
export const loadResearchCentersData = async (): Promise<Point[]> => {
  const config: PointMappingConfig = {
    nameColumn: 'name:en',
    categoryColumn: 'Category:en',
    categoryFaColumn: 'Category:fa',
    latColumn: 'Latitude',
    lonColumn: 'Longitude',
    sizeColumn: 'SizeMetric',
    sizeDivisor: 100,
    defaultSize: 0.5,
  };

  return loadPointsFromCsv(researchCenterCsvPath, config);
};

/**
 * Generic CSV loader for any CSV file. Returns array of objects.
 */
export const loadCsvData = async (csvPath: string): Promise<Record<string, any>[]> => {
  try {
    const response = await fetch(csvPath);
    const csvText = await response.text();
    const result = Papa.parse(csvText, { header: true });
    return result.data as Record<string, any>[];
  } catch (error) {
    console.error('Error loading or parsing CSV:', error);
    return [];
  }
}; 