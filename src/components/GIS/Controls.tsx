import React from 'react';
import { geoDataConfig } from '../../config/geoDataConfig';
import { getMapGeoJsonPath, getMapDisplayName } from '../../config/geoJsonConfig';
import { getPointDataConfigNames } from '../../config/pointDataConfig';
import { getFlowDataConfigNames } from '../../config/flowDataConfig';
import DropdownMenu from './DropdownMenu';

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
  
  // Combined data options (migrated to new system)
  const dataOptions = [
    { value: 'nothing', label: 'هیچ' },
    ...flowDataOptions.map(name => ({ value: `flowdata:${name}`, label: name })),
    ...datasetOptions.map(name => ({ value: name, label: name })),
    ...pointDataOptions.map(name => ({ value: `pointdata:${name}`, label: name }))
  ];

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
    if (dataType === 'FlowData' && selectedDataset.startsWith('flowdata:')) {
      return selectedDataset.replace('flowdata:', '');
    }
    if (selectedDataset !== 'nothing') {
      // Check if it's a point data selection
      if (selectedDataset.startsWith('pointdata:')) {
        // Extract the actual name from pointdata:Research Centers -> Research Centers
        return selectedDataset.replace('pointdata:', '');
      }
      return selectedDataset;
    }
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
           {dataOptions.map(option => (
             <li key={option.value} data-value={option.value}>
               {option.label}
             </li>
           ))}
         </DropdownMenu>
         {' '}نسبت به{' '}
                   <DropdownMenu
            value={getMapDisplayName(mapId)}
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
           {mapIds.map(id => {
             const displayName = getMapDisplayName(id);
             return (
               <li key={id} data-value={id}>
                 {displayName}
               </li>
             );
           })}
         </DropdownMenu>

      </h2>
    </div>
  );
};

export default Controls; 