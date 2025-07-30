# GIS Dashboard - Complete Integration Guide

A comprehensive, reusable GIS dashboard built with React, TypeScript, and MapLibre GL. Features interactive maps, point markers, choropleth visualizations, and a modular legend system.

## 🚀 Features

- 🗺️ **Interactive Maps** - Built with MapLibre GL and Deck.gl
- 📍 **Point Markers** - Configurable markers with clustering and hover effects
- 🎨 **Modular Legend System** - Flexible, reusable legend components
- 📊 **Data Visualization** - Choropleth maps with continuous/categorical color schemes
- 📱 **Responsive Design** - Works on desktop and mobile
- 🔧 **TypeScript Support** - Full type safety and IntelliSense
- 🎯 **Flexible Data Loading** - Works with any CSV structure
- 🌙 **Theme Support** - Light/dark theme compatibility

## 📦 Installation

### Prerequisites
- React 18+ 
- TypeScript 4.5+
- Node.js 16+

### Install Dependencies
```bash
# Core dependencies
npm install @deck.gl/core @deck.gl/layers @deck.gl/react @turf/turf d3-array d3-dsv d3-geo d3-shape lodash maplibre-gl papaparse react-map-gl supercluster

# Type definitions
npm install --save-dev @types/d3-array @types/d3-dsv @types/d3-geo @types/d3-shape @types/lodash @types/papaparse @types/supercluster @danmarshall/deckgl-typings @types/geojson
```

## 📁 File Structure

```
src/
├── components/
│   └── GIS/                    # Complete GIS Dashboard Package
│       ├── index.ts            # Main export file
│       ├── GeoMapContainer.tsx # Main map container
│       ├── geo-json-map.tsx    # Core map component
│       ├── point-layer.tsx     # Point markers layer
│       ├── region-labels.tsx   # Region label component
│       ├── legends/            # Modular legend system
│       │   ├── index.ts
│       │   ├── Legend.tsx      # Core legend component
│       │   ├── LegendGroup.tsx # Legend with title wrapper
│       │   ├── LegendRow.tsx   # Multiple legends in a row
│       │   ├── LegendContainer.tsx # Outer positioning container
│       │   ├── legend-utils.ts # Utility functions
│       │   └── legend.css      # Legend styles
│       ├── utils/              # All utility functions
│       │   ├── csv-loader.ts   # Flexible CSV loading
│       │   ├── color-utils.ts  # Color manipulation
│       │   ├── centroid-utils.ts # Geometry utilities
│       │   ├── polygon-masking.ts # Polygon operations
│       │   ├── resolution-utils.ts # Resolution handling
│       │   ├── name-mapper.ts  # Name mapping utilities
│       │   └── theme.ts        # Theme utilities
│       ├── hooks/              # Custom React hooks
│       │   └── useThemeChange.ts # Theme management hook
│       ├── glassmorphic-map.css # Map styling
│       ├── point-layer.css     # Point layer styling
│       ├── region-labels.css   # Region labels styling
│       └── tooltip.css         # Tooltip styling
├── types/
│   └── index.ts                # TypeScript type definitions
```

## 🚀 Quick Start

**🎉 Self-Contained Package**: The GIS dashboard is now completely self-contained! All components, utilities, hooks, and styles are included within the `GIS` directory.

### 1. Copy Required Files
```bash
# Copy the entire GIS directory to your components folder
cp -r src/components/GIS/ your-project/src/components/
```

### 2. Import Components
```typescript
// Import from the GIS directory
import { GeoMapContainer, loadPointsFromCsv, loadCsvData } from './src/components/GIS';
import { Legend, LegendGroup, LegendRow, LegendContainer } from './src/components/GIS/legends';
```

### 3. Import Styles
```typescript
// Import GIS styles
import './src/components/GIS/glassmorphic-map.css';
import './src/components/GIS/point-layer.css';
import './src/components/GIS/tooltip.css';
```

### 4. Load Your Data
```typescript
// Load region data (for choropleth maps)
const regionData = await loadCsvData('/path/to/your/regions.csv');

// Load points data with flexible configuration
const pointConfig = {
  nameColumn: 'name',
  latColumn: 'latitude',
  lonColumn: 'longitude',
  categoryColumn: 'type',
  sizeColumn: 'size',
  defaultSize: 0.3
};
const points = await loadPointsFromCsv('/path/to/your/points.csv', pointConfig);
```

### 5. Use the Component
```typescript
function MyApp() {
  return (
    <GeoMapContainer
      geoJsonData={yourGeoJsonData}
      geodata={regionData}
      points={points}
      selectedGeodata="population"
      colorMode="continuous"
    />
  );
}
```

## 🧩 Component APIs

### GeoMapContainer

The main component for displaying interactive maps.

