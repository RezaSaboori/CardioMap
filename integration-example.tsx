import React, { useState, useEffect } from 'react';
import { GeoMapContainer } from './src/components/GIS';
import { loadPointsFromCsv, loadCsvData, PointMappingConfig } from './src/components/GIS';
import { 
  Legend, 
  LegendGroup, 
  LegendRow, 
  LegendContainer,
  generateColorScale,
  createGradientLegend,
  createCategoricalLegend
} from './src/components/GIS/legends';

// Import required styles
import './src/components/GIS/glassmorphic-map.css';
import './src/components/GIS/point-layer.css';
import './src/components/GIS/tooltip.css';

// Example GeoJSON data (you would load this from your own file)
const exampleGeoJson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Region 1", id: "region1" },
      geometry: {
        type: "Polygon",
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
      }
    }
  ]
};

// Example CSV data for regions
const exampleRegionData = [
  { name: "Region 1", population: 1000000, gdp: 50000 },
  { name: "Region 2", population: 800000, gdp: 40000 }
];

// Example CSV data for points
const examplePointsCsv = `name,latitude,longitude,type,size
Hospital A,35.6892,51.3890,hospital,500
Clinic B,35.7219,51.3347,clinic,50
Hospital C,35.7578,51.4117,hospital,300`;

function IntegrationExample() {
  const [regionData, setRegionData] = useState<Record<string, any>[]>([]);
  const [points, setPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('population');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load region data (replace with your actual CSV path)
      const regions = await loadCsvData('/path/to/your/regions.csv');
      setRegionData(regions);

      // Load points data (replace with your actual CSV path)
      const pointConfig: PointMappingConfig = {
        nameColumn: 'name',
        latColumn: 'latitude',
        lonColumn: 'longitude',
        categoryColumn: 'type',
        sizeColumn: 'size',
        defaultSize: 0.3
      };
      
      const pointData = await loadPointsFromCsv('/path/to/your/points.csv', pointConfig);
      setPoints(pointData);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Color mapping for different point types
  const pointColorMap = {
    hospital: '#ff4444',
    clinic: '#44ff44',
    pharmacy: '#4444ff'
  };

  // Category labels for the legend
  const categoryLabels = {
    hospital: 'Hospitals',
    clinic: 'Clinics',
    pharmacy: 'Pharmacies'
  };

  if (loading) {
    return <div>Loading map data...</div>;
  }

  return (
    <div className="integration-example">
      <h1>GIS Dashboard Integration Example</h1>
      
      {/* Metric selector */}
      <div className="controls">
        <label>
          Select Metric:
          <select 
            value={selectedMetric} 
            onChange={(e) => setSelectedMetric(e.target.value)}
          >
            <option value="population">Population</option>
            <option value="gdp">GDP</option>
          </select>
        </label>
      </div>

      {/* Main map component */}
      <div className="map-container">
        <GeoMapContainer
          geoJsonData={exampleGeoJson}
          geodata={regionData}
          points={points}
          selectedGeodata={selectedMetric}
          colorMode="continuous"
          colorMap={pointColorMap}
          categoryLabels={categoryLabels}
          beforeOpacity={0.3}
          afterOpacity={0.7}
          coloredDataOpacity={0.8}
        />
      </div>

      {/* Additional controls */}
      <div className="info-panel">
        <h3>Integration Notes:</h3>
        <ul>
          <li>Replace CSV paths with your actual data files</li>
          <li>Update GeoJSON with your region boundaries</li>
          <li>Customize colors and styling as needed</li>
          <li>Add your own controls and interactions</li>
        </ul>
      </div>
    </div>
  );
}

// Example 2: Using modular legend components
function ModularLegendExample() {
  const populationGradient = generateColorScale(0, 1000000);
  const healthColorMap = {
    good: '#00ff00',
    medium: '#ffff00',
    poor: '#ff0000'
  };

  const legendRows = [
    {
      legends: [
        {
          title: 'Population',
          legendProps: {
            gradient: populationGradient,
            gradientLabels: { left: 'Low', right: 'High' },
            showLegend: true
          }
        },
        {
          title: 'Health Status',
          legendProps: {
            colorMap: healthColorMap,
            categoryLabels: {
              good: 'Good',
              medium: 'Medium',
              poor: 'Poor'
            },
            showLegend: true
          }
        }
      ]
    }
  ];

  return (
    <div className="modular-legend-example">
      <h2>Modular Legend System</h2>
      <div style={{ position: 'relative', height: '400px', border: '1px solid #ccc' }}>
        <LegendContainer
          legendRows={legendRows}
          position="bottom"
          padding="20px"
        />
      </div>
    </div>
  );
}

// Example 3: Individual legend components
function IndividualLegendExample() {
  const colorMap = {
    hospital: '#ff0000',
    clinic: '#00ff00',
    pharmacy: '#0000ff'
  };

  return (
    <div className="individual-legend-example">
      <h2>Individual Legend Components</h2>
      
      {/* Simple legend */}
      <Legend
        colorMap={colorMap}
        categoryLabels={{
          hospital: 'Hospitals',
          clinic: 'Clinics',
          pharmacy: 'Pharmacies'
        }}
        showLegend={true}
      />
      
      {/* Legend with group */}
      <LegendGroup
        title="Healthcare Facilities"
        legendProps={{
          colorMap,
          showLegend: true
        }}
      />
      
      {/* Multiple legends in a row */}
      <LegendRow
        legends={[
          {
            title: 'Primary',
            legendProps: {
              colorMap: { a: '#ff0000', b: '#00ff00' },
              showLegend: true
            }
          },
          {
            title: 'Secondary',
            legendProps: {
              colorMap: { x: '#0000ff', y: '#ffff00' },
              showLegend: true
            }
          }
        ]}
      />
    </div>
  );
}

// Example 4: Using utility functions
function UtilityFunctionsExample() {
  // Create gradient legend using utility
  const gradientConfig = createGradientLegend(
    ['#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'],
    [0, 250000, 500000, 750000, 1000000],
    { left: 'No Population', right: '1M+ Population' }
  );

  // Create categorical legend using utility
  const categoricalConfig = createCategoricalLegend(
    { red: '#ff0000', green: '#00ff00', blue: '#0000ff' },
    { red: 'Red Items', green: 'Green Items', blue: 'Blue Items' }
  );

  return (
    <div className="utility-functions-example">
      <h2>Using Utility Functions</h2>
      
      <h3>Gradient Legend (Utility)</h3>
      <Legend
        gradient={gradientConfig.gradient}
        gradientLabels={gradientConfig.gradientLabels}
        showLegend={true}
      />
      
      <h3>Categorical Legend (Utility)</h3>
      <Legend
        colorMap={categoricalConfig.colorMap}
        categoryLabels={categoricalConfig.categoryLabels}
        showLegend={true}
      />
    </div>
  );
}

// Example 5: Custom styling
function CustomStylingExample() {
  const colorMap = {
    category1: '#ff6b6b',
    category2: '#4ecdc4',
    category3: '#45b7d1'
  };

  return (
    <div className="custom-styling-example">
      <h2>Custom Styling</h2>
      
      <LegendGroup
        title="Custom Styled Legend"
        legendProps={{
          colorMap,
          showLegend: true
        }}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '2px solid #333',
          borderRadius: '12px'
        }}
        titleStyle={{
          color: '#333',
          fontWeight: 'bold',
          fontSize: '16px'
        }}
      />
    </div>
  );
}

