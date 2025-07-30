import React from 'react';
import './cards-grid.css';

export interface CardsGridProps {
  title: string;
  data: Record<string, any>;
  onClose: () => void;
}

const CardsGrid: React.FC<CardsGridProps> = ({ title, data, onClose }) => {
  // Filter out empty or null values and exclude the name field
  const filteredData = Object.entries(data).filter(([key, value]) => {
    return key !== 'name' && 
           key !== 'categoryFa' && // We'll handle this separately
           key !== 'sizeValue' && // We'll handle this separately
           value !== null && 
           value !== undefined && 
           value !== '';
  });

  // Format coordinates if they exist
  const formatCoordinates = (coords: any) => {
    if (Array.isArray(coords) && coords.length === 2) {
      return `${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`; // lat, lng format
    }
    return coords;
  };

  // Process data to format coordinates and other special fields
  const processedData = filteredData.map(([key, value]) => {
    if (key === 'coordinates' && Array.isArray(value)) {
      return [key, formatCoordinates(value)];
    }
    if (key === 'sizeValue' || key === 'size') {
      return ['size', typeof value === 'number' ? value.toFixed(2) : value];
    }
    if (key === 'categoryFa' && value) {
      return ['type', value];
    }
    if (key === 'category' && !data.categoryFa) {
      return ['type', value];
    }
    return [key, value];
  });

  // Show empty state if no data
  const hasData = processedData.length > 0;

  return (
    <div className="cards-grid-container">
      <div className="cards-grid-header">
        <h2 className="cards-grid-title">{title}</h2>
      </div>
      {hasData ? (
        <div className="cards-grid">
          {processedData.map(([key, value]) => (
            <div key={key} className="data-card">
              <div className="data-card-label">
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
              </div>
              <div className="data-card-value">
                {typeof value === 'number' ? value.toLocaleString() : String(value)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="cards-grid-empty">
          <p>No data available. Click on a region or marker to view information.</p>
        </div>
      )}
    </div>
  );
};

export default CardsGrid; 