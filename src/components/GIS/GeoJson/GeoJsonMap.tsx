/**
 * GeoJsonMap Component
 * Uses separated geodata components for better clarity
 * Updated with correct import paths
 */

import React, { useState, useEffect, useMemo, useCallback, useRef, createContext } from "react";
import Map, { Popup } from "react-map-gl/maplibre";
import type { MapRef, MapLayerMouseEvent } from "react-map-gl/maplibre";
import bbox from "@turf/bbox";
import "maplibre-gl/dist/maplibre-gl.css";
import "./tooltip.css";
import "./glassmorphic-map.css";
import RegionLabels from "./RegionLabels";
import { getColorPalette, getTheme } from "../utils/theme";
import { useThemeChange } from "../hooks/useThemeChange";
import GeodataEnricher from "../GeoData/GeodataEnricher";
import GeodataVisualizer from "../GeoData/GeodataVisualizer";
import { GeodataRow, ColorScheme } from "../utils/geodata-utils";

export const MapContext = createContext<{ 
    mapRef: React.RefObject<MapRef | null>; 
    hoveredRegion?: any;
}>({ mapRef: { current: null }, hoveredRegion: null });

// Utility to get current theme (light/dark) from <html data-theme>
function getCurrentTheme(): "light" | "dark" {
  if (typeof document !== "undefined") {
    const theme = document.documentElement.getAttribute("data-theme");
    return theme === "dark" ? "dark" : "light";
  }
  return "light";
}

// MapTiler style URLs
const MAPTILER_LIGHT = "https://api.maptiler.com/maps/dataviz-light/style.json?key=GybzZDZvg0B6Da7t1IUL";
const MAPTILER_DARK = "https://api.maptiler.com/maps/dataviz-dark/style.json?key=GybzZDZvg0B6Da7t1IUL";

interface HoverInfo {
    longitude: number;
    latitude: number;
    featureName: string;
}

interface GeoJsonMapProps {
    geoJsonData: any;
    geodata: GeodataRow[];
    children?: React.ReactNode;
    popupInfo?: HoverInfo | null;
    fillColor?: string;
    borderColor?: string;
    beforeOpacity?: number;
    afterOpacity?: number;
    coloredDataOpacity?: number;
    selectedGeodata?: string;
    colorMode?: "continuous" | "categorical" | "default";
    defaultColors?: { light: string; dark: string };
    categoricalSchemes?: ColorScheme["categorical"][];
    continuousSchemes?: ColorScheme["continuous"][];
    onRegionClick?: (regionData: Record<string, any>, regionName: string) => void;
}

/**
 * GeoJsonMap: Cleaner map component using separated geodata logic
 *
 * This version separates concerns:
 * - GeodataEnricher handles data enrichment
 * - GeodataVisualizer handles visualization
 * - Map handles rendering and interactions
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
    selectedGeodata = "pop",
    colorMode = "continuous",
    defaultColors,
    categoricalSchemes = [],
    continuousSchemes = [],
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

    const themeChangeVersion = useThemeChange("html", "data-theme");
    const themeVersion: "light" | "dark" = getCurrentTheme();

    // Always get fresh theme/colors when themeVersion changes
    const colorPalette = useMemo(() => getColorPalette(), [themeVersion, themeChangeVersion]);
    const finalFillColor = fillColor || colorPalette.mapForeground;
    const finalBorderColor = borderColor || colorPalette.mapBorder;

    // Determine default color from theme or prop
    const theme = useMemo(() => getTheme(), [themeVersion, themeChangeVersion]);
    const themeDefaultColor = (defaultColors && typeof defaultColors.light === "string" && typeof defaultColors.dark === "string")
        ? (themeVersion === "dark" ? defaultColors.dark : defaultColors.light)
        : finalFillColor;

    // Map event handlers
    const handleMapLoad = useCallback(() => {
        setIsMapLoaded(true);
    }, []);

    const onHover = useCallback((event: MapLayerMouseEvent) => {
        const feature = event.features?.[0];
        if (feature) {
            setRegionHoverFeature(feature);
            setHoveredFeatureId(feature.id || null);
        } else {
            setRegionHoverFeature(null);
            setHoveredFeatureId(null);
        }
    }, []);

    const onMouseLeave = useCallback(() => {
        setRegionHoverFeature(null);
        setHoveredFeatureId(null);
    }, []);

    const handleRegionClick = useCallback((event: MapLayerMouseEvent) => {
        const feature = event.features?.[0];
        if (feature && onRegionClick) {
            const regionName = feature.properties?.tags?.["name:en"] || 
                             feature.properties?.name || 
                             feature.properties?.NAME || 
                             "Unknown Region";
            const regionData = feature.properties || {};
            onRegionClick(regionData, regionName);
        }
    }, [onRegionClick]);

    // Auto-fit bounds when data changes
    useEffect(() => {
        if (geoJsonData && mapRef.current && isMapLoaded) {
            const bounds = bbox(geoJsonData);
            mapRef.current.fitBounds(bounds as [number, number, number, number], {
                padding: 50,
                duration: 1000
            });
        }
    }, [geoJsonData, isMapLoaded, theme, themeVersion]);

    // Dynamically select MapTiler style URL based on theme
    const mapStyleUrl = useMemo(() => {
        return getCurrentTheme() === "dark" ? MAPTILER_DARK : MAPTILER_LIGHT;
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
                style={{ width: "100%", height: "100%" }}
                mapStyle={mapStyleUrl}
                attributionControl={false}
                onLoad={handleMapLoad}
                onMouseMove={onHover}
                onMouseLeave={onMouseLeave}
                onClick={handleRegionClick}
                interactiveLayerIds={["data-fill"]}
                key={`map-${getCurrentTheme()}`}
            >
                <MapContext.Provider value={{ mapRef, hoveredRegion: regionHoverFeature }}>
                    {/* Use GeodataEnricher to process data */}
                    <GeodataEnricher
                        geoJsonData={geoJsonData}
                        geodata={geodata}
                        selectedGeodata={selectedGeodata}
                    >
                        {(enrichmentResult) => (
                            /* Use GeodataVisualizer to render the visualization */
                            <GeodataVisualizer
                                enrichmentResult={enrichmentResult}
                                selectedGeodata={selectedGeodata}
                                colorMode={colorMode}
                                categoricalSchemes={categoricalSchemes}
                                continuousSchemes={continuousSchemes}
                                beforeOpacity={beforeOpacity}
                                afterOpacity={afterOpacity}
                                coloredDataOpacity={coloredDataOpacity}
                                borderColor={finalBorderColor}
                                themeDefaultColor={themeDefaultColor}
                            />
                        )}
                    </GeodataEnricher>
                    
                    {/* Region labels on hover */}
                    <RegionLabels
                        geoJsonData={geoJsonData}
                        isMapLoaded={isMapLoaded}
                        zoom={zoom}
                        hoverFeature={regionHoverFeature}
                    />
                    
                    {children}
                    
                    {popupInfo && (
                        <Popup
                            longitude={popupInfo.longitude}
                            latitude={popupInfo.latitude}
                            closeButton={false}
                            className="map-tooltip"
                            anchor="top"
                        >
                            <div dangerouslySetInnerHTML={{ __html: popupInfo.featureName }} />
                        </Popup>
                    )}
                </MapContext.Provider>
            </Map>
        </div>
    );
};

export default GeoJsonMap; 