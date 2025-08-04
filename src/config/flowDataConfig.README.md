# Flow Data Configuration (`flowDataConfig.ts`)

## Overview
This configuration file manages flow data visualization settings for the GIS dashboard. Flow data represents connections between geographic points (e.g., disease paths, migration flows, trade routes) with animated particles moving along curved paths.

## Purpose
- Defines how flow data is loaded, processed, and visualized
- Configures display names, colors, and information cards for flow categories
- Provides a centralized way to manage multiple flow datasets

## Key Components

### Interfaces

#### `FlowDataCardConfig`
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

#### `FlowDataConfig`
Main configuration interface for flow datasets:
```typescript
{
  name: string;                                    // Display name for UI
  csvPath: string;                                 // Path to CSV file
  idColumn?: string;                               // Optional unique ID column
  startColumn: string;                             // Origin coordinates column
  endColumn: string;                               // Destination coordinates column
  sizeColumn: string;                              // Size/weight column
  categoriesColumn: string;                        // Category classification column
  categoriesValues: Record<string, [string, string]>; // csv_value: [display_name, hex_color]
  cardConfig: FlowDataCardConfig;                  // Information card settings
}
```

### Configuration Example

```typescript
{
  name: "Disease Path",
  csvPath: DeseasePathCsv,
  startColumn: "Origin",
  endColumn: "Destination", 
  sizeColumn: "pop",
  categoriesColumn: "Disease",
  categoriesValues: {
    "type1": ["Diabetes", "#7209b7"],
    "type2": ["CVD", "#4361ee"],
    "type3": ["Heart Failure", "#fdc500"]
  },
  cardConfig: {
    "Disease": {
      title: "Past Medical History",
      info: "Previous Disease"
    },
    "pop": {
      title: "Size",
      unit: "People",
      info: "Number of People"
    }
  }
}
```

## Helper Functions

### `getFlowDataConfig(name: string)`
Retrieves a specific flow data configuration by name.

### `getFlowDataConfigNames()`
Returns an array of all available flow data configuration names for UI selectors.

### `getFlowDataColorMap(config: FlowDataConfig)`
Generates a color mapping object from the configuration's `categoriesValues`.

### `getFlowDataCategoryLabels(config: FlowDataConfig)`
Generates a label mapping object for display names from the configuration's `categoriesValues`.

## CSV Data Format Requirements

The CSV file should contain the following columns:
- **Origin**: Coordinate string in format `"latitude, longitude"`
- **Destination**: Coordinate string in format `"latitude, longitude"`
- **Disease** (or categoriesColumn): Category values that match `categoriesValues` keys
- **pop** (or sizeColumn): Numeric values for flow size/weight

### Example CSV Format
```csv
Origin,Destination,Disease,pop
"26.904523, 58.283603","35.449513, 52.330926",type1,30
"30.260534, 50.828493","30.539391, 59.595854",type2,100
```

## Usage

### Adding New Flow Datasets
1. Add your CSV file to `src/datasets/`
2. Import the CSV file at the top of the configuration
3. Add a new configuration object to `FLOW_DATA_CONFIGS`
4. Define the column mappings and display settings
5. Configure the information cards for the data

### Example: Adding Migration Flow Data
```typescript
import MigrationFlowCsv from '../datasets/MigrationFlow.csv?url';

// Add to FLOW_DATA_CONFIGS array
{
  name: "Migration Patterns",
  csvPath: MigrationFlowCsv,
  startColumn: "From",
  endColumn: "To",
  sizeColumn: "Population",
  categoriesColumn: "Type",
  categoriesValues: {
    "internal": ["Internal Migration", "#4CAF50"],
    "external": ["External Migration", "#2196F3"]
  },
  cardConfig: {
    "Type": {
      title: "Migration Type",
      info: "Type of population movement"
    },
    "Population": {
      title: "Population",
      unit: "People",
      info: "Number of people in migration flow"
    }
  }
}
```

## Features

- **Animated Particles**: Particles move along curved flow paths
- **Size Visualization**: Flow thickness based on size column values
- **Category Colors**: Different colors for different flow categories
- **Interactive Tooltips**: Hover to see display names instead of raw values
- **Information Cards**: Click flows to see detailed information
- **Responsive Design**: Adapts to different screen sizes

## Integration

This configuration works with:
- `FlowData` component for data loading and processing
- `FlowLayer` component for map visualization
- `flowDataLoader.ts` for CSV data processing
- `flowDataCardUtils.ts` for information card generation 