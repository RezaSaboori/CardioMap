import { ColorMap } from '../../../types';

// Health Status Color Configuration
export const healthStatusColorMap: ColorMap = {
  good: '#4caf50', // green
  medium: '#ffeb3b', // yellow
  poor: '#ff9800', // orange
};

export const healthStatusLabels: { [key: string]: string } = {
  good: 'Good',
  medium: 'Medium', 
  poor: 'Poor'
};

// Population Gradient Configuration
export const populationGradient = [
  { value: 0, color: '#e0f3f8' },
  { value: 1000000, color: '#abd9e9' },
  { value: 3000000, color: '#74add1' },
  { value: 14000000, color: '#4575b4' },
  { value: 85000000, color: '#313695' },
];

export const populationGradientLabels = { left: 'Low', right: 'High' };

// Categorical Schemes Configuration
export const categoricalSchemes = [
  {
    column: 'health_status',
    colorMap: healthStatusColorMap,
  },
];

// Continuous Schemes Configuration  
export const continuousSchemes = [
  {
    column: 'pop',
    gradient: populationGradient,
  },
];

// Default Colors for Maps
export const getDefaultColors = (colorPalette: any) => ({
  light: colorPalette.mapForeground,
  dark: colorPalette.mapForeground,
});

// Helper function to get geodata legend configuration
export const getGeodataLegendConfig = (
  selectedGeodata: 'pop' | 'health_status' | 'nothing',
  colorPalette: any
) => {
  if (selectedGeodata === 'health_status') {
    return {
      title: 'Health Status',
      legendProps: {
        showLegend: true,
        colorMap: categoricalSchemes[0].colorMap,
        categoryLabels: healthStatusLabels,
      }
    };
  }
  
  if (selectedGeodata === 'pop') {
    return {
      title: 'Population',
      legendProps: {
        showLegend: true,
        gradient: continuousSchemes[0].gradient,
        gradientLabels: populationGradientLabels,
      }
    };
  }
  
  return undefined;
};

// Helper function to get research centers legend configuration
export const getResearchCentersLegendConfig = (
  colorMap: ColorMap,
  categoryLabels: { [key: string]: string }
) => {
  return {
    title: 'Research Centers',
    legendProps: {
      colorMap,
      categoryLabels,
      showLegend: true
    }
  };
};

// Helper function to dynamically generate research centers legend configuration based on actual data
export const getDynamicResearchCentersLegendConfig = (
  points: any[],
  colorMap: ColorMap,
  categoryLabels: { [key: string]: string } = {}
) => {
  if (!points || points.length === 0) {
    return null;
  }

  // Extract unique categories from the research centers data
  const uniqueCategories = [...new Set(points.map(point => point.category))];
  
  // Create a filtered color map that only includes categories present in the data
  const filteredColorMap: ColorMap = {};
  const filteredCategoryLabels: { [key: string]: string } = {};
  
  uniqueCategories.forEach(category => {
    if (colorMap[category]) {
      filteredColorMap[category] = colorMap[category];
      filteredCategoryLabels[category] = categoryLabels[category] || category;
    }
  });

  // If no valid categories found, return null
  if (Object.keys(filteredColorMap).length === 0) {
    return null;
  }

  return {
    title: 'Research Centers',
    legendProps: {
      colorMap: filteredColorMap,
      categoryLabels: filteredCategoryLabels,
      showLegend: true
    }
  };
};

// Flow Data Color Configuration
export const flowDataColorMap: ColorMap = {
  type1: '#ff6b6b',
  type2: '#4ecdc4', 
  type3: '#45b7d1'
};

export const flowDataLabels: { [key: string]: string } = {
  type1: 'Type 1',
  type2: 'Type 2',
  type3: 'Type 3'
};

// Helper function to get flow data legend configuration
export const getFlowDataLegendConfig = (
  colorMap: ColorMap,
  categoryLabels: { [key: string]: string }
) => {
  return {
    title: 'Flow Data',
    legendProps: {
      colorMap,
      categoryLabels,
      showLegend: true
    }
  };
};

// Helper function to dynamically generate flow legend configuration based on actual flow data
export const getDynamicFlowLegendConfig = (
  flows: any[],
  colorMap: ColorMap,
  categoryLabels: { [key: string]: string } = {},
  datasetName: string = 'Flow Data'
) => {
  if (!flows || flows.length === 0) {
    return null;
  }

  // Extract unique categories from the flow data
  const uniqueCategories = [...new Set(flows.map(flow => flow.category))];
  
  // Create a filtered color map that only includes categories present in the data
  const filteredColorMap: ColorMap = {};
  const filteredCategoryLabels: { [key: string]: string } = {};
  
  uniqueCategories.forEach(category => {
    if (colorMap[category]) {
      filteredColorMap[category] = colorMap[category];
      filteredCategoryLabels[category] = categoryLabels[category] || category;
    }
  });

  // If no valid categories found, return null
  if (Object.keys(filteredColorMap).length === 0) {
    return null;
  }

  return {
    title: datasetName,
    legendProps: {
      colorMap: filteredColorMap,
      categoryLabels: filteredCategoryLabels,
      showLegend: true
    }
  };
}; 