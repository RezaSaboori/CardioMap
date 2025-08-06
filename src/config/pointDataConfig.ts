// src/config/pointDataConfig.ts

// Import CSV files with Vite's URL handling
import ResearchCenterCsv from '../datasets/ResearchCenter.csv?url';
import { ColorCondition, DynamicColorConfig } from './geoDataConfig';

export interface PointDataCardConfig {
  [columnName: string]: {
    title: string;
    unit?: string;
    info?: string;
    colorCondition?: DynamicColorConfig; // Dynamic color configuration
  };
}

export interface PointDataConfig {
  name: string; // Display name for Legend Title and UI Selector
  csvPath: string; // Path to the CSV file
  idColumn?: string; // Column to use for unique IDs (optional, defaults to row index)
  nameColumn: string; // Column containing the name of the point for tooltips
  sizeColumn: string; // Column whose values determine the size of the point
  coordinates: [string, string]; // Array with latitude and longitude column names
  categoriesColumn: string; // Column that defines the category of the point
  categoriesValues: Record<string, [string, string]>; // csv_value: [display_name, hex_color]
  cardConfig: PointDataCardConfig; // Configuration for the information card/tooltip
}

export const POINT_DATA_CONFIGS: PointDataConfig[] = [
  {
    name: "مراکز پژوهشی",
    csvPath: ResearchCenterCsv,
    idColumn: "name:en", // Use English name as ID
    nameColumn: "name:fa", // Use Persian name for display
    sizeColumn: "SizeMetric",
    coordinates: ["Latitude", "Longitude"],
    categoriesColumn: "Category:en",
    categoriesValues: {
      "Hospital": ["بیمارستان", "#3182ce"], // Blue
      "Research Center": ["مرکز تحقیقاتی", "#fbbf24"], // Yellow
      "Research Facility": ["پژوهشکده", "#10b981"] // Green
    },
    cardConfig: {
      "name:en": {
        title: "Name (English)",
        info: "English name of the research center"
      },
      "name:fa": {
        title: "Name (Persian)",
        info: "Persian name of the research center"
      },
      "Category:en": {
        title: "Category",
        info: "Type of research facility",
        colorCondition: {
          defaultColor: '#ffffff',
          conditions: [
            {
              type: 'category',
              value: 'Hospital',
              color: '#3182ce' // Blue for hospitals
            },
            {
              type: 'category',
              value: 'Research Center',
              color: '#fbbf24' // Yellow for research centers
            },
            {
              type: 'category',
              value: 'Research Facility',
              color: '#10b981' // Green for research facilities
            }
          ]
        }
      },
      "Category:fa": {
        title: "Category (Persian)",
        info: "Type of research facility in Persian"
      },
      "Province": {
        title: "Province",
        info: "Province where the facility is located"
      },
      "City": {
        title: "City",
        info: "City where the facility is located"
      },
      "SizeMetric": {
        title: "Size Metric",
        unit: "units",
        info: "Relative size or capacity metric",
        colorCondition: {
          defaultColor: '#ffffff',
          conditions: [
            {
              type: 'threshold',
              value: 50,
              color: '#ff6b6b', // Red for small facilities
              condition: (value) => value < 50
            },
            {
              type: 'threshold',
              value: 100,
              color: '#ffd93d', // Yellow for medium facilities
              condition: (value) => value >= 50 && value < 100
            },
            {
              type: 'threshold',
              value: 100,
              color: '#6bcf7f', // Green for large facilities
              condition: (value) => value >= 100
            }
          ]
        }
      },
      "Phone": {
        title: "Phone",
        info: "Contact phone number"
      },
      "URL": {
        title: "Website",
        info: "Official website URL"
      },
      "Address": {
        title: "Address",
        info: "Physical address of the facility"
      }
    }
  }
  // Add more point data configurations here as needed
];

// Helper function to get point data config by name
export const getPointDataConfig = (name: string): PointDataConfig | undefined => {
  return POINT_DATA_CONFIGS.find(config => config.name === name);
};

// Helper function to get all point data config names for UI selector
export const getPointDataConfigNames = (): string[] => {
  return POINT_DATA_CONFIGS.map(config => config.name);
};

// Helper function to get color map for a specific point data config
export const getPointDataColorMap = (config: PointDataConfig): Record<string, string> => {
  const colorMap: Record<string, string> = {};
  Object.entries(config.categoriesValues).forEach(([key, [_, color]]) => {
    colorMap[key] = color;
  });
  return colorMap;
};

// Helper function to get category labels for a specific point data config
export const getPointDataCategoryLabels = (config: PointDataConfig): Record<string, string> => {
  const labels: Record<string, string> = {};
  Object.entries(config.categoriesValues).forEach(([key, [label, _]]) => {
    labels[key] = label;
  });
  return labels;
}; 