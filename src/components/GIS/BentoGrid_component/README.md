# BentoGrid Component

This directory contains a reusable and customizable BentoGrid component with a WebGL shader background effect.

## How to Use

1.  Copy this entire directory into your project's `src/components` folder.
2.  Install the required dependencies:
    ```bash
    npm install react react-dom three
    ```
3.  If you are using Vite, you may need to install `vite-plugin-glsl`:
    ```bash
    npm install vite-plugin-glsl --save-dev
    ```
    And add it to your `vite.config.js`:
    ```javascript
    import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react'
    import glsl from 'vite-plugin-glsl';

    // https://vitejs.dev/config/
    export default defineConfig({
      plugins: [react(), glsl()],
    })
    ```
4.  Import and use the `BentoGrid` and `Card` components.

    ```jsx
    import { BentoGrid, Card } from './components/BentoGrid_component';
    import './App.css';

    // Define the configuration for your cards
    const myCards = [
      {
        id: '1',
        header: 'Observation Post A',
        beforeSize: { colSpan: 1, rowSpan: 1 },
        afterSize: { colSpan: 2, rowSpan: 2 },
        tooltipContent: 'Information about Post A.',
        // You can override default styles here
        borderRadius: '24px',
        cardPadding: '20px',
      },
      {
        id: '2',
        header: 'System Status',
        beforeSize: { colSpan: 2, rowSpan: 1 },
        tooltipContent: 'Real-time system metrics.',
      },
      // ... more cards
    ];

    function App() {
      return (
        <div className="app-container">
          <BentoGrid cards={myCards} columns={4}>
            {myCards.map(card => (
              <Card key={card.id} {...card}>
                <p>Content for {card.header}</p>
                {/* You can have more complex children here */}
              </Card>
            ))}
          </BentoGrid>
        </div>
      );
    }

    export default App;
    ```

## Components

### BentoGrid

The main grid container that manages the layout and styling of the cards.

**Props:**

*   `cards` (Array): **Required.** An array of card configuration objects. See the `Card Configuration` section below for details.
*   `columns` (Number): The number of columns in the grid. Default: `4`.
*   `children` (React.Node): `Card` components to be rendered. The `BentoGrid` will automatically clone these children and pass the correct props from the `cards` configuration.
*   `backgroundColor` (String): Background color for the area behind the grid.
*   `shader` (Boolean): Enable or disable the WebGL shader effect. Default: `true`.
*   `padding` (String): Padding for the grid container (e.g., `'24px'`).

---

### Card Configuration (`cards` prop array)

Each object in the `cards` array configures a corresponding `<Card>` child with the same `id`.

*   `id` (String): **Required.** A unique identifier that must match the `id` prop of a `<Card>` child.
*   `header` (String): The header text of the card.
*   `beforeSize` (Object): Size of the card when collapsed. `{ colSpan: 1, rowSpan: 1 }`
*   `afterSize` (Object): Size of the card when expanded. `{ colSpan: 2, rowSpan: 2 }`
*   `tooltipContent` (String): Content for the info icon tooltip.
*   `borderRadius` (String): The border radius of the card. Default: `'32px'`.
*   `borderSize` (String): The size of the card's border effect. Default: `'3px'`.
*   `cardPadding` (String): The padding inside the card. Default: `'24px'`.
*   `childrenGap` (String): The gap between child elements inside the card content area. Default: `'16px'`.

---

### Card

A card component to be placed inside the `BentoGrid`. It should be passed as a child to `BentoGrid`. Most of its props are passed down from the `BentoGrid`'s `cards` configuration.

**Props you pass to `<Card>`:**

*   `id` (String): **Required.** A unique identifier.
*   `header` (String): The header text to display on the card.
*   `children` (React.Node): The content to be displayed inside the card.

**Props passed automatically by `BentoGrid`:**

*   `onExpandToggle`, `onPinToggle`, `gridRef`, `beforeSize`, `afterSize`, and all styling props from the card configuration. 