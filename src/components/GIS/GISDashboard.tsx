import React, { useState, useEffect } from 'react';
import { 
  GeoMapContainer, 
  CardsGrid, 
  LegendContainer,
  categoricalSchemes,
  continuousSchemes,
  getDefaultColors,
  getGeodataLegendConfig,
  getDynamicFlowLegendConfig,
  getDatasetLegendConfig,
  flowDataColorMap,
  flowDataLabels
} from './index';
import { 
  geoDataConfig, 
  getDatasetConfig,
  GeoDatasetConfig 
} from '../../config/geoDataConfig';
import { 
  geoJsonConfig, 
  getMapIds, 
  getMapDisplayName, 
  getMapHoverTag, 
  getMapGeoJsonPath, 
  getMapCsvPath,
  getMapConfig
} from '../../config/geoJsonConfig';
import { loadDatasetData, DatasetData } from './GeoData/dataLoader';
import { loadCsvData, getColorPalette, useThemeChange } from './index';
import { Point, ColorMap } from '../../types';
import { GeodataRow } from './utils/geodata-utils';
import { getPointDataConfig, getPointDataConfigNames } from '../../config/pointDataConfig';
import { loadPointData, ProcessedPointData } from '../../utils/pointDataLoader';
import { getPointDataLegendConfig, convertToLegendGroup, getPointDataColorMap, getPointDataCategoryLabels } from './utils/pointDataLegendUtils';
import { generatePointCardData, generatePointCardTitle } from './utils/pointDataCardUtils';
import { generateFlowCardData, generateFlowCardTitle } from './utils/flowDataCardUtils';
import { FLOW_DATA_CONFIGS, getFlowDataConfigByPrefixedName } from '../../config/flowDataConfig';
import { loadFlowData, ProcessedFlowData } from '../../utils/flowDataLoader';
import { getFlowDataColorMap, getFlowDataCategoryLabels } from '../../config/flowDataConfig';
import Controls from './Controls';
import * as turf from '@turf/turf';
import './GISDashboard.css';

// Use the new GeoJSON configuration
const MAP_CONFIG = geoJsonConfig;
const MAP_IDS = Object.keys(MAP_CONFIG);

