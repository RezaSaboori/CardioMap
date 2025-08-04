// src/components/GIS/utils/pointDataLegendUtils.ts

import { PointDataConfig } from '../../../config/pointDataConfig';
import { Point } from '../../../types';
import { LegendGroup, LegendGroupProps } from '../legends';

export interface PointDataLegendConfig {
  title: string;
  type: 'categorical';
  items: Array<{
    label: string;
    color: string;
    count: number;
  }>;
}

/**
 * Generates legend configuration for point data based on config and data
 * @param config - PointDataConfig object
 * @param data - Array of processed Point objects
 * @returns PointDataLegendConfig for legend display
 */
export const getPointDataLegendConfig = (
  config: PointDataConfig,
  data: Point[]
): PointDataLegendConfig => {
  // Count points by category
  const categoryCounts: Record<string, number> = {};
  data.forEach(point => {
    categoryCounts[point.category] = (categoryCounts[point.category] || 0) + 1;
  });

  // Create legend items from config categories
  const items = Object.entries(config.categoriesValues)
    .map(([categoryKey, [displayName, color]]) => ({
      label: displayName,
      color,
      count: categoryCounts[categoryKey] || 0
    }))
    .filter(item => item.count > 0); // Only show categories that have data

  return {
    title: config.name,
    type: 'categorical',
    items
  };
};

/**
 * Converts PointDataLegendConfig to LegendGroup format
 * @param legendConfig - PointDataLegendConfig object
 * @returns LegendGroup for use in Legend component
 */
export const convertToLegendGroup = (legendConfig: PointDataLegendConfig): LegendGroupProps => {
  return {
    title: legendConfig.title,
    legendProps: {
      colorMap: legendConfig.items.reduce((acc, item) => {
        acc[item.label] = item.color;
        return acc;
      }, {} as Record<string, string>),
      categoryLabels: legendConfig.items.reduce((acc, item) => {
        acc[item.label] = item.label;
        return acc;
      }, {} as Record<string, string>),
      showLegend: true
    }
  };
};

/**
 * Generates color map for point data based on config
 * @param config - PointDataConfig object
 * @returns Record<string, string> color map
 */
export const getPointDataColorMap = (config: PointDataConfig): Record<string, string> => {
  const colorMap: Record<string, string> = {};
  Object.entries(config.categoriesValues).forEach(([key, [_, color]]) => {
    colorMap[key] = color;
  });
  return colorMap;
};

/**
 * Generates category labels for point data based on config
 * @param config - PointDataConfig object
 * @returns Record<string, string> category labels
 */
export const getPointDataCategoryLabels = (config: PointDataConfig): Record<string, string> => {
  const labels: Record<string, string> = {};
  Object.entries(config.categoriesValues).forEach(([key, [label, _]]) => {
    labels[key] = label;
  });
  return labels;
}; 