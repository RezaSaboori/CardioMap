# Modular Menu Component

A highly customizable, liquid glass dock menu component that supports both legacy children-based and new modular configuration approaches.

## Features

- **Liquid Glass Design**: Beautiful glass morphism effect with backdrop blur
- **Modular Configuration**: Support for both children-based and items-based approaches
- **Flexible Positioning**: Multiple position options (top, bottom, left, right, center)
- **Expandable Modes**: Expand, compact, or hover-based expansion
- **Smooth Animations**: Synchronized timing system with elegant transitions
- **Icon Factory System**: Flexible icon creation from string identifiers
- **Theme Integration**: Built-in support for theme toggle button
- **Responsive**: Adapts to different screen sizes and orientations

## Usage

### Method 1: Modular Configuration (Recommended)

```jsx
import Menu from './components/Menu/Menu';
import { createIconFactory } from './components/Menu/iconFactory';

// Create your icon factory
const iconFactory = createIconFactory({
  home: () => <HomeIcon />,
  profile: () => <ProfileIcon />,
  settings: () => <SettingsIcon />,
  // Add more icons as needed
});

// Define menu items
const menuItems = [
  {
    icon: 'home',
    text: 'Home',
    onClick: (index) => console.log('Home clicked', index)
  },
  {
    icon: 'profile', 
    text: 'Profile',
    onClick: (index) => console.log('Profile clicked', index)
  },
  {
    icon: 'settings',
    text: 'Settings',
    isNonSelectable: true, // Won't participate in selection
    onClick: (index) => console.log('Settings clicked', index)
  }
];

function App() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <Menu
      items={menuItems}
      iconFactory={iconFactory}
      selectedIndex={selectedIndex}
      onItemClick={setSelectedIndex}
      position={['top', 'right']}
      glassy={true}
      expandable="expand"
    />
  );
}
```

### Method 2: Legacy Children-based Approach

```jsx
import Menu from './components/Menu/Menu';
import MenuItem from './components/Menu/MenuItem';
import HomeIcon from './components/Menu/icons/HomeIcon';
import ProfileIcon from './components/Menu/icons/ProfileIcon';

function App() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <Menu
      selectedIndex={selectedIndex}
      onItemClick={setSelectedIndex}
      position={['top', 'right']}
      glassy={true}
      expandable="expand"
    >
      <MenuItem icon={<HomeIcon />} text="Home" />
      <MenuItem icon={<ProfileIcon />} text="Profile" />
    </Menu>
  );
}
```

## Props

### Menu Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `Array` | `[]` | Array of menu item configurations (new modular approach) |
| `children` | `React.ReactNode[]` | - | Menu items as children (legacy support) |
| `iconFactory` | `Function` | `null` | Factory function to create icons from string identifiers |
| `selectedIndex` | `number` | `0` | Currently selected item index |
| `onItemClick` | `Function` | `() => {}` | Callback when item is clicked `(index) => void` |
| `position` | `Array` | `['top', 'right']` | Position array `[vertical, horizontal]` |
| `sticky` | `boolean` | `false` | Whether menu should be fixed positioned |
| `glassy` | `boolean` | `false` | Enable glass morphism effect |
| `color` | `string` | `''` | Overlay color for glass effect |
| `expandable` | `string` | `'expand'` | Expansion mode: `'expand'`, `'compact'`, `'hover'` |
| `direction` | `string` | `'horizontal'` | Menu direction: `'horizontal'`, `'vertical'` |
| `margin` | `string\|object` | `undefined` | CSS margin value or object |
| `iconSize` | `string` | `'36px'` | CSS variable for icon size |
| `fontSize` | `string` | `'11px'` | CSS variable for font size |

### Menu Item Configuration

When using the `items` prop, each item should have the following structure:

```jsx
{
  icon: string | React.ReactNode,  // Icon identifier or React element
  text: string,                     // Display text
  onClick?: Function,               // Optional click handler (index, event) => void
  isNonSelectable?: boolean         // Whether item participates in selection
}
```

## Icon Requirements

### For Duo-Color Icons

Icons should be designed as **duo-color SVG components** with the following specifications:

#### SVG Structure
```jsx
const IconName = ({ className = '' }) => (
  <svg 
    viewBox="0 0 40 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ width: '100%', height: '100%' }}
  >
    {/* Primary color path */}
    <path d="..." fill="var(--color-gray12)"/>
    
    {/* Secondary color path */}
    <path d="..." fill="var(--color-gray1)"/>
    
    {/* Background/container path */}
    <path fillRule="evenodd" clipRule="evenodd" d="..." fill="var(--color-gray12)"/>
  </svg>
);
```

