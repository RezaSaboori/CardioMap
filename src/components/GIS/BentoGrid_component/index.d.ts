import React from 'react';

export interface BentoCardProps {
  id: string;
  beforeSize?: { colSpan: number; rowSpan: number };
  afterSize?: { colSpan: number; rowSpan: number };
  borderRadius?: string;
  cardPadding?: string;
  childrenGap?: string;
  backgroundColor?: string;
  borderEffect?: {
    blur?: string;
    gradient?: string;
  };
  blurOverlay?: {
    gradient?: string;
  };
}

export interface BentoGridProps {
  cards?: BentoCardProps[];
  columns?: number;
  children?: React.ReactNode;
  backgroundColor?: string;
  shader?: boolean;
  padding?: number;
}

export interface CardProps {
  header?: string;
  children?: React.ReactNode;
  visibleItemsInitial?: number;
  id?: string;
  beforeSize?: { colSpan: number; rowSpan: number };
  afterSize?: { colSpan: number; rowSpan: number };
  onExpandToggle?: (expanded: boolean) => void;
  onPinToggle?: (pinned: boolean) => void;
  tooltipContent?: string;
  gridRef?: React.RefObject<HTMLElement | HTMLDivElement | null>;
  cardPadding?: string;
  borderRadius?: string;
  borderSize?: string;
  childrenGap?: string;
}

export declare const BentoGrid: React.FC<BentoGridProps>;
export declare const Card: React.FC<CardProps>; 