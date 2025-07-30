import React, { useRef, useState, useEffect } from 'react';
import { ColorMap } from '../../../types';
import './legend.css';

interface GradientStop {
    value: number | string;
    color: string;
    label?: string;
}

export interface LegendProps {
    colorMap?: ColorMap; // For categorical
    categoryLabels?: { [key: string]: string };
    showLegend: boolean;
    gradient?: GradientStop[]; // For continuous
    gradientLabels?: { left: string; right: string };
    className?: string;
    style?: React.CSSProperties;
}

const LeftArrow = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.2893 5.70708C13.8988 5.31655 13.2657 5.31655 12.8751 5.70708L7.98768 10.5993C7.20729 11.3805 7.2076 12.6463 7.98837 13.427L12.8787 18.3174C13.2693 18.7079 13.9024 18.7079 14.293 18.3174C14.6835 17.9269 14.6835 17.2937 14.293 16.9032L10.1073 12.7175C9.71678 12.327 9.71678 11.6939 10.1073 11.3033L14.2893 7.12129C14.6799 6.73077 14.6799 6.0976 14.2893 5.70708Z" fill="currentColor"/>
    </svg>
);

const RightArrow = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z" fill="currentColor"/>
    </svg>
);

const Legend: React.FC<LegendProps> = ({ 
    colorMap, 
    categoryLabels = {}, 
    showLegend, 
    gradient, 
    gradientLabels,
    className = '',
    style = {}
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [hasOverflow, setHasOverflow] = useState(false);

    const checkScrollPosition = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            const overflow = scrollWidth > clientWidth;
            setHasOverflow(overflow);
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
        }
    };

    useEffect(() => {
        checkScrollPosition();
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollPosition);
            return () => container.removeEventListener('scroll', checkScrollPosition);
        }
    }, [colorMap]);

    useEffect(() => {
        // Check scroll position when component mounts or legend changes
        const timer = setTimeout(checkScrollPosition, 100);
        return () => clearTimeout(timer);
    }, [showLegend, colorMap]);

    if (!showLegend) {
        return null;
    }

    // Render continuous (gradient) legend if gradient prop is provided
    if (gradient && gradient.length > 1) {
        // Build linear-gradient CSS string
        const gradientStops = gradient.map((stop, i, arr) => {
            const percent = (i / (arr.length - 1)) * 100;
            return `${stop.color} ${percent}%`;
        }).join(', ');
        
        return (
            <div 
                className={`map-legend ${className}`} 
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    height: 36,
                    ...style 
                }}
            >
                <div className="legend-gradient-container">
                    <span className="legend-label" style={{ textAlign: 'right' }}>
                        {gradientLabels?.left || gradient[0].label || 'Low'}
                    </span>
                    <div 
                        className="legend-gradient-bar" 
                        style={{ 
                            flex: 1, 
                            height: 16, 
                            borderRadius: 8, 
                            background: `linear-gradient(to right, ${gradientStops})` 
                        }} 
                    />
                    <span className="legend-label" style={{ textAlign: 'left' }}>
                        {gradientLabels?.right || gradient[gradient.length - 1].label || 'High'}
                    </span>
                </div>
            </div>
        );
    }

    // Render categorical legend if colorMap is provided
    if (colorMap && Object.keys(colorMap).length > 0) {
        const scrollLeft = () => {
            if (scrollContainerRef.current && canScrollLeft) {
                scrollContainerRef.current.scrollBy({
                    left: -200,
                    behavior: 'smooth'
                });
            }
        };

        const scrollRight = () => {
            if (scrollContainerRef.current && canScrollRight) {
                scrollContainerRef.current.scrollBy({
                    left: 200,
                    behavior: 'smooth'
                });
            }
        };

        return (
            <div 
                className={`map-legend ${className}`} 
                style={{ minWidth: 0, ...style }}
            >
                {hasOverflow && (
                    <button 
                        className={`legend-arrow legend-arrow-left ${!canScrollLeft ? 'legend-arrow-disabled' : ''}`}
                        onClick={scrollLeft}
                        disabled={!canScrollLeft}
                    >
                        <LeftArrow />
                    </button>
                )}
                <div className="legend-items-container" ref={scrollContainerRef}>
                    {Object.entries(colorMap).map(([category, color], index) => (
                        <React.Fragment key={category}>
                            <div className="legend-item">
                                <span className="legend-label">
                                    {categoryLabels[category] || category}
                                </span>
                                <span 
                                    className="legend-color" 
                                    style={{ backgroundColor: color }}
                                />
                            </div>
                            {index < Object.entries(colorMap).length - 1 && (
                                <div className="legend-separator" />
                            )}
                        </React.Fragment>
                    ))}
                </div>
                {hasOverflow && (
                    <button 
                        className={`legend-arrow legend-arrow-right ${!canScrollRight ? 'legend-arrow-disabled' : ''}`}
                        onClick={scrollRight}
                        disabled={!canScrollRight}
                    >
                        <RightArrow />
                    </button>
                )}
            </div>
        );
    }

    // If neither, render nothing
    return null;
};

export default Legend; 