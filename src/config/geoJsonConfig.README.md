# GeoJSON Configuration (`geoJsonConfig.ts`)

## Overview
This configuration file manages GeoJSON map settings for the GIS dashboard. It defines the available geographic maps (provinces, counties, regions) and their associated metadata for display and interaction.

## Purpose
- Defines available geographic maps and their file locations
- Configures display names and hover tags for each map
- Provides a centralized way to manage multiple geographic layers
- Supports multilingual display (English/Persian)

## Key Components

### Interface

#### `GeoJsonMapConfig`
Defines the structure for map configuration:
```typescript
{
  geojson: string;           // GeoJSON file location
  csv?: string;              // Optional CSV data file
  hoverTag: string;          // Tag for hover display (e.g., 'name:fa', 'name:en')
  displayName: string;       // Display name for controller
}
```

### Configuration Examples

#### Country Level Map
```typescript
Iran: { 
  geojson: './datasets/geojson/Iran.json', 
  csv: IranProvincesSampleCsv,
  hoverTag: 'name:fa',
  displayName: 'ایران'
}
```

#### Province Level Map
```typescript
Tehran: { 
  geojson: './datasets/geojson/Tehran.json', 
  csv: TehranCountiesSampleCsv,
  hoverTag: 'name:fa',
  displayName: 'تهران'
}
```

#### Province Without CSV Data
```typescript
Alborz: { 
  geojson: './datasets/geojson/Alborz.json',
  hoverTag: 'name:fa',
  displayName: 'البرز'
}
```

## Available Maps

The configuration includes all 31 provinces of Iran:

### Major Provinces
- **Tehran**: تهران (with county-level data)
- **Isfahan**: اصفهان
- **Fars**: فارس
- **Khorasan Razavi**: خراسان رضوی
- **Kerman**: کرمان

### Northern Provinces
- **Mazandaran**: مازندران
- **Gilan**: گیلان
- **Golestan**: گلستان
- **Alborz**: البرز
- **Qazvin**: قزوین

### Western Provinces
- **Kermanshah**: کرمانشاه
- **Kurdistan**: کردستان
- **Ilam**: ایلام
- **Lorestan**: لرستان
- **Hamadan**: همدان

### Southern Provinces
- **Hormozgan**: هرمزگان
- **Bushehr**: بوشهر
- **Kohgiluye and Buyer Ahmad**: کهگیلویه و بویراحمد
- **Sistan and Baluchestan**: سیستان و بلوچستان

### Eastern Provinces
- **North Khorasan**: خراسان شمالی
- **South Khorasan**: خراسان جنوبی
- **Yazd**: یزد
- **Semnan**: سمنان

### Central Provinces
- **Markazi**: مرکزی
- **Qom**: قم

### Azerbaijan Provinces
- **East Azerbaijan**: آذربایجان شرقی
- **West Azerbaijan**: آذربایجان غربی
- **Ardabil**: اردبیل

### Other Provinces
- **Chaharmahal and Bakhtiari**: چهارمحال و بختیاری
- **Zanjan**: زنجان

## Helper Functions

### `getMapConfig(mapId: string)`
Retrieves a specific map configuration by ID.

### `getMapIds()`
Returns an array of all available map IDs.

### `getMapDisplayName(mapId: string)`
Returns the display name for a specific map.

### `getMapHoverTag(mapId: string)`
Returns the hover tag for a specific map.

### `getMapGeoJsonPath(mapId: string)`
Returns the GeoJSON file path for a specific map.

### `getMapCsvPath(mapId: string)`
Returns the CSV file path for a specific map (if available).

### `hasMapCsvData(mapId: string)`
Checks if a map has associated CSV data.

## Usage

### Adding New Maps
1. Add your GeoJSON file to `src/datasets/geojson/`
2. Add your CSV file to `src/datasets/` (optional)
3. Import the CSV file at the top of the configuration (if applicable)
4. Add a new configuration object to `geoJsonConfig`

### Example: Adding a New Province
```typescript
import NewProvinceCsv from '../datasets/NewProvince.csv?url';

// Add to geoJsonConfig object
NewProvince: { 
  geojson: './datasets/geojson/NewProvince.json',
  csv: NewProvinceCsv,
  hoverTag: 'name:fa',
  displayName: 'استان جدید'
}
```

### Example: Adding a County-Level Map
```typescript
import CountyDataCsv from '../datasets/CountyData.csv?url';

// Add to geoJsonConfig object
CountyMap: { 
  geojson: './datasets/geojson/CountyMap.json',
  csv: CountyDataCsv,
  hoverTag: 'name:fa',
  displayName: 'نقشه شهرستان'
}
```

## Features

- **Multiple Geographic Levels**: Country, province, county, and custom levels
- **Multilingual Support**: Persian and English display names
- **Optional CSV Data**: Maps can have associated data or be display-only
- **Hover Information**: Configurable hover tags for region names
- **Dynamic Loading**: Maps are loaded on-demand
- **Responsive Design**: Adapts to different screen sizes

## Integration

This configuration works with:
- `GeoJsonMap` component for map visualization
- `GeoMapContainer` component for map management
- `dataLoader.ts` for GeoJSON and CSV data processing
- `app.tsx` for map selection and switching

## Data Requirements

### GeoJSON Format
Each GeoJSON file should contain:
- **FeatureCollection**: Standard GeoJSON structure
- **Features**: Geographic polygons for each region
- **Properties**: Properties with name tags (e.g., `name:fa`, `name:en`)
- **Valid Geometry**: Properly formatted polygon/multipolygon geometries

### Example GeoJSON Structure
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name:fa": "تهران",
        "name:en": "Tehran"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[...]]]
      }
    }
  ]
}
```

### CSV Data Format (Optional)
If a map has associated CSV data, it should contain:
- **Join Column**: Column that matches GeoJSON properties
- **Data Columns**: Additional data for visualization
- **Consistent Naming**: Names that match GeoJSON properties

## Map Management

### Map Switching
The configuration supports dynamic map switching:
- Users can select different geographic levels
- Maps load automatically when selected
- Associated data (if any) loads with the map

### Performance Considerations
- Maps are loaded on-demand to improve performance
- Large GeoJSON files are cached after first load
- CSV data is processed efficiently with the map

### Error Handling
- Graceful handling of missing GeoJSON files
- Fallback display names for missing configurations
- Validation of map data integrity 