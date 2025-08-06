import React, { useRef } from 'react';
import { BentoGrid, Card } from './BentoGrid_component';
import { evaluateDynamicColor } from './utils/color-utils';
import { DynamicColorConfig } from '../../config/geoDataConfig';
import './cards-grid.css';

export interface CardData {
  title: string;
  value: string | number;
  unit?: string;
  info?: string;
  colorCondition?: DynamicColorConfig; // Dynamic color configuration
}

export interface CardsGridProps {
  title: string;
  cards: CardData[];
  onClose: () => void;
}

const CardsGrid: React.FC<CardsGridProps> = ({ title, cards, onClose }) => {
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Function to detect Persian text
  const isPersianText = (text: string): boolean => {
    const persianRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return persianRegex.test(text);
  };
  
  // Show empty state if no cards
  const hasCards = cards && cards.length > 0;

  // Configure cards for BentoGrid with dynamic colors
  const bentoCards = cards.map((card, index) => {
    // Evaluate dynamic color based on card value and configuration
    const cardColor = card.colorCondition 
      ? evaluateDynamicColor(card.value, card.colorCondition)
      : '#ffffff'; // Default white background

    return {
      id: `card-${index}`,
      beforeSize: { colSpan: 1, rowSpan: 1 },
      afterSize: { colSpan: 2, rowSpan: 2 },
      borderRadius: 'var(--border-radius-item-xl)',
      cardPadding: 'var(--spacing-md)',
      childrenGap: 'var(--spacing-md)',
      backgroundColor: cardColor
    };
  });

  return (
    <div className="cards-grid-container">
      <div className="cards-grid-header">
        <h2 className="cards-grid-title">{title}</h2>
      </div>
      {hasCards ? (
        <div className="cards-grid" ref={gridRef}>
          <BentoGrid 
            cards={bentoCards} 
            columns={2}
            backgroundColor="transparent"
            shader={true}
            padding={0}
          >
            {cards.map((card, index) => (
              <Card
                key={`card-${index}`}
                id={`card-${index}`}
                header={card.title}
                tooltipContent={card.info || `Value: ${card.value}${card.unit ? ` ${card.unit}` : ''}`}
                visibleItemsInitial={1}
                gridRef={gridRef}
                onExpandToggle={(expanded) => {
                  console.log(`Card ${index} expanded:`, expanded);
                }}
                onPinToggle={(pinned) => {
                  console.log(`Card ${index} pinned:`, pinned);
                }}
              >
                <div className="card-value-wrapper">
                  <span 
                    className="card-value"
                    dir={isPersianText(`${typeof card.value === 'number' ? card.value.toLocaleString() : String(card.value)}${card.unit ? ` ${card.unit}` : ''}`) ? 'rtl' : 'ltr'}
                  >
                    <span data-text={`${typeof card.value === 'number' ? card.value.toLocaleString() : String(card.value)}${card.unit ? ` ${card.unit}` : ''}`}>
                      {typeof card.value === 'number' ? card.value.toLocaleString() : String(card.value)}
                      {card.unit && <span className="card-unit"> {card.unit}</span>}
                    </span>
                  </span>
                </div>
              </Card>
            ))}
          </BentoGrid>
        </div>
      ) : (
        <div className="cards-grid-empty">
          <p>جهت مشاهده جزییات بیشتر بر روی آیتم مورد نظر در نقشه کلیک کنید</p>
        </div>
      )}
    </div>
  );
};

export default CardsGrid; 