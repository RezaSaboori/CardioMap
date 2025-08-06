# Dynamic Card Colors

The GIS dashboard now supports dynamic card colors that change based on data values. This system allows cards to visually indicate the status or severity of data through color coding.

## Features

- **Threshold-based colors**: Cards can change color when values exceed certain thresholds
- **Category-based colors**: Different categories can have different colors
- **Custom condition functions**: Advanced logic for complex color rules
- **Support for both numeric and categorical data**

## Configuration

### Color Condition Types

1. **Threshold**: Changes color when a value exceeds a threshold
2. **Range**: Changes color when a value falls within a specific range
3. **Category**: Changes color based on categorical values

### Example Configurations

#### Hospital Beds Example
```typescript
"Hospital Beds": {
  title: "Hospital Beds",
  unit: "beds",
  info: "Total number of hospital beds",
  colorCondition: {
    defaultColor: '#ffffff',
    conditions: [
      {
        type: 'threshold',
        value: 1000,
        color: '#ff6b6b', // Red for low bed count
        condition: (value) => value < 1000
      },
      {
        type: 'threshold',
        value: 3000,
        color: '#ffd93d', // Yellow for medium bed count
        condition: (value) => value >= 1000 && value < 3000
      },
      {
        type: 'threshold',
        value: 3000,
        color: '#6bcf7f', // Green for high bed count
        condition: (value) => value >= 3000
      }
    ]
  }
}
```

#### Health Status Example
```typescript
"health_status": {
  title: "Health Status",
  info: "Overall health status of the province",
  colorCondition: {
    defaultColor: '#ffffff',
    conditions: [
      {
        type: 'category',
        value: 'poor',
        color: '#ff6b6b' // Red for poor health
      },
      {
        type: 'category',
        value: 'medium',
        color: '#ffd93d' // Yellow for medium health
      },
      {
        type: 'category',
        value: 'good',
        color: '#6bcf7f' // Green for good health
      }
    ]
  }
}
```

## Utility Functions

### `evaluateDynamicColor(value, colorConfig, data?)`
Evaluates the color conditions and returns the appropriate color.

### `createThresholdColorConfig(threshold, warningColor, normalColor, comparison)`
Creates a simple threshold-based color configuration.

### `createCategoryColorConfig(categoryColors, defaultColor)`
Creates a category-based color configuration.

## Usage

The dynamic color system is automatically applied when:
1. Card data includes a `colorCondition` property
2. The `CardsGrid` component evaluates the conditions
3. Colors are applied to the card backgrounds

## Color Meanings

- **Red (#ff6b6b)**: Warning/alert conditions (low values, poor status)
- **Yellow (#ffd93d)**: Medium/caution conditions
- **Green (#6bcf7f)**: Good/optimal conditions (high values, good status)
- **Blue (#3182ce)**: Neutral/informational
- **Purple (#7209b7)**: Special categories (e.g., diabetes)
- **Teal (#4ecdc4)**: Medium-high values

## Extending the System

To add new color conditions:

1. Add the condition to the `ColorCondition` interface
2. Update the `evaluateDynamicColor` function to handle the new type
3. Add the condition to your card configuration

Example of adding a custom condition:
```typescript
{
  type: 'threshold',
  value: 100,
  color: '#ff6b6b',
  condition: (value, data) => {
    // Custom logic here
    return value < 100 && data.someOtherCondition;
  }
}
``` 