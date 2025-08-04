# Geo Data Configuration (`geoDataConfig.ts`)

## Overview
This configuration file manages geographic data visualization settings for the GIS dashboard. Geo data represents regional/polygon data (e.g., provinces, counties) with color-coded visualization based on CSV data attributes.

## Purpose
- Defines how geographic data is loaded, processed, and visualized
- Configures color schemes and information cards for geographic datasets
- Provides a centralized way to manage multiple geographic datasets
- Supports both numeric (continuous) and categorical data visualization

## Key Components

### Interfaces

#### `CardConfig`
Defines the structure for information card configuration:
```typescript
{
  [columnName: string]: {
    title: string;      // Display title for the card
    unit?: string;      // Optional unit of measurement
    info?: string;      // Optional descriptive information
  };
}
```

#### `GeoDatasetConfig`
Main configuration interface for geographic datasets:
```typescript
{
  name: string;                                    // Display name for UI
  type: 'numeric' | 'categorical';                // Data type for visualization
  csvPath: string;                                 // Path to CSV file
  geoJsonPath: string;                             // Path to GeoJSON file
  joinProperty: string;                            // GeoJSON property for joining
  csvJoinColumn: string;                           // CSV column for joining
  dataColumn: string;                              // Primary data column
  colorGradients?: [string, string, string];      // For numeric types
  colorMap?: Record<string, string>;               // For categorical types
  cardConfig: CardConfig;                          // Information card settings
}
```

### Configuration Examples

#### Numeric Data Example
```typescript
{
  name: 'Iran Province Population',
  type: 'numeric',
  csvPath: IranProvincesSampleCsv,
  geoJsonPath: './datasets/geojson/Iran.json',
  joinProperty: 'tags.name:en',
  csvJoinColumn: 'name',
  dataColumn: 'pop',
  colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
  cardConfig: {
    pop: {
      title: 'Population',
      unit: 'people',
      info: 'Total population of the province'
    },
    Area: {
      title: 'Area',
      unit: 'km²',
      info: 'The total area of the province'
    }
  }
}
```

#### Categorical Data Example
```typescript
{
  name: 'Health Status',
  type: 'categorical',
  csvPath: IranProvincesSampleCsv,
  geoJsonPath: './datasets/geojson/Iran.json',
  joinProperty: 'tags.name:en',
  csvJoinColumn: 'name',
  dataColumn: 'health_status',
  colorMap: {
    good: '#4caf50',    // green
    medium: '#ffeb3b',  // yellow
    poor: '#ff9800'     // orange
  },
  cardConfig: {
    health_status: {
      title: 'Health Status',
      info: 'Overall health status of the province'
    },
    'Doctors per 10k': {
      title: 'Doctors per 10k',
      unit: 'doctors',
      info: 'Healthcare professionals per 10,000 residents'
    }
  }
}
```

## Helper Functions

### `getDatasetConfig(name: string)`
Retrieves a specific geographic dataset configuration by name.

### `getDatasetNames()`
Returns an array of all available dataset names for UI selectors.

### `getCategoricalColorMap()`
Returns the default color mapping for categorical data.

### `getCategoricalLabels()`
Returns the default label mapping for categorical data.

## Data Format Requirements

### CSV Data Format
The CSV file should contain:
- **Join Column**: Column that matches GeoJSON properties (e.g., province names)
- **Data Column**: Primary data for visualization (e.g., population, health status)
- **Additional Columns**: Other data for information cards

### Example CSV Format
```csv
name,pop,health_status,Doctors per 10k,Hospital Beds,Area
Tehran,13267637,good,45.2,12500,18814
Isfahan,5120850,medium,32.1,8500,107018
```

### GeoJSON Format
The GeoJSON file should contain:
- **Features**: Geographic polygons for each region
- **Properties**: Properties that can be joined with CSV data
- **Nested Properties**: Support for nested property paths (e.g., `tags.name:en`)

### Example GeoJSON Structure
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "tags": {
          "name:en": "Tehran",
          "name:fa": "تهران"
        }
      },
      "geometry": { ... }
    }
  ]
}
```

## Usage

### Adding New Geographic Datasets
1. Add your CSV file to `src/datasets/`
2. Add your GeoJSON file to `src/datasets/geojson/`
3. Import the CSV file at the top of the configuration
4. Add a new configuration object to `geoDataConfig`
5. Define the data type, join properties, and visualization settings

### Example: Adding Economic Data
```typescript
import EconomicDataCsv from '../datasets/EconomicData.csv?url';

// Add to geoDataConfig array
{
  name: 'Economic Indicators',
  type: 'numeric',
  csvPath: EconomicDataCsv,
  geoJsonPath: './datasets/geojson/Iran.json',
  joinProperty: 'tags.name:en',
  csvJoinColumn: 'Province',
  dataColumn: 'GDP',
  colorGradients: ['#E3F2FD', '#2196F3', '#0D47A1'],
  cardConfig: {
    GDP: {
      title: 'GDP',
      unit: 'billion USD',
      info: 'Gross Domestic Product'
    },
    'GDP per capita': {
      title: 'GDP per capita',
      unit: 'USD',
      info: 'GDP per person'
    }
  }
}
```

## Features

- **Color-coded Visualization**: Different colors based on data values
- **Numeric Data**: Continuous color gradients for quantitative data
- **Categorical Data**: Discrete colors for qualitative data
- **Interactive Regions**: Click regions to see detailed information
- **Information Cards**: Display relevant data for selected regions
- **Legend Support**: Automatic legend generation based on data type
- **Data Joining**: Automatic joining of CSV data with GeoJSON features

## Integration

This configuration works with:
- `GeoData` component for data loading and processing
- `GeoJsonMap` component for map visualization
- `dataLoader.ts` for CSV and GeoJSON data processing
- `colorScale.test.ts` for color scale testing
- `geoDataConfig.test.ts` for configuration testing

## Data Processing

The configuration supports:
- **Automatic Data Joining**: Joins CSV data with GeoJSON features
- **Name Normalization**: Handles variations in region names
- **Color Scale Generation**: Creates appropriate color scales
- **Data Validation**: Checks for required columns and valid data
- **Error Handling**: Graceful handling of missing or invalid data
- **Performance Optimization**: Efficient data processing for large datasets 