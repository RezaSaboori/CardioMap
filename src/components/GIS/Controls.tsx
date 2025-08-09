import React, { useEffect } from 'react';
import { geoDataConfig } from '../../config/geoDataConfig';
import { getMapGeoJsonPath } from '../../config/geoJsonConfig';
import { getPointDataConfigNames } from '../../config/pointDataConfig';
import { getFlowDataConfigNames } from '../../config/flowDataConfig';
import DropdownMenu from './DropdownMenu';
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

  const renderNodes = (nodes: ControlNode[], type: 'data' | 'map'): React.ReactNode => {
    return nodes.map((node, idx) => {
      const key = `${node.label}-${idx}`;
      if (node.children && node.children.length > 0) {
        // For parent items, render submenu only if it has at least one valid child
        const childrenContent = renderNodes(
          node.children.filter((child) => {
            if (type === 'map') return true;
            return child.children ? true : isAllowedLeaf(child.value);
          }),
          type
        );
        const hasChildren = React.Children.count(childrenContent) > 0;
        if (!hasChildren) return null;
        return (
          <li key={key} className="has-submenu" tabIndex={-1}>
            <span className="item-label">{node.label}</span>
            <div className="submenu-arrow" aria-hidden>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <g transform="translate(0 -32)">
                  <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/>
                </g>
              </svg>
            </div>
            <ul className="dropdown-submenu">{childrenContent}</ul>
          </li>
        );
      }

      // Leaf
      if (type === 'data') {
        const resolved = resolveDataControlValue(node.value as string);
        if (isDatasetValue(resolved) && !datasetOptions.includes(resolved)) return null;
        return (
          <li key={key} data-value={resolved}>
            {node.label}
          </li>
        );
      }
      // map leaf
      return (
        <li key={key} data-value={node.value}>
          {node.label}
        </li>
      );
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
    const match = resolvedDataItems.find(i => i.value === currentValue);
    if (match) return match.label;
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
              const event = { target: { value } } as React.ChangeEvent<HTMLSelectElement>;
              handleCombinedDataChange(event);
            }}
           minWidth={120}
           headerHeight={45}
           fontSize="var(--font-size-lg)"
           finalBorderRadius={20}
           direction="rtl"
           textColor="var(--color-gray12)"
           gradientColors={[['var(--color-gray1)', 0.3], ['var(--color-gray1)', 0.01]]}
           shadow="var(--elevation-2)"
           hoverBackground={['var(--color-gray12)', 0.15]}
          >
            {renderNodes(nestedDataItems, 'data')}
          </DropdownMenu>
          {' '}نسبت به{' '}
           <DropdownMenu
            value={configuredMapItems.find(i => i.value === mapId)?.label || mapId}
            onSelect={(value: string) => {
              const event = { target: { value } } as React.ChangeEvent<HTMLSelectElement>;
              onMapChange(event);
            }}
           minWidth={120}
           headerHeight={45}
           fontSize="var(--font-size-lg)"
           finalBorderRadius={20}
           direction="rtl"
           textColor="var(--color-gray12)"
           gradientColors={[['var(--color-gray1)', 0.3], ['var(--color-gray1)', 0.01]]}
           shadow="var(--elevation-2)"
           hoverBackground={['var(--color-gray12)', 0.15]}
           >
            {renderNodes(nestedMapItems, 'map')}
          </DropdownMenu>

      </h2>
    </div>
  );
};

export default Controls; 