const GISDashboard: React.FC = () => {
  const [mapId, setMapId] = useState<string>('Iran');
  const [dataType, setDataType] = useState<string>('ResearchCenter');
  const [selectedDataset, setSelectedDataset] = useState<string>('nothing');
  const [flows, setFlows] = useState<any[]>([]);
  const [filteredPoints, setFilteredPoints] = useState<Point[]>([]);
  const [hoverInfo, setHoverInfo] = useState<{ longitude: number; latitude: number; featureName: string; } | null>(null);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const themeVersion = useThemeChange('html', 'data-theme');
  const [showMap, setShowMap] = useState(true);
  const [geodata, setGeodata] = useState<GeodataRow[]>([]);
  const [selectedRegionData, setSelectedRegionData] = useState<{ regionName: string; data: Record<string, any> } | null>(null);
  const [selectedPointData, setSelectedPointData] = useState<{ pointName: string; data: Record<string, any> } | null>(null);
  const [selectedFlowData, setSelectedFlowData] = useState<{ flowName: string; data: Record<string, any> } | null>(null);
  
  // New state for dataset configuration
  const [currentDatasetConfig, setCurrentDatasetConfig] = useState<GeoDatasetConfig | null>(null);
  const [datasetData, setDatasetData] = useState<DatasetData | null>(null);
  const [isDatasetLoading, setIsDatasetLoading] = useState<boolean>(false);
  
  // New state for point data configuration
  const [currentPointDataConfig, setCurrentPointDataConfig] = useState<ProcessedPointData | null>(null);
  const [isPointDataLoading, setIsPointDataLoading] = useState<boolean>(false);
  
  // New state for flow data configuration
  const [currentFlowDataConfig, setCurrentFlowDataConfig] = useState<ProcessedFlowData | null>(null);
  const [isFlowDataLoading, setIsFlowDataLoading] = useState<boolean>(false);

  useEffect(() => {
    setShowMap(false);
    const timeout = setTimeout(() => setShowMap(true), 50);
    return () => clearTimeout(timeout);
  }, [themeVersion]);

  // Use theme-based color palette
  const colorPalette = getColorPalette();

  // Generate color map based on current selection
  const getColorMap = (): ColorMap => {
    if (currentPointDataConfig) {
      // Use color map from point data configuration
      return getPointDataColorMap(currentPointDataConfig.config);
    }
    
    if (currentFlowDataConfig) {
      // Use color map from flow data configuration
      return getFlowDataColorMap(currentFlowDataConfig.config);
    }
    
    // Fallback to flow data color map only
    return flowDataColorMap;
  };

  const colorMap = getColorMap();

  // Generate category labels based on current selection
  const getCategoryLabels = (): { [key: string]: string } => {
    if (currentPointDataConfig) {
      // Use category labels from point data configuration
      return getPointDataCategoryLabels(currentPointDataConfig.config);
    }
    
    if (currentFlowDataConfig) {
      // Use category labels from flow data configuration
      return getFlowDataCategoryLabels(currentFlowDataConfig.config);
    }
    
    // Return empty object if no config
    return {};
  };

  const categoryLabels = getCategoryLabels();

  // Create flow category labels
  const flowCategoryLabels = currentFlowDataConfig 
    ? getFlowDataCategoryLabels(currentFlowDataConfig.config)
    : { ...flowDataLabels };

  // Load dataset data when selectedDataset changes
  useEffect(() => {
    const loadDataset = async () => {
      if (selectedDataset === 'nothing') {
        setCurrentDatasetConfig(null);
        setDatasetData(null);
        setIsDatasetLoading(false);
        setCurrentPointDataConfig(null);
        setIsPointDataLoading(false);
        // Clear geodata when no dataset is selected
        setGeodata([]);
        return;
      }

      // Check if the selected dataset is compatible with the current map
      const datasetConfig = getDatasetConfig(selectedDataset);
      if (datasetConfig) {
        const datasetGeoJsonPath = datasetConfig.geoJsonPath;
        const currentMapGeoJsonPath = getMapGeoJsonPath(mapId);
        
        if (datasetGeoJsonPath !== currentMapGeoJsonPath) {
          // Dataset is not compatible with current map, clear it
          console.log(`Dataset ${selectedDataset} is not compatible with map ${mapId}`);
          setCurrentDatasetConfig(null);
          setDatasetData(null);
          setIsDatasetLoading(false);
          setCurrentPointDataConfig(null);
          setIsPointDataLoading(false);
          setGeodata([]);
          return;
        }
      }

      // Check if this is a point data selection
      if (selectedDataset.startsWith('pointdata:')) {
        const pointDataName = selectedDataset.replace('pointdata:', '');
        setIsPointDataLoading(true);
        setCurrentDatasetConfig(null);
        setDatasetData(null);
        
        try {
          const config = getPointDataConfig(pointDataName);
          if (!config) {
            console.error(`Point data configuration not found for: ${pointDataName}`);
            setIsPointDataLoading(false);
            return;
          }
          
          const processedData = await loadPointData(config);
          setCurrentPointDataConfig(processedData);
        } catch (error) {
          console.error(`Error loading point data ${pointDataName}:`, error);
          setCurrentPointDataConfig(null);
        } finally {
          setIsPointDataLoading(false);
        }
        return;
      }

      // Handle regular dataset loading
      setIsDatasetLoading(true);
      setCurrentPointDataConfig(null);
      
      const config = getDatasetConfig(selectedDataset);
      if (!config) {
        console.error(`Dataset configuration not found for: ${selectedDataset}`);
        setIsDatasetLoading(false);
        return;
      }

      setCurrentDatasetConfig(config);
      
      try {
        const data = await loadDatasetData(config);
        setDatasetData(data);
        // Don't override the map's GeoJSON - only set the geodata
        setGeodata(data.csvData as GeodataRow[]);
      } catch (error) {
        console.error(`Error loading dataset ${selectedDataset}:`, error);
        setDatasetData(null);
        setGeodata([]);
      } finally {
        setIsDatasetLoading(false);
      }
    };

    loadDataset();
  }, [selectedDataset, mapId]);

  useEffect(() => {
    const loadFlowDataAsync = async () => {
      if (dataType === 'FlowData' && selectedDataset.startsWith('flowdata:')) {
        setIsFlowDataLoading(true);
        setCurrentFlowDataConfig(null);
        
        // Clear geodata when flow data is active to prevent color fills from persisting
        setGeodata([]);
        
        try {
          // Get the flow data configuration using the helper function
          const config = getFlowDataConfigByPrefixedName(selectedDataset);
          
          if (!config) {
            console.error(`No flow data configuration found for: ${selectedDataset}`);
            setIsFlowDataLoading(false);
            return;
          }
          
          const processedData = await loadFlowData(config);
          setCurrentFlowDataConfig(processedData);
          setFlows(processedData.data);
        } catch (error) {
          console.error('Error loading flow data:', error);
          setCurrentFlowDataConfig(null);
          setFlows([]);
        } finally {
          setIsFlowDataLoading(false);
        }
      } else {
        // Clear flow data when not in FlowData mode
        setCurrentFlowDataConfig(null);
        setFlows([]);
        setIsFlowDataLoading(false);
      }
    };
    
    loadFlowDataAsync();
  }, [dataType, selectedDataset]); // Depend on both dataType and selectedDataset

  // Map data loading - always load GeoJSON when map changes
  useEffect(() => {
    const loadMapData = async () => {
      const mapConfig = getMapConfig(mapId);
      if (!mapConfig) {
        console.error(`No configuration found for mapId: ${mapId}`);
        setGeoJsonData(null);
        setGeodata([]);
        return;
      }

      // Always load geojson for the selected map
      let geojsonPath = mapConfig.geojson;
      setGeoJsonData(null);
      setGeodata([]);
      try {
        const geojsonModule = await import(/* @vite-ignore */ geojsonPath);
        setGeoJsonData(geojsonModule.default);
      } catch (error) {
        console.error(`Error loading GeoJSON for mapId: ${mapId}`, error);
        setGeoJsonData(null);
      }

      // Only load geodata if csv is defined for this map AND no dataset is selected AND not in flow data mode
      // (when dataset is selected, the dataset loading will handle geodata)
      if (selectedDataset === 'nothing' && dataType !== 'FlowData') {
        const csvPath = getMapCsvPath(mapId);
        if (csvPath) {
          try {
            const data = await loadCsvData(csvPath);
            setGeodata(data as GeodataRow[]);
          } catch (error) {
            console.error(`Error loading CSV for mapId: ${mapId}`, error);
            setGeodata([]);
          }
        } else {
          setGeodata([]);
        }
      }
    };
    loadMapData();
  }, [mapId, selectedDataset, dataType]);

  useEffect(() => {
    if (!geoJsonData) {
      setFilteredPoints([]);
      return;
    }

    // Determine which points to filter based on current selection
    let pointsToFilter: Point[] = [];
    
    if (currentPointDataConfig) {
      // Use point data from configuration
      pointsToFilter = currentPointDataConfig.data;
    } else {
      // No point data to filter
      setFilteredPoints([]);
      return;
    }

    // This ensures filtering always happens, masking points outside polygons
    const filtered = pointsToFilter.filter(p => {
      const pointGeom = turf.point(p.coordinates);
      
      // If it's a FeatureCollection (e.g., Iran with provinces, or province with counties),
      // check if point is in ANY feature (masks to the overall selected map)
      if (geoJsonData.type === 'FeatureCollection') {
        return geoJsonData.features.some((feature: any) => 
          turf.booleanPointInPolygon(pointGeom, feature)
        );
      } else if (geoJsonData.type === 'Feature') {
        return turf.booleanPointInPolygon(pointGeom, geoJsonData);
      } else {
        // Fallback for other GeoJSON types
        return turf.booleanPointInPolygon(pointGeom, geoJsonData);
      }
    });
    
    setFilteredPoints(filtered);
  }, [mapId, geoJsonData, currentPointDataConfig, dataType]);

  // Clear selected data when map or data type changes
  useEffect(() => {
    setSelectedRegionData(null);
    setSelectedPointData(null);
    setSelectedFlowData(null);
  }, [mapId, dataType, selectedDataset]);

  const handleMapChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMapId(event.target.value);
  };

  const handleDataTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setDataType(event.target.value);
  };

  const handleDatasetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDataset(event.target.value);
  };

  const handlePointHover = (info: { longitude: number; latitude: number; featureName: string; } | null) => {
    setHoverInfo(info);
  };

  const handleRegionClick = (regionData: Record<string, any>, regionName: string) => {
    console.log('=== REGION CLICK ===');
    console.log('Region clicked:', regionName);
    console.log('Selected dataset:', selectedDataset);
    console.log('Available geodata:', geodata);
    
    // Don't show data card if no dataset is selected
    if (selectedDataset === 'nothing') {
      console.log('No dataset selected, not showing data card');
      setSelectedRegionData(null);
      setSelectedPointData(null);
      return;
    }
    
    // Helper function to normalize region names (same as in dataLoader.ts)
    const normalizeRegionName = (name: string): string => {
      if (!name) return '';
      // Simply remove " Province" suffix and spaces to match CSV format
      return name.replace(' Province', '').replace(/ /g, '');
    };
    
    // Use the normalized name if available, otherwise normalize the region name
    const normalizedName = regionData.normalizedName || normalizeRegionName(regionName);
    
    // Find the corresponding data in the geodata array
    const matchingData = geodata.find(item => {
      const normalizedItemName = normalizeRegionName(item.name);
      console.log('Comparing:', item.name, '->', normalizedItemName, 'with:', normalizedName);
      return normalizedItemName === normalizedName;
    });

    if (matchingData) {
      console.log('Found matching data:', matchingData);
      setSelectedPointData(null); // Clear point selection
      setSelectedRegionData({
        regionName: regionName,
        data: matchingData
      });
    } else {
      console.log('No matching data found for:', normalizedName);
      setSelectedRegionData(null);
    }
  };

  const handleCloseDataCard = () => {
    setSelectedRegionData(null);
  };

  const handlePointClick = (point: any) => {
    console.log('=== POINT CLICK ===');
    console.log('Point clicked:', point);
    
    if (currentPointDataConfig) {
      // Use new point data card generation
      const cardData = generatePointCardData(point, currentPointDataConfig.config);
      const cardTitle = generatePointCardTitle(point, currentPointDataConfig.config);
      
      setSelectedRegionData(null); // Clear region selection
      setSelectedPointData({
        pointName: cardTitle,
        data: cardData
      });
    } else {
      // Fallback to legacy point data format
      const pointData = {
        name: point.name,
        category: point.category,
        categoryFa: point.categoryFa,
        coordinates: point.coordinates,
        sizeValue: point.sizeValue,
        // Format the data for better display
        type: point.categoryFa || point.category,
        size: point.sizeValue,
        // Add any other point properties you want to display
      };

      setSelectedRegionData(null); // Clear region selection
      setSelectedPointData({
        pointName: point.name,
        data: pointData
      });
    }
  };

  const handleClosePointDataCard = () => {
    setSelectedPointData(null);
  };

  const handleFlowClick = (flow: any) => {
    console.log('=== FLOW CLICK ===');
    console.log('Flow clicked:', flow);
    
    // Use the original CSV data directly for proper card generation
    const flowData = flow.originalData || {
      // Fallback if original data is not available
      name: flow.name || flow.category,
      origin: `${flow.origin[1].toFixed(4)}, ${flow.origin[0].toFixed(4)}`,
      destination: `${flow.destination[1].toFixed(4)}, ${flow.destination[0].toFixed(4)}`,
      size: flow.sizeValue.toFixed(2),
      type: flow.categoryFa || flow.category
    };

    setSelectedRegionData(null); // Clear region selection
    setSelectedPointData(null); // Clear point selection
    setSelectedFlowData({
      flowName: flow.name || flow.category,
      data: flowData
    });
  };

  const handleCloseFlowDataCard = () => {
    setSelectedFlowData(null);
  };

  const beforeOpacity = 0.1; // default fill opacity for non-colored maps
  const coloredDataOpacity = 0.6; // opacity for colored geodata fill and legend

  const defaultColors = getDefaultColors(colorPalette);

  // Check if current map is compatible with selected dataset
  const isMapCompatibleWithDataset = () => {
    if (!currentDatasetConfig) return false;
    
    // Check if the dataset's GeoJSON path matches the current map
    const datasetGeoJsonPath = currentDatasetConfig.geoJsonPath;
    const currentMapGeoJsonPath = getMapGeoJsonPath(mapId);
    
    return datasetGeoJsonPath === currentMapGeoJsonPath;
  };

  // Get compatible datasets for current map
  const getCompatibleDatasets = () => {
    const currentMapGeoJsonPath = getMapGeoJsonPath(mapId);
    if (!currentMapGeoJsonPath) return [];
    
    return geoDataConfig.filter(config => config.geoJsonPath === currentMapGeoJsonPath);
  };

  // Determine color mode and legend config based on current dataset
  const getColorMode = () => {
    if (!currentDatasetConfig || !isMapCompatibleWithDataset()) return 'default';
    return currentDatasetConfig.type === 'numeric' ? 'continuous' : 'categorical';
  };

  const getLegendConfig = () => {
    // Only show dataset legend if map is compatible with dataset
    if (currentDatasetConfig && datasetData && isMapCompatibleWithDataset()) {
      return getDatasetLegendConfig(currentDatasetConfig, datasetData, colorPalette);
    }
    
    // Point data legend config
    if (currentPointDataConfig && filteredPoints.length > 0) {
      const pointDataLegend = getPointDataLegendConfig(currentPointDataConfig.config, filteredPoints);
      return convertToLegendGroup(pointDataLegend);
    }
    
    // Legacy legend configs
    if (geodata.length > 0 && selectedDataset !== 'nothing') {
      const geodataLegend = getGeodataLegendConfig(selectedDataset as any, colorPalette);
      if (geodataLegend) {
        return geodataLegend;
      }
    }
    
    if (dataType === 'FlowData' && flows.length > 0 && currentFlowDataConfig) {
      const flowLegend = getDynamicFlowLegendConfig(flows, colorMap, flowCategoryLabels, currentFlowDataConfig.config.name);
      if (flowLegend) {
        return flowLegend;
      }
    }
    
    return undefined;
  };

  return (
    <div className="gis-dashboard-container">
      {/* Controls Section */}
      <div className="controls-section">
        <Controls
          selectedDataset={selectedDataset}
          onDatasetChange={handleDatasetChange}
          mapId={mapId}
          onMapChange={handleMapChange}
          mapIds={MAP_IDS}
          dataType={dataType}
          onDataTypeChange={handleDataTypeChange}
        />
      </div>
      
      {/* Main Content Section */}
      <div className="main-content-section">
        {/* Map Container */}
        <div className="map-container">
          <div className={showMap ? "map-inner map-fade-in" : "map-inner"}>
            {showMap && geoJsonData && !isDatasetLoading && !isPointDataLoading && (
              <GeoMapContainer
                geoJsonData={geoJsonData}
                geodata={geodata}
                points={filteredPoints}
                flowConfig={dataType === 'FlowData' && currentFlowDataConfig ? currentFlowDataConfig.config : null}
                popupInfo={hoverInfo}
                fillColor={colorPalette.mapForeground}
                borderColor={colorPalette.mapBorder}
                beforeOpacity={beforeOpacity}
                afterOpacity={0.3}
                coloredDataOpacity={coloredDataOpacity}
                selectedGeodata={dataType === 'FlowData' ? 'nothing' : (isMapCompatibleWithDataset() ? (currentDatasetConfig?.dataColumn || 'nothing') : 'nothing')}
                colorMode={getColorMode()}
                defaultColors={defaultColors}
                categoricalSchemes={isMapCompatibleWithDataset() ? categoricalSchemes : []}
                continuousSchemes={isMapCompatibleWithDataset() ? continuousSchemes : []}
                colorMap={colorMap}
                categoryLabels={dataType === 'FlowData' ? flowCategoryLabels : categoryLabels}
                hoverTag={getMapHoverTag(mapId)}
                onRegionClick={handleRegionClick}
                onPointClick={handlePointClick}
                onFlowClick={handleFlowClick}
                currentDatasetConfig={currentDatasetConfig}
                datasetData={datasetData}
              />
            )}
          </div>
          {/* Legends using the new modular legend system */}
          {/* Show only the legend for the currently active dataset */}
          <LegendContainer
            legendRows={[
              {
                legends: (() => {
                  const legends = [];
                  
                  const legendConfig = getLegendConfig();
                  if (legendConfig) {
                    legends.push(legendConfig);
                  }
                  
                  return legends;
                })()
              }
            ]}
            position="bottom"
            padding="var(--spacing-md)"
          />
        </div>
        
        {/* Data Cards Section - Always visible */}
        <div className="data-cards-section">
          <CardsGrid
            title={(() => {
              if (selectedRegionData) {
                return selectedRegionData.regionName;
              }
              if (selectedPointData) {
                return selectedPointData.pointName;
              }
              if (selectedFlowData && currentFlowDataConfig) {
                // Find the flow that matches the selected flow data
                const flow = currentFlowDataConfig.data.find(f => 
                  f.originalData && 
                  Object.entries(f.originalData).some(([key, value]) => 
                    selectedFlowData.data[key] === value
                  )
                );
                
                if (flow) {
                  return generateFlowCardTitle(flow, currentFlowDataConfig.config);
                }
                return selectedFlowData.flowName;
              }
              return '';
            })()}
            cards={(() => {
              const data = selectedRegionData?.data || selectedPointData?.data || selectedFlowData?.data;
              if (!data) return [];
              
              // If data is already an array of CardData objects (from point data), return it directly
              if (Array.isArray(data)) {
                return data;
              }
              
              // If we have a current dataset config, use its card configuration
              if (currentDatasetConfig && selectedRegionData) {
                const cards = [];
                for (const [key, value] of Object.entries(data)) {
                  if (key === 'name' || value === null || value === undefined || value === '') continue;
                  
                  const cardConfig = currentDatasetConfig.cardConfig[key];
                  if (cardConfig) {
                    cards.push({
                      title: cardConfig.title,
                      value: value,
                      unit: cardConfig.unit,
                      info: cardConfig.info,
                      colorCondition: cardConfig.colorCondition // Include dynamic color configuration
                    });
                  }
                }
                return cards;
              }
              
              // If we have flow data, use its card configuration
              if (selectedFlowData && currentFlowDataConfig) {
                // Find the flow that matches the selected flow data
                const flow = currentFlowDataConfig.data.find(f => 
                  f.originalData && 
                  Object.entries(f.originalData).some(([key, value]) => 
                    data[key] === value
                  )
                );
                
                if (flow) {
                  return generateFlowCardData(flow, currentFlowDataConfig.config);
                }
              }
              
              // If no specific configuration is found, return empty array
              return [];
            })()}
            onClose={() => {}} // No close functionality needed
          />
        </div>
      </div>
    </div>
  );
};

export default GISDashboard; 