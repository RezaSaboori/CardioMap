# DropdownMenu Component

A modern, customizable dropdown menu component with support for nested submenus, RTL/LTR layouts, and glassmorphic styling.

## Features

- **Customizable Styling**: Background colors, gradients, shadows, borders, and more
- **Responsive Design**: Dynamic width and height based on content
- **RTL/LTR Support**: Full bidirectional layout support
- **Nested Submenus**: Multi-level menu structures with portal-based rendering
- **Portal-based Submenus**: Submenus render outside parent containers for proper layering
- **Smooth Animations**: CSS transitions for height, border-radius, and content appearance
- **Accessibility**: Proper ARIA attributes and keyboard navigation support
- **Theme Integration**: CSS custom properties for easy theming

## Recent Updates

### Submenu Click Handling Fix (Latest)
- **Problem**: Submenu items were not responding to clicks and submenus were closing instantly
- **Solution**: 
  - Added proper `data-value` attributes to submenu items
  - Implemented dedicated `handleSubmenuClick` function for submenu interactions
  - Added hover bridge effect to prevent accidental submenu closing
  - Improved click outside detection to handle submenu clicks properly
- **Benefits**: 
  - Submenu items now properly trigger `onSelect` callbacks
  - Smooth navigation between main menu and submenus
  - Better user experience with stable submenu behavior

### Submenu Positioning Fix
- **Problem**: Submenus were opening inside their parent containers instead of in individual wrappers
- **Solution**: 
  - Migrated to React Portal-based rendering (`createPortal`)
  - Implemented dynamic positioning using `getBoundingClientRect()`
  - Added edge detection to prevent submenus from going off-screen
- **Benefits**: 
  - Submenus now render outside parent DOM hierarchy
  - Proper z-index layering and no clipping issues
  - Responsive positioning that adapts to viewport edges

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Custom content to render in the dropdown |
| `items` | `SubmenuItem[]` | - | Array of menu items with optional nested children |
| `value` | `string` | - | Currently selected value (required) |
| `onSelect` | `(value: string) => void` | - | Callback when an item is selected (required) |
| `fontSize` | `string` | `'14px'` | Font size for the dropdown |
| `headerHeight` | `number` | `48` | Height of the dropdown header |
| `maxHeight` | `number` | `288` | Maximum height of the dropdown |
| `minWidth` | `number` | `120` | Minimum width of the dropdown |
| `maxWidth` | `number` | `320` | Maximum width of the dropdown |
| `initialBorderRadius` | `number` | `headerHeight / 2` | Initial border radius |
| `finalBorderRadius` | `number` | `16` | Final border radius when expanded |
| `direction` | `'rtl' \| 'ltr'` | `'rtl'` | Text direction |
| `textColor` | `string` | `'#ffffff'` | Text color |
| `background` | `string` | `'rgba(255, 255, 255, 0.2)'` | Background color |
| `gradientColors` | `Array<[string, number, string?]>` | - | Gradient background colors |
| `shadow` | `string` | `'0 8px 32px 0 rgba(0, 0, 0, 0.2)'` | Box shadow |
| `hoverBackground` | `[string, number]` | `['rgba(255,255,255,1)', 0.1]` | Hover background color |
| `fixedWidth` | `boolean` | `false` | Whether to use fixed width |
| `fixedHeight` | `boolean` | `false` | Whether to use fixed height |

## Submenu Example

```tsx
const menuItems = [
  {
    label: "Option 1",
    value: "opt1"
  },
  {
    label: "Option 2",
    children: [
      {
        label: "Sub Option 2.1",
        value: "sub2.1"
      },
      {
        label: "Sub Option 2.2",
        value: "sub2.2"
      }
    ]
  }
];

<DropdownMenu
  items={menuItems}
  value={selectedValue}
  onSelect={handleSelect}
  direction="rtl"
/>
```

## Technical Details

### Submenu Architecture
- **Portal Rendering**: Submenus use `createPortal` to render outside parent DOM hierarchy
- **Dynamic Positioning**: Calculated using `getBoundingClientRect()` with edge detection
- **Event Handling**: Separate click handlers for main menu and submenu items
- **Hover Management**: Intelligent hover state management with bridge effects

### Performance Optimizations
- **useCallback**: Event handlers are memoized to prevent unnecessary re-renders
- **useRef**: DOM references are stored to avoid repeated queries
- **ResizeObserver**: Efficient height calculations without layout thrashing
- **Portal Cleanup**: Proper cleanup of portal-rendered elements

### Styling System
- **CSS Custom Properties**: Dynamic values like border-radius and colors
- **Backdrop Filters**: Glassmorphic effects with proper fallbacks
- **Responsive Design**: Dynamic sizing based on content and viewport
- **Theme Integration**: CSS variables for consistent theming across components

## Usage

```tsx
import DropdownMenu from './components/DropdownMenu';

function App() {
  const [selectedValue, setSelectedValue] = useState('Option 1');
  
  const handleSelect = (value: string) => {
    setSelectedValue(value);
    console.log('Selected:', value);
  };

  return (
    <DropdownMenu
      value={selectedValue}
      onSelect={handleSelect}
      items={menuItems}
      direction="rtl"
      background="rgba(0, 0, 0, 0.8)"
      textColor="#ffffff"
    />
  );
}
```

## Browser Support

- Modern browsers with CSS Grid and Flexbox support
- Backdrop filter support for glassmorphic effects
- Fallbacks provided for older browsers

## Contributing

When contributing to this component:
1. Maintain the existing animation and styling system
2. Test RTL/LTR layouts thoroughly
3. Ensure submenu positioning works across different viewport sizes
4. Follow the established TypeScript patterns
5. Update tests for any new functionality 