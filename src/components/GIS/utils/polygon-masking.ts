import * as turf from '@turf/turf';



export const polygonToCssPolygon = (
  polygon: any,
  markerPosition: [number, number],
  markerSize: number,
  mapInstance: any
): string => {
  // Validate inputs
  if (!polygon || !markerPosition || !markerSize || !mapInstance) return '';
  
  // Extract coordinates based on geometry type
  let coords: any;
  
  if (polygon.geometry) {
    // Handle GeoJSON Feature
    const geometry = polygon.geometry;
    if (geometry.type === 'Polygon') {
      coords = geometry.coordinates?.[0];
    } else if (geometry.type === 'MultiPolygon') {
      coords = geometry.coordinates?.[0]?.[0];
    }
  } else if (polygon.coordinates) {
    // Handle raw geometry object
    if (Array.isArray(polygon.coordinates[0]?.[0]?.[0])) {
      coords = polygon.coordinates[0][0];
    } else {
      coords = polygon.coordinates[0];
    }
  }
  
  if (!coords || !Array.isArray(coords) || coords.length === 0) return '';

  // Get the marker's screen position
  const markerScreenPos = mapInstance.project(markerPosition);
  if (!markerScreenPos || typeof markerScreenPos.x !== 'number' || typeof markerScreenPos.y !== 'number') {
    return '';
  }

  // Convert coordinates to percentage-based polygon points
  const polygonPoints = coords
    .filter((coord: any) => {
      return Array.isArray(coord) && 
             coord.length >= 2 && 
             typeof coord[0] === 'number' && 
             typeof coord[1] === 'number';
    })
    .map((coord: [number, number]) => {
      try {
        const screenPos = mapInstance.project(coord);
        if (!screenPos || typeof screenPos.x !== 'number' || typeof screenPos.y !== 'number') {
          return null;
        }
        
        // Calculate relative to marker center
        const relativeX = screenPos.x - markerScreenPos.x;
        const relativeY = screenPos.y - markerScreenPos.y;
        
        // Convert from center-relative coordinates to CSS percentage coordinates
        // Since clip-path uses top-left as origin, we need to translate from center-based to top-left-based
        // But since both marker and container are centered, we need to adjust the calculation
        const percentX = ((relativeX / markerSize) + 0.5) * 100;
        const percentY = ((relativeY / markerSize) + 0.5) * 100;
        
        // Ensure coordinates are finite
        if (!isFinite(percentX) || !isFinite(percentY)) {
          return null;
        }
        
        return `${percentX.toFixed(1)}% ${percentY.toFixed(1)}%`;
      } catch (error) {
        console.warn('Error projecting coordinate:', coord, error);
        return null;
      }
    })
    .filter(Boolean);

  if (polygonPoints.length < 3) return '';
  
  return `polygon(${polygonPoints.join(', ')})`;
};

/**
 * Finds the most specific polygon(s) that contain a point in a hierarchical GeoJSON structure
 * @param point - [longitude, latitude] coordinates
 * @param geoJsonData - GeoJSON FeatureCollection or Feature
 * @returns Array of features that contain the point, ordered from most specific to least specific
 */
export const findContainingPolygons = (
  point: [number, number],
  geoJsonData: any
): any[] => {
  if (!geoJsonData || !point) return [];

  const pointGeom = turf.point(point);
  const containingPolygons: any[] = [];

  try {
    if (geoJsonData.type === 'FeatureCollection') {
      // Check each feature in the collection
      geoJsonData.features.forEach((feature: any) => {
        if (turf.booleanPointInPolygon(pointGeom, feature)) {
          containingPolygons.push(feature);
        }
      });
    } else if (geoJsonData.type === 'Feature') {
      // Single feature
      if (turf.booleanPointInPolygon(pointGeom, geoJsonData)) {
        containingPolygons.push(geoJsonData);
      }
    }
  } catch (error) {
    console.warn('Error finding containing polygons:', error);
  }

  return containingPolygons;
};

/**
 * Creates a unique clip path ID for a point and polygon combination
 * @param pointId - Unique identifier for the point
 * @param polygonIndex - Index of the polygon in the collection
 * @returns Unique clip path ID
 */
export const generateClipPathId = (pointId: string, polygonIndex: number): string => {
  return `clip-${pointId.replace(/[^a-zA-Z0-9]/g, '-')}-${polygonIndex}`;
};

/**
 * Determines if a point's visual representation should be clipped based on its size and containing polygons
 * @param point - Point coordinates [longitude, latitude]
 * @param markerSize - Size of the marker in pixels
 * @param geoJsonData - GeoJSON data for masking
 * @param mapInstance - Map instance for coordinate conversion
 * @returns Object containing clipping information
 */
export const getPointClippingInfo = (
  point: [number, number],
  markerSize: number,
  geoJsonData: any,
  mapInstance: any
): {
  shouldClip: boolean;
  clipPaths: string[];
  clipPathIds: string[];
  containingPolygons: any[];
} => {
  // Early return for missing dependencies
  if (!point || !markerSize || !geoJsonData || !mapInstance) {
    return { shouldClip: false, clipPaths: [], clipPathIds: [], containingPolygons: [] };
  }

  try {
    // Test if map projection is working
    const testProjection = mapInstance.project(point);
    if (!testProjection || typeof testProjection.x !== 'number' || typeof testProjection.y !== 'number') {
      return { shouldClip: false, clipPaths: [], clipPathIds: [], containingPolygons: [] };
    }
  } catch (error) {
    console.warn('Map projection failed during clipping info calculation:', error);
    return { shouldClip: false, clipPaths: [], clipPathIds: [], containingPolygons: [] };
  }

  const containingPolygons = findContainingPolygons(point, geoJsonData);
  
  if (containingPolygons.length === 0) {
    return { shouldClip: false, clipPaths: [], clipPathIds: [], containingPolygons: [] };
  }

  const clipPaths: string[] = [];
  const clipPathIds: string[] = [];

  containingPolygons.forEach((polygon, index) => {
    try {
      // Use CSS polygon format instead of SVG path
      const clipPath = polygonToCssPolygon(polygon, point, markerSize, mapInstance);
      
      // Validate clip path - check if it contains valid polygon data
      if (clipPath && clipPath.startsWith('polygon(') && clipPath.includes('%')) {
        clipPaths.push(clipPath);
        clipPathIds.push(generateClipPathId(`point-${point[0]}-${point[1]}`, index));
      }
    } catch (error) {
      console.warn('Error generating clip path for polygon:', error);
    }
  });

  return {
    shouldClip: clipPaths.length > 0,
    clipPaths,
    clipPathIds,
    containingPolygons
  };
};



 