```typescript
interface GeoMapContainerProps {
  geoJsonData: any;                    // GeoJSON for map regions
  geodata: Record<string, any>[];      // Data for region coloring
  points?: Point[];                    // Optional point markers
  popupInfo?: PopupInfo | null;        // Optional popup data
  fillColor?: string;                  // Default fill color
  borderColor?: string;                // Border color
  beforeOpacity?: number;              // Default opacity (0-1)
  afterOpacity?: number;               // Hover opacity (0-1)
  coloredDataOpacity?: number;         // Data-colored opacity (0-1)
  selectedGeodata?: string;            // Column to visualize
  colorMode?: 'continuous' | 'categorical' | 'default';
  defaultColors?: { light: string; dark: string };
  categoricalSchemes?: Array<{ column: string; colorMap: Record<string, string> }>;
  continuousSchemes?: Array<{ column: string; gradient: Array<{ value: number; color: string }> }>;
  colorMap?: Record<string, string>;   // For point colors
  categoryLabels?: Record<string, string>; // Point category labels
  children?: React.ReactNode;          // Additional components
}
```

### Legend Components

#### Legend (Core Component)
```typescript
interface LegendProps {
  colorMap?: ColorMap;                    // For categorical legends
  categoryLabels?: { [key: string]: string }; // Custom labels
  showLegend: boolean;                    // Show/hide legend
  gradient?: GradientStop[];              // For gradient legends
  gradientLabels?: { left: string; right: string }; // Gradient labels
  className?: string;                     // Additional CSS classes
  style?: React.CSSProperties;           // Inline styles
}
```

#### LegendGroup
```typescript
interface LegendGroupProps {
  title: string;                          // Legend title
  legendProps: LegendProps;               // Legend configuration
  className?: string;                     // Additional CSS classes
  style?: React.CSSProperties;           // Inline styles
  titleClassName?: string;                // Title CSS classes
  titleStyle?: React.CSSProperties;      // Title inline styles
}
```

#### LegendRow
```typescript
interface LegendRowProps {
  legends: LegendGroupProps[];            // Array of legend groups
  className?: string;                     // Additional CSS classes
  style?: React.CSSProperties;           // Inline styles
  gap?: string;                          // Grid gap (default: var(--spacing-md))
  columns?: number;                       // Grid columns (default: 2)
}
```

#### LegendContainer
```typescript
interface LegendContainerProps {
  legendRows: LegendRowProps[];           // Array of legend rows
  className?: string;                     // Additional CSS classes
  style?: React.CSSProperties;           // Inline styles
  position?: 'bottom' | 'top' | 'left' | 'right'; // Position
  padding?: string;                       // Container padding
}
```

## 📊 Data Formats

### GeoJSON Structure
Your GeoJSON should have a `features` array with properties that match your CSV data:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Region Name",
        "id": "unique_id"
      },
      "geometry": { ... }
    }
  ]
}
```

### CSV Data Format

#### Region Data (for choropleth maps)
```csv
name,population,gdp,health_status
Region 1,1000000,50000,good
Region 2,800000,40000,medium
```

#### Point Data (for markers)
```csv
name,latitude,longitude,type,size
Hospital A,35.6892,51.3890,hospital,500
Clinic B,35.7219,51.3347,clinic,50
```

## 🎨 Usage Examples

### Basic Choropleth Map
```typescript
const regionData = await loadCsvData('/data/provinces.csv');

<GeoMapContainer
  geoJsonData={provincesGeoJson}
  geodata={regionData}
  selectedGeodata="population"
  colorMode="continuous"
/>
```

### Map with Points
```typescript
const points = await loadPointsFromCsv('/data/hospitals.csv', {
  nameColumn: 'hospital_name',
  latColumn: 'latitude',
  lonColumn: 'longitude',
  categoryColumn: 'type',
  sizeColumn: 'beds'
});

<GeoMapContainer
  geoJsonData={regionsGeoJson}
  geodata={regionData}
  points={points}
  colorMap={{ 'hospital': '#ff0000', 'clinic': '#00ff00' }}
/>
```

### Custom Legend System
```typescript
<GeoMapContainer
  geoJsonData={geoJson}
  geodata={data}
  points={points}
>
  <LegendContainer
    legendRows={[{
      legends: [{
        title: 'Population',
        legendProps: {
          gradient: generateColorScale(0, 1000000),
          showLegend: true
        }
      }, {
        title: 'Facilities',
        legendProps: {
          colorMap: { hospital: '#ff0000', clinic: '#00ff00' },
          showLegend: true
        }
      }]
    }]}
    position="bottom"
  />
</GeoMapContainer>
```

### Individual Legend Components
```typescript
// Simple legend
<Legend
  colorMap={{ hospital: '#ff0000', clinic: '#00ff00' }}
  categoryLabels={{ hospital: 'Hospitals', clinic: 'Clinics' }}
  showLegend={true}
/>

// Legend with group
<LegendGroup
  title="Healthcare Facilities"
  legendProps={{
    colorMap: { hospital: '#ff0000', clinic: '#00ff00' },
    showLegend: true
  }}
