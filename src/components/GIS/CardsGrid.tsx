import React from 'react';
import './cards-grid.css';

export interface CardData {
  title: string;
  value: string | number;
  unit?: string;
  info?: string;
}

export interface CardsGridProps {
  title: string;
  cards: CardData[];
  onClose: () => void;
}

const CardsGrid: React.FC<CardsGridProps> = ({ title, cards, onClose }) => {
  // Show empty state if no cards
  const hasCards = cards && cards.length > 0;

  return (
    <div className="cards-grid-container">
      <div className="cards-grid-header">
        <h2 className="cards-grid-title">{title}</h2>
      </div>
      {hasCards ? (
        <div className="cards-grid">
          {cards.map((card, index) => (
            <div key={index} className="data-card">
              <div className="data-card-label">
                {card.title}
              </div>
              <div className="data-card-value">
                {typeof card.value === 'number' ? card.value.toLocaleString() : String(card.value)}
                {card.unit && <span className="data-card-unit"> {card.unit}</span>}
              </div>
              {card.info && (
                <div className="data-card-info">
                  {card.info}
                </div>
              )}
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