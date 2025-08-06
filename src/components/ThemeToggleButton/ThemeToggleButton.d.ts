import React from 'react';

export interface ThemeToggleButtonProps {
  isExpanded?: boolean;
  transitionDelay?: string;
}

declare const ThemeToggleButton: React.FC<ThemeToggleButtonProps>;
export default ThemeToggleButton; 