// Example 6: Responsive legend system
function ResponsiveLegendExample() {
  const legends = [
    {
      title: 'Primary Data',
      legendProps: {
        colorMap: { a: '#ff0000', b: '#00ff00' } as Record<string, string>,
        showLegend: true
      }
    },
    {
      title: 'Secondary Data',
      legendProps: {
        colorMap: { x: '#0000ff', y: '#ffff00' } as Record<string, string>,
        showLegend: true
      }
    }
  ];

  return (
    <div className="responsive-legend-example">
      <h2>Responsive Legend System</h2>
      <div style={{ position: 'relative', height: '300px', border: '1px solid #ccc' }}>
        <LegendContainer
          legendRows={[{ legends }]}
          position="bottom"
          style={{
            padding: '10px',
            maxWidth: '100%'
          }}
        />
      </div>
    </div>
  );
}

// Main example component
function CompleteIntegrationExamples() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <h1>Complete GIS Dashboard Integration Examples</h1>
      
      <IntegrationExample />
      <hr />
      
      <ModularLegendExample />
      <hr />
      
      <IndividualLegendExample />
      <hr />
      
      <UtilityFunctionsExample />
      <hr />
      
      <CustomStylingExample />
      <hr />
      
      <ResponsiveLegendExample />
    </div>
  );
}

export default CompleteIntegrationExamples; 