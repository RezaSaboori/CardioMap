import React, { useMemo, useEffect, useState, useContext } from 'react';
import { Marker } from 'react-map-gl/maplibre';
import { MapContext } from './geo-json-map.tsx';
import { calculateLabelPositions } from './utils/centroid-utils';
import { getTheme, spacingToPx } from './utils/theme';
import './region-labels.css';

interface RegionLabelsProps {
  geoJsonData: any;
  isMapLoaded: boolean;
  zoom: number;
  hoverFeature?: any;
}

const RegionLabels: React.FC<RegionLabelsProps> = ({
  geoJsonData,
  isMapLoaded,
  zoom,
  hoverFeature
}) => {
  const { mapRef } = useContext(MapContext);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Update canvas size
  useEffect(() => {
    if (!mapRef?.current) return;

    const updateCanvasSize = () => {
      const map = mapRef.current?.getMap();
      if (map) {
        const canvas = map.getCanvas();
        setCanvasSize({
          width: canvas.width,
          height: canvas.height
        });
      }
    };

    const map = mapRef.current.getMap();
    map.on('resize', updateCanvasSize);
    updateCanvasSize();

    return () => {
      map.off('resize', updateCanvasSize);
    };
  }, [mapRef]);

  // Calculate label position for hovered feature only
  const labelInfo = useMemo(() => {
    if (!hoverFeature || !isMapLoaded || !mapRef?.current || canvasSize.width === 0 || zoom < 4) {
      return null;
    }

    const mapInstance = mapRef.current.getMap();
    
    // Get feature name to estimate actual label width
    let featureName = 'Unknown';
    if (hoverFeature.properties?.tags) {
      let tags = hoverFeature.properties.tags;
      if (typeof tags === 'string') {
        try {
          tags = JSON.parse(tags);
        } catch (e) {
          // ignore
        }
      }
      featureName = tags['name:fa'] || tags['name:en'] || 'Unknown';
    }

    // Get theme variables for consistent sizing
    const theme = getTheme();
    const fontSize = spacingToPx(theme.fontSize3xl || '34px'); // Use theme font size
    const padding = spacingToPx(theme.spacingSm || '8px'); // Use theme spacing for padding
    
    // Estimate actual label dimensions based on text length and theme font size
    const labelWidth = Math.max(150, featureName.length * fontSize * 0.6);
    const labelHeight = fontSize + (padding * 2) + 10; // Font size + padding + extra space

    const positions = calculateLabelPositions(
      [hoverFeature],
      mapInstance,
      canvasSize.width,
      canvasSize.height,
      labelWidth,
      labelHeight
    );

    return positions.length > 0 ? positions[0] : null;
  }, [hoverFeature, isMapLoaded, mapRef, canvasSize, zoom]);

  // Don't render labels if zoom is too low or no hovered feature
  if (zoom < 4 || !labelInfo) {
    return null;
  }

  const [longitude, latitude] = labelInfo.position;
  
  return (
    <Marker
      key={`region-label-hover`}
      longitude={longitude}
      latitude={latitude}
      anchor="center"
    >
      <div className="region-label region-label-hovered">
        <div className="region-label-content">
          {hoverFeature.properties?.tags && (() => {
            let tags = hoverFeature.properties.tags;
            if (typeof tags === 'string') {
              try {
                tags = JSON.parse(tags);
              } catch (e) {
                // ignore
              }
            }
            return tags['name:fa'] || tags['name:en'] || 'Unknown';
          })()}
        </div>
      </div>
    </Marker>
  );
};

export default RegionLabels; 