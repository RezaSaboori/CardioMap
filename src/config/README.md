# Geodata Configuration Guide

This document explains how to configure and control geodata visualizations in the GIS dashboard system.

## Overview

The geodata visualization system allows you to display various datasets on geographic maps. The system supports both **numeric** (continuous) and **categorical** (discrete) data types, with automatic color coding and interactive features.

## Configuration Structure

### Core Configuration File: `geoDataConfig.ts`

The main configuration is located in `src/config/geoDataConfig.ts`. This file defines:

- **Dataset configurations** - How data is loaded and displayed
- **Color schemes** - Visual representation of data values
- **Card configurations** - Information displayed in tooltips and legends
- **Helper functions** - Utilities for accessing configuration data

## Adding New Datasets

### Step 1: Prepare Your Data Files

#### CSV Data File
Place your CSV file in `src/datasets/` directory. Your CSV should include:
- A column for geographic identification (e.g., province names)
- Data columns you want to visualize
- Optional metadata columns

**Example CSV structure:**
```csv
name,pop,health_status,Doctors per 10k,Hospital Beds,Area
Alborz Province,2730000,good,12.5,850,5120
Ardabil Province,1300000,medium,8.2,420,17800
```

#### GeoJSON File
Place your GeoJSON file in `src/datasets/geojson/` directory. The GeoJSON should contain:
- Geographic boundaries (polygons)
- Properties that can be matched with your CSV data

### Step 2: Import the CSV File

Add an import statement at the top of `geoDataConfig.ts`:

```typescript
import YourDatasetCsv from '../datasets/YourDataset.csv?url';
```

### Step 3: Add Configuration

Add a new configuration object to the `geoDataConfig` array:

#### For Numeric Data:
```typescript
{
  name: 'Your Dataset Name',
  type: 'numeric',
  csvPath: YourDatasetCsv,
  geoJsonPath: './datasets/geojson/YourGeoJson.json',
  joinProperty: 'tags.name:en', // Property in GeoJSON to match
  csvJoinColumn: 'name', // Column in CSV to match
  dataColumn: 'pop', // Column containing the data to visualize
  colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'], // Color gradient
  cardConfig: {
    pop: {
      title: 'Population',
      unit: 'people',
      info: 'Total population'
    }
  }
}
```

#### For Categorical Data:
```typescript
{
  name: 'Your Categorical Dataset',
  type: 'categorical',
  csvPath: YourDatasetCsv,
  geoJsonPath: './datasets/geojson/YourGeoJson.json',
  joinProperty: 'tags.name:en',
  csvJoinColumn: 'name',
  dataColumn: 'status',
  colorMap: {
    good: '#4caf50',
    medium: '#ffeb3b',
    poor: '#ff9800'
  },
  cardConfig: {
    status: {
      title: 'Status',
      info: 'Current status'
    }
  }
}
```

## Configuration Properties

### Required Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Display name for UI selector and legend |
| `type` | 'numeric' \| 'categorical' | Data type for visualization |
| `csvPath` | string | Path to CSV data file (use import) |
| `geoJsonPath` | string | Path to GeoJSON boundary file |
| `joinProperty` | string | Property in GeoJSON to match with CSV |
| `csvJoinColumn` | string | Column in CSV to match with GeoJSON |
| `dataColumn` | string | Column in CSV containing the data to visualize |
| `cardConfig` | CardConfig | Configuration for tooltip/legend cards |

### Optional Properties

| Property | Type | Description |
|----------|------|-------------|
| `colorGradients` | [string, string, string] | Color gradient for numeric data |
| `colorMap` | Record<string, string> | Color mapping for categorical data |

### Card Configuration

The `cardConfig` object defines how data is displayed in tooltips and legends:

```typescript
cardConfig: {
  columnName: {
    title: 'Display Title',
    unit?: 'unit', // Optional unit of measurement
    info?: 'Description' // Optional description
  }
}
```

## Data Types

