import * as turf from '@turf/turf';

/**
 * Calculates the centroid of a GeoJSON feature
 * @param feature - GeoJSON feature
 * @returns Centroid coordinates [longitude, latitude] or null if calculation fails
 */
export const getFeatureCentroid = (feature: any): [number, number] | null => {
  if (!feature || !feature.geometry) return null;

  try {
    const centroid = turf.centroid(feature);
    return centroid.geometry.coordinates as [number, number];
  } catch (error) {
    console.warn('Error calculating centroid:', error);
    return null;
  }
};

/**
 * Calculates the visual centroid for label positioning with bounds checking
 * @param feature - GeoJSON feature
 * @param mapInstance - Map instance for coordinate conversion
 * @param canvasWidth - Canvas width in pixels
 * @param canvasHeight - Canvas height in pixels
 * @param labelWidth - Estimated label width in pixels
 * @param labelHeight - Estimated label height in pixels
 * @returns Optimal position for label [longitude, latitude] or null if calculation fails
 */
export const getOptimalLabelPosition = (
  feature: any,
  mapInstance: any,
  canvasWidth: number,
  canvasHeight: number,
  labelWidth: number = 100,
  labelHeight: number = 30
): [number, number] | null => {
  if (!feature || !mapInstance) return null;

  try {
    // Get the bounding box of the feature
    const bbox = turf.bbox(feature);
    if (!bbox || bbox.length < 4) return null;

    // Calculate centroid for horizontal positioning
    const centroid = getFeatureCentroid(feature);
    if (!centroid) return null;

    // Use centroid's longitude but position above the region
    // bbox[3] is the maximum latitude (northernmost point)
    const aboveRegionLat = bbox[3]; // Top of the region
    const labelPosition: [number, number] = [centroid[0], aboveRegionLat];

    // Convert to screen coordinates for bounds checking
    const screenPos = mapInstance.project(labelPosition);
    if (!screenPos || typeof screenPos.x !== 'number' || typeof screenPos.y !== 'number') {
      return null;
    }

    // Calculate bounds for label positioning
    const halfWidth = labelWidth / 2;
    const halfHeight = labelHeight / 2;
    
    // Adjust position to keep label within bounds
    let adjustedX = screenPos.x;
    let adjustedY = screenPos.y - halfHeight - 15; // Position above the region with margin

    // Adjust X position to keep label within horizontal bounds with padding
    const horizontalPadding = 30; // Increased padding for larger font
    // Check left overflow first
    if (adjustedX - halfWidth < horizontalPadding) {
      adjustedX = halfWidth + horizontalPadding;
    } 
    // Then check right overflow
    else if (adjustedX + halfWidth > canvasWidth - horizontalPadding) {
      adjustedX = canvasWidth - halfWidth - horizontalPadding;
    }

    // Adjust Y position to keep label within vertical bounds with padding
    const verticalPadding = 35; // Increased padding for larger font height (50px)
    if (adjustedY - halfHeight < verticalPadding) {
      adjustedY = halfHeight + verticalPadding;
    } else if (adjustedY + halfHeight > canvasHeight - verticalPadding) {
      adjustedY = canvasHeight - halfHeight - verticalPadding;
    }

    // Convert back to geographic coordinates
    const adjustedGeoPos = mapInstance.unproject([adjustedX, adjustedY]);
    return [adjustedGeoPos.lng, adjustedGeoPos.lat];
  } catch (error) {
    console.warn('Error calculating optimal label position:', error);
    return null;
  }
};

/**
 * Calculates multiple label positions for a feature collection, avoiding overlaps
 * @param features - Array of GeoJSON features
 * @param mapInstance - Map instance for coordinate conversion
 * @param canvasWidth - Canvas width in pixels
 * @param canvasHeight - Canvas height in pixels
 * @param labelWidth - Estimated label width in pixels
 * @param labelHeight - Estimated label height in pixels
 * @returns Array of label positions with feature names
 */
export const calculateLabelPositions = (
  features: any[],
  mapInstance: any,
  canvasWidth: number,
  canvasHeight: number,
  labelWidth: number = 100,
  labelHeight: number = 30
): Array<{ position: [number, number]; name: string; feature: any }> => {
  if (!features || features.length === 0 || !mapInstance) return [];

  const labelPositions: Array<{ position: [number, number]; name: string; feature: any }> = [];
  const usedPositions: Array<{ x: number; y: number }> = [];

  features.forEach((feature) => {
    const position = getOptimalLabelPosition(feature, mapInstance, canvasWidth, canvasHeight, labelWidth, labelHeight);
    if (!position) return;

    // Get feature name
    let featureName = 'Unknown';
    if (feature.properties?.tags) {
      let tags = feature.properties.tags;
      if (typeof tags === 'string') {
        try {
          tags = JSON.parse(tags);
        } catch (e) {
          return;
        }
      }
      featureName = tags['name:fa'] || tags['name:en'] || 'Unknown';
    }

    // Convert to screen coordinates for overlap checking
    const screenPos = mapInstance.project(position);
    if (!screenPos || typeof screenPos.x !== 'number' || typeof screenPos.y !== 'number') {
      return;
    }

    // Check for overlaps with existing labels
    const hasOverlap = usedPositions.some(usedPos => {
      const distance = Math.sqrt(
        Math.pow(screenPos.x - usedPos.x, 2) + Math.pow(screenPos.y - usedPos.y, 2)
      );
      return distance < Math.max(labelWidth, labelHeight);
    });

    if (!hasOverlap) {
      labelPositions.push({ position, name: featureName, feature });
      usedPositions.push({ x: screenPos.x, y: screenPos.y });
    }
  });

  return labelPositions;
}; 