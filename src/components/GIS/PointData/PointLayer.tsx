import React, { useMemo, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { Marker } from 'react-map-gl/maplibre';
import Supercluster from 'supercluster';
import { pie as d3pie, arc as d3arc } from 'd3-shape';
import { Point, ColorMap } from '../../types';
import { MapContext } from '../GeoJson/GeoJsonMap';
import { blendColors, parseRgb } from '../utils/color-utils';
import { 
    getPointClippingInfo 
} from '../utils/polygon-masking';
import * as turf from '@turf/turf';
import { useOptimalBlur } from '../utils/resolution-utils';
import { getTheme, spacingToPx, getColorPalette } from '../utils/theme';
import './point-layer.css';

interface PointLayerProps {
    points: Point[];
    colorMap: ColorMap;
    onPointHover: (hoverInfo: { longitude: number; latitude: number; featureName: string; } | null) => void;
    onPointClick: (point: Point) => void;
    categoryLabels: { [key: string]: string };
    geoJsonData?: any; // GeoJSON data for hierarchical masking
    blurAmount?: number; // Blur amount in pixels
    enablePulsing?: boolean; // Enable natural light pulsing animation
}

const PointLayer: React.FC<PointLayerProps> = ({ 
    points = [], 
    colorMap, 
    onPointHover, 
    onPointClick, 
    categoryLabels,
    geoJsonData,
    blurAmount,
    enablePulsing = false
}) => {
    const { mapRef, hoveredRegion } = useContext(MapContext);
    
    const [zoom, setZoom] = useState<number | null>(null);
    const [bounds, setBounds] = useState<[number, number, number, number] | null>(null);
    
    // Performance monitoring
    const performanceRef = useRef({
        frameCount: 0,
        lastTime: 0,
        fps: 0
    });
    
    // Performance optimization flags
    const PERFORMANCE_OPTIMIZATIONS = {
        MAX_MARKERS: 1000, // Limit total markers
        SIMPLIFIED_SHADOWS: points.length > 500, // Reduce shadow layers
        DISABLE_ANIMATIONS: points.length > 1000, // Disable animations for large datasets
        REDUCE_CLUSTER_DETAIL: points.length > 2000, // Simplify cluster pie charts
        BATCH_UPDATES: true, // Batch marker updates
        ENABLE_OPTIMIZATIONS: true // Enable optimizations for better performance
    };
    
    // Get optimal blur amount based on resolution and optional override
    const optimalBlur = useOptimalBlur(blurAmount);
    
    // Get theme variables and fallback colors
    const theme = getTheme();
    const colorPalette = getColorPalette();
    const fallbackColor = colorPalette.secondary || '#888888';
    
    // Calculate cluster sizing using theme variables
    const baseClusterSize = spacingToPx(theme.spacingLg || '24px');
    const maxClusterSize = spacingToPx(theme.spacing5xl || '64px');
    
    // Check if a point is inside the hovered region
    const isPointInHoveredRegion = useCallback((pointCoordinates: [number, number]) => {
        if (!hoveredRegion) return false;
        
        try {
            const point = turf.point(pointCoordinates);
            return turf.booleanPointInPolygon(point, hoveredRegion);
        } catch (error) {
            console.warn('Error checking point in hovered region:', error);
            return false;
        }
    }, [hoveredRegion]);
    
    // Generate random animation delays for natural variation
    const getRandomDelay = () => Math.random() * 2; // 0-2 seconds delay
    const getRandomPulseClass = () => {
        const pulseTypes = ['light-pulse-1', 'light-pulse-2', 'light-pulse-3'];
        return pulseTypes[Math.floor(Math.random() * pulseTypes.length)];
    };

    const supercluster = useMemo(() => {
        const sc = new Supercluster({
            radius: 45,
            maxZoom: 16,
        });
        sc.load(points.map(p => ({
            type: 'Feature',
            properties: { ...p, cluster: false },
            geometry: {
                type: 'Point',
                coordinates: p.coordinates,
            },
        })));
        return sc;
    }, [points]);

    useEffect(() => {
        if (!mapRef?.current) return;
        const map = mapRef.current.getMap();

        const onMove = () => {
            setZoom(map.getZoom());
            setBounds(map.getBounds().toArray().flat() as [number, number, number, number]);
        };

        map.on('moveend', onMove);
        map.on('load', onMove); 
        onMove();

        return () => {
            map.off('moveend', onMove);
            map.off('load', onMove);
        };
    }, [mapRef]);

    const clusters = useMemo(() => {
        if (points.length === 0) return [];
        if (!bounds || zoom === null) return [];
        return supercluster.getClusters(bounds, Math.floor(zoom));
    }, [supercluster, zoom, bounds, points]);

    // Optimized pie chart rendering with performance considerations
    const renderPieChart = (cluster: any) => {
        const leaves = supercluster.getLeaves(cluster.id, Infinity);
        const counts: { [key: string]: number } = {};
        const clusterColors: string[] = [];
        
        leaves.forEach(leaf => {
            const category = leaf.properties.category;
            counts[category] = (counts[category] || 0) + 1;
            if (colorMap[category]) {
                clusterColors.push(colorMap[category]);
            }
        });

        const blendedCenterColor = blendColors(clusterColors);

        // Simplified cluster rendering for large datasets
        if (PERFORMANCE_OPTIMIZATIONS.REDUCE_CLUSTER_DETAIL) {
            const size = Math.min(maxClusterSize, baseClusterSize + Math.sqrt(cluster.properties.point_count) * 5);
            const pointColor = colorMap[Object.keys(counts)[0]] || fallbackColor;
            
            return (
                <div 
                    style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        backgroundColor: pointColor,
                        borderRadius: '50%',
                        border: '2px solid white',
                        boxShadow: `0 2px 8px rgba(0,0,0,0.3)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }}
                >
                    {cluster.properties.point_count}
                </div>
            );
        }

        const pieData = d3pie<{ key: string, value: number }>().value(d => d.value).sort(null)(
            Object.entries(counts).map(([key, value]) => ({ key, value }))
        );

        // Use theme-based sizing
        const size = Math.min(maxClusterSize, baseClusterSize + Math.sqrt(cluster.properties.point_count) * 5);
        const radius = size / 2;
        const centralRadius = radius * 0.3; // Make central circle much smaller
        const arc = d3arc().innerRadius(centralRadius).outerRadius(radius); // Make pie touch the center

        // Optimized drop-shadow filters
        const parsedColor = parseRgb(blendedCenterColor);
        const shadowColor1 = parsedColor ? `rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, 1.0)` : 'rgba(0,0,0,0.7)';
        const shadowColor2 = parsedColor ? `rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, 0.7)` : 'rgba(0,0,0,0.5)';
        
        // Simplified shadows for performance
        const filterStyle = PERFORMANCE_OPTIMIZATIONS.SIMPLIFIED_SHADOWS
            ? `drop-shadow(0 2px 8px ${shadowColor1})`
            : `drop-shadow(0 0 ${size * 0.4}px ${shadowColor1}) drop-shadow(0 0 ${size * 0.6}px ${shadowColor2})`;

        // Get clipping information for hierarchical masking
        const clusterPoint: [number, number] = cluster.geometry.coordinates;
        const mapInstance = mapRef?.current?.getMap();
        const clippingInfo = geoJsonData ? getPointClippingInfo(clusterPoint, size, geoJsonData, mapInstance) : 
                            { shouldClip: false, clipPaths: [], clipPathIds: [], containingPolygons: [] };
        
        // Check if this cluster is in the hovered region
        const isInHoveredRegion = isPointInHoveredRegion(clusterPoint);
        
        // Always apply mask if a valid clipPath is available (but not if in hovered region)
        const hasValidClipPath = !isInHoveredRegion && clippingInfo.clipPaths.length > 0 && 
                                clippingInfo.clipPaths[0] && 
                                clippingInfo.clipPaths[0].startsWith('polygon(') &&
                                clippingInfo.clipPaths[0].includes('%');

        const containerStyle: React.CSSProperties = {
            filter: hasValidClipPath ? `blur(${optimalBlur}px) ${filterStyle}` : filterStyle,
            clipPath: hasValidClipPath ? clippingInfo.clipPaths[0] : 'none',
            position: 'relative',
            ...(isInHoveredRegion && {
                filter: filterStyle, // Keep colorful shadows but remove blur
                clipPath: 'none',
                zIndex: 1000
            })
        };

        return (
            <div 
                style={{
                    ...containerStyle,
                    ...(enablePulsing && !isInHoveredRegion && !PERFORMANCE_OPTIMIZATIONS.DISABLE_ANIMATIONS && {
                        animationDelay: `${getRandomDelay()}s`
                    })
                }}
                className={`marker-filter-transition masking-transition ${enablePulsing && !isInHoveredRegion && !PERFORMANCE_OPTIMIZATIONS.DISABLE_ANIMATIONS ? 'light-container pulse-glow' : ''}`}
            >
                <svg 
                    width={size} 
                    height={size} 
                    viewBox={`0 0 ${size} ${size}`} 
                    style={{ 
                        overflow: 'visible', 
                        display: 'block', 
                        borderRadius: '50%'
                    }}
                    className={`${hasValidClipPath ? 'masked-content' : ''} ${enablePulsing && !isInHoveredRegion && !PERFORMANCE_OPTIMIZATIONS.DISABLE_ANIMATIONS ? 'light-pulse' : ''}`}
                >
                    <g transform={`translate(${size / 2}, ${size / 2})`}>
                        {pieData.map((d, i) => (
                            <path key={i} d={arc(d as any) || ''} fill={colorMap[d.data.key] || fallbackColor} />
                        ))}
                        <circle cx="0" cy="0" r={centralRadius} fill={blendedCenterColor} stroke={theme.colorGray6 || '#888888'} strokeWidth="1" />
                    </g>
                </svg>
            </div>
        );
    };

    return (
        <>
            {clusters.map(cluster => {
                const [longitude, latitude] = cluster.geometry.coordinates;

                if (cluster.properties.cluster) {
                    return (
                        <Marker
                            key={cluster.id}
                            longitude={longitude}
                            latitude={latitude}
                            anchor="center"
                        >
                            <div
                                style={{ cursor: 'pointer' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle cluster click if needed
                                    console.log('Cluster clicked:', cluster);
                                }}
                                onMouseEnter={() => {
                                    if (typeof cluster.id !== 'number') return;
                                    const leaves = supercluster.getLeaves(cluster.id, Infinity);
                                    const counts: { [key: string]: number } = {};
                                    leaves.forEach(leaf => {
                                        const category = leaf.properties.category;
                                        counts[category] = (counts[category] || 0) + 1;
                                    });

                                    const featureName = Object.entries(counts)
                                        .map(([category, count]) => `${categoryLabels[category] || category}: ${count}`)
                                        .join('<br />');

                                    onPointHover({
                                        longitude,
                                        latitude,
                                        featureName,
                                    });
                                }}
                                onMouseLeave={() => onPointHover(null)}
                            >
                                {renderPieChart(cluster)}
                            </div>
                        </Marker>
                    );
                }

                const point = cluster.properties as Point;
                const pointColor = colorMap[point.category] || fallbackColor;
                const parsedColor = parseRgb(pointColor);
                
                // Optimized shadow effects
                const shadowColor1 = parsedColor ? `rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, 1.0)` : 'rgba(0,0,0,0.7)';
                const shadowColor2 = parsedColor ? `rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, 0.7)` : 'rgba(0,0,0,0.5)';

                // Calculate marker size using theme-based scale
                const minMarkerSize = spacingToPx(theme.spacingSm || '8px');
                const markerSize = Math.max(minMarkerSize, point.sizeValue * spacingToPx(theme.spacingLg || '24px'));
                
                // Simplified shadows for performance
                const filterStyle = PERFORMANCE_OPTIMIZATIONS.SIMPLIFIED_SHADOWS
                    ? `drop-shadow(0 2px 8px ${shadowColor1})`
                    : `drop-shadow(0 0 ${markerSize * 0.4}px ${shadowColor1}) drop-shadow(0 0 ${markerSize * 1}px ${shadowColor2})`;

                // Get clipping information for hierarchical masking
                const pointCoordinates: [number, number] = [longitude, latitude];
                const mapInstance = mapRef?.current?.getMap();
                const clippingInfo = geoJsonData ? getPointClippingInfo(pointCoordinates, markerSize, geoJsonData, mapInstance) : 
                                        { shouldClip: false, clipPaths: [], clipPathIds: [], containingPolygons: [] };
                
                // Check if this marker is in the hovered region
                const isInHoveredRegion = isPointInHoveredRegion(pointCoordinates);
                
                // Always apply mask if a valid clipPath is available (but not if in hovered region)
                const hasValidClipPath = !isInHoveredRegion && clippingInfo.clipPaths.length > 0 && 
                                        clippingInfo.clipPaths[0] && 
                                        clippingInfo.clipPaths[0].startsWith('polygon(') &&
                                        clippingInfo.clipPaths[0].includes('%');

                const containerStyle: React.CSSProperties = {
                    filter: hasValidClipPath ? `blur(${optimalBlur}px) ${filterStyle}` : filterStyle,
                    clipPath: hasValidClipPath ? clippingInfo.clipPaths[0] : 'none',
                    position: 'relative',
                    ...(isInHoveredRegion && {
                        filter: filterStyle, // Keep colorful shadows but remove blur
                        clipPath: 'none',
                        zIndex: 1000
                    })
                };
                
                return (
                    <Marker
                        key={point.id}
                        longitude={longitude}
                        latitude={latitude}
                        anchor="center"
                    >
                        <div
                            style={{
                                ...containerStyle,
                                ...(enablePulsing && !isInHoveredRegion && !PERFORMANCE_OPTIMIZATIONS.DISABLE_ANIMATIONS && {
                                    animationDelay: `${getRandomDelay()}s`
                                })
                            }}
                            className={`marker-filter-transition masking-transition ${enablePulsing && !isInHoveredRegion && !PERFORMANCE_OPTIMIZATIONS.DISABLE_ANIMATIONS ? 'light-container pulse-glow' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onPointClick(point);
                            }}
                            onMouseEnter={() => onPointHover({
                                longitude: longitude,
                                latitude: latitude,
                                featureName: point.name,
                            })}
                            onMouseLeave={() => onPointHover(null)}
                        >
                            <div
                                style={{
                                    backgroundColor: pointColor,
                                    width: `${markerSize}px`,
                                    height: `${markerSize}px`,
                                    borderRadius: '50%',
                                    animation: enablePulsing && !isInHoveredRegion && !PERFORMANCE_OPTIMIZATIONS.DISABLE_ANIMATIONS
                                        ? `marker-appear 0.25s ease-in-out, ${getRandomPulseClass()} ${3 + Math.random() * 2}s ease-in-out infinite`
                                        : 'marker-appear 0.25s ease-in-out'
                                }}
                                className={`marker-hover-transition ${hasValidClipPath ? 'masked-content' : 'map-marker'} ${enablePulsing && !isInHoveredRegion && !PERFORMANCE_OPTIMIZATIONS.DISABLE_ANIMATIONS ? 'light-pulse' : ''}`}
                            />
                        </div>
                    </Marker>
                );
            })}
        </>
    );
};

export default PointLayer; 