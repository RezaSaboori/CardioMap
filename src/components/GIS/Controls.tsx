import React, { useEffect } from 'react';
import { geoDataConfig } from '../../config/geoDataConfig';
import { getMapGeoJsonPath } from '../../config/geoJsonConfig';
import { getPointDataConfigNames } from '../../config/pointDataConfig';
import { getFlowDataConfigNames } from '../../config/flowDataConfig';
import DropdownMenu, { SubmenuItem } from './DropdownMenu';
import { getControlItems, getNestedControlItems, validateControlsConfig, resolveDataControlValue, ControlNode } from '../../config/controlsConfig';

export interface ControlsProps {
  selectedDataset: string;
  onDatasetChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  mapId: string;
  onMapChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  mapIds: string[];
  dataType: string;
  onDataTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Controls: React.FC<ControlsProps> = ({
  selectedDataset,
  onDatasetChange,
  mapId,
  onMapChange,
  mapIds,
  dataType,
  onDataTypeChange,
}) => {
  // Get compatible datasets for current map
  const currentMapGeoJsonPath = getMapGeoJsonPath(mapId);
  const compatibleDatasets = geoDataConfig.filter(config => config.geoJsonPath === currentMapGeoJsonPath);
  const compatibleDatasetNames = compatibleDatasets.map(config => config.name);
  
  // Get dataset options from configuration (only compatible ones)
  const datasetOptions = compatibleDatasetNames;
  const pointDataOptions = getPointDataConfigNames();
  const flowDataOptions = getFlowDataConfigNames();

  // Validate controls config once
  useEffect(() => {
    validateControlsConfig();
  }, []);

  // Read items from central controls config
  const configuredDataItems = getControlItems('01');
  const configuredMapItems = getControlItems('02');
  const nestedDataItems = getNestedControlItems('01');
  const nestedMapItems = getNestedControlItems('02');

  const resolvedDataItems = configuredDataItems.map(item => ({
    label: item.label,
    value: resolveDataControlValue(item.value)
  }));

  // Filter configured data items by current map compatibility for dataset items
  const isDatasetValue = (val: string) => (
    val !== 'nothing' && !val.startsWith('flowdata:') && !val.startsWith('pointdata:')
  );

  const dataOptions = resolvedDataItems.filter(item => {
    if (!isDatasetValue(item.value)) return true;
    return datasetOptions.includes(item.value);
  });

  // Helper to filter and render nested items (for DropdownMenu with submenus)
  const isAllowedLeaf = (val?: string) => {
    if (!val) return false;
    const resolved = resolveDataControlValue(val);
    if (!isDatasetValue(resolved)) return true;
    return datasetOptions.includes(resolved);
  };

  // Convert ControlNode to SubmenuItem format
  const convertToSubmenuItems = (nodes: ControlNode[], type: 'data' | 'map'): SubmenuItem[] => {
    console.log('🔍 convertToSubmenuItems called with:', { nodes, type });
    
    return nodes
      .filter(node => {
        console.log('🔍 convertToSubmenuItems - filtering node:', {
          label: node.label,
          value: node.value,
          hasChildren: !!node.children,
          type
        });
        
        if (type === 'map') return true;
        if (node.children && node.children.length > 0) {
          // For parent items, include only if they have at least one valid child
          const validChildren = node.children.filter(child => {
            if (child.children) return true;
            return isAllowedLeaf(child.value);
          });
          console.log('🔍 convertToSubmenuItems - parent node validChildren count:', validChildren.length);
          return validChildren.length > 0;
        }
        const isAllowed = isAllowedLeaf(node.value);
        console.log('🔍 convertToSubmenuItems - leaf node isAllowed:', isAllowed);
        return isAllowed;
      })
      .map(node => {
        console.log('🔍 convertToSubmenuItems - mapping node:', {
          label: node.label,
          value: node.value,
          type
        });
        
        if (type === 'data' && node.value) {
          const resolvedValue = resolveDataControlValue(node.value);
          console.log('🔍 convertToSubmenuItems - resolved value:', {
            original: node.value,
            resolved: resolvedValue
          });
          return {
            label: node.label,
            value: resolvedValue,
            children: node.children ? convertToSubmenuItems(node.children, type) : undefined
          };
        }
        return {
          label: node.label,
          value: node.value,
          children: node.children ? convertToSubmenuItems(node.children, type) : undefined
        };
      });
  };

  const handleCombinedDataChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    if (value.startsWith('flowdata:')) {
      // Handle flow data selection
      onDataTypeChange({ target: { value: 'FlowData' } } as React.ChangeEvent<HTMLSelectElement>);
      onDatasetChange(e);
    } else if (value.startsWith('pointdata:')) {
      // Handle point data selection
      onDatasetChange(e);
      onDataTypeChange({ target: { value: 'Nothing' } } as React.ChangeEvent<HTMLSelectElement>);
    } else if (datasetOptions.includes(value)) {
      onDatasetChange(e);
      onDataTypeChange({ target: { value: 'Nothing' } } as React.ChangeEvent<HTMLSelectElement>);
    } else {
      onDataTypeChange(e);
      onDatasetChange({ target: { value: 'nothing' } } as React.ChangeEvent<HTMLSelectElement>);
    }
  };

