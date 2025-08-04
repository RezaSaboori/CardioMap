# DropdownMenu Component

A highly customizable and animated dropdown menu component for React with full TypeScript support.

## Features

- **Dynamic Sizing:** Automatically adjusts its width based on the content of the selected item, with smooth animations.
- **Fixed or Variable Size:** Can be set to a fixed width or allowed to resize dynamically between a minimum and maximum width.
- **Customizable Appearance:** Control everything from colors, fonts, and borders to shadows and gradients through a simple and powerful prop-based API.
- **Smooth Animations:** Fluid animations for opening, closing, and resizing, powered by CSS transitions.
- **RTL/LTR Support:** Full support for both right-to-left and left-to-right layouts.
- **Glassmorphism Effect:** Built-in support for backdrop blur and transparency to create a modern, glass-like effect.

## Installation

To use the `DropdownMenu` component, import it into your React file:

```tsx
import DropdownMenu from './path/to/DropdownMenu';
```

## Usage Example

Here is a basic example of how to use the `DropdownMenu`.

```tsx
import React, { useState } from 'react';
import DropdownMenu from './DropdownMenu';

const App: React.FC = () => {
  const [selectedValue, setSelectedValue] = useState('Select a fruit');
  const options = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

  return (
    <DropdownMenu
      value={selectedValue}
      onSelect={setSelectedValue}
      minWidth={150}
      maxWidth={300}
    >
      {options.map((option) => (
        <li key={option}>{option}</li>
      ))}
    </DropdownMenu>
  );
};

export default App;
```

## Props

The component accepts the following props to customize its appearance and behavior:

| Prop                  | Type                               | Default                                             | Description                                                                                                                              |
| --------------------- | ---------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `children`            | `node`                             | `undefined`                                         | **Required.** The list items (`<li>`) to be displayed in the dropdown.                                                                    |
| `value`               | `string`                           | `undefined`                                         | **Required.** The currently selected value to be displayed in the dropdown header.                                                       |
| `onSelect`            | `function`                         | `undefined`                                         | **Required.** A callback function that is invoked with the new value when an item is selected.                                           |
| `fontSize`            | `string`                           | `'14px'`                                            | The font size for the text in the component.                                                                                             |
| `headerHeight`        | `number`                           | `48`                                                | The height of the dropdown header in pixels.                                                                                             |
| `maxHeight`           | `number`                           | `288`                                               | The maximum height the dropdown can expand to, including the header.                                                                     |
| `minWidth`            | `number`                           | `120`                                               | The minimum width of the component.                                                                                                      |
| `maxWidth`            | `number`                           | `320`                                               | The maximum width of the component.                                                                                                      |
| `initialBorderRadius` | `number`                           | `headerHeight / 2`                                  | The border radius of the collapsed dropdown. Defaults to half the header height, creating a pill shape.                                  |
| `finalBorderRadius`   | `number`                           | `16`                                                | The border radius of the expanded dropdown.                                                                                              |
| `direction`           | `string`                           | `'rtl'`                                             | The text and layout direction. Can be `'rtl'` or `'ltr'`.                                                                                |
| `textColor`           | `string`                           | `'#ffffff'`                                         | The color of the text and the arrow icon.                                                                                                |
| `background`          | `string`                           | `'rgba(255, 255, 255, 0.2)'`                         | The background color of the dropdown. This is overridden if `gradientColors` is provided.                                              |
| `gradientColors`      | `array`                            | `undefined`                                         | An array of color stops to generate a linear gradient background. Each stop is an array: `[color, alpha, position]`.                    |
| `shadow`              | `string`                           | `'0 8px 32px 0 rgba(0, 0, 0, 0.2)'`                 | The box-shadow for the dropdown.                                                                                                         |
| `hoverBackground`     | `array`                            | `['rgba(255,255,255,1)', 0.1]`                       | A `[color, alpha]` array to generate the background color for list items on hover and for the arrow's background.                      |
| `fixedWidth`          | `boolean`                          | `false`                                             | If `true`, the dropdown will have a fixed width equal to `maxWidth`. Dynamic width sizing will be disabled.                              |
| `fixedHeight`         | `boolean`                          | `false`                                             | If `true`, the dropdown list will expand to `maxHeight` instead of fitting its content.                                                  |

## Styling

The component relies on `DropdownMenu.css` for its base styles and animations. You can modify this file to make further appearance changes. Key CSS variables are also set via props for dynamic styling. 