// src/components/GIS/utils/flowDataCardUtils.ts

import { FlowData } from '../FlowData';
import { FlowDataConfig } from '../../../config/flowDataConfig';
import { CardData } from '../CardsGrid';

/**
 * Generates card data for a flow based on its configuration
 * @param flow - FlowData object with originalData
 * @param config - FlowDataConfig object
 * @returns Array of CardData objects for display
 */
export const generateFlowCardData = (
  flow: FlowData,
  config: FlowDataConfig
): CardData[] => {
  if (!flow.originalData) {
    return [];
  }

  const cards: CardData[] = [];

  // Iterate through the card configuration
  Object.entries(config.cardConfig).forEach(([columnName, cardConfig]) => {
    const value = flow.originalData?.[columnName];
    
    // Skip if value is null, undefined, or empty
    if (value === null || value === undefined || value === '') {
      return;
    }

    // Check if this is a categories column and we have a mapping for it
    let displayValue = value;
    if (columnName === config.categoriesColumn && config.categoriesValues[value]) {
      // Use the display name from categoriesValues
      displayValue = config.categoriesValues[value][0];
    }

    cards.push({
      title: cardConfig.title,
      value: displayValue,
      unit: cardConfig.unit,
      info: cardConfig.info,
      colorCondition: cardConfig.colorCondition // Include dynamic color configuration
    });
  });

  return cards;
};

/**
 * Generates a title for the flow data card
 * @param flow - FlowData object
 * @param config - FlowDataConfig object
 * @returns String title for the card
 */
export const generateFlowCardTitle = (
  flow: FlowData,
  config: FlowDataConfig
): string => {
  // Use the flow name or category as the title
  return flow.name || flow.category || config.name;
}; 