  // Get the current combined value
  const getCombinedValue = () => {
    const currentValue = selectedDataset;
    console.log('🔍 getCombinedValue - currentValue:', currentValue);
    
    // Use the same data source as the items prop to ensure consistency
    const convertedItems = convertToSubmenuItems(nestedDataItems, 'data');
    console.log('🔍 getCombinedValue - convertedItems:', convertedItems);
    
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
    console.log('🔍 getCombinedValue - match:', match);
    
    if (match && match.value) {
      console.log('🔍 getCombinedValue - returning value:', match.value);
      return match.value; // Return the actual value, not the label
    }
    
    console.log('🔍 getCombinedValue - no match found, returning default');
    return 'انتخاب کنید';
  };

  return (
    <div className="controls">
      <h2 style={{
        fontFamily: 'var(--font-family-persian)',
        fontSize: 'var(--font-size-xl)',
        fontWeight: 'var(--font-weight-medium)',
        color: 'var(--color-gray11)',
        textAlign: 'center',
        margin: '0',
        direction: 'rtl',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--spacing-sm)',
        flexWrap: 'nowrap'
      }}>
                 نقشه توزیع{' '}
          <DropdownMenu
           value={getCombinedValue()}
                       onSelect={(value: string) => {
              console.log('🔍 Data DropdownMenu onSelect - value:', value);
              const event = { target: { value } } as React.ChangeEvent<HTMLSelectElement>;
              handleCombinedDataChange(event);
            }}
           items={convertToSubmenuItems(nestedDataItems, 'data')}
           minWidth={120}
           headerHeight={45}
           fontSize="var(--font-size-lg)"
           finalBorderRadius={20}
           direction="rtl"
           textColor="var(--color-gray12)"
           gradientColors={[['var(--color-gray1)', 0.3], ['var(--color-gray1)', 0.01]]}
           shadow="var(--elevation-2)"
           hoverBackground={['var(--color-gray12)', 0.04]}
           activeBackground={['var(--color-gray12)', 0.15]}
          />
          {' '}نسبت به{' '}
           <DropdownMenu
            value={configuredMapItems.find(i => i.value === mapId)?.value || mapId}
            onSelect={(value: string) => {
              console.log('🔍 Map DropdownMenu onSelect - value:', value);
              const event = { target: { value } } as React.ChangeEvent<HTMLSelectElement>;
              onMapChange(event);
            }}
           items={convertToSubmenuItems(nestedMapItems, 'map')}
           minWidth={120}
           headerHeight={45}
           fontSize="var(--font-size-lg)"
           finalBorderRadius={20}
           direction="rtl"
           textColor="var(--color-gray12)"
           gradientColors={[['var(--color-gray1)', 0.3], ['var(--color-gray1)', 0.01]]}
           shadow="var(--elevation-2)"
           hoverBackground={['var(--color-gray12)', 0.04]}
           activeBackground={['var(--color-gray12)', 0.15]}
           />

      </h2>
    </div>
  );
};

export default Controls; 