#### Color Variables
- `var(--color-gray12)`: Primary color (usually darker)
- `var(--color-gray1)`: Secondary color (usually lighter)
- These variables should be defined in your CSS theme

#### Design Guidelines
1. **ViewBox**: Use `0 0 40 40` for consistent sizing
2. **Colors**: Use CSS variables for theme compatibility
3. **Paths**: Separate primary and secondary elements into different paths
4. **Styling**: Use `width: '100%', height: '100%'` for responsive scaling
5. **Props**: Accept `className` prop for custom styling

#### Example Icon Implementation
```jsx
// Good example
const HomeIcon = ({ className = '' }) => (
  <svg 
    viewBox="0 0 40 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ width: '100%', height: '100%' }}
  >
    {/* House outline */}
    <path d="M8.30273 17.8789C8.08789 18.0547 7.99023 18.2891 7.99023 18.5137..." fill="var(--color-gray12)"/>
    
    {/* Door */}
    <path d="M22.1602 27.8105V21.3555C22.1602 20.9062..." fill="var(--color-gray1)"/>
    
    {/* Background circle */}
    <path fillRule="evenodd" clipRule="evenodd" d="M19.9005 39.8L19.3868 39.7941C8.80434 39.5262..." fill="var(--color-gray12)"/>
  </svg>
);
```

## Icon Factory System

Create a centralized icon factory to manage all your icons:

```jsx
// iconFactory.js
import HomeIcon from './icons/HomeIcon';
import ProfileIcon from './icons/ProfileIcon';
import SettingsIcon from './icons/SettingsIcon';
// Import all your icons

export const createIconFactory = (iconMap) => {
  return (iconName) => {
    const IconComponent = iconMap[iconName];
    if (!IconComponent) {
      console.warn(`Icon "${iconName}" not found in icon factory`);
      return null;
    }
    return <IconComponent />;
  };
};

// Usage
export const iconFactory = createIconFactory({
  home: HomeIcon,
  profile: ProfileIcon,
  settings: SettingsIcon,
  // Add more icons
});
```

## Positioning Options

### Position Array
The `position` prop accepts an array with two values: `[vertical, horizontal]`

**Vertical options**: `'top'`, `'bottom'`, `'center'`
**Horizontal options**: `'left'`, `'right'`, `'center'`

### Examples
```jsx
// Top right corner
<Menu position={['top', 'right']} />

// Bottom left corner  
<Menu position={['bottom', 'left']} />

// Center top
<Menu position={['top', 'center']} />

// Center of screen
<Menu position={['center', 'center']} />
```

## Expansion Modes

### `expand` (Default)
Menu starts expanded and stays expanded.

### `compact`
Menu starts collapsed and stays collapsed.

### `hover`
Menu expands on hover and collapses when mouse leaves.

## CSS Customization

The component uses CSS variables for easy customization:

```css
.menu-container {
  --menu-font-size: 11px;
  --menu-icon-size: 36px;
  --menu-dock-gap: 20px;
  --menu-dock-padding: 8px;
  
  /* Timing variables */
  --menu-timing-main: 0.6s;
  --menu-timing-quick: 0.3s;
  --menu-timing-smooth: 0.45s;
  --menu-timing-fade: 0.8s;
  --menu-timing-instant: 0.1s;
}
```

## Migration Guide

### From Children-based to Items-based

**Before:**
```jsx
<Menu>
  <MenuItem icon={<HomeIcon />} text="Home" />
  <MenuItem icon={<ProfileIcon />} text="Profile" />
</Menu>
```

**After:**
```jsx
const menuItems = [
  { icon: 'home', text: 'Home' },
  { icon: 'profile', text: 'Profile' }
];

<Menu items={menuItems} iconFactory={iconFactory} />
```

## Best Practices

1. **Use the modular approach** for new projects - it's more maintainable
2. **Create a centralized icon factory** to manage all icons
3. **Follow the duo-color icon specification** for consistent theming
4. **Use CSS variables** for customization instead of hardcoded values
5. **Test different expansion modes** to find the best UX for your use case
6. **Consider accessibility** by providing proper alt text and keyboard navigation

## Browser Support

- Modern browsers with CSS backdrop-filter support
- Fallback styles provided for older browsers
- Graceful degradation for unsupported features 