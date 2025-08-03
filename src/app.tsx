import React, { useState, useEffect } from 'react';
import { 
  GeoMapContainer, 
  CardsGrid, 
  loadFlowsFromCsv,
  Legend, 
  LegendGroup, 
  LegendRow, 
  LegendContainer,
  categoricalSchemes,
  continuousSchemes,
  getDefaultColors,
  getGeodataLegendConfig,
  getResearchCentersLegendConfig,
  getDynamicResearchCentersLegendConfig,
  getFlowDataLegendConfig,
  getDynamicFlowLegendConfig,
  flowDataColorMap,
  flowDataLabels
} from './components/GIS';
// ThemeToggle as a local component
const ThemeToggle: React.FC = () => {
  const [dark, setDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <label style={{ position: 'fixed', top: 16, right: 16, zIndex: 1000, background: '#fff8', padding: 8, borderRadius: 8 }}>
      <input
        type="checkbox"
        checked={dark}
        onChange={e => setDark(e.target.checked)}
        style={{ marginRight: 8 }}
      />
      Dark mode
    </label>
  );
};

// Controls as a local component
interface ControlsProps {
  dataType: string;
  onDataTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  mapId: string;
  onMapChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  mapIds: string[];
  selectedGeodata: 'pop' | 'health_status' | 'nothing';
  onGeodataChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Controls: React.FC<ControlsProps> = ({
  dataType,
  onDataTypeChange,
  mapId,
  onMapChange,
  mapIds,
  selectedGeodata,
  onGeodataChange,
}) => {
  // Combined data options
  const dataOptions = [
    { value: 'nothing', label: 'No Data' },
    { value: 'ResearchCenter', label: 'Research Centers' },
    { value: 'FlowData', label: 'Disease Path' },
    { value: 'pop', label: 'Population Data' },
    { value: 'health_status', label: 'Health Status Data' }
  ];

  const handleCombinedDataChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    if (value === 'ResearchCenter' || value === 'FlowData') {
      onDataTypeChange(e);
      onGeodataChange({ target: { value: 'nothing' } } as React.ChangeEvent<HTMLSelectElement>);
    } else if (value === 'pop' || value === 'health_status') {
      onGeodataChange(e);
      onDataTypeChange({ target: { value: 'Nothing' } } as React.ChangeEvent<HTMLSelectElement>);
    } else {
      onDataTypeChange(e);
      onGeodataChange({ target: { value: 'nothing' } } as React.ChangeEvent<HTMLSelectElement>);
    }
  };

  // Get the current combined value
  const getCombinedValue = () => {
    if (dataType === 'ResearchCenter') return 'ResearchCenter';
    if (dataType === 'FlowData') return 'FlowData';
    if (selectedGeodata !== 'nothing') return selectedGeodata;
    return 'nothing';
  };

