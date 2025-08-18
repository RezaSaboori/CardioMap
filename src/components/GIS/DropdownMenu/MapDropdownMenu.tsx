import React from 'react';
import DropdownMenu, { SubmenuItem } from './DropdownMenu';
import { getNestedControlItems, ControlNode } from '../../../config/controlsConfig';

export interface MapDropdownMenuProps {
  mapId: string;
  onMapChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  minWidth?: number;
  headerHeight?: number;
  fontSize?: string;
  finalBorderRadius?: number;
  direction?: 'rtl' | 'ltr';
  textColor?: string;
  gradientColors?: Array<[string, number, string?]>;
  shadow?: string;
  hoverBackground?: [string, number];
  activeBackground?: [string, number];
  headerPathDepth?: number;
}

const MapDropdownMenu: React.FC<MapDropdownMenuProps> = ({
  mapId,
  onMapChange,
  minWidth = 120,
  headerHeight = 45,
  fontSize = "var(--font-size-lg)",
  finalBorderRadius = 20,
  direction = "rtl",
  textColor = "var(--color-gray12)",
  gradientColors = [['var(--color-gray1)', 0.3], ['var(--color-gray1)', 0.01]],
  shadow = "var(--elevation-2)",
  hoverBackground = ['var(--color-gray12)', 0.04],
  activeBackground = ['var(--color-gray12)', 0.15],
  headerPathDepth,
}) => {
  // Read items from central controls config
  const nestedMapItems = getNestedControlItems('02');

  // Convert ControlNode to SubmenuItem format
  const convertToSubmenuItems = (nodes: ControlNode[]): SubmenuItem[] => {
    return nodes.map(node => ({
      label: node.label,
      value: node.value,
      children: node.children ? convertToSubmenuItems(node.children) : undefined,
      accordion: node.accordion
    }));
  };

  const handleMapChange = (value: string) => {
    onMapChange({ target: { value } } as React.ChangeEvent<HTMLSelectElement>);
  };

  // Get the current map value
  const getCurrentMapValue = () => {
    const convertedItems = convertToSubmenuItems(nestedMapItems);
    
    // Find the item that matches the current mapId
    const findMatchingItem = (items: SubmenuItem[]): SubmenuItem | null => {
      for (const item of items) {
        if (item.value === mapId) {
          return item;
        }
        if (item.children) {
          const found = findMatchingItem(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    const match = findMatchingItem(convertedItems);
    
    if (match && match.value) {
      return match.value;
    }
    
    return mapId; // Fallback to the actual mapId if no match found
  };

  return (
    <DropdownMenu
      value={getCurrentMapValue()}
      onSelect={handleMapChange}
      items={convertToSubmenuItems(nestedMapItems)}
      minWidth={minWidth}
      headerHeight={headerHeight}
      fontSize={fontSize}
      finalBorderRadius={finalBorderRadius}
      direction={direction}
      textColor={textColor}
      gradientColors={gradientColors}
      shadow={shadow}
      hoverBackground={hoverBackground}
      activeBackground={activeBackground}
      headerPathDepth={headerPathDepth}
    />
  );
};

export default MapDropdownMenu;
