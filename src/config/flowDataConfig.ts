// src/config/flowDataConfig.ts

// Import CSV files with Vite's URL handling
import DeseasePathCsv from '../datasets/DeseasePath.csv?url';

export interface FlowDataCardConfig {
  [columnName: string]: {
    title: string;
    unit?: string;
    info?: string;
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
    name: "Disease Path",
    csvPath: DeseasePathCsv,
    startColumn: "Origin",
    endColumn: "Destination",
    sizeColumn: "pop",
    categoriesColumn: "Disease",
    categoriesValues: {
      "type1": ["Diabetes", "#7209b7"],
      "type2": ["CVD", "#4361ee"],
      "type3": ["Heart Failure", "#fdc500"]
    },
    cardConfig: {
      "Disease": {
        title: "Past Medical History",
        info: "Previous Disease"
      },
      "pop": {
        title: "Size",
        unit: "People",
        info: "Number of People"
      }
    }
  }
  // Add more flow data configurations here as needed
];

// Helper function to get flow data config by name
export const getFlowDataConfig = (name: string): FlowDataConfig | undefined => {
  return FLOW_DATA_CONFIGS.find(config => config.name === name);
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