  return (
    <div className="controls">
      <label htmlFor="data-select">Select Data:</label>
      <select id="data-select" value={getCombinedValue()} onChange={handleCombinedDataChange}>
        {dataOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label htmlFor="map-select">Select a Map:</label>
      <select id="map-select" onChange={onMapChange} value={mapId}>
        {mapIds.map(id => (
          <option key={id} value={id}>
            {id}
          </option>
        ))}
      </select>

    </div>
  );
};
import { loadCsvData, loadResearchCentersData, getColorPalette, useThemeChange } from './components/GIS';
import { Point, ColorMap } from './types';
import './app.css';
import provinces from './datasets/geojson/Iran.json';
import * as turf from '@turf/turf';
import IranProvincesSampleCsv from './datasets/IranProvincesSample.csv?url';
import TehranCountiesSampleCsv from './datasets/TehranCountiesSample.csv?url';
import ResearchCenterCsv from './datasets/ResearchCenter.csv?url';
// Define a simple type for our GeoJSON structure
interface GeoJSON {
  features: {
    properties: {
      tags: {
        'name:en': string;
      };
    };
  }[];
}

const typedProvinces = provinces as GeoJSON;

const provinceNames = typedProvinces.features.map(feature => {
  const provinceName = feature.properties.tags['name:en'].replace(' Province', '').replace(/ /g, '');
  return provinceName;
});
// Map/data config: all maps for marker display, only some have geodata
const MAP_CONFIG: Record<string, { geojson: string; csv?: string }> = {
  Iran: { geojson: './datasets/geojson/Iran.json', csv: IranProvincesSampleCsv },
  Tehran: { geojson: './datasets/geojson/Tehran.json', csv: TehranCountiesSampleCsv },
  // Add more maps with geodata here
};
const MAP_IDS = ['Iran', ...provinceNames];

const App: React.FC = () => {
  const [mapId, setMapId] = useState<string>('Iran');
  const [dataType, setDataType] = useState<string>('ResearchCenter');
  const [points, setPoints] = useState<Point[]>([]);
  const [flows, setFlows] = useState<any[]>([]);
  const [filteredPoints, setFilteredPoints] = useState<Point[]>([]);
  const [hoverInfo, setHoverInfo] = useState<{ longitude: number; latitude: number; featureName: string; } | null>(null);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const themeVersion = useThemeChange('html', 'data-theme');
  const [showMap, setShowMap] = useState(true);
  const [selectedGeodata, setSelectedGeodata] = useState<'pop' | 'health_status' | 'nothing'>('nothing');
  const [geodata, setGeodata] = useState<Record<string, any>[]>([]);
  const [selectedRegionData, setSelectedRegionData] = useState<{ regionName: string; data: Record<string, any> } | null>(null);
  const [selectedPointData, setSelectedPointData] = useState<{ pointName: string; data: Record<string, any> } | null>(null);
  const [selectedFlowData, setSelectedFlowData] = useState<{ flowName: string; data: Record<string, any> } | null>(null);

  useEffect(() => {
    setShowMap(false);
    const timeout = setTimeout(() => setShowMap(true), 50);
    return () => clearTimeout(timeout);
  }, [themeVersion]);

  // Use theme-based color palette
  const colorPalette = getColorPalette();

  const colorMap: ColorMap = {
    "Hospital": colorPalette.hospital,
    "Research Center": colorPalette.researchCenter,
    "Research Facility": colorPalette.researchFacility,
    ...flowDataColorMap
  };

  const categoryLabels = points.reduce((acc, point) => {
    acc[point.category] = point.categoryFa;
    return acc;
  }, {} as { [key: string]: string });

  // Create flow category labels
  const flowCategoryLabels = { ...flowDataLabels };

  useEffect(() => {
    const fetchData = async () => {
      const researchData = await loadResearchCentersData();
      setPoints(researchData);
      
      // Load flow data
      try {
        const csvPath = '/DeseasePath.csv';
        const flowConfig = {
          categoryColumn: 'Disease',
          nameColumn: 'Disease',
          originLatColumn: 'Origin',
          originLonColumn: 'Origin',
          destLatColumn: 'Destination',
          destLonColumn: 'Destination',
          sizeColumn: 'pop',
          defaultSize: 0.3
        };
        
        const flowData = await loadFlowsFromCsv(csvPath, flowConfig);
        setFlows(flowData);
      } catch (error) {
        console.error('Error loading flow data:', error);
        setFlows([]);
      }
    };
    fetchData();
  }, []); // Remove selectedFlowDataset dependency

  useEffect(() => {
    const loadData = async () => {
      // Always load geojson for the selected map
      let geojsonPath = MAP_CONFIG[mapId]?.geojson || `./datasets/geojson/${mapId}.json`;
      setGeoJsonData(null);
      setGeodata([]);
      try {
        const geojsonModule = await import(/* @vite-ignore */ geojsonPath);
        setGeoJsonData(geojsonModule.default);
      } catch (error) {
        console.error(`Error loading GeoJSON for mapId: ${mapId}`, error);
        setGeoJsonData(null);
      }
      // Only load geodata if csv is defined for this map
      const csvPath = MAP_CONFIG[mapId]?.csv;
      if (csvPath) {
        try {
          const data = await loadCsvData(csvPath);
          setGeodata(data);
        } catch (error) {
          console.error(`Error loading CSV for mapId: ${mapId}`, error);
          setGeodata([]);
        }
      } else {
        setGeodata([]);
      }
    };
    loadData();
  }, [mapId]);

  useEffect(() => {
    if (!geoJsonData) {
      setFilteredPoints([]);
      return;
    }

    // This ensures filtering always happens, masking points outside polygons
    const filtered = points.filter(p => {
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
  }, [mapId, points, geoJsonData]);

  const handleMapChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMapId(event.target.value);
  };

  const handleDataTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setDataType(event.target.value);
  };

  const handleGeodataChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGeodata(event.target.value as 'pop' | 'health_status' | 'nothing');
  };

