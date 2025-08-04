import React from 'react';
import { geoDataConfig } from '../../config/geoDataConfig';
import { getMapGeoJsonPath, getMapDisplayName } from '../../config/geoJsonConfig';
import { getPointDataConfigNames } from '../../config/pointDataConfig';

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
  
  // Combined data options (migrated to new system)
  const dataOptions = [
    { value: 'nothing', label: 'No Data' },
    { value: 'FlowData', label: 'Disease Path' },
    ...datasetOptions.map(name => ({ value: name, label: name })),
    ...pointDataOptions.map(name => ({ value: `pointdata:${name}`, label: name }))
  ];

  const handleCombinedDataChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    if (value === 'FlowData') {
      onDataTypeChange(e);
      onDatasetChange({ target: { value: 'nothing' } } as React.ChangeEvent<HTMLSelectElement>);
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
    if (dataType === 'FlowData') return 'FlowData';
    if (selectedDataset !== 'nothing') {
      // Check if it's a point data selection
      if (selectedDataset.startsWith('pointdata:')) {
        return selectedDataset;
      }
      return selectedDataset;
    }
    return 'nothing';
  };

  return (
    <div className="controls">
      <label htmlFor="data-select">Select Data:</label>
      <select id="data-select" value={getCombinedValue()} onChange={handleCombinedDataChange}>
        {dataOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label htmlFor="map-select">Select a Map:</label>
      <select id="map-select" onChange={onMapChange} value={mapId}>
        {mapIds.map(id => {
          const displayName = getMapDisplayName(id);
          return (
            <option key={id} value={id}>
              {displayName}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default Controls; 