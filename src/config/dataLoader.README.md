# Data Loader (`dataLoader.ts`)

## Overview
This utility file handles the loading, processing, and merging of GeoJSON and CSV data for the GIS dashboard. It provides a unified interface for combining geographic boundaries with attribute data for visualization.

## Purpose
- Loads and validates GeoJSON and CSV data files
- Merges CSV attribute data with GeoJSON geographic features
- Handles data joining and name normalization
- Provides color scale generation for numeric data
- Supports both numeric and categorical data processing

## Key Components

### Interfaces

#### `MergedGeoJsonData`
Represents the final merged data structure:
```typescript
{
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    properties: Record<string, any>;
    geometry: any;
  }>;
}
```

#### `DatasetData`
Contains the complete processed dataset:
```typescript
{
  geoJson: MergedGeoJsonData;
  csvData: Record<string, any>[];
  minValue?: number;
  maxValue?: number;
  categories?: string[];
}
```

## Core Functions

### `loadDatasetData(config: GeoDatasetConfig)`
Main function that loads and processes geographic datasets.

**Process:**
1. **Load GeoJSON**: Dynamically imports GeoJSON file
2. **Load CSV**: Fetches and parses CSV data
3. **Data Validation**: Checks for required columns and valid data
4. **Name Normalization**: Handles variations in region names
5. **Data Joining**: Merges CSV data with GeoJSON features
6. **Statistics Calculation**: Computes min/max values or categories

**Returns:** `Promise<DatasetData>` with merged and processed data

### `createColorScale(minValue, maxValue, colorGradients)`
Creates a color interpolation function for numeric data.

**Parameters:**
- `minValue`: Minimum data value
- `maxValue`: Maximum data value  
- `colorGradients`: Array of three hex colors for gradient

**Returns:** Function that maps numeric values to hex colors

### `interpolateColor(color1, color2, t)`
Helper function for color interpolation between two hex colors.

**Parameters:**
- `color1`: Starting hex color
- `color2`: Ending hex color
- `t`: Interpolation factor (0-1)

**Returns:** Interpolated hex color

## Data Processing Features

### Name Normalization
Handles variations in region names between GeoJSON and CSV:
```typescript
const normalizeRegionName = (name: string): string => {
  return name.replace(' Province', '').replace(/ /g, '');
};
```

### Nested Property Access
Supports accessing nested GeoJSON properties:
```typescript
const getNestedProperty = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};
```

### Data Joining
Matches CSV rows with GeoJSON features based on normalized names:
```typescript
const matchingCsvRow = csvData.find((row: any) => {
  const normalizedCsvRegionName = normalizeRegionName(row[config.csvJoinColumn]);
  return normalizedCsvRegionName === normalizedRegionName;
});
```

## Usage Examples

### Loading a Province Dataset
```typescript
import { loadDatasetData } from './config/dataLoader';
import { getDatasetConfig } from './config/geoDataConfig';

const config = getDatasetConfig('Iran Province Population');
if (config) {
  const dataset = await loadDatasetData(config);
  console.log('Loaded dataset:', dataset);
}
```

### Creating a Color Scale
```typescript
import { createColorScale } from './config/dataLoader';

const colorScale = createColorScale(0, 100, ['#FFEDA0', '#FEB24C', '#F03B20']);
const color = colorScale(50); // Returns interpolated color for value 50
```

## Error Handling

### GeoJSON Loading Errors
- Handles missing or invalid GeoJSON files
- Provides detailed error messages for debugging
- Graceful fallback for import failures

### CSV Loading Errors
- Validates required columns exist
- Checks for empty or malformed data
- Reports specific column issues

### Data Joining Errors
- Warns about unmatched regions
- Continues processing with available data
- Logs detailed matching information

## Performance Optimizations

### Dynamic Imports
Uses dynamic imports for GeoJSON files to reduce initial bundle size:
```typescript
const geoJsonModule = await import(/* @vite-ignore */ geoJsonPath);
```

### Efficient Data Processing
- Processes data in memory without multiple file reads
- Uses efficient array methods for data joining
- Minimizes object creation and copying

### Error Recovery
- Continues processing even if some data is missing
- Provides fallback values for missing properties
- Maintains data integrity throughout processing

## Integration

This utility works with:
- `geoDataConfig.ts` for dataset configurations
- `GeoJsonMap` component for visualization
- `csv-loader.ts` for CSV data parsing
- Color scale utilities for data visualization

## Data Validation

### Required Fields
- GeoJSON must have valid FeatureCollection structure
- CSV must contain the specified join column
- Data column must exist for the specified data type

### Data Type Validation
- Numeric data: Validates numeric values in data column
- Categorical data: Extracts unique categories from data column
- Coordinates: Validates geographic coordinate formats

### Error Reporting
- Detailed console logging for debugging
- Specific error messages for different failure types
- Graceful degradation for partial data failures

## Testing

The data loader includes comprehensive error handling and logging:
- Console logs for data loading progress
- Validation checks for data integrity
- Performance monitoring for large datasets
- Error recovery for common data issues 