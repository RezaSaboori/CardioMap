import React from 'react';
import { LegendProps } from './Legend';
import Legend from './Legend';
import './legend.css';

export interface LegendGroupProps {
    title: string;
    legendProps: LegendProps;
    className?: string;
    style?: React.CSSProperties;
    titleClassName?: string;
    titleStyle?: React.CSSProperties;
}

const LegendGroup: React.FC<LegendGroupProps> = ({
    title,
    legendProps,
    className = '',
    style = {},
    titleClassName = '',
    titleStyle = {}
}) => {
    return (
        <div 
            className={`legend-group ${className}`}
            style={style}
        >
            <div 
                className={`legend-title ${titleClassName}`}
                style={titleStyle}
            >
                {title}
            </div>
            <Legend {...legendProps} />
        </div>
    );
};

export default LegendGroup; 