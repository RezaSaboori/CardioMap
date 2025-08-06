import React from 'react';

export interface MenuItemProps {
  icon: React.ReactNode;
  text: string;
  isExpanded?: boolean;
}

declare const MenuItem: React.FC<MenuItemProps>;
export default MenuItem; 