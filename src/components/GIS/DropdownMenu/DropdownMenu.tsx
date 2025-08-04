import React, { useState, useEffect, useRef, useCallback, useLayoutEffect, ReactNode } from 'react';
import './DropdownMenu.css';

export interface DropdownMenuProps {
  children: ReactNode;
  value: string;
  onSelect: (value: string) => void;
  fontSize?: string;
  headerHeight?: number;
  maxHeight?: number;
  minWidth?: number;
  maxWidth?: number;
  initialBorderRadius?: number;
  finalBorderRadius?: number;
  direction?: 'rtl' | 'ltr';
  textColor?: string;
  background?: string;
  gradientColors?: Array<[string, number, string?]>;
  shadow?: string;
  hoverBackground?: [string, number];
  fixedWidth?: boolean;
  fixedHeight?: boolean;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  children,
  value,
  onSelect,
  fontSize = '14px',
  headerHeight = 48,
  maxHeight = 288,
  minWidth = 120,
  maxWidth = 320,
  initialBorderRadius,
  finalBorderRadius = 16,
  direction = 'rtl',
  textColor = '#ffffff',
  background = 'rgba(255, 255, 255, 0.2)',
  gradientColors,
  shadow = '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
  hoverBackground = ['rgba(255,255,255,1)', 0.1],
  fixedWidth = false,
  fixedHeight = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOnTop, setIsOnTop] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(minWidth);
  const [currentHeight, setCurrentHeight] = useState(headerHeight);
  const [shouldUseEllipsis, setShouldUseEllipsis] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownDivRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const isRtl = direction === 'rtl';

  const getHeaderContentWidth = useCallback(() => {
    const tempSpan = document.createElement('span');
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.position = 'absolute';
    tempSpan.style.fontSize = fontSize;
    tempSpan.style.fontWeight = '500';
    tempSpan.style.whiteSpace = 'nowrap';
    tempSpan.textContent = value;
    document.body.appendChild(tempSpan);
    const textWidth = tempSpan.offsetWidth;
    document.body.removeChild(tempSpan);
    return textWidth;
  }, [fontSize, value]);

  const toggleDropdown = () => {
    if (isExpanded) {
      setIsExpanded(false);
    } else {
      if (containerRef.current && !fixedWidth) {
        const initialWidth = containerRef.current.offsetWidth;
        let widestChildWidth = 0;
        if (listRef.current) {
          const children = listRef.current.children;
          for (let i = 0; i < children.length; i++) {
            const child = children[i] as HTMLElement;
            child.style.whiteSpace = 'nowrap';
            const childWidth = child.scrollWidth;
            child.style.whiteSpace = 'normal';
            if (childWidth > widestChildWidth) {
              widestChildWidth = childWidth;
            }
          }
        }
        
        // Calculate required width for header content
        const headerContentWidth = getHeaderContentWidth();
        const requiredWidth = Math.max(initialWidth, widestChildWidth, headerContentWidth) + 60;
        
        if (requiredWidth > maxWidth) {
          setCurrentWidth(maxWidth);
          setShouldUseEllipsis(true);
        } else {
          setCurrentWidth(requiredWidth);
          setShouldUseEllipsis(false);
        }
      } else if (fixedWidth) {
        // For fixed width, check if content exceeds the current width
        const headerContentWidth = getHeaderContentWidth();
        const currentContainerWidth = containerRef.current ? containerRef.current.offsetWidth : maxWidth;
        setShouldUseEllipsis(headerContentWidth + 60 > currentContainerWidth);
      }
      setIsOnTop(true);
      // We no longer calculate height here; a new useEffect will handle it.
      setIsExpanded(true);
    }
  };

  useEffect(() => {
    // This effect now handles observing the list size and updating the height dynamically.
    if (isExpanded && listRef.current && !fixedHeight) {
      const listElement = listRef.current;

      const observer = new ResizeObserver(() => {
        const contentHeight = listElement.scrollHeight;
        const totalHeight = contentHeight + headerHeight + 2; // +2 for border
        setCurrentHeight(Math.min(totalHeight, maxHeight + 2)); // +2 for border
      });

      observer.observe(listElement);

      return () => {
        observer.unobserve(listElement);
      };
    } else if (!isExpanded) {
      // Reset height when closing
      setCurrentHeight(headerHeight + 2); // +2 for border
    }
  }, [isExpanded, fixedHeight, headerHeight, maxHeight]);

  useLayoutEffect(() => {
    if (!fixedWidth && !isExpanded) {
      const headerContentWidth = getHeaderContentWidth();
      const requiredWidth = headerContentWidth + 60 + 8; // 60px for padding/arrow, 8px for spacing
      
      const validMinWidth = typeof minWidth === 'number' ? minWidth : 120;
      const validMaxWidth = typeof maxWidth === 'number' ? maxWidth : 320;

      const newWidth = Math.max(validMinWidth, Math.min(requiredWidth, validMaxWidth));
      setCurrentWidth(newWidth);
    }
  }, [value, fixedWidth, isExpanded, minWidth, maxWidth, getHeaderContentWidth]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const dropdownNode = dropdownDivRef.current;
    if (!dropdownNode) return;

    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.propertyName === 'height' && !isExpanded) {
        setIsOnTop(false);
        setCurrentHeight(headerHeight);
      }
    };

    dropdownNode.addEventListener('transitionend', handleTransitionEnd);
    return () => {
      dropdownNode.removeEventListener('transitionend', handleTransitionEnd);
    };
  }, [isExpanded, headerHeight]);

  // Check for ellipsis on mount and when value changes
  useEffect(() => {
    if (containerRef.current) {
      const headerContentWidth = getHeaderContentWidth();
      const currentContainerWidth = containerRef.current.offsetWidth || maxWidth;
      setShouldUseEllipsis(headerContentWidth + 60 > currentContainerWidth);
    }
  }, [value, maxWidth, fontSize, getHeaderContentWidth]);

  const handleListClick = (e: React.MouseEvent<HTMLUListElement>) => {
    const listItem = (e.target as HTMLElement).closest('li');
    if (listItem) {
      if (onSelect) {
        // Use data-value if available, otherwise fall back to textContent
        const value = listItem.getAttribute('data-value') || listItem.textContent || '';
        onSelect(value);
      }
      setIsExpanded(false);
    }
  };

  const generateGradient = (colors: Array<[string, number, string?]>) => {
    if (!colors || !Array.isArray(colors) || colors.length === 0) {
      return null;
    }
    
    const colorStops = colors.map(stop => {
      const [color, alpha, position] = stop;
      const alphaPercentage = alpha * 100;
      const positionStr = position ? ` ${position}` : '';
      return `color-mix(in srgb, ${color} ${alphaPercentage}%, transparent)${positionStr}`;
    }).join(', ');
    
    return `linear-gradient(to bottom, ${colorStops})`;
  };

  const generateMixedColor = (colorArray: [string, number]) => {
    if (!colorArray || !Array.isArray(colorArray) || colorArray.length !== 2) {
      return null;
    }
    const [color, alpha] = colorArray;
    const alphaPercentage = alpha * 100;
    return `color-mix(in srgb, ${color} ${alphaPercentage}%, transparent)`;
  };
  
  const initialRad = initialBorderRadius !== undefined ? initialBorderRadius : headerHeight / 2;
  const listMaxHeight = maxHeight - headerHeight;
  
  const arrowSize = Math.min(headerHeight * 0.9, headerHeight - 8);
  const headerPadding = Math.max((headerHeight - arrowSize) / 2, 4);

  // These values must match the padding in DropdownMenu.css to ensure alignment
  const listContainerInlinePadding = 6;
  const listItemInlinePadding = 6;
  const totalListIndent = listContainerInlinePadding + listItemInlinePadding;
  
  const titlePadding = totalListIndent - headerPadding;

  const headerTitleStyle: React.CSSProperties = {
    textAlign: isRtl ? 'right' : 'left',
    flex: '1 1 auto',
    paddingLeft: !isRtl ? `${titlePadding}px` : undefined,
    paddingRight: isRtl ? `${titlePadding}px` : undefined,
  };
  
  if (shouldUseEllipsis) {
    headerTitleStyle.whiteSpace = 'nowrap';
    headerTitleStyle.overflow = 'hidden';
    headerTitleStyle.textOverflow = 'ellipsis';
    headerTitleStyle.minWidth = 0;
  }

  const containerStyle: React.CSSProperties = {
    minWidth,
    maxWidth,
    width: fixedWidth ? maxWidth : currentWidth,
    fontSize,
    display: 'inline-block',
    verticalAlign: 'top',
    position: 'relative',
    height: `${headerHeight + 2}px`,
    direction: direction,
  };

  if (!fixedWidth) {
    containerStyle.transition = 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
  }

  const hoverColor = generateMixedColor(hoverBackground as [string, number]);

  const dropdownStyle: React.CSSProperties = {
    borderRadius: isExpanded ? `${finalBorderRadius}px` : `${initialRad}px`,
    height: isExpanded ? `${currentHeight}px` : `${headerHeight + 2}px`,
    position: isOnTop ? 'absolute' : 'relative',
    zIndex: isOnTop ? 999999999 : 'auto',
    width: '100%',
    top: 0,
    background: background,
    boxShadow: shadow,
    '--arrow-color': textColor,
    '--hover-bg-color': hoverColor,
  } as React.CSSProperties & { '--arrow-color': string; '--hover-bg-color': string | null };

  const gradientBackground = generateGradient(gradientColors || []);
  if (gradientBackground) {
    dropdownStyle.background = gradientBackground;
  }

  if(isOnTop) {
    dropdownStyle[isRtl ? 'right' : 'left'] = 0;
  }

  const headerStyle: React.CSSProperties = {
    height: `${headerHeight}px`,
    minHeight: `${headerHeight}px`,
    maxHeight: `${headerHeight}px`,
    paddingRight: `${headerPadding}px`,
    paddingLeft: `${headerPadding}px`,
    color: textColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    boxSizing: 'border-box',
    overflow: 'hidden',
  };

  const arrowStyle: React.CSSProperties = {
    width: `${arrowSize}px`,
    height: `${arrowSize}px`,
    backgroundColor: hoverColor || undefined,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 'auto 0',
  };

  const listStyle: React.CSSProperties = {
    maxHeight: listMaxHeight,
    textAlign: isRtl ? 'right' : 'left',
    color: textColor,
    '--final-border-radius': `${finalBorderRadius}px`,
  } as React.CSSProperties & { '--final-border-radius': string };

  if (fixedWidth) {
    listStyle.wordBreak = 'break-word';
  }

  const dropdownClasses = `custom-dropdown-menu ${isExpanded ? 'expanded' : ''}`;

  return (
    <div className="dropdown-menu-container" style={containerStyle} ref={containerRef}>
      <div className={dropdownClasses} style={dropdownStyle} ref={dropdownDivRef}>
        <div 
          className="dropdown-menu-header" 
          onClick={toggleDropdown} 
          style={headerStyle}
        >
          <span className="dropdown-menu-header-title" style={headerTitleStyle}>{value}</span>
          <div className="dropdown-menu-arrow" style={arrowStyle}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <g transform="translate(0 -32)">
                <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/>
              </g>
            </svg>
          </div>
        </div>
        <ul 
          ref={listRef}
          className="dropdown-menu-list" 
          style={listStyle} 
          onClick={handleListClick}
        >
          {children}
        </ul>
      </div>
    </div>
  );
};

export default DropdownMenu; 