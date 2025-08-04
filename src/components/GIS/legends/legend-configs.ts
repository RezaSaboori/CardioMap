import { ColorMap } from '../../../types';
import { GeoDatasetConfig } from '../../../config/geoDataConfig';
import { DatasetData } from '../GeoData/dataLoader';

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

// New function to generate legend config from dataset configuration
export const getDatasetLegendConfig = (
  config: GeoDatasetConfig,
  datasetData: DatasetData,
  colorPalette: any
) => {
  if (config.type === 'numeric') {
    return {
      title: config.name,
      legendProps: {
        showLegend: true,
        gradient: generateGradientFromConfig(config, datasetData),
        gradientLabels: { 
          left: datasetData.minValue?.toString() || '0', 
          right: datasetData.maxValue?.toString() || '100' 
        },
      }
    };
  } else if (config.type === 'categorical') {
    const colorMap = config.colorMap || getCategoricalColorMap();
    const categoryLabels = getCategoricalLabels();
    
    return {
      title: config.name,
      legendProps: {
        showLegend: true,
        colorMap,
        categoryLabels,
      }
    };
  }
  
  return undefined;
};

// Helper function to generate gradient from config
const generateGradientFromConfig = (config: GeoDatasetConfig, datasetData: DatasetData) => {
  if (!config.colorGradients || datasetData.minValue === undefined || datasetData.maxValue === undefined) {
    console.warn('Falling back to population gradient due to missing config:', { 
      hasColorGradients: !!config.colorGradients, 
      minValue: datasetData.minValue, 
      maxValue: datasetData.maxValue 
    });
    return populationGradient; // fallback
  }
  
  const [color1, color2, color3] = config.colorGradients;
  const range = datasetData.maxValue - datasetData.minValue;
  
  console.log('Generating gradient from config:', { color1, color2, color3, minValue: datasetData.minValue, maxValue: datasetData.maxValue });
  
  return [
    { value: datasetData.minValue, color: color1 },
    { value: datasetData.minValue + range * 0.5, color: color2 },
    { value: datasetData.maxValue, color: color3 },
  ];
};

// Helper function to get categorical color map
const getCategoricalColorMap = (): Record<string, string> => {
  return {
    good: '#4caf50', // green
    medium: '#ffeb3b', // yellow
    poor: '#ff9800', // orange
  };
};

// Helper function to get categorical labels
const getCategoricalLabels = (): Record<string, string> => {
  return {
    good: 'Good',
    medium: 'Medium', 
    poor: 'Poor'
  };
};

// Helper function to get geodata legend configuration (legacy support)
export const getGeodataLegendConfig = (
  selectedGeodata: string,
  colorPalette: any,
  continuousSchemes?: Array<{ column: string; gradient: Array<{ value: number; color: string }> }>
) => {
  if (selectedGeodata === 'nothing' || !continuousSchemes || continuousSchemes.length === 0) {
    return undefined;
  }

  // Find the matching continuous scheme for the selected geodata
  const matchingScheme = continuousSchemes.find(scheme => scheme.column === selectedGeodata);
  if (!matchingScheme) {
    return undefined;
  }

  return {
    title: selectedGeodata.charAt(0).toUpperCase() + selectedGeodata.slice(1), // Capitalize first letter
    legendProps: {
      showLegend: true,
      gradient: matchingScheme.gradient,
      gradientLabels: populationGradientLabels,
    }
  };
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
    return undefined;
  }

  // Get unique categories from actual data
  const uniqueCategories = [...new Set(points.map(point => point.category))];
  
  // Filter color map to only include categories that exist in the data
  const filteredColorMap: ColorMap = {};
  const filteredCategoryLabels: { [key: string]: string } = {};
  
  uniqueCategories.forEach(category => {
    if (colorMap[category]) {
      filteredColorMap[category] = colorMap[category];
      filteredCategoryLabels[category] = categoryLabels[category] || category;
    }
  });

  // Return undefined if no valid categories found
  if (Object.keys(filteredColorMap).length === 0) {
    return undefined;
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

// Helper function to dynamically generate flow legend configuration based on actual data
export const getDynamicFlowLegendConfig = (
  flows: any[],
  colorMap: ColorMap,
  categoryLabels: { [key: string]: string } = {},
  datasetName: string = 'Flow Data'
) => {
  if (!flows || flows.length === 0) {
    return undefined;
  }

  // Get unique categories from actual data
  const uniqueCategories = [...new Set(flows.map(flow => flow.category))];
  
  // Filter color map to only include categories that exist in the data
  const filteredColorMap: ColorMap = {};
  const filteredCategoryLabels: { [key: string]: string } = {};
  
  uniqueCategories.forEach(category => {
    if (colorMap[category]) {
      filteredColorMap[category] = colorMap[category];
      filteredCategoryLabels[category] = categoryLabels[category] || category;
    }
  });

  // Return undefined if no valid categories found
  if (Object.keys(filteredColorMap).length === 0) {
    return undefined;
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