  const handlePointHover = (info: { longitude: number; latitude: number; featureName: string; } | null) => {
    setHoverInfo(info);
  };

  const handleRegionClick = (regionData: Record<string, any>, regionName: string) => {
    console.log('=== REGION CLICK ===');
    console.log('Region clicked:', regionName);
    console.log('Selected geodata:', selectedGeodata);
    console.log('Available geodata:', geodata);
    
    // Don't show data card if no geodata is selected
    if (selectedGeodata === 'nothing') {
      console.log('No geodata selected, not showing data card');
      setSelectedRegionData(null);
      setSelectedPointData(null);
      return;
    }
    
    // Find the corresponding data in the geodata array
    const matchingData = geodata.find(item => {
      console.log('Comparing:', item.name, 'with:', regionName);
      return item.name === regionName;
    });

    if (matchingData) {
      console.log('Found matching data:', matchingData);
      setSelectedPointData(null); // Clear point selection
      setSelectedRegionData({
        regionName: regionName,
        data: matchingData
      });
    } else {
      console.log('No matching data found for:', regionName);
      setSelectedRegionData(null);
    }
  };

  const handleCloseDataCard = () => {
    setSelectedRegionData(null);
  };

  const handlePointClick = (point: any) => {
    console.log('=== POINT CLICK ===');
    console.log('Point clicked:', point);
    
    // Convert point data to a format suitable for the data card
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
  };

  const handleClosePointDataCard = () => {
    setSelectedPointData(null);
  };

