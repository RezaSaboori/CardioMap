import React, { useMemo, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { Marker, Source, Layer } from 'react-map-gl/maplibre';
import { FlowData, FlowLayerProps } from '../../types';
import { MapContext } from '../GeoJson/GeoJsonMap';
import { getColorPalette } from '../utils/theme';
import './flow-layer.css';

interface AnimatedParticle {
  id: string;
  flowId: string;
  progress: number;
  speed: number;
}

interface TooltipState {
  visible: boolean;
  content: string;
  x: number;
  y: number;
}

// Memoized size normalization to avoid recalculating on every render
const createSizeNormalizer = (flows: FlowData[], minSize: number, maxSize: number) => {
  const min = Math.min(...flows.map(f => f.sizeValue));
  const max = Math.max(...flows.map(f => f.sizeValue));
  const range = max - min;
  
  if (range === 0) return () => (minSize + maxSize) / 2;
  
  return (sizeValue: number): number => {
    const normalized = ((sizeValue - min) / range) * (maxSize - minSize) + minSize;
    return Math.max(minSize, Math.min(maxSize, normalized));
  };
};

// Pre-calculated curve points for better performance
const createCurvePoints = (origin: [number, number], destination: [number, number]): [number, number][] => {
  const [originLon, originLat] = origin;
  const [destLon, destLat] = destination;
  
  // Calculate midpoint
  const midLon = (originLon + destLon) / 2;
  const midLat = (originLat + destLat) / 2;
  
  // Calculate distance for curve intensity
  const dx = destLon - originLon;
  const dy = destLat - originLat;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Create a subtle curve by offsetting the midpoint perpendicular to the line
  const curveIntensity = distance * 0.15;
  const perpendicularAngle = Math.atan2(dy, dx) + Math.PI / 2;
  const curveOffsetLon = Math.cos(perpendicularAngle) * curveIntensity;
  const curveOffsetLat = Math.sin(perpendicularAngle) * curveIntensity;
  
  // Create curved path with control point
  const controlLon = midLon + curveOffsetLon;
  const controlLat = midLat + curveOffsetLat;
  
  // Generate points along the curve (approximate quadratic bezier)
  const curvePoints: [number, number][] = [];
  const steps = 20; // Number of points to generate along the curve
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Quadratic Bezier curve formula
    const x = Math.pow(1 - t, 2) * originLon + 
             2 * (1 - t) * t * controlLon + 
             Math.pow(t, 2) * destLon;
    const y = Math.pow(1 - t, 2) * originLat + 
             2 * (1 - t) * t * controlLat + 
             Math.pow(t, 2) * destLat;
    curvePoints.push([x, y]);
  }
  
  return curvePoints;
};

