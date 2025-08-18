import React from 'react';
import DropdownMenu, { SubmenuItem } from './DropdownMenu';
import { getNestedControlItems, resolveDataControlValue, ControlNode } from '../../../config/controlsConfig';

export interface DataDropdownMenuProps {
  selectedDataset: string;
  onDatasetChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onDataTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  datasetOptions: string[];
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

const DataDropdownMenu: React.FC<DataDropdownMenuProps> = ({
  selectedDataset,
  onDatasetChange,
  onDataTypeChange,
  datasetOptions,
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
  const nestedDataItems = getNestedControlItems('01');

  // Filter configured data items by current map compatibility for dataset items
  const isDatasetValue = (val: string) => (
    val !== 'nothing' && !val.startsWith('flowdata:') && !val.startsWith('pointdata:')
  );

  // Helper to filter and render nested items (for DropdownMenu with submenus)
  const isAllowedLeaf = (val?: string) => {
    if (!val) return false;
    const resolved = resolveDataControlValue(val);
    if (!isDatasetValue(resolved)) return true;
    return datasetOptions.includes(resolved);
  };

  // Convert ControlNode to SubmenuItem format
  const convertToSubmenuItems = (nodes: ControlNode[], type: 'data' | 'map'): SubmenuItem[] => {
    return nodes
      .filter(node => {
        if (type === 'map') return true;
        if (node.children && node.children.length > 0) {
          // For parent items, include only if they have at least one valid child
          const validChildren = node.children.filter(child => {
            if (child.children) return true;
            return isAllowedLeaf(child.value);
          });
          return validChildren.length > 0;
        }
        const isAllowed = isAllowedLeaf(node.value);
        return isAllowed;
      })
      .map(node => {
        if (type === 'data' && node.value) {
          const resolvedValue = resolveDataControlValue(node.value);
          return {
            label: node.label,
            value: resolvedValue,
            children: node.children ? convertToSubmenuItems(node.children, type) : undefined,
            accordion: node.accordion
          };
        }
        return {
          label: node.label,
          value: node.value,
          children: node.children ? convertToSubmenuItems(node.children, type) : undefined,
          accordion: node.accordion
        };
      });
  };

  const handleCombinedDataChange = (value: string) => {
    if (value.startsWith('flowdata:')) {
      // Handle flow data selection
      onDataTypeChange({ target: { value: 'FlowData' } } as React.ChangeEvent<HTMLSelectElement>);
      onDatasetChange({ target: { value } } as React.ChangeEvent<HTMLSelectElement>);
    } else if (value.startsWith('pointdata:')) {
      // Handle point data selection
      onDatasetChange({ target: { value } } as React.ChangeEvent<HTMLSelectElement>);
      onDataTypeChange({ target: { value: 'Nothing' } } as React.ChangeEvent<HTMLSelectElement>);
    } else if (datasetOptions.includes(value)) {
      onDatasetChange({ target: { value } } as React.ChangeEvent<HTMLSelectElement>);
      onDataTypeChange({ target: { value: 'Nothing' } } as React.ChangeEvent<HTMLSelectElement>);
    } else {
      onDataTypeChange({ target: { value } } as React.ChangeEvent<HTMLSelectElement>);
      onDatasetChange({ target: { value: 'nothing' } } as React.ChangeEvent<HTMLSelectElement>);
    }
  };

  // Get the current combined value
  const getCombinedValue = () => {
    const currentValue = selectedDataset;
    
    // Use the same data source as the items prop to ensure consistency
    const convertedItems = convertToSubmenuItems(nestedDataItems, 'data');
    
    // Find the item that matches the current selectedDataset
    const findMatchingItem = (items: SubmenuItem[]): SubmenuItem | null => {
      for (const item of items) {
        if (item.value === currentValue) {
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
      return match.value; // Return the actual value, not the label
    }
    
    return 'انتخاب کنید';
  };

  return (
    <DropdownMenu
      value={getCombinedValue()}
      onSelect={handleCombinedDataChange}
      items={convertToSubmenuItems(nestedDataItems, 'data')}
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

export default DataDropdownMenu;
