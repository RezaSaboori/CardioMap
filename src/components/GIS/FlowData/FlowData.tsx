import React, { useState, useEffect } from 'react';
import { FlowLayer } from './index';
import { FlowDataConfig } from '../../../config/flowDataConfig';
import { loadFlowData, ProcessedFlowData } from '../../../utils/flowDataLoader';
import { getFlowDataColorMap, getFlowDataCategoryLabels } from '../../../config/flowDataConfig';

interface FlowDataProps {
  config: FlowDataConfig;
  onFlowClick?: (flow: any) => void;
  onFlowHover?: (hoverInfo: { longitude: number; latitude: number; featureName: string; } | null) => void;
  minSize?: number;
  maxSize?: number;
  enableAnimation?: boolean;
}

const FlowData: React.FC<FlowDataProps> = ({
  config,
  onFlowClick,
  onFlowHover,
  minSize = 2,
  maxSize = 12,
  enableAnimation = true
}) => {
  const [processedData, setProcessedData] = useState<ProcessedFlowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data when config changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await loadFlowData(config);
        setProcessedData(data);
      } catch (err) {
        console.error('Error loading flow data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load flow data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [config]);

  // Generate color map and category labels from config
  const colorMap = getFlowDataColorMap(config);
  const categoryLabels = getFlowDataCategoryLabels(config);

  if (loading) {
    return (
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '10px',
        borderRadius: '5px'
      }}>
        Loading {config.name}...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        background: 'rgba(255, 0, 0, 0.1)',
        padding: '10px',
        borderRadius: '5px',
        color: 'red'
      }}>
        Error loading {config.name}: {error}
      </div>
    );
  }

  if (!processedData || processedData.data.length === 0) {
    return (
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '10px',
        borderRadius: '5px'
      }}>
        No data available for {config.name}
      </div>
    );
  }

  console.log('FlowData component - processedData:', processedData);
  console.log('FlowData component - flows:', processedData.data);
  console.log('FlowData component - flows with IDs:', processedData.data.map(f => ({ id: f.id, category: f.category })));
  console.log('FlowData component - categoryLabels:', categoryLabels);
  console.log('FlowData component - config.categoriesColumn:', config.categoriesColumn);

  return (
    <FlowLayer
      flows={processedData.data}
      colorMap={colorMap}
      onFlowClick={onFlowClick}
      onFlowHover={onFlowHover}
      categoryLabels={categoryLabels}
      minSize={minSize}
      maxSize={maxSize}
      enableAnimation={enableAnimation}
      nameColumn={config.categoriesColumn}
    />
  );
};

export default FlowData; 