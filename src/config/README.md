# Configuration Directory (`/config`)

## Overview
This directory contains all configuration files for the GIS dashboard. Each configuration file manages a specific aspect of the application, from data sources to visualization settings.

## Directory Structure

```
/config/
├── README.md                    # This file - Main configuration documentation
├── flowDataConfig.ts           # Flow data visualization settings
├── pointDataConfig.ts          # Point data visualization settings
├── geoDataConfig.ts            # Geographic data visualization settings
├── geoJsonConfig.ts            # Map and GeoJSON file configurations
# Note: dataLoader.ts has been moved to src/components/GIS/GeoData/dataLoader.ts
├── colorScale.test.ts          # Color scale testing utilities
├── geoDataConfig.test.ts       # Geographic data configuration tests
└── [Individual README files]   # Detailed documentation for each config
```

## Configuration Files Overview

### 1. Flow Data Configuration (`flowDataConfig.ts`)
**Purpose**: Manages flow data visualization (connections between points)
- **Features**: Animated particles, curved paths, category colors
- **Data Type**: CSV with origin/destination coordinates
- **Use Case**: Disease paths, migration flows, trade routes

### 2. Point Data Configuration (`pointDataConfig.ts`)
**Purpose**: Manages point data visualization (discrete locations)
- **Features**: Interactive markers, size visualization, multilingual support
- **Data Type**: CSV with latitude/longitude coordinates
- **Use Case**: Research centers, hospitals, cities

### 3. Geo Data Configuration (`geoDataConfig.ts`)
**Purpose**: Manages geographic data visualization (regions/polygons)
- **Features**: Color-coded regions, numeric/categorical data
- **Data Type**: GeoJSON + CSV with attribute data
- **Use Case**: Province statistics, health indicators, population data

### 4. GeoJSON Configuration (`geoJsonConfig.ts`)
**Purpose**: Manages available maps and their metadata
- **Features**: Multiple geographic levels, multilingual support
- **Data Type**: GeoJSON files with optional CSV data
- **Use Case**: Country, province, county maps

### 5. Data Loader (`dataLoader.ts`) - *Moved to GeoData directory*
**Purpose**: Handles data loading, processing, and merging
- **Features**: Dynamic imports, data joining, color scale generation
- **Data Type**: GeoJSON and CSV processing utilities
- **Use Case**: All data loading operations
- **New Location**: `src/components/GIS/GeoData/dataLoader.ts`

## Configuration Patterns

### Common Interface Structure
All data configurations follow a similar pattern:

```typescript
interface DataConfig {
  name: string;                                    // Display name
  csvPath: string;                                 // Data source
  categoriesValues: Record<string, [string, string]>; // Display names and colors
  cardConfig: CardConfig;                          // Information cards
}
```

### Helper Functions Pattern
Each configuration includes standard helper functions:

```typescript
// Get specific configuration
export const getConfig = (name: string): ConfigType | undefined

// Get all configuration names
export const getConfigNames = (): string[]

// Get color mapping
export const getColorMap = (config: ConfigType): Record<string, string>

// Get category labels
export const getCategoryLabels = (config: ConfigType): Record<string, string>
```

## Data Flow Architecture

```
CSV/GeoJSON Files → Configuration → Data Loader → Components → Visualization
```

### 1. Data Sources
- **CSV Files**: Located in `/src/datasets/`
- **GeoJSON Files**: Located in `/src/datasets/geojson/`
- **Configuration**: Defines how to process and visualize data

### 2. Configuration Layer
- **Data Mapping**: Maps CSV columns to visualization properties
- **Display Settings**: Colors, labels, information cards
- **Validation**: Ensures data integrity and required fields

### 3. Processing Layer
- **Data Loading**: Dynamic imports and CSV parsing
- **Data Joining**: Merges CSV data with GeoJSON features
- **Data Transformation**: Normalization, scaling, categorization

### 4. Visualization Layer
- **Components**: React components for different data types
- **Interactivity**: Hover, click, and selection handlers
- **Responsive Design**: Adapts to different screen sizes

## Adding New Data Sources

### Step 1: Prepare Data Files
1. Add CSV file to `/src/datasets/`
2. Add GeoJSON file to `/src/datasets/geojson/` (if needed)
3. Ensure data format matches requirements

### Step 2: Choose Configuration Type
- **Flow Data**: For connections between points
- **Point Data**: For discrete locations
- **Geo Data**: For regional/polygon data
- **Map Data**: For new geographic boundaries

### Step 3: Create Configuration
1. Import data files at top of configuration
2. Add configuration object to appropriate array
3. Define column mappings and display settings
4. Configure information cards

### Step 4: Test Configuration
1. Run tests: `npm test`
2. Check browser console for errors
3. Verify data loading and visualization

## Configuration Best Practices

### 1. Data Validation
- Always validate required columns exist
- Check data types match expected formats
- Handle missing or invalid data gracefully

### 2. Performance Optimization
- Use dynamic imports for large files
- Process data efficiently in memory
- Cache processed data when possible

### 3. Error Handling
- Provide detailed error messages
- Graceful degradation for missing data
- Fallback values for required fields

### 4. Internationalization
- Support multiple languages (English/Persian)
- Use consistent naming conventions
- Provide display names for all categories

### 5. Accessibility
- Use semantic color schemes
- Provide alternative text for visual elements
- Ensure keyboard navigation support

## Testing

### Unit Tests
- `colorScale.test.ts`: Tests color scale generation
- `geoDataConfig.test.ts`: Tests geographic data configuration

### Integration Tests
- Data loading and processing
- Configuration validation
- Component integration

### Manual Testing
- Browser console logging
- Data visualization verification
- Performance monitoring

## Troubleshooting

### Common Issues

#### 1. Data Not Loading
- Check file paths in configuration
- Verify CSV column names match configuration
- Check browser console for import errors

#### 2. Visualization Issues
- Verify color mappings are correct
- Check data type (numeric vs categorical)
- Ensure coordinate formats are valid

#### 3. Performance Problems
- Use dynamic imports for large files
- Optimize data processing algorithms
- Consider data caching strategies

### Debug Tools
- Browser console logging
- Configuration validation tests
- Data processing utilities

## Integration with Components

### Flow Data
- `FlowData` component for data loading
- `FlowLayer` component for visualization
- `flowDataLoader.ts` for data processing

### Point Data
- `PointData` component for data loading
- `PointLayer` component for visualization
- `pointDataLoader.ts` for data processing

### Geo Data
- `GeoData` component for data loading
- `GeoJsonMap` component for visualization
- `dataLoader.ts` for data processing

## Future Enhancements

### Planned Features
- **Dynamic Configuration**: Runtime configuration changes
- **Data Caching**: Improved performance for large datasets
- **Advanced Filtering**: Complex data filtering options
- **Export Functionality**: Data export capabilities

### Potential Improvements
- **Configuration UI**: Visual configuration editor
- **Data Validation**: Enhanced validation tools
- **Performance Monitoring**: Real-time performance metrics
- **Error Recovery**: Advanced error handling strategies 