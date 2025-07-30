import React, { useState, useEffect, useMemo, useCallback, useRef, createContext } from 'react';
import Map, { Source, Layer, Popup } from 'react-map-gl/maplibre';
import type { MapRef, MapLayerMouseEvent } from 'react-map-gl/maplibre';
import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec';
import bbox from '@turf/bbox';
import 'maplibre-gl/dist/maplibre-gl.css';
import './tooltip.css';
import './glassmorphic-map.css';
import RegionLabels from './region-labels';
import { getColorPalette, spacingToPx, getTheme } from './utils/theme';
import { useThemeChange } from './hooks/useThemeChange';
import Papa from 'papaparse';

export const MapContext = createContext<{ 
    mapRef: React.RefObject<MapRef | null>; 
    hoveredRegion?: any;
}>({ mapRef: { current: null }, hoveredRegion: null });

// Utility to get current theme (light/dark) from <html data-theme>
function getCurrentTheme(): 'light' | 'dark' {
  if (typeof document !== 'undefined') {
    const theme = document.documentElement.getAttribute('data-theme');
    return theme === 'dark' ? 'dark' : 'light';
  }
  return 'light';
}

// MapTiler style URLs
const MAPTILER_LIGHT = 'https://api.maptiler.com/maps/dataviz-light/style.json?key=GybzZDZvg0B6Da7t1IUL';
const MAPTILER_DARK = 'https://api.maptiler.com/maps/dataviz-dark/style.json?key=GybzZDZvg0B6Da7t1IUL';

interface HoverInfo {
    longitude: number;
    latitude: number;
    featureName: string;
}

interface GeoJsonMapProps {
    geoJsonData: any;
    geodata: Record<string, any>[];
    children?: React.ReactNode;
    popupInfo?: HoverInfo | null;
    fillColor?: string;
    borderColor?: string;
    beforeOpacity?: number;
    afterOpacity?: number;
    coloredDataOpacity?: number;
    selectedGeodata?: string;
    colorMode?: 'continuous' | 'categorical' | 'default';
    defaultColors?: { light: string; dark: string };
    categoricalSchemes?: Array<{ column: string; colorMap: Record<string, string> }>;
    continuousSchemes?: Array<{ column: string; gradient: Array<{ value: number; color: string }> }>;
    onRegionClick?: (regionData: Record<string, any>, regionName: string) => void;
}

/**
 * GeoJsonMap: Modular map container for use in any React app.
 *
 * Props:
 * - geoJsonData: GeoJSON object for map regions (required)
 * - geodata: Array of objects (e.g., from CSV) for region enrichment (required)
 * - children: React children (e.g., PointLayer, Legend)
 * - popupInfo: Info for map popups (optional)
 * - fillColor, borderColor: Map colors (optional)
 * - beforeOpacity, afterOpacity, coloredDataOpacity: Opacity controls (optional)
 * - selectedGeodata: Which geodata column to visualize (optional)
 * - colorMode: 'continuous' | 'categorical' | 'default' (optional)
 * - defaultColors: { light, dark } (optional)
 * - categoricalSchemes, continuousSchemes: Color schemes (optional)
 *
 * All controls (theme, selectors) must be managed by the parent app.
 */
