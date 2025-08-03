// src/config/geoDataConfig.ts

// Import CSV files with Vite's URL handling
import IranProvincesSampleCsv from '../datasets/IranProvincesSample.csv?url';

export interface CardConfig {
  [columnName: string]: {
    title: string;
    unit?: string;
    info?: string;
  };
}

export interface GeoDatasetConfig {
  name: string; // Display name for Legend Title and UI Selector
  type: 'numeric' | 'categorical';
  csvPath: string; // Path to the CSV data
  geoJsonPath: string; // Path to the corresponding GeoJSON
  joinProperty: string; // The property in the GeoJSON to join with the CSV data
  csvJoinColumn: string; // The column in the CSV to use for joining with GeoJSON
  dataColumn: string; // The column in the CSV containing the primary data to visualize
  colorGradients?: [string, string, string]; // For numeric types
  colorMap?: Record<string, string>; // For categorical types
  cardConfig: CardConfig; // Configuration for the display cards
}

export const geoDataConfig: GeoDatasetConfig[] = [
  {
    name: 'Iran Province Population',
    type: 'numeric',
    csvPath: IranProvincesSampleCsv,
    geoJsonPath: './datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'name',
    dataColumn: 'pop',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      pop: {
        title: 'Population',
        unit: 'people',
        info: 'Total population of the province'
      },
      Area: {
        title: 'Area',
        unit: 'km²',
        info: 'The total area of the province'
      }
    }
  },
  {
    name: 'Health Status',
    type: 'categorical',
    csvPath: IranProvincesSampleCsv,
    geoJsonPath: './datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'name',
    dataColumn: 'health_status',
    colorMap: {
      good: '#4caf50',    // green
      medium: '#ffeb3b',  // yellow
      poor: '#ff9800'     // orange
    },
    cardConfig: {
      health_status: {
        title: 'Health Status',
        info: 'Overall health status of the province'
      },
      'Doctors per 10k': {
        title: 'Doctors per 10k',
        unit: 'doctors',
        info: 'Healthcare professionals per 10,000 residents'
      },
      'Hospital Beds': {
        title: 'Hospital Beds',
        unit: 'beds',
        info: 'Total number of hospital beds'
      },
      Area: {
        title: 'Area',
        unit: 'km²',
        info: 'The total area of the province'
      }
    }
  }
];

// Helper function to get dataset config by name
export const getDatasetConfig = (name: string): GeoDatasetConfig | undefined => {
  return geoDataConfig.find(config => config.name === name);
};

// Helper function to get all dataset names for UI selector
export const getDatasetNames = (): string[] => {
  return geoDataConfig.map(config => config.name);
};

// Helper function to get color map for categorical data
export const getCategoricalColorMap = (): Record<string, string> => {
  return {
    good: '#4caf50', // green
    medium: '#ffeb3b', // yellow
    poor: '#ff9800', // orange
  };
};

// Helper function to get category labels for categorical data
export const getCategoricalLabels = (): Record<string, string> => {
  return {
    good: 'Good',
    medium: 'Medium', 
    poor: 'Poor'
  };
}; 