# Geodata Separation Architecture

## Overview

The geodata visualization logic has been separated into distinct components for better clarity, maintainability, and testability. This separation follows the **Single Responsibility Principle** and makes the codebase more modular.

## Architecture Components

### 1. **GeodataEnricher** (`GeodataEnricher.tsx`)
**Responsibility**: Data enrichment and processing
- Enriches GeoJSON features with geodata from CSV files
- Builds region data lookup maps
- Determines color modes based on selected geodata
- **Input**: Raw GeoJSON + CSV geodata
- **Output**: Enriched GeoJSON with attached geodata

### 2. **GeodataVisualizer** (`GeodataVisualizer.tsx`)
**Responsibility**: Visualization rendering
- Creates map layers for geodata visualization
- Handles color schemes (continuous/categorical)
- Manages opacity and styling
- **Input**: Enrichment result from GeodataEnricher
- **Output**: Map layers (Source + Layer components)

### 3. **GeodataUtils** (`utils/geodata-utils.ts`)
**Responsibility**: Utility functions and types
- Data processing functions
- Color calculation logic
- Type definitions
- **Input**: Various data structures
- **Output**: Processed data and configurations

### 4. **GeoJsonMapSimplified** (`geo-json-map-simplified.tsx`)
**Responsibility**: Map container and interactions
- Map rendering and event handling
- Coordinates between GeodataEnricher and GeodataVisualizer
- Handles user interactions (hover, click)
- **Input**: Props from parent component
- **Output**: Complete map with geodata visualization

## Data Flow

```
Raw GeoJSON + CSV Geodata
         ↓
   GeodataEnricher
         ↓
   Enriched GeoJSON
         ↓
   GeodataVisualizer
         ↓
   Map Layers (Source + Layer)
         ↓
   GeoJsonMapSimplified
         ↓
   Interactive Map
```

## Benefits of Separation

### ✅ **Clarity**
- Each component has a single, clear responsibility
- Easy to understand what each part does
- Reduced cognitive load when reading code

### ✅ **Maintainability**
- Changes to data processing don't affect visualization
- Changes to visualization don't affect map interactions
- Easier to debug specific issues

### ✅ **Testability**
- Each component can be tested independently
- Mock data can be easily injected
- Unit tests are more focused

### ✅ **Reusability**
- GeodataEnricher can be used with different visualizers
- GeodataVisualizer can be used with different map components
- Utils can be shared across different components

### ✅ **Extensibility**
- Easy to add new geodata types
- Easy to add new visualization methods
- Easy to add new map interactions

## Usage Example

```tsx
// Using the separated components
<GeodataEnricher
  geoJsonData={geoJsonData}
  geodata={geodata}
  selectedGeodata={selectedGeodata}
>
  {(enrichmentResult) => (
    <GeodataVisualizer
      enrichmentResult={enrichmentResult}
      selectedGeodata={selectedGeodata}
      colorMode={colorMode}
      categoricalSchemes={categoricalSchemes}
      continuousSchemes={continuousSchemes}
    />
  )}
</GeodataEnricher>
```

## Migration Path

### Option 1: Use Simplified Component
Replace the original `geo-json-map.tsx` with `geo-json-map-simplified.tsx`:

```tsx
// Before
import GeoJsonMap from './geo-json-map.tsx';

// After
import GeoJsonMapSimplified from './geo-json-map-simplified.tsx';
```

### Option 2: Use Individual Components
Use the separated components directly for maximum flexibility:

```tsx
import GeodataEnricher from './GeodataEnricher';
import GeodataVisualizer from './GeodataVisualizer';
```

## File Structure

```
src/components/GIS/
├── GeodataEnricher.tsx          # Data enrichment component
├── GeodataVisualizer.tsx        # Visualization component
├── geo-json-map-simplified.tsx  # Simplified map component
├── utils/
│   └── geodata-utils.ts        # Geodata utility functions
└── GEODATA_SEPARATION.md       # This documentation
```

## Type Definitions

```typescript
interface GeodataRow {
  name: string;
  pop?: number;
  health_status?: string;
  [key: string]: any;
}

interface GeodataEnrichmentResult {
  enrichedGeoJsonData: any;
  regionDataMap: Record<string, GeodataRow>;
  colorScheme: 'continuous' | 'categorical' | 'default';
}

interface ColorScheme {
  continuous?: {
    column: string;
    gradient: Array<{ value: number; color: string }>;
  };
  categorical?: {
    column: string;
    colorMap: Record<string, string>;
  };
}
```

## Future Enhancements

1. **Custom Geodata Processors**: Allow custom enrichment logic
2. **Multiple Visualization Types**: Support for different chart types
3. **Dynamic Color Schemes**: Runtime color scheme generation
4. **Performance Optimization**: Memoization and lazy loading
5. **Accessibility**: Better support for screen readers and keyboard navigation 