const GeoJsonMap = ({ 
    geoJsonData,
    geodata,
    children, 
    popupInfo, 
    fillColor,
    borderColor,
    beforeOpacity = 0.2,
    afterOpacity = 0.5,
    coloredDataOpacity = 0.6,
    selectedGeodata = 'pop',
    colorMode = 'continuous',
    defaultColors,
    categoricalSchemes,
    continuousSchemes,
    onRegionClick,
}: GeoJsonMapProps) => {
    const mapRef = useRef<MapRef>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [regionHoverFeature, setRegionHoverFeature] = useState<any>(null);
    const [hoveredFeatureId, setHoveredFeatureId] = useState<string | number | null>(null);
    const [zoom, setZoom] = useState<number>(4);
    const [viewState, setViewState] = useState({
        longitude: 53.6880,
        latitude: 32.4279,
        zoom: 4
    });

    const themeChangeVersion = useThemeChange('html', 'data-theme'); // just to trigger rerender
    const themeVersion: 'light' | 'dark' = getCurrentTheme();

    // Always get fresh theme/colors when themeVersion changes
    const colorPalette = useMemo(() => getColorPalette(), [themeVersion, themeChangeVersion]);
    const finalFillColor = fillColor || colorPalette.mapForeground;
    const finalBorderColor = borderColor || colorPalette.mapBorder;

    // Determine default color from theme or prop
    const theme = useMemo(() => getTheme(), [themeVersion, themeChangeVersion]);
    const themeDefaultColor = (defaultColors && typeof defaultColors.light === 'string' && typeof defaultColors.dark === 'string')
        ? (themeVersion === 'dark' ? defaultColors.dark : defaultColors.light)
        : finalFillColor;

    // Find the color scheme for the selected geodata
    const categoricalScheme = categoricalSchemes?.find(s => s.column === selectedGeodata);
    const continuousScheme = continuousSchemes?.find(s => s.column === selectedGeodata);

    // Build a lookup from geodata for enrichment
    const regionDataMap = useMemo(() => {
        const map: Record<string, any> = {};
        geodata.forEach((row: any) => {
            if (row.name) {
                let normName = row.name.replace(' Province', '').replace(/ /g, '');
                map[normName] = row;
            }
        });
        return map;
    }, [geodata]);

    // Enrich geoJsonData with geodata
    const enrichedGeoJsonData = useMemo(() => {
        if (!geoJsonData) return null;
        if (!geoJsonData.features) return geoJsonData;
        return {
            ...geoJsonData,
            features: geoJsonData.features.map((feature: any) => {
                let name = feature.properties?.tags?.['name:en'] || feature.properties?.tags?.['name:fa'] || '';
                name = name.replace(' Province', '').replace(/ /g, '');
                const regionData = regionDataMap[name];
                return {
                    ...feature,
                    properties: {
                        ...feature.properties,
                        name,
                        ...regionData,
                    }
                };
            })
        };
    }, [geoJsonData, regionDataMap]);

    useEffect(() => {
        if (enrichedGeoJsonData && mapRef.current && isMapLoaded) {
            const bounds = bbox(enrichedGeoJsonData);
            const padding = 0; // Set padding to 0 for perfect fit
            mapRef.current.fitBounds(
                [bounds[0], bounds[1], bounds[2], bounds[3]],
                { padding, duration: 1000 }
            );
        }
    }, [enrichedGeoJsonData, isMapLoaded, theme, themeVersion]);

    const handleMapLoad = useCallback(() => {
        setIsMapLoaded(true);
        if (enrichedGeoJsonData && mapRef.current) {
            const bounds = bbox(enrichedGeoJsonData);
            const padding = 0; // Set padding to 0 for perfect fit
            mapRef.current.fitBounds(
                [bounds[0], bounds[1], bounds[2], bounds[3]],
                { padding, duration: 0 }
            );
        }
    }, [enrichedGeoJsonData, theme, themeVersion]);

    // Track zoom level changes
    useEffect(() => {
        if (!mapRef?.current) return;
        
        const map = mapRef.current.getMap();
        const onZoomChange = () => {
            setZoom(map.getZoom());
        };

        map.on('zoom', onZoomChange);
        map.on('zoomend', onZoomChange);
        
        // Set initial zoom
        onZoomChange();

        return () => {
            map.off('zoom', onZoomChange);
            map.off('zoomend', onZoomChange);
        };
    }, [mapRef, isMapLoaded]);

    const onHover = useCallback((event: MapLayerMouseEvent) => {
        const feature = event.features && event.features[0];
        const map = mapRef.current?.getMap();
        
        if (feature?.properties && map && feature.id !== undefined) {
            // Clear previous hover state
            if (hoveredFeatureId !== null) {
                map.setFeatureState(
                    { source: 'my-data', id: hoveredFeatureId },
                    { hover: false }
                );
            }
            
            // Set new hover state using the auto-generated feature ID
            map.setFeatureState(
                { source: 'my-data', id: feature.id },
                { hover: true }
            );
            setHoveredFeatureId(feature.id);
            
            // This is a region feature, handle it for fixed label positioning
            setRegionHoverFeature(feature);
            
            // This is a region feature, handle it for fixed label positioning
            setRegionHoverFeature(feature);
        } else {
            // No feature hovered, clear region hover and feature state
            if (hoveredFeatureId !== null && map) {
                map.setFeatureState(
                    { source: 'my-data', id: hoveredFeatureId },
                    { hover: false }
                );
                setHoveredFeatureId(null);
            }
            setRegionHoverFeature(null);
        }
    }, [hoveredFeatureId]);

    const onMouseLeave = useCallback(() => {
        // Clear feature hover state when leaving the map
        const map = mapRef.current?.getMap();
        if (hoveredFeatureId !== null && map) {
            map.setFeatureState(
                { source: 'my-data', id: hoveredFeatureId },
                { hover: false }
            );
            setHoveredFeatureId(null);
        }
        
        // Clear region hover when leaving the map
        setRegionHoverFeature(null);
    }, [hoveredFeatureId]);

    const handleRegionClick = useCallback((event: MapLayerMouseEvent) => {
        const feature = event.features && event.features[0];
        
        if (feature?.properties && onRegionClick) {
            const regionName = feature.properties.name;
            const regionData = feature.properties;
            
            console.log('Map click - Feature properties:', feature.properties);
            console.log('Region name:', regionName);
            
            // Call the parent's onRegionClick handler
            onRegionClick(regionData, regionName);
        }
    }, [onRegionClick]);

    // Color scales
    const popColorScale = [
      { value: 0, color: '#e0f3f8' },
      { value: 1000000, color: '#abd9e9' },
      { value: 3000000, color: '#74add1' },
      { value: 14000000, color: '#4575b4' },
      { value: 85000000, color: '#313695' },
    ];
    const healthStatusColors: Record<string, string> = {
      good: '#4caf50',
      medium: '#ffeb3b',
      poor: '#ff9800',
    };

    function getPopColor(pop: number) {
      for (let i = popColorScale.length - 1; i >= 0; i--) {
        if (pop >= popColorScale[i].value) return popColorScale[i].color;
      }
      return popColorScale[0].color;
    }

    function getRegionColor(regionName: string) {
      const data = regionDataMap[regionName];
      if (!data) return colorPalette.mapForeground;
      if (selectedGeodata === 'pop') {
        return getPopColor(data.pop);
      } else {
        return healthStatusColors[data.health_status] || '#ccc';
      }
    }

    const fillLayer = useMemo(() => {
        let fillColor: any = themeDefaultColor;
        const column = String(selectedGeodata);
        let fillOpacity = beforeOpacity;
        if ((colorMode === 'continuous' && continuousScheme) || (colorMode === 'categorical' && categoricalScheme)) {
            fillOpacity = coloredDataOpacity;
        }
        if (colorMode === 'continuous' && continuousScheme) {
            // Build interpolate expression from gradient
            const stops: any[] = [];
            continuousScheme.gradient.forEach(g => {
                stops.push(g.value, g.color);
            });
            fillColor = [
                'interpolate', ['linear'],
                ['to-number', ['get', column]],
                ...stops
            ];
        } else if (colorMode === 'categorical' && categoricalScheme) {
            // Build match expression from colorMap
            const matchArr: any[] = [];
            Object.entries(categoricalScheme.colorMap).forEach(([key, color]) => {
                matchArr.push(key, color);
            });
            matchArr.push('#ccc'); // fallback
            fillColor = [
                'match', ['get', column],
                ...matchArr
            ];
        }
        return {
            id: 'data-fill',
            type: 'fill',
            source: 'my-data',
            paint: {
                'fill-color': fillColor,
                'fill-opacity': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    afterOpacity,
                    fillOpacity
                ]
            }
        } as any;
    }, [colorMode, selectedGeodata, themeDefaultColor, categoricalScheme, continuousScheme, beforeOpacity, afterOpacity, coloredDataOpacity]);

    const lineLayer: LayerSpecification = useMemo(() => ({
        id: 'data-line',
        type: 'line',
        source: 'my-data',
        paint: {
            'line-color': finalBorderColor,
            'line-width': 2,
            'line-opacity': 0.1
        }
    }), [finalBorderColor]);

    const memoizedGeoJsonData = useMemo(() => enrichedGeoJsonData, [enrichedGeoJsonData]);
    const finalHoverInfo = popupInfo;

    // Dynamically select MapTiler style URL based on theme
    const mapStyleUrl = useMemo(() => {
        return getCurrentTheme() === 'dark' ? MAPTILER_DARK : MAPTILER_LIGHT;
    }, [themeVersion]);

    return (
        <div className="glassmorphic-map">
            <Map
                ref={mapRef}
                {...viewState}
                onMove={evt => {
                    setViewState(evt.viewState);
                    setZoom(evt.viewState.zoom);
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle={mapStyleUrl}
                attributionControl={false}
                onLoad={handleMapLoad}
                onMouseMove={onHover}
                onMouseLeave={onMouseLeave}
                onClick={handleRegionClick}
                interactiveLayerIds={['data-fill']}
                key={`map-${getCurrentTheme()}`}
            >
                <MapContext.Provider value={{ mapRef, hoveredRegion: regionHoverFeature }}>
                    {memoizedGeoJsonData && (
                        <Source id="my-data" type="geojson" data={memoizedGeoJsonData} generateId={true} key="my-data">
                            <Layer {...fillLayer} key="data-fill" />
                            <Layer {...lineLayer} key="data-line" />
                        </Source>
                    )}
                    {/* Region labels on hover */}
                    <RegionLabels
                        geoJsonData={memoizedGeoJsonData}
                        isMapLoaded={isMapLoaded}
                        zoom={zoom}
                        hoverFeature={regionHoverFeature}
                    />
                    {children}
                    {finalHoverInfo && (
                            <Popup
                                longitude={finalHoverInfo.longitude}
                                latitude={finalHoverInfo.latitude}
                                closeButton={false}
                                className="map-tooltip"
                                anchor="top"
                            >
                                <div dangerouslySetInnerHTML={{ __html: finalHoverInfo.featureName }} />
                            </Popup>
                    )}
                </MapContext.Provider>
            </Map>
        </div>
    );
};

export default GeoJsonMap; 