import React, { useEffect } from 'react';
import { geoDataConfig } from '../../config/geoDataConfig';
import { getMapGeoJsonPath } from '../../config/geoJsonConfig';
import { DataDropdownMenu, MapDropdownMenu } from './DropdownMenu';
import { validateControlsConfig } from '../../config/controlsConfig';

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

  // Validate controls config once
  useEffect(() => {
    validateControlsConfig();
  }, []);

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
        <DataDropdownMenu
          selectedDataset={selectedDataset}
          onDatasetChange={onDatasetChange}
          onDataTypeChange={onDataTypeChange}
          datasetOptions={compatibleDatasetNames}
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
          headerPathDepth={1}
        />
        {' '}نسبت به{' '}
        <MapDropdownMenu
          mapId={mapId}
          onMapChange={onMapChange}
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
          headerPathDepth={0}
        />
      </h2>
    </div>
  );
};

export default Controls; 