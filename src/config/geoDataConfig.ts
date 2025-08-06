// src/config/geoDataConfig.ts

// Import CSV files with Vite's URL handling
import IranProvincesSampleCsv from '../datasets/IranProvincesSample.csv?url';

export interface ColorCondition {
  type: 'threshold' | 'range' | 'category';
  value?: number | string;
  minValue?: number;
  maxValue?: number;
  color: string;
  condition?: (value: any, data: any) => boolean; // Custom condition function
}

export interface DynamicColorConfig {
  defaultColor: string;
  conditions: ColorCondition[];
}

export interface CardConfig {
  [columnName: string]: {
    title: string;
    unit?: string;
    info?: string;
    colorCondition?: DynamicColorConfig; // Dynamic color configuration
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
    name: 'جمعیت',
    type: 'numeric',
    csvPath: IranProvincesSampleCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'name',
    dataColumn: 'pop',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      pop: {
        title: 'Population',
        unit: 'people',
        info: 'Total population of the province',
        colorCondition: {
          defaultColor: '#ffffff',
          conditions: [
            {
              type: 'threshold',
              value: 1000000,
              color: '#ff6b6b', // Red for high population
              condition: (value) => value > 1000000
            },
            {
              type: 'threshold',
              value: 500000,
              color: '#4ecdc4', // Teal for medium population
              condition: (value) => value > 500000 && value <= 1000000
            }
          ]
        }
      },
      Area: {
        title: 'Area',
        unit: 'km²',
        info: 'The total area of the province'
      }
    }
  },
  {
    name: 'وضعیت سلامت',
    type: 'categorical',
    csvPath: IranProvincesSampleCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
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
        info: 'Overall health status of the province',
        colorCondition: {
          defaultColor: '#ffffff',
          conditions: [
            {
              type: 'category',
              value: 'poor',
              color: '#ff6b6b' // Red for poor health
            },
            {
              type: 'category',
              value: 'medium',
              color: '#ffd93d' // Yellow for medium health
            },
            {
              type: 'category',
              value: 'good',
              color: '#6bcf7f' // Green for good health
            }
          ]
        }
      },
      'Doctors per 10k': {
        title: 'Doctors per 10k',
        unit: 'doctors',
        info: 'Healthcare professionals per 10,000 residents',
        colorCondition: {
          defaultColor: '#ffffff',
          conditions: [
            {
              type: 'threshold',
              value: 10,
              color: '#ff6b6b', // Red for low doctor ratio
              condition: (value) => value < 10
            },
            {
              type: 'threshold',
              value: 20,
              color: '#4ecdc4', // Teal for medium doctor ratio
              condition: (value) => value >= 10 && value < 20
            },
            {
              type: 'threshold',
              value: 20,
              color: '#6bcf7f', // Green for high doctor ratio
              condition: (value) => value >= 20
            }
          ]
        }
      },
      'Hospital Beds': {
        title: 'Hospital Beds',
        unit: 'beds',
        info: 'Total number of hospital beds',
        colorCondition: {
          defaultColor: '#ffffff',
          conditions: [
            {
              type: 'threshold',
              value: 1000,
              color: '#ff6b6b', // Red for low bed count
              condition: (value) => value < 1000
            },
            {
              type: 'threshold',
              value: 3000,
              color: '#ffd93d', // Yellow for medium bed count
              condition: (value) => value >= 1000 && value < 3000
            },
            {
              type: 'threshold',
              value: 3000,
              color: '#6bcf7f', // Green for high bed count
              condition: (value) => value >= 3000
            }
          ]
        }
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