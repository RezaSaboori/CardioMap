import React from 'react';

export interface MenuItem {
  icon: string | React.ReactNode;
  text: string;
  onClick?: (index: number, event?: React.MouseEvent) => void;
  isNonSelectable?: boolean;
}

export interface MenuProps {
  position?: [string, string]; // [vertical, horizontal]
  sticky?: boolean;
  glassy?: boolean;
  color?: string;
  expandable?: 'expand' | 'compact' | 'hover';
  direction?: 'horizontal' | 'vertical';
  margin?: string | object;
  children?: React.ReactNode[];
  items?: MenuItem[];
  selectedIndex?: number;
  onItemClick?: (index: number) => void;
  iconSize?: string;
  fontSize?: string;
  iconFactory?: (iconName: string) => React.ReactNode | null;
}

declare const Menu: React.FC<MenuProps>;
export default Menu; 