const FlowLayer: React.FC<FlowLayerProps> = ({ 
  flows = [], 
  colorMap, 
  onFlowClick, 
  categoryLabels = {},
  minSize = 2,
  maxSize = 12,
  enableAnimation = true,
  nameColumn = 'Disease'
}) => {
  const { mapRef } = useContext(MapContext);
  const animationRef = useRef<number | undefined>(undefined);
  const [particles, setParticles] = useState<AnimatedParticle[]>([]);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    content: '',
    x: 0,
    y: 0
  });
  
  // Performance optimization flags
  const PERFORMANCE_OPTIMIZATIONS = {
    MAX_PARTICLES: 50, // Limit number of animated particles
    REDUCE_CURVE_POINTS: flows.length > 100, // Reduce curve complexity for large datasets
    SIMPLIFIED_GLOW: flows.length > 50, // Use simplified glow effects for large datasets
    BATCH_UPDATES: true, // Batch particle updates
    // Enable optimizations for better performance even with small datasets
    ENABLE_OPTIMIZATIONS: true
  };
  
  // Get fallback colors
  const colorPalette = getColorPalette();
  const fallbackColor = colorPalette.secondary || '#888888';
  
  // Memoized size normalizer
  const normalizeSize = useMemo(() => 
    createSizeNormalizer(flows, minSize, maxSize), 
    [flows, minSize, maxSize]
  );
  
  // Pre-calculate curve points for all flows with performance optimization
  const flowCurvePoints = useMemo(() => {
    const steps = PERFORMANCE_OPTIMIZATIONS.ENABLE_OPTIMIZATIONS ? 10 : 20;
    return flows.map(flow => {
      const curvePoints = createCurvePoints(flow.origin, flow.destination);
      // Reduce points if performance optimization is enabled
      if (PERFORMANCE_OPTIMIZATIONS.ENABLE_OPTIMIZATIONS) {
        return curvePoints.filter((_, index) => index % 2 === 0);
      }
      return curvePoints;
    });
  }, [flows]);
  
  // Initialize particles for each flow with performance limits
  useEffect(() => {
    if (!enableAnimation) {
      setParticles([]);
      return;
    }

    const newParticles: AnimatedParticle[] = [];
    const maxParticles = Math.min(flows.length, PERFORMANCE_OPTIMIZATIONS.MAX_PARTICLES);
    
    flows.slice(0, maxParticles).forEach((flow, flowIndex) => {
      // Create only one particle per flow (limited by performance)
      newParticles.push({
        id: `particle-${flowIndex}`,
        flowId: flow.id,
        progress: Math.random(), // Random starting position
        speed: 0.5 // All particles have the same speed
      });
    });
    setParticles(newParticles);
  }, [flows, enableAnimation]);

  // Optimized animation loop with performance monitoring
  useEffect(() => {
    if (!enableAnimation) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const animate = (currentTime: number) => {
      // Update particle positions with reduced precision for better performance
      setParticles(prevParticles => 
        prevParticles.map(particle => ({
          ...particle,
          progress: (particle.progress + particle.speed * 0.01) % 1
        }))
      );
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enableAnimation, particles.length]);

  // Optimized point calculation using pre-calculated curve points
  const getPointAlongCurve = useCallback((curvePoints: [number, number][], t: number): [number, number] => {
    const index = Math.floor(t * (curvePoints.length - 1));
    const nextIndex = Math.min(index + 1, curvePoints.length - 1);
    const localT = (t * (curvePoints.length - 1)) - index;
    
    const [x1, y1] = curvePoints[index];
    const [x2, y2] = curvePoints[nextIndex];
    
    return [x1 + (x2 - x1) * localT, y1 + (y2 - y1) * localT];
  }, []);

  // Generate unique ID for each flow
  const generateFlowId = useCallback((flow: FlowData): string => {
    return `flow-${flow.id}-${flow.origin[0]}-${flow.origin[1]}-${flow.destination[0]}-${flow.destination[1]}`;
  }, []);

  // Get display name from flow data
  const getDisplayName = useCallback((flow: FlowData): string => {
    // Try to get the value from the specified column
    const columnValue = (flow as any)[nameColumn];
    if (columnValue) {
      return String(columnValue);
    }
    // Fallback to flow.name
    if (flow.name) {
      return String(flow.name);
    }
    // Final fallback
    return `Flow ${flow.id}`;
  }, [nameColumn]);

  // Create GeoJSON data for the flow lines with curved paths
  const flowLinesGeoJSON = useMemo(() => {
    if (flows.length === 0) return null;
    
    return {
      type: 'FeatureCollection' as const,
      features: flows.map((flow, index) => {
        const curvePoints = flowCurvePoints[index];
        
        return {
          type: 'Feature' as const,
          id: `flow-${index}`,
          properties: {
            category: flow.category,
            sizeValue: flow.sizeValue,
            name: flow.name,
            flowId: flow.id,
            displayName: getDisplayName(flow)
          },
          geometry: {
            type: 'LineString' as const,
            coordinates: curvePoints
          }
        };
      })
    };
  }, [flows, flowCurvePoints, getDisplayName]);

  // Handle flow hover
  const handleFlowHover = useCallback((event: any) => {
    if (event.features && event.features.length > 0) {
      const feature = event.features[0];
      const displayName = feature.properties?.displayName || feature.properties?.name || 'Unknown Flow';
      
      // Convert map coordinates to screen coordinates
      const point = mapRef?.current?.project([event.lngLat.lng, event.lngLat.lat]);
      if (point) {
        setTooltip({ 
          visible: true, 
          content: displayName, 
          x: point.x, 
          y: point.y 
        });
      }
      
      // Don't call onFlowHover to avoid triggering global popup
      // if (onFlowHover) {
      //   onFlowHover({
      //     longitude: event.lngLat.lng,
      //     latitude: event.lngLat.lat,
      //     featureName: displayName
      //   });
      // }
    }
  }, [mapRef]);

  // Handle flow leave
  const handleFlowLeave = useCallback(() => {
    setTooltip({ visible: false, content: '', x: 0, y: 0 });
    // Don't call onFlowHover to avoid triggering global popup
    // if (onFlowHover) {
    //   onFlowHover(null);
    // }
  }, []);

  // Handle marker hover
  const handleMarkerHover = useCallback((displayName: string, event: React.MouseEvent) => {
    setTooltip({ 
      visible: true, 
      content: displayName, 
      x: event.clientX, 
      y: event.clientY 
    });
  }, []);

  const handleMarkerLeave = useCallback(() => {
    setTooltip({ visible: false, content: '', x: 0, y: 0 });
  }, []);

  // Set up map event listeners for flow line hover and click
  useEffect(() => {
    if (!mapRef?.current) return;

    const map = mapRef.current;

    const handleMapMouseMove = (e: any) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['flow-lines-base'] });
      if (features.length > 0) {
        handleFlowHover({ features, lngLat: e.lngLat });
      } else {
        handleFlowLeave();
      }
    };

    const handleMapMouseLeave = () => {
      handleFlowLeave();
    };

    const handleMapClick = (e: any) => {
      console.log('=== MAP CLICK ===');
      console.log('Click point:', e.point);
      const features = map.queryRenderedFeatures(e.point, { layers: ['flow-lines-base'] });
      console.log('Features found:', features);
      if (features.length > 0 && onFlowClick) {
        const feature = features[0];
        console.log('Feature properties:', feature.properties);
        const flowId = feature.properties?.flowId;
        if (flowId) {
          const flow = flows.find(f => f.id === flowId);
          if (flow) {
            console.log('Flow found, calling onFlowClick:', flow);
            onFlowClick(flow);
          }
        }
      }
    };

    map.on('mousemove', handleMapMouseMove);
    map.on('mouseleave', handleMapMouseLeave);
    map.on('click', handleMapClick);

    return () => {
      map.off('mousemove', handleMapMouseMove);
      map.off('mouseleave', handleMapMouseLeave);
      map.off('click', handleMapClick);
    };
  }, [mapRef, handleFlowHover, handleFlowLeave, onFlowClick, flows]);

  return (
    <>
      {/* Draw flow lines using map's native line layers */}
      {flowLinesGeoJSON && (
        <Source id="flow-lines" type="geojson" data={flowLinesGeoJSON} key="flow-lines">
          {/* Base line layer */}
          <Layer
            id="flow-lines-base"
            type="line"
            layout={{
              'line-cap': 'round',
              'line-join': 'round'
            }}
            paint={{
              'line-color': [
                'case',
                ['==', ['get', 'category'], 'type1'], colorMap.type1 || '#ff6b6b',
                ['==', ['get', 'category'], 'type2'], colorMap.type2 || '#4ecdc4',
                ['==', ['get', 'category'], 'type3'], colorMap.type3 || '#45b7d1',
                '#cccccc'
              ],
              'line-width': ['interpolate', ['linear'], ['get', 'sizeValue'], 0, 2, 100, 12],
              'line-opacity': 0.5
            }}
            filter={['has', 'category']}
            key="flow-lines-base"
          />
        </Source>
      )}
      
      {/* Tooltip for hovered flow */}
      {tooltip.visible && (
        <div 
          className="flow-tooltip"
          style={{
            position: 'absolute',
            top: `${tooltip.y - 10}px`, // Closer to pointer (was 20px)
            left: `${tooltip.x - 5}px`, // Closer to pointer (was 10px)
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          <div className="maplibregl-popup-content">
            {tooltip.content}
          </div>
        </div>
      )}
      
      {/* Performance-optimized animated particles moving along flow lines */}
      {enableAnimation && particles.map((particle) => {
        const flow = flows.find(f => f.id === particle.flowId);
        if (!flow) return null;
        
        const flowColor = colorMap[flow.category] || fallbackColor;
        const flowSize = normalizeSize(flow.sizeValue);
        const curvePoints = flowCurvePoints[flows.findIndex(f => f.id === particle.flowId)];
        const [longitude, latitude] = getPointAlongCurve(curvePoints, particle.progress);
        
        // Adaptive glow effect based on performance optimizations
        const glowRadius = PERFORMANCE_OPTIMIZATIONS.ENABLE_OPTIMIZATIONS 
          ? flowSize * 1.5 
          : flowSize * 2;
        
        return (
          <Marker
            key={particle.id}
            longitude={longitude}
            latitude={latitude}
            anchor="center"
          >
            <div 
              className="flow-particle"
              style={{ 
                width: `${flowSize}px`, 
                height: `${flowSize}px`, 
                backgroundColor: flowColor, 
                borderRadius: '50%',
                boxShadow: PERFORMANCE_OPTIMIZATIONS.ENABLE_OPTIMIZATIONS 
                  ? `0 0 ${glowRadius}px ${flowColor}`
                  : `0 0 ${glowRadius}px ${flowColor}, 0 0 ${glowRadius * 1.5}px ${flowColor}80`,
                opacity: 0.8,
                position: 'relative',
                animation: 'particleGlow 2s ease-in-out infinite'
              } as React.CSSProperties} 
            />
          </Marker>
        );
      })}
      
      {/* Draw markers for origin and destination points */}
      {flows.map((flow) => {
        const flowColor = colorMap[flow.category] || fallbackColor;
        const flowSize = normalizeSize(flow.sizeValue);
        const flowId = generateFlowId(flow);
        const displayName = getDisplayName(flow);

        return (
          <React.Fragment key={flowId}>
            {/* Origin marker */}
            <Marker
              longitude={flow.origin[0]}
              latitude={flow.origin[1]}
              anchor="center"
            >
              <div 
                style={{ 
                  width: `${flowSize}px`, 
                  height: `${flowSize}px`, 
                  backgroundColor: flowColor, 
                  borderRadius: '50%',
                  border: '1px solid rgba(255, 255, 255, 1)',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  console.log('=== MARKER CLICK ===');
                  console.log('Flow clicked:', flow);
                  onFlowClick && onFlowClick(flow);
                }}
                onMouseEnter={(e) => handleMarkerHover(displayName, e)}
                onMouseLeave={handleMarkerLeave}
              />
            </Marker>
            
            {/* Destination marker */}
            <Marker
              longitude={flow.destination[0]}
              latitude={flow.destination[1]}
              anchor="center"
            >
              <div 
                style={{ 
                  width: `${flowSize}px`, 
                  height: `${flowSize}px`, 
                  backgroundColor: flowColor, 
                  borderRadius: '50%',
                  border: '1px solid rgba(255, 255, 255, 1)',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  console.log('=== MARKER CLICK ===');
                  console.log('Flow clicked:', flow);
                  onFlowClick && onFlowClick(flow);
                }}
                onMouseEnter={(e) => handleMarkerHover(displayName, e)}
                onMouseLeave={handleMarkerLeave}
              />
            </Marker>
          </React.Fragment>
        );
      })}
    </>
  );
};

export default FlowLayer; 