/>

// Multiple legends in a row
<LegendRow
  legends={[
    {
      title: 'Population',
      legendProps: {
        gradient: gradientData,
        showLegend: true
      }
    },
    {
      title: 'Health Status',
      legendProps: {
        colorMap: { good: '#00ff00', poor: '#ff0000' },
        showLegend: true
      }
    }
  ]}
/>
```

## 🔧 Utility Functions

### CSV Loading
```typescript
// Load any CSV as raw data
const data = await loadCsvData('/path/to/data.csv');

// Load CSV and convert to Point objects
const points = await loadPointsFromCsv('/path/to/points.csv', {
  nameColumn: 'name',
  latColumn: 'latitude',
  lonColumn: 'longitude',
  categoryColumn: 'type',
  sizeColumn: 'size',
  defaultSize: 0.3
});
```

### Legend Utilities
```typescript
// Generate color scale for continuous data
const gradient = generateColorScale(0, 1000000, [
  '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'
]);

// Create gradient legend configuration
const gradientConfig = createGradientLegend(
  ['#e0f3f8', '#abd9e9', '#74add1'],
  [0, 500000, 1000000],
  { left: 'Low', right: 'High' }
);

// Create categorical legend configuration
const categoricalConfig = createCategoricalLegend(
  { red: '#ff0000', blue: '#0000ff' },
  { red: 'Red Items', blue: 'Blue Items' }
);
```

## 🎨 Styling

### CSS Variables Required
```css
:root {
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  
  /* Colors */
  --color-gray1: #f8f9fa;
  --color-gray3: #dee2e6;
  --color-gray5: #adb5bd;
  --color-gray6: #6c757d;
  --color-gray10: #495057;
  --color-gray12: #212529;
  
  /* Typography */
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-weight-bold: 600;
  --line-height-normal: 1.5;
  
  /* Borders */
  --border-width-hairline: 1px;
  --border-radius-pill: 999px;
  --border-radius-container-xs: 8px;
  
  /* Shadows */
  --elevation-1: 0 1px 3px rgba(0,0,0,0.12);
  --elevation-3: 0 4px 6px rgba(0,0,0,0.1);
  
  /* Motion */
  --motion-duration-fast: 0.15s;
  --motion-duration-normal: 0.3s;
  --motion-easing-easeOut: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Theme Support
```typescript
import { useThemeChange } from './src/hooks/useThemeChange';

function App() {
  const { theme, toggleTheme } = useThemeChange();
  
  return (
    <div className={`app ${theme}`}>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <GeoMapContainer {...props} />
    </div>
  );
}
```

## 🚨 Troubleshooting

### Common Issues

**Map not displaying:**
- Check that GeoJSON is valid
- Ensure coordinates are in the correct format (longitude, latitude)
- Verify MapLibre GL is properly initialized

**Points not showing:**
- Validate CSV column mappings in `PointMappingConfig`
- Check coordinate format (should be decimal degrees)
- Ensure `points` array is not empty

**Legend not displaying:**
- Check `showLegend` prop is true
- Verify colorMap or gradient is provided
- Ensure legend CSS is imported

**Styling issues:**
- Import all required CSS files
- Check theme class is applied to parent container
- Verify CSS custom properties are defined

**Performance issues:**
- Test with large datasets
- Implement clustering for many points
- Use lazy loading for large GeoJSON files

## 📚 Integration Checklist

- [ ] Install all required dependencies
- [ ] Copy GIS directory to your components folder
- [ ] Import required CSS files
- [ ] Define CSS custom properties
- [ ] Prepare your GeoJSON and CSV data
- [ ] Test basic functionality
- [ ] Customize styling and colors
- [ ] Test responsive behavior
- [ ] Add error handling
- [ ] Optimize performance

## 🎯 Best Practices

### 1. Data Preparation
- Validate GeoJSON format before use
- Ensure CSV column names match your configuration
- Use appropriate coordinate systems (WGS84)
- Clean and normalize your data

### 2. Performance
- Use clustering for large point datasets
- Implement lazy loading for large files
- Memoize expensive calculations
- Optimize bundle size

### 3. Accessibility
- Provide meaningful labels and descriptions
- Ensure keyboard navigation works
- Test with screen readers
- Use appropriate color contrast

### 4. Responsive Design
- Test on different screen sizes
- Use appropriate breakpoints
- Ensure touch interactions work
- Optimize for mobile performance

## 📞 Support

For issues or questions:
1. Check the examples in `integration-example.tsx`
2. Review the TypeScript interfaces for API details
3. Examine the source code for implementation details
4. Test with the provided sample data first

## 📄 License

This project is available for integration into other applications. Please ensure proper attribution and licensing compliance.

## 🎉 Success!

Your GIS dashboard is now ready to use in any React application with full functionality, including the modular legend system! The package is completely self-contained and ready for plug-and-play integration. 