### Numeric Data
- **Purpose**: Continuous data with values that can be ordered
- **Visualization**: Color gradients from low to high values
- **Example**: Population, temperature, income levels
- **Configuration**: Use `colorGradients` array

### Categorical Data
- **Purpose**: Discrete categories or classifications
- **Visualization**: Distinct colors for each category
- **Example**: Health status, political parties, land use types
- **Configuration**: Use `colorMap` object

## Color Configuration

### Numeric Color Gradients
Define a three-color gradient for numeric data:
```typescript
colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20']
// Low values → Medium values → High values
```

### Categorical Color Maps
Define specific colors for each category:
```typescript
colorMap: {
  good: '#4caf50',    // green
  medium: '#ffeb3b',  // yellow
  poor: '#ff9800'     // orange
}
```

## Helper Functions

The configuration file provides several helper functions:

### `getDatasetConfig(name: string)`
Returns the configuration for a specific dataset by name.

### `getDatasetNames()`
Returns an array of all available dataset names for UI selectors.

### `getCategoricalColorMap()`
Returns the default color map for categorical data.

### `getCategoricalLabels()`
Returns human-readable labels for categorical values.

## Data Joining

The system joins CSV data with GeoJSON boundaries using:

1. **CSV Join Column**: The column in your CSV that contains geographic identifiers
2. **GeoJSON Join Property**: The property in your GeoJSON that contains matching identifiers

**Example:**
- CSV has column `name` with values like "Tehran Province"
- GeoJSON has property `tags.name:en` with values like "Tehran Province"
- Set `csvJoinColumn: 'name'` and `joinProperty: 'tags.name:en'`

## File Structure

```
src/
├── config/
│   ├── geoDataConfig.ts    # Main configuration file
│   └── README.md          # This file
├── datasets/
│   ├── YourData.csv       # Your CSV data files
│   └── geojson/
│       ├── Iran.json      # Your GeoJSON boundary files
│       └── YourRegion.json
```

## Best Practices

1. **Naming**: Use descriptive names for datasets and columns
2. **Data Quality**: Ensure CSV and GeoJSON identifiers match exactly
3. **Color Selection**: Choose accessible color schemes for colorblind users
4. **Units**: Always specify units for numeric data
5. **Documentation**: Provide clear descriptions in card configurations

## Troubleshooting

### Common Issues

1. **Data not displaying**: Check that `csvJoinColumn` and `joinProperty` values match exactly
2. **Wrong colors**: Verify `colorGradients` or `colorMap` configuration
3. **Missing tooltips**: Ensure `cardConfig` includes all columns you want to display
4. **Import errors**: Make sure CSV files are in the correct directory and imported properly

### Debugging Tips

- Check browser console for import errors
- Verify CSV column names match configuration
- Test with a simple dataset first
- Use the helper functions to verify configuration

## Example: Adding a New Dataset

Here's a complete example of adding a new dataset:

1. **Add CSV file**: `src/datasets/EconomicData.csv`
2. **Add import**: `import EconomicDataCsv from '../datasets/EconomicData.csv?url';`
3. **Add configuration**:
```typescript
{
  name: 'Economic Indicators',
  type: 'numeric',
  csvPath: EconomicDataCsv,
  geoJsonPath: './datasets/geojson/Iran.json',
  joinProperty: 'tags.name:en',
  csvJoinColumn: 'province',
  dataColumn: 'gdp_per_capita',
  colorGradients: ['#e8f5e8', '#4caf50', '#2e7d32'],
  cardConfig: {
    gdp_per_capita: {
      title: 'GDP per Capita',
      unit: 'USD',
      info: 'Gross Domestic Product per capita'
    },
    unemployment_rate: {
      title: 'Unemployment Rate',
      unit: '%',
      info: 'Percentage of unemployed population'
    }
  }
}
```

This configuration will create a new visualization option in your GIS dashboard with proper color coding and informative tooltips. 