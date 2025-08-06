// src/config/flowDataConfig.ts

// Import CSV files with Vite's URL handling
import DeseasePathCsv from '../datasets/DeseasePath.csv?url';
import PatientFlowCsv from '../datasets/PatientFlow.csv?url';
import { ColorCondition, DynamicColorConfig } from './geoDataConfig';

export interface FlowDataCardConfig {
  [columnName: string]: {
    title: string;
    unit?: string;
    info?: string;
    colorCondition?: DynamicColorConfig; // Dynamic color configuration
  };
}

export interface FlowDataConfig {
  name: string; // Display name for Legend Title and UI Selector
  csvPath: string; // Path to the CSV file
  idColumn?: string; // Column to use for unique IDs (optional, defaults to row index)
  startColumn: string; // Column containing origin coordinates
  endColumn: string; // Column containing destination coordinates
  sizeColumn: string; // Column whose values determine the size of the flow
  categoriesColumn: string; // Column that defines the category of the flow
  categoriesValues: Record<string, [string, string]>; // csv_value: [display_name, hex_color]
  cardConfig: FlowDataCardConfig; // Configuration for the information card/tooltip
}

export const FLOW_DATA_CONFIGS: FlowDataConfig[] = [
  {
    name: "مسیر بیماران",
    csvPath: DeseasePathCsv,
    startColumn: "Origin",
    endColumn: "Destination",
    sizeColumn: "pop",
    categoriesColumn: "Disease",
    categoriesValues: {
      "type1": ["دیابت", "#7209b7"],
      "type2": ["قلبی عروقی", "#4361ee"],
      "type3": ["عفونی", "#fdc500"]
    },
    cardConfig: {
      "Disease": {
        title: "Past Medical History",
        info: "Previous Disease",
        colorCondition: {
          defaultColor: '#ffffff',
          conditions: [
            {
              type: 'category',
              value: 'type1',
              color: '#7209b7' // Purple for diabetes
            },
            {
              type: 'category',
              value: 'type2',
              color: '#4361ee' // Blue for cardiovascular
            },
            {
              type: 'category',
              value: 'type3',
              color: '#fdc500' // Yellow for infectious
            }
          ]
        }
      },
      "pop": {
        title: "Size",
        unit: "People",
        info: "Number of People",
        colorCondition: {
          defaultColor: '#ffffff',
          conditions: [
            {
              type: 'threshold',
              value: 100,
              color: '#ff6b6b', // Red for high patient count
              condition: (value) => value > 100
            },
            {
              type: 'threshold',
              value: 50,
              color: '#ffd93d', // Yellow for medium patient count
              condition: (value) => value > 50 && value <= 100
            },
            {
              type: 'threshold',
              value: 50,
              color: '#6bcf7f', // Green for low patient count
              condition: (value) => value <= 50
            }
          ]
        }
      }
    }
  }
  // Add more flow data configurations here as needed
];

// Helper function to get flow data config by name
export const getFlowDataConfig = (name: string): FlowDataConfig | undefined => {
  return FLOW_DATA_CONFIGS.find(config => config.name === name);
};

// Helper function to get flow data config by flowdata: prefixed name
export const getFlowDataConfigByPrefixedName = (prefixedName: string): FlowDataConfig | undefined => {
  if (!prefixedName.startsWith('flowdata:')) {
    return undefined;
  }
  const name = prefixedName.replace('flowdata:', '');
  return getFlowDataConfig(name);
};

// Helper function to get all flow data config names for UI selector
export const getFlowDataConfigNames = (): string[] => {
  return FLOW_DATA_CONFIGS.map(config => config.name);
};

// Helper function to get color map for a specific flow data config
export const getFlowDataColorMap = (config: FlowDataConfig): Record<string, string> => {
  const colorMap: Record<string, string> = {};
  Object.entries(config.categoriesValues).forEach(([key, [_, color]]) => {
    colorMap[key] = color;
  });
  return colorMap;
};

// Helper function to get category labels for a specific flow data config
export const getFlowDataCategoryLabels = (config: FlowDataConfig): Record<string, string> => {
  const labels: Record<string, string> = {};
  Object.entries(config.categoriesValues).forEach(([key, [label, _]]) => {
    labels[key] = label;
  });
  return labels;
}; 