// src/components/GIS/utils/pointDataCardUtils.ts

import { Point } from '../../../types';
import { PointDataConfig } from '../../../config/pointDataConfig';
import { CardData } from '../CardsGrid';

/**
 * Generates card data for a point based on its configuration
 * @param point - Point object with originalData
 * @param config - PointDataConfig object
 * @returns Array of CardData objects for display
 */
export const generatePointCardData = (
  point: Point,
  config: PointDataConfig
): CardData[] => {
  if (!point.originalData) {
    return [];
  }

  const cards: CardData[] = [];

  // Iterate through the card configuration
  Object.entries(config.cardConfig).forEach(([columnName, cardConfig]) => {
    const value = point.originalData?.[columnName];
    
    // Skip if value is null, undefined, or empty
    if (value === null || value === undefined || value === '') {
      return;
    }

    cards.push({
      title: cardConfig.title,
      value: value,
      unit: cardConfig.unit,
      info: cardConfig.info
    });
  });

  return cards;
};

/**
 * Generates a title for the point data card
 * @param point - Point object
 * @param config - PointDataConfig object
 * @returns String title for the card
 */
export const generatePointCardTitle = (
  point: Point,
  config: PointDataConfig
): string => {
  // Use the configured name column for the title
  if (point.originalData && point.originalData[config.nameColumn]) {
    return point.originalData[config.nameColumn];
  }
  
  // Fallback to the point name
  return point.name;
}; 