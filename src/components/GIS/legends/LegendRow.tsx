import React from 'react';
import { LegendGroupProps } from './LegendGroup';
import LegendGroup from './LegendGroup';
import './legend.css';

export interface LegendRowProps {
    legends: LegendGroupProps[];
    className?: string;
    style?: React.CSSProperties;
    gap?: string;
    columns?: number;
}

const LegendRow: React.FC<LegendRowProps> = ({
    legends,
    className = '',
    style = {},
    gap = 'var(--spacing-md)',
    columns = 2
}) => {
    // Dynamically determine the number of columns based on legends count
    const actualColumns = Math.min(columns, legends.length);
    
    const gridStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: `repeat(${actualColumns}, minmax(0, 1fr))`,
        gap,
        width: '100%',
        boxSizing: 'border-box',
        zIndex: 1000,
        pointerEvents: 'none',
        ...style
    };

    return (
        <div className={`map-legends-row ${className}`} style={gridStyle}>
            {legends.map((legendProps, index) => (
                <LegendGroup
                    key={index}
                    {...legendProps}
                    className={`${legendProps.className || ''} legend-group-in-row`}
                    style={{
                        pointerEvents: 'auto',
                        width: '100%',
                        boxSizing: 'border-box',
                        ...legendProps.style
                    }}
                />
            ))}
        </div>
    );
};

export default LegendRow; 