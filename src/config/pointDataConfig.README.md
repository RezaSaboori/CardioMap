# Point Data Configuration (`pointDataConfig.ts`)

## Overview
This configuration file manages point data visualization settings for the GIS dashboard. Point data represents discrete locations on the map (e.g., research centers, hospitals, cities) with interactive markers and detailed information cards.

## Purpose
- Defines how point data is loaded, processed, and visualized
- Configures display names, colors, and information cards for point categories
- Provides a centralized way to manage multiple point datasets
- Supports multilingual display (English/Persian)

## Key Components

### Interfaces

#### `PointDataCardConfig`
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

#### `PointDataConfig`
Main configuration interface for point datasets:
```typescript
{
  name: string;                                    // Display name for UI
  csvPath: string;                                 // Path to CSV file
  idColumn?: string;                               // Optional unique ID column
  nameColumn: string;                              // Column for point names
  sizeColumn: string;                              // Size/importance column
  coordinates: [string, string];                   // [latitude, longitude] columns
  categoriesColumn: string;                        // Category classification column
  categoriesValues: Record<string, [string, string]>; // csv_value: [display_name, hex_color]
  cardConfig: PointDataCardConfig;                 // Information card settings
}
```

### Configuration Example

```typescript
{
  name: "Research Centers",
  csvPath: ResearchCenterCsv,
  idColumn: "name:en",
  nameColumn: "name:fa",
  sizeColumn: "SizeMetric",
  coordinates: ["Latitude", "Longitude"],
  categoriesColumn: "Category:en",
  categoriesValues: {
    "Hospital": ["بیمارستان", "#3182ce"],
    "Research Center": ["مرکز تحقیقاتی", "#fbbf24"],
    "Research Facility": ["پژوهشکده", "#10b981"]
  },
  cardConfig: {
    "name:en": {
      title: "Name (English)",
      info: "English name of the research center"
    },
    "name:fa": {
      title: "Name (Persian)",
      info: "Persian name of the research center"
    },
    "Category:en": {
      title: "Category",
      info: "Type of research facility"
    }
  }
}
```

## Helper Functions

### `getPointDataConfig(name: string)`
Retrieves a specific point data configuration by name.

### `getPointDataConfigNames()`
Returns an array of all available point data configuration names for UI selectors.

### `getPointDataColorMap(config: PointDataConfig)`
Generates a color mapping object from the configuration's `categoriesValues`.

### `getPointDataCategoryLabels(config: PointDataConfig)`
Generates a label mapping object for display names from the configuration's `categoriesValues`.

## CSV Data Format Requirements

The CSV file should contain the following columns:
- **Latitude**: Numeric latitude values
- **Longitude**: Numeric longitude values
- **name:en**: English name of the point
- **name:fa**: Persian name of the point
- **Category:en**: Category values that match `categoriesValues` keys
- **SizeMetric**: Numeric values for point size/importance
- **Province**: Province name
- **City**: City name

### Example CSV Format
```csv
ID,name:en,name:fa,Category:en,Category:fa,Province,City,Latitude,Longitude,SizeMetric
1,Tehran Medical Center,مرکز پزشکی تهران,Hospital,بیمارستان,Tehran,Tehran,35.6892,51.3890,100
2,Research Institute,موسسه تحقیقاتی,Research Center,مرکز تحقیقاتی,Tehran,Tehran,35.6892,51.3890,75
```

## Usage

### Adding New Point Datasets
1. Add your CSV file to `src/datasets/`
2. Import the CSV file at the top of the configuration
3. Add a new configuration object to `POINT_DATA_CONFIGS`
4. Define the column mappings and display settings
5. Configure the information cards for the data

### Example: Adding Hospital Data
```typescript
import HospitalDataCsv from '../datasets/HospitalData.csv?url';

// Add to POINT_DATA_CONFIGS array
{
  name: "Hospitals",
  csvPath: HospitalDataCsv,
  idColumn: "HospitalID",
  nameColumn: "HospitalName",
  sizeColumn: "BedCount",
  coordinates: ["Lat", "Lng"],
  categoriesColumn: "HospitalType",
  categoriesValues: {
    "General": ["بیمارستان عمومی", "#4CAF50"],
    "Specialized": ["بیمارستان تخصصی", "#2196F3"],
    "Emergency": ["بیمارستان اورژانس", "#FF5722"]
  },
  cardConfig: {
    "HospitalName": {
      title: "Hospital Name",
      info: "Name of the hospital"
    },
    "BedCount": {
      title: "Bed Count",
      unit: "beds",
      info: "Number of available beds"
    },
    "HospitalType": {
      title: "Hospital Type",
      info: "Type of hospital facility"
    }
  }
}
```

## Features

- **Interactive Markers**: Clickable points with hover effects
- **Size Visualization**: Marker size based on importance/size column
- **Category Colors**: Different colors for different point categories
- **Multilingual Support**: English and Persian display names
- **Information Cards**: Click points to see detailed information
- **Responsive Design**: Adapts to different screen sizes
- **Search and Filter**: Filter points by category or location

## Integration

This configuration works with:
- `PointData` component for data loading and processing
- `PointLayer` component for map visualization
- `pointDataLoader.ts` for CSV data processing
- `pointDataCardUtils.ts` for information card generation
- `pointDataLegendUtils.ts` for legend generation

## Data Processing

The configuration supports:
- **Coordinate Parsing**: Automatic parsing of latitude/longitude
- **Size Normalization**: Automatic scaling of size values (0-1)
- **Category Mapping**: Raw values mapped to display names
- **Data Validation**: Checks for required columns and valid data
- **Error Handling**: Graceful handling of missing or invalid data 