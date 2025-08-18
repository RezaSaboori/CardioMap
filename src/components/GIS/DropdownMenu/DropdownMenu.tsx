import React, { useState, useEffect, useRef, useCallback, useLayoutEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './DropdownMenu.css';

export interface SubmenuItem {
  label: string;
  value?: string;
  children?: SubmenuItem[];
  accordion?: boolean; // Whether this item should behave as an accordion (click to expand/collapse)
}

export interface DropdownMenuProps {
  children?: ReactNode;
  items?: SubmenuItem[];
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
  activeBackground?: [string, number];
  fixedWidth?: boolean;
  fixedHeight?: boolean;
  /**
   * Limits how many ancestor segments to show in the header path, counted from the leaf upward.
   * - 0: show only the leaf label
   * - 1: show parent : leaf
   * - 2: show grandparent : parent : leaf
   * - undefined: show full path
   */
  headerPathDepth?: number;
}

interface SubmenuPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  children,
  items,
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
  activeBackground = ['rgba(255,255,255,1)', 0.2],
  fixedWidth = false,
  fixedHeight = false,
  headerPathDepth,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOnTop, setIsOnTop] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(minWidth);
  const [currentHeight, setCurrentHeight] = useState(headerHeight + 2);
  const [shouldUseEllipsis, setShouldUseEllipsis] = useState(false);
  const [activeSubmenus, setActiveSubmenus] = useState<Set<string>>(new Set());
  const [submenuPositions, setSubmenuPositions] = useState<Map<string, SubmenuPosition>>(new Map());
  const [submenuHoverState, setSubmenuHoverState] = useState<Map<string, boolean>>(new Map());
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [activeItemIds, setActiveItemIds] = useState<Set<string>>(new Set());
  const [expandedAccordions, setExpandedAccordions] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownDivRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const submenuRefs = useRef<Map<string, HTMLUListElement>>(new Map());
  const submenuTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const submenuTriggerRects = useRef<Map<string, DOMRect>>(new Map());
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const isRtl = direction === 'rtl';

  // Helper function to get the display label for the current value
  const getDisplayLabel = useCallback((): string => {
    if (!items) return value;
    
    const findItemPathByValue = (items: SubmenuItem[], path: string[] = []): string[] | null => {
      for (const item of items) {
        const currentPath = [...path, item.label];
        
        if (item.value === value) {
          return currentPath;
        }
        
        if (item.children) {
          const found = findItemPathByValue(item.children, currentPath);
          if (found) return found;
        }
      }
      return null;
    };
    
    const foundPath = findItemPathByValue(items);
    if (foundPath) {
      // Apply header path depth limiting from leaf upward when provided
      if (typeof headerPathDepth === 'number' && headerPathDepth >= 0) {
        const segmentsToShow = Math.min(foundPath.length, headerPathDepth + 1);
        const limitedPath = foundPath.slice(-segmentsToShow);
        return limitedPath.join(' : ');
      }
      // Default behavior: show full path for nested, or just label for top-level
      return foundPath.join(' : ');
    }
    
    return value;
  }, [items, value, headerPathDepth]);

  // Helper function to generate item ID consistently
  const generateItemId = useCallback((item: SubmenuItem, index: number, parentId: string = ''): string => {
    const itemKey = item.value || item.label;
    return `${parentId}-${itemKey}-${index}`;
  }, []);

  // Helper function to find initial active items (only for items prop changes)
  const findActiveItems = useCallback((items: SubmenuItem[], parentId: string = ''): Set<string> => {
    const activeIds = new Set<string>();
    
    items.forEach((item, index) => {
      const itemId = generateItemId(item, index, parentId);
      
      // Only add items that are selected by default (when items prop changes)
      if (item.value === value) {
        activeIds.add(itemId);
      }
      
      // Recursively check children
      if (item.children && item.children.length > 0) {
        const childActiveIds = findActiveItems(item.children, itemId);
        childActiveIds.forEach(id => activeIds.add(id));
      }
    });
    
    return activeIds;
  }, [value, generateItemId]);

  // Update active items only when items prop changes (not on every value/activeSubmenu change)
  useEffect(() => {
    if (items) {
      const newActiveItems = findActiveItems(items);
      setActiveItemIds(newActiveItems);
    }
  }, [items, findActiveItems]);

  // Update active items when value prop changes
  useEffect(() => {
    if (items) {
      const newActiveItems = findActiveItems(items);
      setActiveItemIds(newActiveItems);
    }
  }, [value, items, findActiveItems]);

  const getHeaderContentWidth = useCallback(() => {
    const tempSpan = document.createElement('span');
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.position = 'absolute';
    tempSpan.style.fontSize = fontSize;
    tempSpan.style.fontWeight = '500';
    tempSpan.style.whiteSpace = 'nowrap';
    tempSpan.textContent = getDisplayLabel();
    document.body.appendChild(tempSpan);
    const textWidth = tempSpan.offsetWidth;
    document.body.removeChild(tempSpan);
    return textWidth;
  }, [fontSize, getDisplayLabel]);

  // Helper function to measure all possible item widths including accordion content
  const measureAllItemWidths = useCallback(() => {
    if (!items) return 0;

    const tempSpan = document.createElement('span');
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.position = 'absolute';
    tempSpan.style.fontSize = fontSize;
    tempSpan.style.fontWeight = '500';
    tempSpan.style.whiteSpace = 'nowrap';
    tempSpan.style.padding = '6px 12px'; // Same padding as dropdown items
    document.body.appendChild(tempSpan);

    let maxWidth = 0;

    const measureItems = (itemList: SubmenuItem[]) => {
      itemList.forEach(item => {
        tempSpan.textContent = item.label;
        const width = tempSpan.scrollWidth;
        if (width > maxWidth) {
          maxWidth = width;
        }
        
        // Recursively measure children (accordion content)
        if (item.children) {
          measureItems(item.children);
        }
      });
    };

    measureItems(items);
    document.body.removeChild(tempSpan);
    return maxWidth;
  }, [items, fontSize]);

  const calculateSubmenuPosition = useCallback((triggerElement: HTMLElement, submenuId: string): SubmenuPosition => {
    const rect = triggerElement.getBoundingClientRect();
    const gap = 16; // Gap between trigger and submenu
    
            // Calculate dynamic submenu width using the same logic as main dropdown
        let submenuWidth = 160; // Default minimum width
        let submenuHeight = maxHeight; // Default height, will be adjusted based on content
    
    // Try to find the submenu content to calculate width and height
    const submenuItems = findSubmenuItems(submenuId);
    if (submenuItems && submenuItems.length > 0) {
      // Use the same width calculation logic as main dropdown
      let widestChildWidth = 0;
      
      // Create a temporary container to measure actual text widths
      const tempContainer = document.createElement('div');
      tempContainer.style.visibility = 'hidden';
      tempContainer.style.position = 'absolute';
      tempContainer.style.fontSize = fontSize;
      tempContainer.style.fontFamily = 'inherit';
      tempContainer.style.fontWeight = '500'; // Same as main dropdown
      tempContainer.style.whiteSpace = 'nowrap';
      tempContainer.style.padding = '6px 12px'; // Same padding as submenu items
      document.body.appendChild(tempContainer);
      
      // Measure each submenu item's actual width
      submenuItems.forEach(item => {
        tempContainer.textContent = item.label;
        const itemWidth = tempContainer.scrollWidth;
        if (itemWidth > widestChildWidth) {
          widestChildWidth = itemWidth;
        }
      });
      
      // Clean up temporary container
      document.body.removeChild(tempContainer);
      
      // Apply the same padding logic as main dropdown (60px)
      const requiredWidth = widestChildWidth + 60;
      
      // Apply the same constraints as main dropdown using component props
      const validMinWidth = Math.max(160, minWidth); // Use component minWidth or fallback to 160
      const validMaxWidth = Math.min(400, maxWidth); // Use component maxWidth or fallback to 400
      
      submenuWidth = Math.max(validMinWidth, Math.min(requiredWidth, validMaxWidth));
      
                // Calculate height based on actual content (same logic as main dropdown)
        // Create a temporary container to measure actual content height
        const tempHeightContainer = document.createElement('ul');
        tempHeightContainer.style.visibility = 'hidden';
        tempHeightContainer.style.position = 'absolute';
        tempHeightContainer.style.top = '-9999px';
        tempHeightContainer.style.left = '-9999px';
        tempHeightContainer.style.width = `${submenuWidth}px`;
        tempHeightContainer.style.fontSize = fontSize;
        tempHeightContainer.style.fontFamily = 'inherit';
        tempHeightContainer.style.padding = '6px 6px';
        tempHeightContainer.style.margin = '0';
        tempHeightContainer.style.listStyle = 'none';
        tempHeightContainer.style.borderRadius = '16px';
        tempHeightContainer.style.boxSizing = 'border-box';
        
        // Add all submenu items to measure their actual height
        submenuItems.forEach(item => {
          const li = document.createElement('li');
          li.style.padding = '6px 12px';
          li.style.margin = '0';
          li.style.borderRadius = '16px';
          li.style.boxSizing = 'border-box';
          li.style.whiteSpace = 'nowrap';
          li.style.overflow = 'hidden';
          li.style.textOverflow = 'ellipsis';
          li.textContent = item.label;
          tempHeightContainer.appendChild(li);
        });
        
        document.body.appendChild(tempHeightContainer);
        
        // Get the actual scroll height (same as main dropdown logic)
        const actualContentHeight = tempHeightContainer.scrollHeight;
        
        // Clean up temporary container
        document.body.removeChild(tempHeightContainer);
        
        // Use the same height calculation logic as main dropdown
        const totalHeight = actualContentHeight + 2; // Add 2px like main dropdown
        submenuHeight = Math.min(totalHeight, maxHeight);
    }
    
    let x: number;
    let y: number;
    
    if (isRtl) {
      // For RTL, position submenu to the left of the trigger
      x = rect.left - gap - submenuWidth;
      // Ensure submenu doesn't go off the left edge of the screen
      if (x < 0) {
        x = rect.right + gap;
      }
    } else {
      // For LTR, position submenu to the right of the trigger
      x = rect.right + gap;
      // Ensure submenu doesn't go off the right edge of the screen
      if (x + submenuWidth > window.innerWidth) {
        x = rect.left - gap - submenuWidth;
        // If still off-screen, position it to the left edge
        if (x < 0) {
          x = 0;
        }
      }
    }
    
    // Ensure submenu doesn't go off the left edge
    if (x < 0) {
      x = 0;
    }
    
    y = rect.top;
    // Ensure submenu doesn't go off the bottom edge of the screen
    if (y + submenuHeight > window.innerHeight) {
      y = Math.max(0, window.innerHeight - submenuHeight);
    }
    // Ensure submenu doesn't go off the top edge of the screen
    if (y < 0) {
      y = 0;
    }
    
    return { x, y, width: submenuWidth, height: submenuHeight };
  }, [isRtl, fontSize, minWidth, maxWidth, maxHeight]);

  // Helper function to find submenu items for width calculation
  const findSubmenuItems = useCallback((submenuId: string): SubmenuItem[] | null => {
    if (!items) return null;
    
    // Parse the submenu ID to find the path
    const pathParts = submenuId.split('-').filter(part => part.length > 0);
    if (pathParts.length === 0) return null;
    
    let currentItems = items;
    let currentIndex = 0;
    
    // Navigate through the nested structure
    for (let i = 0; i < pathParts.length - 1; i += 2) {
      const itemIndex = parseInt(pathParts[i + 1]);
      if (isNaN(itemIndex) || itemIndex < 0 || itemIndex >= currentItems.length) {
        return null;
      }
      
      const currentItem = currentItems[itemIndex];
      if (!currentItem.children) {
        return null;
      }
      
      currentItems = currentItem.children;
      currentIndex = itemIndex;
    }
    
    return currentItems;
  }, [items, maxHeight]);

  const handleSubmenuEnter = useCallback((submenuId: string, triggerElement: HTMLElement) => {
    // Clear any existing timer for this submenu
    if (submenuTimers.current.has(submenuId)) {
      clearTimeout(submenuTimers.current.get(submenuId)!);
      submenuTimers.current.delete(submenuId);
    }
    
    // Clear unrelated submenus (not parent or child of current submenu)
    setActiveSubmenus(prev => {
      const newSet = new Set<string>();
      // Keep submenus that are in the hierarchy of the current submenu
      Array.from(prev).forEach(activeId => {
        if (activeId === submenuId || 
            submenuId.startsWith(activeId + '-') || 
            activeId.startsWith(submenuId + '-')) {
          newSet.add(activeId);
        }
      });
      // Add the new submenu
      newSet.add(submenuId);
      return newSet;
    });
    
    const position = calculateSubmenuPosition(triggerElement, submenuId);
    // Track trigger rect to build a hover bridge into the portal
    try {
      submenuTriggerRects.current.set(submenuId, triggerElement.getBoundingClientRect());
    } catch {}
    setSubmenuPositions(prev => new Map(prev).set(submenuId, position));
    setSubmenuHoverState(prev => new Map(prev).set(submenuId, true));
    
    // Add to active items (keep only related ones)
    setActiveItemIds(prev => {
      const newSet = new Set<string>();
      // Keep items that are in the hierarchy of the current submenu
      Array.from(prev).forEach(activeId => {
        if (activeId === submenuId || 
            submenuId.startsWith(activeId + '-') || 
            activeId.startsWith(submenuId + '-')) {
          newSet.add(activeId);
        }
      });
      newSet.add(submenuId);
      return newSet;
    });
  }, [calculateSubmenuPosition]);

  // Helper: determine if pointer is within submenu portal or the corridor between trigger and portal
  const isPointerInPortalOrBridge = useCallback((submenuId: string): boolean => {
    const portal = submenuRefs.current.get(submenuId);
    const portalPos = submenuPositions.get(submenuId);
    const triggerRect = submenuTriggerRects.current.get(submenuId);
    const { x, y } = lastMousePosRef.current;

    // If pointer is inside portal element, keep open
    if (portal) {
      const elAtPoint = document.elementFromPoint(x, y);
      if (elAtPoint && portal.contains(elAtPoint)) return true;
    }
    // If we have geometry, check corridor between trigger and portal
    if (portalPos && triggerRect) {
      const portalRect = new DOMRect(
        portalPos.x,
        portalPos.y,
        portalPos.width,
        portalPos.height
      );
      const padding = 10;
      // Horizontal corridor between trigger and portal
      let x1: number;
      let x2: number;
      if (portalRect.x >= triggerRect.right) {
        // LTR: portal to the right
        x1 = triggerRect.right - padding;
        x2 = portalRect.x + padding;
      } else if (portalRect.right <= triggerRect.left) {
        // RTL: portal to the left
        x1 = portalRect.right - padding;
        x2 = triggerRect.left + padding;
      } else {
        // Overlapping horizontally; expand minimal corridor around overlap
        x1 = Math.min(triggerRect.left, portalRect.x) - padding;
        x2 = Math.max(triggerRect.right, portalRect.right) + padding;
      }
      // Vertical extent: use overlap if exists, otherwise union with padding
      const overlapTop = Math.max(triggerRect.top, portalRect.top);
      const overlapBottom = Math.min(triggerRect.bottom, portalRect.bottom);
      let y1: number;
      let y2: number;
      if (overlapBottom > overlapTop) {
        y1 = overlapTop - padding;
        y2 = overlapBottom + padding;
      } else {
        y1 = Math.min(triggerRect.top, portalRect.top) - padding;
        y2 = Math.max(triggerRect.bottom, portalRect.bottom) + padding;
      }
      if (x >= Math.min(x1, x2) && x <= Math.max(x1, x2) && y >= Math.min(y1, y2) && y <= Math.max(y1, y2)) {
        return true;
      }
    }
    return false;
  }, [submenuPositions]);

  const handleSubmenuLeave = useCallback((submenuId: string) => {
    setSubmenuHoverState(prev => new Map(prev).set(submenuId, false));
    
    // Allow time to move pointer into the submenu portal or across the hover bridge
    const timer = setTimeout(() => {
      if (isPointerInPortalOrBridge(submenuId)) {
        return; // keep open, user is moving toward/within submenu
      }
      // Check if submenu is still not hovered and no child submenus are active
      if (!submenuHoverState.get(submenuId)) {
        // Check if we're currently hovering any related submenu
        const isHoveringRelated = Array.from(submenuHoverState.entries()).some(([id, isHovered]) => {
          return isHovered && (id.startsWith(submenuId + '-') || submenuId.startsWith(id + '-'));
        });
        
        if (!isHoveringRelated) {
          // Close this submenu and all its children
          setActiveSubmenus(prev => {
            const newSet = new Set(prev);
            // Remove this submenu
            newSet.delete(submenuId);
            // Remove all child submenus (those that start with submenuId-)
            Array.from(newSet).forEach(activeId => {
              if (activeId.startsWith(submenuId + '-')) {
                newSet.delete(activeId);
              }
            });
            return newSet;
          });
          
          // Remove from active items
          setActiveItemIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(submenuId);
            // Remove child items too
            Array.from(newSet).forEach(activeId => {
              if (activeId.startsWith(submenuId + '-')) {
                newSet.delete(activeId);
              }
            });
            return newSet;
          });
        }
      }
    }, 300);
    
    submenuTimers.current.set(submenuId, timer);
  }, [submenuHoverState, activeSubmenus, isPointerInPortalOrBridge]);

  const handleSubmenuMouseEnter = useCallback((submenuId: string) => {
    // Clear any existing timer for this submenu
    if (submenuTimers.current.has(submenuId)) {
      clearTimeout(submenuTimers.current.get(submenuId)!);
      submenuTimers.current.delete(submenuId);
    }
    
    setSubmenuHoverState(prev => new Map(prev).set(submenuId, true));
    
    // Keep only related submenus open
    setActiveSubmenus(prev => {
      const newSet = new Set<string>();
      // Keep submenus that are in the hierarchy of the current submenu
      Array.from(prev).forEach(activeId => {
        if (activeId === submenuId || 
            submenuId.startsWith(activeId + '-') || 
            activeId.startsWith(submenuId + '-')) {
          newSet.add(activeId);
        }
      });
      newSet.add(submenuId);
      return newSet;
    });
    
    // Ensure submenu stays in active items (keep only related ones)
    setActiveItemIds(prev => {
      const newSet = new Set<string>();
      // Keep items that are in the hierarchy of the current submenu
      Array.from(prev).forEach(activeId => {
        if (activeId === submenuId || 
            submenuId.startsWith(activeId + '-') || 
            activeId.startsWith(submenuId + '-')) {
          newSet.add(activeId);
        }
      });
      newSet.add(submenuId);
      return newSet;
    });
  }, []);

  const handleSubmenuMouseLeave = useCallback((submenuId: string) => {
    setSubmenuHoverState(prev => new Map(prev).set(submenuId, false));
    
    // Allow time to move pointer back to parent or into a child submenu
    const timer = setTimeout(() => {
      if (isPointerInPortalOrBridge(submenuId)) {
        return; // keep open
      }
      // Check if submenu is still not hovered and no child submenus are active
      if (!submenuHoverState.get(submenuId)) {
        // Check if we're currently hovering any related submenu
        const isHoveringRelated = Array.from(submenuHoverState.entries()).some(([id, isHovered]) => {
          return isHovered && (id.startsWith(submenuId + '-') || submenuId.startsWith(id + '-'));
        });
        
        if (!isHoveringRelated) {
          // Close this submenu and all its children
          setActiveSubmenus(prev => {
            const newSet = new Set(prev);
            // Remove this submenu
            newSet.delete(submenuId);
            // Remove all child submenus (those that start with submenuId-)
            Array.from(newSet).forEach(activeId => {
              if (activeId.startsWith(submenuId + '-')) {
                newSet.delete(activeId);
              }
            });
            return newSet;
          });
          
          // Remove from active items
          setActiveItemIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(submenuId);
            // Remove child items too
            Array.from(newSet).forEach(activeId => {
              if (activeId.startsWith(submenuId + '-')) {
                newSet.delete(activeId);
              }
            });
            return newSet;
          });
        }
      }
    }, 250);
    
    submenuTimers.current.set(submenuId, timer);
  }, [submenuHoverState, activeSubmenus, isPointerInPortalOrBridge]);

  // Close all open submenus immediately (used when hovering/clicking other parts)
  const closeAllSubmenus = useCallback(() => {
    setActiveSubmenus(new Set());
    setSubmenuHoverState(new Map());
    setActiveItemIds(new Set());
  }, []);

  const toggleDropdown = () => {
    if (isExpanded) {
      setIsExpanded(false);
      setActiveSubmenus(new Set()); // Close all submenus when closing dropdown
      setActiveItemIds(new Set()); // Clear all active items
      setSubmenuHoverState(new Map()); // Clear all hover states
      setExpandedAccordions(new Set()); // Clear all accordion states
    } else {
      if (containerRef.current && !fixedWidth) {
        const initialWidth = containerRef.current.offsetWidth;
        // Measure all possible item widths including accordion content
        const widestChildWidth = measureAllItemWidths();
        
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
        const headerContentWidth = getHeaderContentWidth();
        const currentContainerWidth = containerRef.current ? containerRef.current.offsetWidth : maxWidth;
        setShouldUseEllipsis(headerContentWidth + 60 > currentContainerWidth);
      }
      setIsExpanded(true);
    }
  };

  useEffect(() => {
    if (isExpanded && listRef.current && !fixedHeight) {
      const listElement = listRef.current;

      const observer = new ResizeObserver(() => {
        const contentHeight = listElement.scrollHeight;
        const totalHeight = contentHeight + headerHeight + 2;
        const newHeight = Math.min(totalHeight, maxHeight + 2);
        setCurrentHeight(newHeight);
      });

      observer.observe(listElement);

      return () => {
        observer.unobserve(listElement);
      };
    } else if (!isExpanded) {
      setCurrentHeight(headerHeight + 2);
    }
  }, [isExpanded, fixedHeight, headerHeight, maxHeight]);

  useLayoutEffect(() => {
    if (!fixedWidth && !isExpanded) {
      const headerContentWidth = getHeaderContentWidth();
      const requiredWidth = headerContentWidth + 60 + 8;
      
      const validMinWidth = typeof minWidth === 'number' ? minWidth : 120;
      const validMaxWidth = typeof maxWidth === 'number' ? maxWidth : 320;

      const newWidth = Math.max(validMinWidth, Math.min(requiredWidth, validMaxWidth));
      setCurrentWidth(newWidth);
    }
  }, [value, fixedWidth, isExpanded, minWidth, maxWidth, getHeaderContentWidth]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Check if click is inside any active submenu
        let isInsideSubmenu = false;
        submenuRefs.current.forEach((submenuRef) => {
          if (submenuRef && submenuRef.contains(event.target as Node)) {
            isInsideSubmenu = true;
          }
        });
        
        if (!isInsideSubmenu) {
          setIsExpanded(false);
          setActiveSubmenus(new Set());
          // Clear all active items and hover states when dropdown closes
          setActiveItemIds(new Set());
          setSubmenuHoverState(new Map());
          setExpandedAccordions(new Set());
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    const handleMouseMove = (e: MouseEvent) => {
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Cleanup effect for submenus
  useEffect(() => {
    return () => {
      // Clean up any active submenus when component unmounts
      setActiveSubmenus(new Set());
      setSubmenuPositions(new Map());
      setSubmenuHoverState(new Map());
      setExpandedAccordions(new Set());
      // Clear all timers
      submenuTimers.current.forEach(clearTimeout);
      submenuTimers.current.clear();
      // Clear active items
      setActiveItemIds(new Set());
    };
  }, []);

  // Track selected item when value prop changes
  useEffect(() => {
    if (items) {
      // Find the item that matches the current value
      const findSelectedItem = (items: SubmenuItem[], parentId: string = ''): string | null => {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          // Use consistent ID generation
          const itemId = generateItemId(item, i, parentId);
          
          if (item.value === value) {
            return itemId;
          }
          
          if (item.children) {
            const found = findSelectedItem(item.children, itemId);
            if (found) return found;
          }
        }
        return null;
      };
      
      const foundId = findSelectedItem(items);
      setSelectedItemId(foundId);
    }
  }, [value, items, generateItemId]);

  // Close submenus when dropdown closes
  useEffect(() => {
    if (!isExpanded) {
      setActiveSubmenus(new Set());
      setSubmenuHoverState(new Map());
      setActiveItemIds(new Set());
      // Clear all timers when dropdown closes
      submenuTimers.current.forEach(clearTimeout);
      submenuTimers.current.clear();
    }
  }, [isExpanded]);

  // Handle window resize to recalculate submenu positions
  useEffect(() => {
    if (!isExpanded || activeSubmenus.size === 0) return;

    const handleResize = () => {
      // Close submenus on resize to avoid positioning issues
      setActiveSubmenus(new Set());
      setSubmenuPositions(new Map());
      setActiveItemIds(new Set());
      setSubmenuHoverState(new Map());
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isExpanded, activeSubmenus]);

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

  useEffect(() => {
    if (containerRef.current) {
      const headerContentWidth = getHeaderContentWidth();
      const currentContainerWidth = containerRef.current.offsetWidth || maxWidth;
      setShouldUseEllipsis(headerContentWidth + 60 > currentContainerWidth);
    }
  }, [value, maxWidth, fontSize, getHeaderContentWidth]);

  const handleListClick = (e: React.MouseEvent<HTMLUListElement>) => {
    const listItem = (e.target as HTMLElement).closest('li');
    if (!listItem) return;
    
    // Check if it's an accordion item
    if (listItem.classList.contains('accordion-item')) {
      // For accordion items, the click should be handled by the accordion header
      return;
    }
    
    // Check if it's a submenu item with children
    if (listItem.classList.contains('has-submenu')) {
      // Any click on a different parent should close other submenus
      closeAllSubmenus();
      // Find the submenu ID for this trigger item
      const itemIndex = Array.from(listItem.parentNode?.children || []).indexOf(listItem);
      const itemKey = listItem.textContent?.trim() || '';
      const submenuId = `-${itemKey}-${itemIndex}`;
      
      // Toggle the submenu
      handleSubmenuTriggerClick(submenuId);
      return;
    }
    
    const valueAttr = listItem.getAttribute('data-value');
    const isLeaf = !!valueAttr;
    if (!isLeaf) {
      return;
    }
    
    if (onSelect) {
      const value = valueAttr || listItem.textContent || '';
      onSelect(value);
      
      // Find the correct item ID using the same logic as the useEffect
      if (items) {
        const findClickedItemId = (items: SubmenuItem[], parentId: string = ''): string | null => {
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const itemId = generateItemId(item, i, parentId);
            
            if (item.value === value) {
              return itemId;
            }
            
            if (item.children) {
              const found = findClickedItemId(item.children, itemId);
              if (found) return found;
            }
          }
          return null;
        };
        
        const clickedItemId = findClickedItemId(items);
        
        if (clickedItemId) {
          setSelectedItemId(clickedItemId);
          
          // Immediately update active items to show the new selection
          const newActiveItems = new Set<string>();
          newActiveItems.add(clickedItemId);
          setActiveItemIds(newActiveItems);
        }
      }
    }
      // Close any open submenus when a leaf is selected
      closeAllSubmenus();      
      setIsExpanded(false);
      setActiveSubmenus(new Set());
  };

  // Handle clicks on submenu items
  const handleSubmenuClick = useCallback((e: React.MouseEvent<HTMLUListElement>) => {
    const listItem = (e.target as HTMLElement).closest('li');
    if (!listItem) return;
    
    // Check if it's a submenu item with children
    if (listItem.classList.contains('has-submenu')) {
      return; // Don't close for submenu triggers
    }
    
    const valueAttr = listItem.getAttribute('data-value');
    
    if (valueAttr && onSelect) {
      onSelect(valueAttr);
      
      // Find the correct item ID using the same logic as the useEffect
      if (items) {
        const findClickedSubmenuItemId = (items: SubmenuItem[], parentId: string = ''): string | null => {
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const itemId = generateItemId(item, i, parentId);
            
            if (item.value === valueAttr) {
              return itemId;
            }
            
            if (item.children) {
              const found = findClickedSubmenuItemId(item.children, itemId);
              if (found) return found;
            }
          }
          return null;
        };
        
        const clickedItemId = findClickedSubmenuItemId(items);
        
        if (clickedItemId) {
          setSelectedItemId(clickedItemId);
          
          // Immediately update active items to show the new selection
          const newActiveItems = new Set<string>();
          newActiveItems.add(clickedItemId);
          setActiveItemIds(newActiveItems);
        }
      }
      
      // After selecting a leaf in submenu, close all open nested menus
      closeAllSubmenus();
      setIsExpanded(false);
      setActiveSubmenus(new Set());
    }
  }, [onSelect, items, generateItemId, closeAllSubmenus]);

  // Handle clicks on submenu trigger items (toggle behavior)
  const handleSubmenuTriggerClick = useCallback((submenuId: string) => {
    if (activeSubmenus.has(submenuId)) {
      // If submenu is already open, close it and all children
      setActiveSubmenus(prev => {
        const newSet = new Set(prev);
        // Remove this submenu
        newSet.delete(submenuId);
        // Remove all child submenus (those that start with submenuId-)
        Array.from(newSet).forEach(activeId => {
          if (activeId.startsWith(submenuId + '-')) {
            newSet.delete(activeId);
          }
        });
        return newSet;
      });
      
      setSubmenuHoverState(prev => new Map(prev).set(submenuId, false));
      // Clear any existing timer for this submenu
      if (submenuTimers.current.has(submenuId)) {
        clearTimeout(submenuTimers.current.get(submenuId)!);
        submenuTimers.current.delete(submenuId);
      }
      
      // Remove from active items
      setActiveItemIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(submenuId);
        // Remove child items too
        Array.from(newSet).forEach(activeId => {
          if (activeId.startsWith(submenuId + '-')) {
            newSet.delete(activeId);
          }
        });
        return newSet;
      });
    } else {
      // If submenu is closed, open ONLY this submenu and close others
      setActiveSubmenus(new Set([submenuId]));
      setSubmenuHoverState(new Map([[submenuId, true]]));
      setActiveItemIds(new Set([submenuId]));
    }
  }, [activeSubmenus]);

  // Handle clicks on accordion items (toggle behavior)
  const handleAccordionToggle = useCallback((accordionId: string) => {
    // Interacting with accordion should close any open nested submenus
    closeAllSubmenus();
    setExpandedAccordions(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(accordionId)) {
        newExpanded.delete(accordionId);
      } else {
        newExpanded.add(accordionId);
      }
      return newExpanded;
    });
  }, [closeAllSubmenus]);

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

  const renderSubmenuItems = (items: SubmenuItem[], parentId: string = ''): ReactNode => {
    return items.map((item, idx) => {
      const key = `${item.label}-${idx}`;
      const submenuId = generateItemId(item, idx, parentId);
      
      if (item.children && item.children.length > 0) {
        const isActive = activeItemIds.has(submenuId);
        const isSelected = selectedItemId === submenuId;
        
        // Check if this item is an accordion
        if (item.accordion) {
          const isAccordionExpanded = expandedAccordions.has(submenuId);
          const className = `accordion-item ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''} ${isAccordionExpanded ? 'accordion-expanded' : ''}`;
          
          return (
            <li key={key} className={className}>
              <div 
                className="accordion-header"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAccordionToggle(submenuId);
                }}
              >
                <span className="item-label">{item.label}</span>
                <div className="accordion-arrow" aria-hidden>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <g transform="translate(0 -32)">
                      <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5 12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/>
                    </g>
                  </svg>
                </div>
              </div>
              {isAccordionExpanded && (
                <ul className="accordion-content">
                  {renderSubmenuItems(item.children, submenuId)}
                </ul>
              )}
            </li>
          );
        } else {
          // Regular submenu behavior (hover-based)
          const isSubmenuOpen = activeSubmenus.has(submenuId);
          const className = `has-submenu ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''} ${isSubmenuOpen ? 'submenu-open' : ''}`;
          
          return (
            <li 
              key={key} 
              className={className}
              tabIndex={-1}
              onMouseEnter={(e) => handleSubmenuEnter(submenuId, e.currentTarget)}
              onMouseLeave={() => handleSubmenuLeave(submenuId)}
              onClick={() => handleSubmenuTriggerClick(submenuId)}
            >
              <span className="item-label">{item.label}</span>
              <div className="submenu-arrow" aria-hidden>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <g transform="translate(0 -32)">
                    <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5 12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/>
                  </g>
                </svg>
              </div>
              {/* Render submenu in portal */}
              {activeSubmenus.has(submenuId) && createPortal(
                <ul 
                  ref={(el) => {
                    if (el) submenuRefs.current.set(submenuId, el);
                  }}
                  className="dropdown-submenu-portal"
                  dir={direction}
                  style={{
                    position: 'fixed',
                    left: `${submenuPositions.get(submenuId)?.x || 0}px`,
                    top: `${submenuPositions.get(submenuId)?.y || 0}px`,
                    width: `${submenuPositions.get(submenuId)?.width || 160}px`,
                    height: `${submenuPositions.get(submenuId)?.height || maxHeight}px`,
                    background: gradientColors ? generateGradient(gradientColors) || background : background,
                    boxShadow: shadow,
                    color: textColor,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: `${finalBorderRadius}px`,
                    backdropFilter: 'blur(15px) brightness(1.2) saturate(1.5)',
                    WebkitBackdropFilter: 'blur(15px) brightness(1.2) saturate(1.5)',
                    fontSize: fontSize,
                    fontFamily: 'inherit',
                    zIndex: 10000,
                    listStyle: 'none',
                    margin: 0,
                    padding: '6px 6px',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    '--arrow-color': textColor,
                    '--hover-bg-color': effectiveHoverColor,
                    '--active-bg-color': effectiveActiveColor,
                  } as React.CSSProperties & { 
                    '--arrow-color': string; 
                    '--hover-bg-color': string;
                    '--active-bg-color': string;
                  }}
                  onMouseEnter={() => handleSubmenuMouseEnter(submenuId)}
                  onMouseLeave={() => handleSubmenuMouseLeave(submenuId)}
                  onClick={handleSubmenuClick}
                >
                  {renderSubmenuItems(item.children, submenuId)}
                </ul>,
                document.body
              )}
            </li>
          );
        }
      }
      
      const isSelected = selectedItemId === submenuId;
      const isActive = activeItemIds.has(submenuId);
      const className = `${isSelected ? 'selected' : ''} ${isActive ? 'active' : ''}`;
      
      return (
        <li key={key} data-value={item.value || item.label} className={className}>
          <span className="item-label">{item.label}</span>
        </li>
      );
    });
  };
  
  const initialRad = initialBorderRadius !== undefined ? initialBorderRadius : headerHeight / 2;
  const listMaxHeight = maxHeight - headerHeight;
  
  const arrowSize = Math.min(headerHeight * 0.9, headerHeight - 8);
  const headerPadding = Math.max((headerHeight - arrowSize) / 2, 4);

  const listContainerInlinePadding = 6;
  const listItemInlinePadding = 6;
  const totalListIndent = listContainerInlinePadding + listItemInlinePadding;
  
  const titlePadding = totalListIndent - headerPadding;

  const headerTitleStyle: React.CSSProperties = {
    textAlign: isRtl ? 'right' : 'left',
    direction: isRtl ? 'rtl' : 'ltr',
    flex: '1 1 auto',
    paddingLeft: !isRtl ? `${titlePadding}px` : undefined,
    paddingRight: isRtl ? `${titlePadding}px` : undefined,
    order: isRtl ? 2 : 1,
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
  const activeColor = generateMixedColor(activeBackground as [string, number]);
  const gradientBackground = generateGradient(gradientColors || []);
  
  // Ensure hover color has a fallback value
  const effectiveHoverColor = hoverColor || 'rgba(255, 255, 255, 0.1)';
  const effectiveActiveColor = activeColor || 'rgba(255, 255, 255, 0.2)';

  // Main dropdown styles
  const dropdownStyle: React.CSSProperties = {
    height: isExpanded ? `${currentHeight}px` : `${headerHeight + 2}px`,
    position: isOnTop ? 'absolute' : 'relative',
    zIndex: isOnTop ? 1000 : 'auto',
    width: '100%',
    top: 0,
    background: gradientBackground || background,
    boxShadow: shadow,
    color: textColor,
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: isExpanded ? `${finalBorderRadius}px` : `${initialRad}px`,
    backdropFilter: 'blur(15px) brightness(1.2) saturate(1.5)',
    WebkitBackdropFilter: 'blur(15px) brightness(1.2) saturate(1.5)',
    fontSize: fontSize,
    fontFamily: 'inherit',
    '--arrow-color': textColor,
    '--hover-bg-color': effectiveHoverColor,
  } as React.CSSProperties & { 
    '--arrow-color': string; 
    '--hover-bg-color': string;
  };
  
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
    flexDirection: 'row',
    direction: 'ltr',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    boxSizing: 'border-box',
    overflow: 'hidden',
  };

  const arrowStyle: React.CSSProperties = {
    width: `${arrowSize}px`,
    height: `${arrowSize}px`,
    backgroundColor: effectiveHoverColor,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 'auto 0',
    order: isRtl ? 1 : 2,
  };

  const listStyle: React.CSSProperties = {
    maxHeight: listMaxHeight,
    textAlign: isRtl ? 'right' : 'left',
    direction: direction,
    color: textColor,
    '--final-border-radius': `${finalBorderRadius}px`,
    '--hover-bg-color': effectiveHoverColor,
    '--active-bg-color': effectiveActiveColor,
  } as React.CSSProperties & { 
    '--final-border-radius': string;
    '--hover-bg-color': string;
    '--active-bg-color': string;
  };

  if (fixedWidth) {
    listStyle.wordBreak = 'break-word';
  }

  const dropdownClasses = `custom-dropdown-menu ${isExpanded ? 'expanded' : ''}`;

  return (
    <div className="dropdown-menu-container" style={containerStyle} ref={containerRef} dir={direction}>
      <div className={dropdownClasses} style={dropdownStyle} ref={dropdownDivRef}>
        <div 
          className="dropdown-menu-header" 
          onClick={toggleDropdown} 
          style={headerStyle}
        >
          <span className="dropdown-menu-header-title" style={headerTitleStyle}>{getDisplayLabel()}</span>
          <div className="dropdown-menu-arrow" style={arrowStyle}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <g transform="translate(0 -32)">
                <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5 12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/>
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
          {items ? renderSubmenuItems(items) : children}
        </ul>
      </div>
    </div>
  );
};

export default DropdownMenu; 