import React from 'react';
import { LegendRowProps } from './LegendRow';
import LegendRow from './LegendRow';
import './legend.css';

export interface LegendContainerProps {
    legendRows: LegendRowProps[];
    className?: string;
    style?: React.CSSProperties;
    position?: 'bottom' | 'top' | 'left' | 'right';
    padding?: string;
}

const LegendContainer: React.FC<LegendContainerProps> = ({
    legendRows,
    className = '',
    style = {},
    position = 'bottom',
    padding = 'var(--spacing-md)'
}) => {
    const getPositionStyle = (): React.CSSProperties => {
        const baseStyle: React.CSSProperties = {
            position: 'absolute',
            width: '100%',
            boxSizing: 'border-box',
            zIndex: 1000,
            pointerEvents: 'none'
        };

        switch (position) {
            case 'bottom':
                return {
                    ...baseStyle,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: `0 ${padding} ${padding} ${padding}`
                };
            case 'top':
                return {
                    ...baseStyle,
                    left: 0,
                    right: 0,
                    top: 0,
                    padding: `${padding} ${padding} 0 ${padding}`
                };
            case 'left':
                return {
                    ...baseStyle,
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: 'auto',
                    maxWidth: '300px',
                    padding: `${padding} 0 ${padding} ${padding}`
                };
            case 'right':
                return {
                    ...baseStyle,
                    top: 0,
                    bottom: 0,
                    right: 0,
                    width: 'auto',
                    maxWidth: '300px',
                    padding: `${padding} ${padding} ${padding} 0`
                };
            default:
                return baseStyle;
        }
    };

    return (
        <div 
            className={`map-legends-outer-container ${className}`}
            style={{ ...getPositionStyle(), ...style }}
        >
            {legendRows.map((rowProps, index) => (
                <LegendRow
                    key={index}
                    {...rowProps}
                    className={`${rowProps.className || ''} legend-row-${index}`}
                />
            ))}
        </div>
    );
};

export default LegendContainer; 