  const handleFlowClick = (flow: any) => {
    console.log('=== FLOW CLICK ===');
    console.log('Flow clicked:', flow);
    
    // Use the original CSV data if available, otherwise fall back to processed data
    const flowData = flow.originalData ? {
      // Show all original CSV fields
      Origin: flow.originalData.Origin,
      Destination: flow.originalData.Destination,
      Disease: flow.originalData.Disease,
      pop: flow.originalData.pop,
      // Add processed data for display
      origin_coordinates: `${flow.origin[1].toFixed(4)}, ${flow.origin[0].toFixed(4)}`,
      destination_coordinates: `${flow.destination[1].toFixed(4)}, ${flow.destination[0].toFixed(4)}`,
      size_value: flow.sizeValue.toFixed(2),
      category: flow.category,
      category_fa: flow.categoryFa || flow.category
    } : {
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

  return (
    <>
      <ThemeToggle />
      <div className="app-container">
        <Controls
          dataType={dataType}
          onDataTypeChange={handleDataTypeChange}
          mapId={mapId}
          onMapChange={handleMapChange}
          mapIds={MAP_IDS}
          selectedGeodata={selectedGeodata}
          onGeodataChange={handleGeodataChange}
        />
        <div className="gis-container">
          <div className="map-container">
            <div className={showMap ? "map-inner map-fade-in" : "map-inner"}>
              {showMap && geoJsonData && (
                <GeoMapContainer
                  geoJsonData={geoJsonData}
                  geodata={geodata}
                  points={dataType === 'ResearchCenter' ? filteredPoints : []}
                  flows={dataType === 'FlowData' ? flows : []}
                  popupInfo={hoverInfo}
                  fillColor={colorPalette.mapForeground}
                  borderColor={colorPalette.mapBorder}
                  beforeOpacity={beforeOpacity}
                  afterOpacity={0.3}
                  coloredDataOpacity={coloredDataOpacity}
                  selectedGeodata={selectedGeodata}
                  colorMode={
                    geodata.length > 0 && selectedGeodata === 'pop'
                      ? 'continuous'
                      : geodata.length > 0 && selectedGeodata === 'health_status'
                      ? 'categorical'
                      : 'default'
                  }
                  defaultColors={defaultColors}
                  categoricalSchemes={categoricalSchemes}
                  continuousSchemes={continuousSchemes}
                  colorMap={colorMap}
                  categoryLabels={dataType === 'FlowData' ? flowCategoryLabels : categoryLabels}
                  onRegionClick={handleRegionClick}
                  onPointClick={handlePointClick}
                  onFlowClick={handleFlowClick}
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
                    
                    // Show geodata legend only when geodata is selected and available
                    if (geodata.length > 0 && selectedGeodata !== 'nothing') {
                      const geodataLegend = getGeodataLegendConfig(selectedGeodata, colorPalette);
                      if (geodataLegend) {
                        legends.push(geodataLegend);
                      }
                    }
                    // Show research centers legend only when research centers are selected
                    else if (dataType === 'ResearchCenter' && filteredPoints.length > 0) {
                      const researchLegend = getDynamicResearchCentersLegendConfig(filteredPoints, colorMap, categoryLabels);
                      if (researchLegend) {
                        legends.push(researchLegend);
                      }
                    }
                    // Show flow legend only when flow data is selected
                    else if (dataType === 'FlowData' && flows.length > 0) {
                      const flowLegend = getDynamicFlowLegendConfig(flows, colorMap, flowCategoryLabels, 'Disease Path');
                      if (flowLegend) {
                        legends.push(flowLegend);
                      }
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
              title={selectedRegionData?.regionName || selectedPointData?.pointName || selectedFlowData?.flowName || 'Select a region, marker, or flow to view data'}
              cards={(() => {
                const data = selectedRegionData?.data || selectedPointData?.data || selectedFlowData?.data;
                if (!data) return [];
                
                // Convert data object to cards format
                const cards = [];
                for (const [key, value] of Object.entries(data)) {
                  if (key === 'name' || value === null || value === undefined || value === '') continue;
                  
                  let title = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
                  let unit = '';
                  let info = '';
                  
                  // Define units and info based on field names
                  if (key === 'pop') {
                    title = 'Population';
                    unit = 'people';
                    info = 'Total population of the province';
                  } else if (key === 'health_status') {
                    title = 'Health Status';
                    info = 'Overall health status of the province';
                  } else if (key === 'Doctors per 10k') {
                    unit = 'doctors';
                    info = 'Healthcare professionals per 10,000 residents';
                  } else if (key === 'Hospital Beds') {
                    unit = 'beds';
                    info = 'Total number of hospital beds';
                  } else if (key === 'Area') {
                    unit = 'km²';
                    info = 'Province area in square kilometers';
                  } else if (key === 'coordinates') {
                    title = 'Coordinates';
                    info = 'Geographic coordinates (lat, lng)';
                  } else if (key === 'type' || key === 'category') {
                    title = 'Type';
                    info = 'Category or type of the data point';
                  } else if (key === 'size' || key === 'size_value') {
                    title = 'Size';
                    info = 'Relative size or importance value';
                  }
                  
                  cards.push({
                    title,
                    value: value,
                    unit,
                    info
                  });
                }
                
                return cards;
              })()}
              onClose={() => {}} // No close functionality needed
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default App; 